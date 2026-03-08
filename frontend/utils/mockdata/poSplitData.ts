import type { PurchaseRequest } from './purchaseRequestsData';

export type SplitLineItem = {
  id: string;
  description: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  category: string;
};

export type PurchaseOrderDraft = {
  id: string;
  supplier: string | null;
  itemIds: string[];
  reference: string;
};

export type PoSplitScenario = {
  prId: string;
  summary: string;
  lineItems: SplitLineItem[];
  purchaseOrders: PurchaseOrderDraft[];
};

function createDefaultScenario(request: PurchaseRequest): PoSplitScenario {
  const firstHalf = Math.max(1, Math.floor(request.amount * 0.48));
  const secondHalf = request.amount - firstHalf;

  return {
    prId: request.id,
    summary:
      'Split the request across supplier-specific purchase orders, while parked items stay in the pool until procurement is ready to release them.',
    lineItems: [
      {
        id: `${request.id}-1`,
        description: `${request.title} - main batch`,
        supplier: request.vendor,
        quantity: 1,
        unitPrice: firstHalf,
        category: 'Core supply',
      },
      {
        id: `${request.id}-2`,
        description: `${request.title} - contingency batch`,
        supplier: `${request.vendor} Services`,
        quantity: 1,
        unitPrice: secondHalf,
        category: 'Contingency',
      },
    ],
    purchaseOrders: [
      {
        id: `${request.id}-PO-1`,
        supplier: request.vendor,
        itemIds: [`${request.id}-1`],
        reference: `PO-${request.id.slice(-3)}-A`,
      },
      {
        id: `${request.id}-PO-2`,
        supplier: null,
        itemIds: [],
        reference: `PO-${request.id.slice(-3)}-B`,
      },
    ],
  };
}

export function buildPoSplitScenario(
  request: PurchaseRequest
): PoSplitScenario {
  const scenario = poSplitScenarios[request.id];

  return scenario ?? createDefaultScenario(request);
}

export const poSplitScenarios: Record<string, PoSplitScenario> = {
  'PR-2026-101': {
    prId: 'PR-2026-101',
    summary:
      'Procurement is splitting laptop hardware, accessories, and onboarding services into supplier-specific POs. Any item removed from a PO returns to the pool for reassignment.',
    lineItems: [
      {
        id: 'PR-2026-101-1',
        description: 'Developer laptop bundle',
        supplier: 'TechSource MY',
        quantity: 8,
        unitPrice: 2950,
        category: 'Hardware',
      },
      {
        id: 'PR-2026-101-2',
        description: 'USB-C dock and adapter set',
        supplier: 'TechSource MY',
        quantity: 8,
        unitPrice: 380,
        category: 'Accessories',
      },
      {
        id: 'PR-2026-101-3',
        description: 'Asset tagging and imaging service',
        supplier: 'DeployHub Services',
        quantity: 8,
        unitPrice: 210,
        category: 'Services',
      },
      {
        id: 'PR-2026-101-4',
        description: 'Laptop backpack',
        supplier: 'Office Outfitters',
        quantity: 8,
        unitPrice: 210,
        category: 'Accessories',
      },
    ],
    purchaseOrders: [
      {
        id: 'PR-2026-101-PO-1',
        supplier: 'TechSource MY',
        itemIds: ['PR-2026-101-1'],
        reference: 'PO-101-A',
      },
      {
        id: 'PR-2026-101-PO-2',
        supplier: 'DeployHub Services',
        itemIds: ['PR-2026-101-3'],
        reference: 'PO-101-B',
      },
      {
        id: 'PR-2026-101-PO-3',
        supplier: null,
        itemIds: [],
        reference: 'PO-101-C',
      },
    ],
  },
};
