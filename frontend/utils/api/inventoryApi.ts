import { apiRequest, readApiEnvelope } from './apiClient';

export type WarehouseInventoryRow = {
  itemId: string;
  itemName: string;
  currentStock: number;
  unitPrice: number;
  unit: string;
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

function normalizeWarehouseRow(value: unknown, index: number): WarehouseInventoryRow {
  const record = readRecord(value);
  const itemId = String(
    record?.item_id || record?.sku || record?.id || `ITEM-${index + 1}`
  ).trim();
  const itemName = String(
    record?.item_name || record?.name || record?.item || itemId || `Item ${index + 1}`
  ).trim();

  return {
    itemId,
    itemName,
    currentStock: toNumber(
      record?.current_stock || record?.stock || record?.quantity || record?.count
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

export function updateInventory(incomingCsvPath: string) {
  return apiRequest<unknown>('/api/warehouse/update_inventory', {
    method: 'POST',
    body: JSON.stringify({ incoming_csv_path: incomingCsvPath }),
  });
}
