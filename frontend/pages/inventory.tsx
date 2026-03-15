import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import Button, { buttonClassName } from '../components/atoms/Button';
import DataTableWithTotal from '../components/molecules/DataTableWithTotal';
import { useToast } from '../components/ToastProvider';
import { ApiError } from '../utils/api/apiClient';
import {
  fetchInventoryCounts,
  fetchInventoryItems,
  type WarehouseInventoryRow,
  updateInventory,
} from '../utils/api/inventoryApi';

type InventoryItem = {
  sku: string;
  itemName: string;
  location: string;
  currentStock: number;
  unit: string;
  unitPrice: number;
  lastUpdated: string;
};

function toCsvRow(values: Array<string | number>): string {
  return values
    .map((value) => {
      const serialized = String(value);
      if (serialized.includes(',') || serialized.includes('"')) {
        return `"${serialized.replace(/"/g, '""')}"`;
      }
      return serialized;
    })
    .join(',');
}

function mapInventoryCountsToRows(counts: Record<string, number>) {
  return Object.entries(counts).map(([itemName, currentStock], index) => {
    return {
      sku: `API-${String(index + 1).padStart(3, '0')}`,
      itemName,
      location: 'API Warehouse',
      currentStock,
      unit: 'pcs',
      unitPrice: 0,
      lastUpdated: new Date().toLocaleString(),
    } as InventoryItem;
  });
}

function mapWarehouseRowsToInventoryItems(rows: WarehouseInventoryRow[]) {
  return rows.map((row, index) => ({
    sku: row.itemId || `API-${String(index + 1).padStart(3, '0')}`,
    itemName: row.itemName,
    location: 'API Warehouse',
    currentStock: row.currentStock,
    unit: row.unit || 'pcs',
    unitPrice: row.unitPrice,
    lastUpdated: new Date().toLocaleString(),
  }));
}

export default function InventoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadInventory() {
      try {
        const warehouseRows = await fetchInventoryItems();
        const rows = warehouseRows.length
          ? mapWarehouseRowsToInventoryItems(warehouseRows)
          : mapInventoryCountsToRows(await fetchInventoryCounts());

        if (isMounted && rows.length) {
          setItems(rows);
        }
      } catch (error) {
        if (isMounted) {
          showToast({
            title: 'Unable to load inventory',
            description:
              error instanceof ApiError
                ? error.message
                : 'Unable to load inventory from API.',
            variant: 'error',
          });
          setItems([]);
        }
      }
    }

    void loadInventory();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        item.itemName.toLowerCase().includes(normalizedSearch) ||
        item.sku.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [items, searchTerm]);

  const tableRows = filteredItems.map((item) => ({
    key: item.sku,
    values: {
      sku: item.sku,
      item: item.itemName,
      currentStock: `${item.currentStock.toLocaleString()} ${item.unit}`,
      updated: item.lastUpdated,
    },
  }));

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();

      const response = await updateInventory(content);

      const warehouseRows = await fetchInventoryItems();
      const nextRows = warehouseRows.length
        ? mapWarehouseRowsToInventoryItems(warehouseRows)
        : mapInventoryCountsToRows(await fetchInventoryCounts());
      setItems(nextRows);

      showToast({
        title: 'Inventory updated',
        description: response.message,
        variant: 'success',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to parse CSV. Please check the file format.';
      showToast({
        title: 'Upload failed',
        description: message,
        variant: 'error',
      });
    } finally {
      event.target.value = '';
    }
  }

  function handleCsvExport() {
    const headers = ['sku', 'itemName', 'currentStock', 'unit', 'lastUpdated'];
    const csvBody = items.map((item) =>
      toCsvRow([
        item.sku,
        item.itemName,
        item.currentStock,
        item.unit,
        item.lastUpdated,
      ])
    );
    const csvContent = [toCsvRow(headers), ...csvBody].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `inventory-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <CardHeader
          subtitle="Warehouse operations"
          title="Inventory"
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Total Items
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-blue">
              {items.length}
            </p>
          </Card>
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Update via CSV
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <label
                htmlFor="inventory-csv"
                className={buttonClassName({
                  variant: 'secondary',
                  size: 'md',
                  className: 'cursor-pointer',
                })}
              >
                Upload warehouse CSV
              </label>
              <Button variant="outline" onClick={handleCsvExport}>
                Export full table CSV
              </Button>
            </div>
            <input
              id="inventory-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="sr-only"
            />
          </Card>
        </div>
      </Card>

      <Card variant="surface" padding="lg">
        <div>
          <label
            htmlFor="inventory-search"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Search item / SKU
          </label>
          <input
            id="inventory-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type item name or SKU"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <DataTableWithTotal
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'item', label: 'Item' },
            { key: 'currentStock', label: 'Current Stock (Unit)' },
            {
              key: 'updated',
              label: 'Updated',
              cellClassName: 'text-slate-500',
            },
          ]}
          rows={tableRows}
          emptyLabel="No items match the selected filters."
        />
      </Card>
    </div>
  );
}
