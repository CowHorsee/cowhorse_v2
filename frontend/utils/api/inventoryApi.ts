import { apiRequest, readApiEnvelope } from './apiClient';

export type WarehouseInventoryRow = {
  itemId: string;
  itemName: string;
  currentStock: number;
  unitPrice: number;
  unit: string;
};

export type InventoryGraphDatapoint = {
  label: string;
  itemName: string;
  actualSkuInventory: number;
  actualSales: number;
  predictedSales: number;
  actualSalesMissing?: boolean;
  predictedSalesMissing?: boolean;
};

function readRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthLabel(month: number) {
  return new Date(2026, Math.max(month - 1, 0), 1).toLocaleString('en-US', {
    month: 'short',
  });
}

function readGraphValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function normalizeWarehouseRow(
  value: unknown,
  index: number
): WarehouseInventoryRow {
  const record = readRecord(value);
  const itemId = String(
    record?.item_id || record?.sku || record?.id || `ITEM-${index + 1}`
  ).trim();
  const itemName = String(
    record?.item_name ||
      record?.name ||
      record?.item ||
      itemId ||
      `Item ${index + 1}`
  ).trim();

  return {
    itemId,
    itemName,
    currentStock: toNumber(
      record?.current_stock ||
        record?.stock ||
        record?.quantity ||
        record?.count
    ),
    unitPrice: toNumber(record?.unit_price || record?.price),
    unit: String(record?.unit || record?.uom || 'pcs'),
  };
}

export async function fetchInventoryItems(itemName?: string) {
  const response = await apiRequest<unknown>('/api/warehouse/count_inventory', {
    method: 'GET',
    query: { item_name: itemName },
  });

  const envelope = readApiEnvelope<unknown>(response);
  const data = envelope?.data;

  if (Array.isArray(data)) {
    return data.map((row, index) => normalizeWarehouseRow(row, index));
  }

  const record = readRecord(data);
  if (record) {
    return Object.entries(record).map(([name, count], index) => ({
      itemId: `ITEM-${index + 1}`,
      itemName: name,
      currentStock: toNumber(count),
      unitPrice: 0,
      unit: 'pcs',
    }));
  }

  return [];
}

export async function fetchInventoryCounts(itemName?: string) {
  const response = await apiRequest<unknown>('/api/warehouse/count_inventory', {
    method: 'GET',
    query: { item_name: itemName },
  });

  const envelope = readApiEnvelope<unknown>(response);
  const data = envelope?.data;

  if (typeof data === 'number') {
    const key = itemName?.trim() || 'TOTAL';
    return { [key]: data };
  }

  if (Array.isArray(data)) {
    const rows = data
      .map((row) => readRecord(row))
      .filter((row): row is Record<string, unknown> => Boolean(row));

    if (!rows.length) {
      return {};
    }

    return rows.reduce<Record<string, number>>((accumulator, row, index) => {
      const name = String(
        row.item_name || row.item || row.item_id || `ITEM-${index + 1}`
      ).trim();
      const quantity = Number(
        row.quantity || row.current_stock || row.count || row.value || 0
      );
      accumulator[name] = Number.isFinite(quantity) ? quantity : 0;
      return accumulator;
    }, {});
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        key,
        Number(value) || 0,
      ])
    ) as Record<string, number>;
  }

  return {};
}

type FetchInventoryGraphDataOptions = {
  year?: number;
  itemNames?: string[];
};

function formatGraphLabel(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return monthLabel(value);
  }

  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber >= 1 && asNumber <= 12) {
      return monthLabel(asNumber);
    }

    return value.trim();
  }

  return 'Current';
}

function normalizeGraphPoint(
  value: unknown,
  itemName: string,
  counts: Record<string, number>
) {
  const record = readRecord(value);
  if (!record) {
    return null;
  }

  const resolvedItemName = String(
    readGraphValue(record, ['item_name', 'itemName']) || itemName
  ).trim();
  const inventoryValue = toNumber(
    readGraphValue(record, [
      'inventory_count',
      'current_stock',
      'quantity',
      'count',
    ])
  );
  const actualSalesRawValue = readGraphValue(record, [
    'actual_sales',
    'sales_actual',
    'sales',
  ]);
  const predictedSalesRawValue = readGraphValue(record, [
    'predicted_demand',
    'predicted_sales',
    'forecast_sales',
  ]);

  return {
    label: formatGraphLabel(
      readGraphValue(record, ['month', 'month_name', 'label'])
    ),
    itemName: resolvedItemName,
    actualSkuInventory: inventoryValue || counts[itemName] || 0,
    actualSales: toNumber(actualSalesRawValue),
    predictedSales: toNumber(predictedSalesRawValue),
    actualSalesMissing:
      actualSalesRawValue === null ||
      actualSalesRawValue === undefined ||
      actualSalesRawValue === '',
    predictedSalesMissing:
      predictedSalesRawValue === null ||
      predictedSalesRawValue === undefined ||
      predictedSalesRawValue === '',
  } as InventoryGraphDatapoint;
}

function normalizeGraphResponse(
  payload: unknown,
  itemName: string,
  counts: Record<string, number>
) {
  const envelope = readApiEnvelope<unknown>(payload);
  const data = envelope?.data ?? payload;

  if (Array.isArray(data)) {
    return data
      .map((row) => normalizeGraphPoint(row, itemName, counts))
      .filter((row): row is InventoryGraphDatapoint => Boolean(row));
  }

  const record = readRecord(data);
  if (!record) {
    return [] as InventoryGraphDatapoint[];
  }

  const nestedRows =
    (Array.isArray(record.datapoints) && record.datapoints) ||
    (Array.isArray(record.points) && record.points) ||
    (Array.isArray(record.series) && record.series) ||
    null;

  if (nestedRows) {
    return nestedRows
      .map((row) => normalizeGraphPoint(row, itemName, counts))
      .filter((row): row is InventoryGraphDatapoint => Boolean(row));
  }

  const single = normalizeGraphPoint(record, itemName, counts);
  return single ? [single] : [];
}

export async function fetchInventoryGraphData(
  counts: Record<string, number>,
  options: FetchInventoryGraphDataOptions = {}
) {
  const itemNames =
    options.itemNames && options.itemNames.length
      ? options.itemNames.filter((name) => name.trim())
      : Object.keys(counts).filter((name) => name.trim());
  if (!itemNames.length) {
    return [] as InventoryGraphDatapoint[];
  }

  const now = new Date();
  const selectedYear = Math.max(options.year || now.getFullYear(), 2026);
  const requests = itemNames.map(async (itemName) => {
    const response = await apiRequest<unknown>(
      '/api/warehouse/graph_datapoint',
      {
        method: 'GET',
        query: { item_name: itemName, year: selectedYear },
      }
    );

    return normalizeGraphResponse(response, itemName, counts);
  });

  const settled = await Promise.allSettled(requests);
  return settled
    .filter(
      (result): result is PromiseFulfilledResult<InventoryGraphDatapoint[]> =>
        result.status === 'fulfilled'
    )
    .flatMap((result) => result.value);
}

export async function updateInventory(csvContent: string) {
  const response = await apiRequest<unknown>(
    '/api/warehouse/update_inventory',
    {
      method: 'POST',
      body: JSON.stringify({ csv_content: csvContent }),
    }
  );

  const envelope = readApiEnvelope<unknown>(response);
  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' ? envelope.data : '') ||
      'Inventory updated successfully.',
  };
}
