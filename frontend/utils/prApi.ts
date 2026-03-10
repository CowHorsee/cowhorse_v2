import { apiRequest } from './apiClient';
import type {
  PurchaseRequest,
  PurchaseRequestStatus,
} from './mockdata/purchaseRequestsData';

function readRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function formatStatus(value: unknown): PurchaseRequestStatus {
  const normalized = String(value || '')
    .trim()
    .toUpperCase();

  switch (normalized) {
    case 'APPROVED':
      return 'Approved';
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
      return 'In Review';
    case 'REJECTED':
      return 'Rejected';
    case 'SUBMITTED':
    case 'PENDING_APPROVAL':
    case 'PENDING':
    default:
      return 'Pending Approval';
  }
}

function formatUpdatedAt(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Recently updated';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function normalizePurchaseRequest(value: unknown): PurchaseRequest {
  const record = readRecord(value);
  const amountValue = Number(
    record?.total_amount || record?.amount || record?.total || 0
  );

  return {
    id: String(record?.pr_id || record?.id || record?.ticket_id || '').trim(),
    title: String(
      record?.title ||
        record?.name ||
        record?.request_title ||
        'Purchase Request'
    ).trim(),
    department: String(record?.department || 'General').trim(),
    requester: String(
      record?.requester ||
        record?.created_by ||
        record?.user_id ||
        'Unknown User'
    ).trim(),
    vendor: String(record?.vendor || record?.supplier || 'TBD').trim(),
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    status: formatStatus(record?.status || record?.status_name),
    updatedAt: formatUpdatedAt(
      record?.updated_at || record?.updatedAt || record?.created_at
    ),
    description: String(
      record?.description || record?.justification || 'No description provided.'
    ).trim(),
  };
}

function normalizePurchaseRequestsResponse(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizePurchaseRequest)
    .filter((request) => Boolean(request.id));
}

function normalizePurchaseRequestDetails(value: unknown) {
  const record = readRecord(value);

  if (!record) {
    return null;
  }

  const nested = readRecord(
    record.data || record.pr || record.purchase_request
  );
  return normalizePurchaseRequest(nested || record);
}

export async function getPrTickets(userId: string, status?: string) {
  const response = await apiRequest<unknown>('/api/pr/get_pr_ticket', {
    method: 'GET',
    query: { user_id: userId, status },
  });

  return normalizePurchaseRequestsResponse(response);
}

export async function listPrByUser(userId: string) {
  const response = await apiRequest<unknown>('/api/pr/list_by_user', {
    method: 'GET',
    query: { user_id: userId },
  });

  return normalizePurchaseRequestsResponse(response);
}

export async function getPrDetails(userId: string, prId: string) {
  const response = await apiRequest<unknown>('/api/pr/get_pr_details', {
    method: 'GET',
    query: { user_id: userId, pr_id: prId },
  });

  return normalizePurchaseRequestDetails(response);
}

export async function createPurchaseRequest(payload: {
  user_id: string;
  proc_item: Record<string, number>;
  justification: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/pr/create_pr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function acceptPrSuggestion(payload: {
  pr_id: string;
  officer_id: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/pr/accept_pr_suggestion', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function modifyPurchaseRequest(payload: {
  user_id: string;
  pr_id: string;
  proc_item: Record<string, number>;
  justification: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/pr/modify_pr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reviewPurchaseRequest(payload: {
  pr_id: string;
  decision: string;
  manager_id: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/pr/review_pr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendProcurementAlert(payload: {
  item_name: string;
  predicted_demand: number;
  justification: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/pr/procurement_alert', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
