export type PurchaseRequestStatus = 'Pending Approval' | 'In Review' | 'Approved';

export type PurchaseRequest = {
  id: string;
  title: string;
  department: string;
  requester: string;
  vendor: string;
  amount: number;
  status: PurchaseRequestStatus;
  updatedAt: string;
  description: string;
};

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: 'PR-2026-101',
    title: 'Laptop procurement for new engineering hires',
    department: 'Engineering',
    requester: 'Aina',
    vendor: 'TechSource MY',
    amount: 28400,
    status: 'Pending Approval',
    updatedAt: '2h ago',
    description:
      'Requesting eight development laptops for incoming engineers in Q2 onboarding.',
  },
  {
    id: 'PR-2026-102',
    title: 'Office chair replacement batch',
    department: 'Facilities',
    requester: 'Hafiz',
    vendor: 'Ergo Supply Sdn Bhd',
    amount: 9600,
    status: 'In Review',
    updatedAt: '5h ago',
    description:
      'Replacing damaged ergonomic chairs for the operations and finance floor.',
  },
  {
    id: 'PR-2026-103',
    title: 'Annual software license renewal',
    department: 'IT',
    requester: 'Sara',
    vendor: 'CloudSuite',
    amount: 45200,
    status: 'Approved',
    updatedAt: '1d ago',
    description:
      'Renewing analytics, project management, and endpoint protection licenses for one year.',
  },
  {
    id: 'PR-2026-104',
    title: 'Warehouse barcode scanner devices',
    department: 'Logistics',
    requester: 'Daniel',
    vendor: 'ScanTech Asia',
    amount: 13200,
    status: 'Pending Approval',
    updatedAt: '1d ago',
    description:
      'Acquiring new handheld barcode scanners to reduce receiving and stock count delays.',
  },
];
