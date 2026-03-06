type PurchaseOrderListItem = {
  id: string;
  reference: string;
  supplier: string | null;
  total: number;
  itemCount: number;
};

type PurchaseOrderListProps = {
  items: PurchaseOrderListItem[];
  selectedPoId: string;
  onSelect: (poId: string) => void;
};

function formatCurrency(value: number) {
  return `RM ${value.toLocaleString()}`;
}

export default function PurchaseOrderList({
  items,
  selectedPoId,
  onSelect,
}: PurchaseOrderListProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
      <div className="divide-y divide-slate-200">
        {items.map((purchaseOrder) => {
          const isActive = purchaseOrder.id === selectedPoId;

          return (
            <button
              key={purchaseOrder.id}
              type="button"
              onClick={() => onSelect(purchaseOrder.id)}
              className={`w-full px-4 py-4 text-left transition ${
                isActive
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">
                      {purchaseOrder.reference}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {purchaseOrder.supplier ?? 'Draft supplier'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {formatCurrency(purchaseOrder.total)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                    {purchaseOrder.itemCount} line
                    {purchaseOrder.itemCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
