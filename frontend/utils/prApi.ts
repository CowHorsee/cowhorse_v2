import { apiRequest } from './apiClient';
import type {
  PurchaseRequest,
  PurchaseRequestStatus,
} from './mockdata/purchaseRequestsData';

type PrTicketRow = {
  pr_id?: string;
  status_name?: string;
  status_id?: string | number;
  justification?: string;
  created_by?: string;
  last_modified_at?: string;
};

type PrDetailsResponse = {
  header?: Record<string, unknown>;
};

function normalizeStatus(value: string | number | undefined): PurchaseRequestStatus {
  const raw = String(value || '').toLowerCase();

  if (raw.includes('approved') || raw === '4') {
    return 'Approved';
  }

  if (raw.includes('review') || raw === '2') {
    return 'In Review';
  }

  return 'Pending Approval';
}

function toStringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function getPrTickets(params: { user_id?: string; pr_id?: string; status?: string }) {
  const query = new URLSearchParams();

  if (params.user_id) {
    query.set('user_id', params.user_id);
  }
  if (params.pr_id) {
    query.set('pr_id', params.pr_id);
  }
  if (params.status) {
    query.set('status', params.status);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<PrTicketRow[]>(`/api/get_pr_ticket${suffix}`);
}

export function getPrDetails(params: { user_id?: string; pr_id: string }) {
  const query = new URLSearchParams();

  if (params.user_id) {
    query.set('user_id', params.user_id);
  }
  query.set('pr_id', params.pr_id);

  return apiRequest<PrDetailsResponse | string>(
    `/api/pr/get_pr_details?${query.toString()}`
  );
}

export function reviewPr(payload: {
  pr_id: string;
  decision: 'approve' | 'reject';
  manager_id: string;
}) {
  return apiRequest<string>('/api/pr/review_pr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function mapTicketToPurchaseRequest(
  ticket: PrTicketRow,
  fallback: PurchaseRequest | undefined
): PurchaseRequest {
  const id = toStringValue(ticket.pr_id, fallback?.id || 'PR-UNKNOWN');

  return {
    id,
    title: toStringValue(ticket.justification, fallback?.title || `Request ${id}`),
    department: fallback?.department || '-',
    requester: toStringValue(ticket.created_by, fallback?.requester || '-'),
    vendor: fallback?.vendor || '-',
    amount: fallback?.amount || 0,
    status: normalizeStatus(ticket.status_name || ticket.status_id),
    updatedAt: toStringValue(ticket.last_modified_at, fallback?.updatedAt || '-'),
    description: toStringValue(
      ticket.justification,
      fallback?.description || 'No additional description from API.'
    ),
  };
}

export function mergeDetailsIntoPurchaseRequest(
  base: PurchaseRequest,
  details: PrDetailsResponse | string
): PurchaseRequest {
  if (!details || typeof details === 'string' || !details.header) {
    return base;
  }

  const header = details.header;

  return {
    ...base,
    status: normalizeStatus(
      (header.status_name as string | undefined) ||
        (header.status_id as string | number | undefined)
    ),
    description: toStringValue(
      header.justification,
      toStringValue(header.description, base.description)
    ),
    requester: toStringValue(header.created_by, base.requester),
    updatedAt: toStringValue(header.last_modified_at, base.updatedAt),
  };
}
