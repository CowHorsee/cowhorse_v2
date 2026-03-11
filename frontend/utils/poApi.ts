import { apiRequest } from './api/apiClient';

export function createPurchaseOrder(payload: {
  pr_id: string;
  proc_item: Array<Record<string, number>>;
  user_id: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/po/create_po', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getPoTickets(userId: string) {
  return apiRequest<unknown>('/api/po/get_po_ticket', {
    method: 'GET',
    query: { user_id: userId },
  });
}

export function getPoDetails(userId: string, poId: string) {
  return apiRequest<unknown>('/api/po/get_po_details', {
    method: 'GET',
    query: { user_id: userId, po_id: poId },
  });
}

export function updatePoStatus(payload: {
  supplier_id: string;
  po_id: string;
  status_name: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/po/update_po_status', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
