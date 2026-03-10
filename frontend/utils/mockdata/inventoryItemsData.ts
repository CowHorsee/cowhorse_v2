export type InventoryItem = {
  sku: string;
  itemName: string;
  location: string;
  currentStock: number;
  unit: string;
  unitPrice: number;
  lastUpdated: string;
};

export const inventoryItems: InventoryItem[] = [
  {
    sku: 'INV-001',
    itemName: 'Industrial Sensors',
    location: 'Zone A-01',
    currentStock: 740,
    unit: 'pcs',
    unitPrice: 68.5,
    lastUpdated: '2026-03-08 09:00',
  },
  {
    sku: 'INV-002',
    itemName: 'Copper Wiring',
    location: 'Zone B-04',
    currentStock: 515,
    unit: 'rolls',
    unitPrice: 120.0,
    lastUpdated: '2026-03-08 08:55',
  },
  {
    sku: 'INV-003',
    itemName: 'Safety Helmets',
    location: 'Zone C-02',
    currentStock: 385,
    unit: 'pcs',
    unitPrice: 24.9,
    lastUpdated: '2026-03-08 08:45',
  },
  {
    sku: 'INV-004',
    itemName: 'Hydraulic Pumps',
    location: 'Zone D-03',
    currentStock: 112,
    unit: 'units',
    unitPrice: 1450.0,
    lastUpdated: '2026-03-08 08:30',
  },
  {
    sku: 'INV-005',
    itemName: 'Packaging Pallets',
    location: 'Zone E-01',
    currentStock: 960,
    unit: 'pcs',
    unitPrice: 39.0,
    lastUpdated: '2026-03-08 08:10',
  },
  {
    sku: 'INV-006',
    itemName: 'Bearing Sets',
    location: 'Zone D-06',
    currentStock: 76,
    unit: 'sets',
    unitPrice: 210.0,
    lastUpdated: '2026-03-08 07:50',
  },
];
