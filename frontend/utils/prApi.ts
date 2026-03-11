import { apiRequest } from './api/apiClient';
import type { PurchaseRequest, PurchaseRequestStatus } from './mockdata/purchaseRequestsData';

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
    case '4':
      return 'Approved';
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
    case '2':
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

function toStringValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function normalizePurchaseRequest(value: unknown): PurchaseRequest {
  const record = readRecord(value);
  const amountValue = Number(
    record?.total_amount || record?.amount || record?.total || 0,
  );

  return {
    id: String(record?.pr_id || record?.id || record?.ticket_id || '').trim(),
    title: String(
      record?.title ||
        record?.name ||
        record?.request_title ||
        record?.justification ||
        'Purchase Request',
    ).trim(),
    department: String(record?.department || 'General').trim(),
    requester: String(
      record?.requester ||
        record?.created_by ||
        record?.user_id ||
        'Unknown User',
    ).trim(),
    vendor: String(record?.vendor || record?.supplier || 'TBD').trim(),
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    status: formatStatus(
      record?.status || record?.status_name || record?.status_id,
    ),
    updatedAt: formatUpdatedAt(
      record?.updated_at ||
        record?.updatedAt ||
        record?.last_modified_at ||
        record?.created_at,
    ),
    description: String(
      record?.description ||
        record?.justification ||
        'No description provided.',
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
    record.data || record.pr || record.purchase_request || record.header,
  );
  return normalizePurchaseRequest(nested || record);
}

export async function getPrTickets(
  userIdOrParams:
    | string
    | { user_id?: string; pr_id?: string; status?: string | number },
  status?: string,
) {
  const query =
    typeof userIdOrParams === 'string'
      ? { user_id: userIdOrParams, status }
      : {
          user_id: userIdOrParams.user_id,
          pr_id: userIdOrParams.pr_id,
          status:
            userIdOrParams.status !== undefined
              ? String(userIdOrParams.status)
              : undefined,
        };

  const response = await apiRequest<unknown>('/api/pr/get_pr_ticket', {
    method: 'GET',
    query,
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

export async function getPrDetails(
  userIdOrParams: string | { user_id: string; pr_id: string },
  prId?: string,
) {
  const query =
    typeof userIdOrParams === 'string'
      ? { user_id: userIdOrParams, pr_id: prId }
      : { user_id: userIdOrParams.user_id, pr_id: userIdOrParams.pr_id };

  const response = await apiRequest<unknown>('/api/pr/get_pr_details', {
    method: 'GET',
    query,
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

export const createPr = createPurchaseRequest;

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

export const modifyPr = modifyPurchaseRequest;

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

export const reviewPr = reviewPurchaseRequest;

export function mapTicketToPurchaseRequest(
  ticket: unknown,
  fallback?: PurchaseRequest,
): PurchaseRequest {
  const normalized = normalizePurchaseRequest(ticket);

  return {
    ...fallback,
    ...normalized,
    id: normalized.id || fallback?.id || 'PR-UNKNOWN',
    title: normalized.title || fallback?.title || 'Purchase Request',
    requester: normalized.requester || fallback?.requester || 'Unknown User',
    description:
      normalized.description ||
      fallback?.description ||
      'No additional description from API.',
  };
}

export function mergeDetailsIntoPurchaseRequest(
  base: PurchaseRequest,
  details: unknown,
): PurchaseRequest {
  const merged = normalizePurchaseRequestDetails(details);
  if (!merged) {
    return base;
  }

  return {
    ...base,
    status: merged.status || base.status,
    description: toStringValue(merged.description, base.description),
    requester: toStringValue(merged.requester, base.requester),
    updatedAt: toStringValue(merged.updatedAt, base.updatedAt),
  };
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
