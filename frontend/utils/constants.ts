export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  WAREHOUSE: 'WAREHOUSE',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.EMPLOYEE,
  USER_ROLES.MANAGER,
  USER_ROLES.WAREHOUSE,
];

export const PR_STATUS_STAGES = [
  'Suggestion',
  'Pending for Approval',
  'Rejected',
  'Approved',
  'Awaiting Supplier Acceptance',
  'Order Accepted',
  'Order Shipped',
  'Order Arrived',
  'Order Received',
] as const;

export type PrStatusStage = (typeof PR_STATUS_STAGES)[number];

export const PR_APPROVAL_STAGES = [
  'Suggestion',
  'Pending for Approval',
  'Rejected',
  'Approved',
] as const;

export type PrApprovalStage = (typeof PR_APPROVAL_STAGES)[number];

export function normalizePrStatusLabel(status: unknown): PrStatusStage {
  const raw = String(status || '').trim();
  if (!raw) {
    return PR_STATUS_STAGES[0];
  }

  const directMatch = PR_STATUS_STAGES.find(
    (stage) => stage.toUpperCase() === raw.toUpperCase()
  );
  if (directMatch) {
    return directMatch;
  }

  return PR_STATUS_STAGES[0];
}

export function normalizePrApprovalStage(status: unknown): PrApprovalStage {
  const normalized = normalizePrStatusLabel(status);
  if (PR_APPROVAL_STAGES.includes(normalized as PrApprovalStage)) {
    return normalized as PrApprovalStage;
  }

  return 'Approved';
}
