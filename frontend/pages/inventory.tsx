import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import Button, { buttonClassName } from '../components/atoms/Button';
import { ApiError } from '../utils/api/apiClient';
import { fetchInventoryCounts } from '../utils/api/inventoryApi';
import {
  inventoryItems as initialInventoryItems,
  type InventoryItem,
} from '../utils/mockdata/inventoryItemsData';

type CsvParseResult = {
  rows: InventoryItem[];
  skippedRows: number;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '');
}

function getValueByAliases(
  row: Record<string, string>,
  aliases: string[]
): string {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    if (normalizedAlias in row) {
      return row[normalizedAlias] || '';
    }
  }
  return '';
}

function parseInventoryCsv(content: string): CsvParseResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headerCells = parseCsvLine(lines[0]);
  const normalizedHeaders = headerCells.map((header) =>
    normalizeHeader(header)
  );

  const requiredGroups = [
    ['sku', 'itemsku'],
    ['itemname', 'item', 'name'],
    ['currentstock', 'stock', 'quantity'],
  ];

  requiredGroups.forEach((group) => {
    if (!group.some((key) => normalizedHeaders.includes(key))) {
      throw new Error(
        `Missing required column. Accepted: ${group.join(' / ')}`
      );
    }
  });

  const rows: InventoryItem[] = [];
  let skippedRows = 0;

  lines.slice(1).forEach((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};

    normalizedHeaders.forEach((header, cellIndex) => {
      row[header] = (cells[cellIndex] || '').trim();
    });

    const sku = getValueByAliases(row, ['sku', 'itemsku']);
    const itemName = getValueByAliases(row, ['itemname', 'item', 'name']);
    const location =
      getValueByAliases(row, ['location', 'warehouse', 'zone']) || 'Unassigned';
    const unit = getValueByAliases(row, ['unit', 'uom']) || 'pcs';
    const unitPrice =
      Number(getValueByAliases(row, ['unitprice', 'price'])) || 0;
    const lastUpdated =
      getValueByAliases(row, ['lastupdated', 'updatedat', 'updated']) ||
      new Date().toISOString().slice(0, 16).replace('T', ' ');

    const currentStock = Number(
      getValueByAliases(row, ['currentstock', 'stock', 'quantity'])
    );

    if (!sku || !itemName || Number.isNaN(currentStock)) {
      skippedRows += 1;
      return;
    }

    rows.push({
      sku,
      itemName,
      location,
      currentStock,
      unit,
      unitPrice,
      lastUpdated,
    });
  });

  if (!rows.length) {
    throw new Error('No valid inventory rows found in CSV.');
  }

  return { rows, skippedRows };
}

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
    const template = initialInventoryItems.find(
      (item) => item.itemName.toLowerCase() === itemName.toLowerCase()
    );

    return {
      sku: template?.sku || `API-${String(index + 1).padStart(3, '0')}`,
      itemName,
      location: template?.location || 'API Warehouse',
      currentStock,
      unit: template?.unit || 'pcs',
      unitPrice: template?.unitPrice || 0,
      lastUpdated: new Date().toLocaleString(),
    } as InventoryItem;
  });
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadInventory() {
      try {
        const counts = await fetchInventoryCounts();
        const rows = mapInventoryCountsToRows(counts);

        if (isMounted && rows.length) {
          setItems(rows);
          setApiMessage('Inventory counts loaded from the live warehouse API.');
        }
      } catch (error) {
        if (isMounted) {
          setApiMessage(
            error instanceof ApiError
              ? `${error.message} Showing fallback inventory data.`
              : 'Showing fallback inventory data.'
          );
        }
      }
    }

    void loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

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

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError('');
    setUploadMessage('');

    try {
      const content = await file.text();
      const { rows, skippedRows } = parseInventoryCsv(content);

      setItems(rows);
      setUploadMessage(
        `Uploaded ${rows.length} rows from ${file.name}.${
          skippedRows ? ` Skipped ${skippedRows} invalid row(s).` : ''
        }`
      );
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Unable to parse CSV. Please check the file format.'
      );
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
            {apiMessage ? (
              <p className="mt-2 text-xs font-semibold text-brand-blue">
                {apiMessage}
              </p>
            ) : null}
            {uploadMessage ? (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                {uploadMessage}
              </p>
            ) : null}
            {uploadError ? (
              <p className="mt-2 text-xs font-semibold text-rose-700">
                {uploadError}
              </p>
            ) : null}
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

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Current Stock (Unit)</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={item.sku}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.itemName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.lastUpdated}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No items match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
