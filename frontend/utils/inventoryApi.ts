import { apiRequest } from './api/apiClient';

export async function fetchInventoryCounts(itemName?: string) {
  return apiRequest<Record<string, number>>('/api/warehouse/count_inventory', {
    method: 'GET',
    query: { item_name: itemName },
  });
}

export function updateInventory(incomingCsvPath: string) {
  return apiRequest<Record<string, unknown>>(
    '/api/warehouse/update_inventory',
    {
      method: 'POST',
      body: JSON.stringify({ incoming_csv_path: incomingCsvPath }),
    }
  );
}
