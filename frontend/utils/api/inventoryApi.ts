import { apiRequest, readApiEnvelope } from './apiClient';

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
