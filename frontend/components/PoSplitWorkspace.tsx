import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PurchaseRequest } from '../utils/purchaseRequestsData';
import type { PurchaseOrderDraft, SplitLineItem } from '../utils/poSplitData';

type PoSplitWorkspaceProps = {
  purchaseRequest: PurchaseRequest;
  summary: string;
  initialItems: SplitLineItem[];
  initialPurchaseOrders: PurchaseOrderDraft[];
};

function formatCurrency(value: number) {
  return `RM ${value.toLocaleString()}`;
}

function getItemTotal(item: SplitLineItem) {
  return item.quantity * item.unitPrice;
}

function createPoReference(prId: string, index: number) {
  return `PO-${prId.slice(-3)}-${String.fromCharCode(64 + index)}`;
}

export default function PoSplitWorkspace({
  purchaseRequest,
  summary,
  initialItems,
  initialPurchaseOrders,
}: PoSplitWorkspaceProps) {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [selectedPoId, setSelectedPoId] = useState(
    initialPurchaseOrders[0]?.id ?? ''
  );

  const itemMap = useMemo(() => {
    return initialItems.reduce<Record<string, SplitLineItem>>(
      (accumulator, item) => {
        accumulator[item.id] = item;
        return accumulator;
      },
      {}
    );
  }, [initialItems]);

  const assignedItemIds = useMemo(() => {
    return new Set(
      purchaseOrders.flatMap((purchaseOrder) => purchaseOrder.itemIds)
    );
  }, [purchaseOrders]);

  const poolItems = initialItems.filter(
    (item) => !assignedItemIds.has(item.id)
  );
  const selectedPo =
    purchaseOrders.find((purchaseOrder) => purchaseOrder.id === selectedPoId) ??
    purchaseOrders[0] ??
    null;

  const poSummaries = purchaseOrders.map((purchaseOrder) => {
    const items = purchaseOrder.itemIds.map((itemId) => itemMap[itemId]);
    const total = items.reduce((sum, item) => sum + getItemTotal(item), 0);

    return {
      ...purchaseOrder,
      items,
      total,
    };
  });

  const poolTotal = poolItems.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );
  const assignedTotal = poSummaries.reduce((sum, item) => sum + item.total, 0);

  function createNewPo() {
    const nextIndex = purchaseOrders.length + 1;
    const newPoId = `${purchaseRequest.id}-PO-${nextIndex}`;
    const newPurchaseOrder: PurchaseOrderDraft = {
      id: newPoId,
      supplier: null,
      itemIds: [],
      reference: createPoReference(purchaseRequest.id, nextIndex),
    };

    setPurchaseOrders((current) => [...current, newPurchaseOrder]);
    setSelectedPoId(newPoId);
  }

  function moveItemToPo(itemId: string, targetPoId: string) {
    const item = itemMap[itemId];

    setPurchaseOrders((current) =>
      current.map((purchaseOrder) => {
        const hasItem = purchaseOrder.itemIds.includes(itemId);

        if (purchaseOrder.id === targetPoId) {
          if (hasItem) {
            return purchaseOrder;
          }

          const nextSupplier = purchaseOrder.supplier ?? item.supplier;

          if (nextSupplier !== item.supplier) {
            return purchaseOrder;
          }

          return {
            ...purchaseOrder,
            supplier: nextSupplier,
            itemIds: [...purchaseOrder.itemIds, itemId],
          };
        }

        if (!hasItem) {
          return purchaseOrder;
        }

        const remainingItems = purchaseOrder.itemIds.filter(
          (currentItemId) => currentItemId !== itemId
        );

        return {
          ...purchaseOrder,
          supplier: remainingItems.length ? purchaseOrder.supplier : null,
          itemIds: remainingItems,
        };
      })
    );
  }

  function moveItemToPool(itemId: string) {
    setPurchaseOrders((current) =>
      current.map((purchaseOrder) => {
        if (!purchaseOrder.itemIds.includes(itemId)) {
          return purchaseOrder;
        }

        const remainingItems = purchaseOrder.itemIds.filter(
          (currentItemId) => currentItemId !== itemId
        );

        return {
          ...purchaseOrder,
          supplier: remainingItems.length ? purchaseOrder.supplier : null,
          itemIds: remainingItems,
        };
      })
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,_#11183A_0%,_#1D4ED8_100%)] p-6 text-white shadow-surface md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-100/70">
              PR to PO split workspace
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
              {purchaseRequest.id}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-100 md:text-base">
              {purchaseRequest.title}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/85">
              {summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-100/70">
                PR total
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold">
                {formatCurrency(purchaseRequest.amount)}
              </p>
            </article>
            <article className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-100/70">
                Assigned to POs
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold">
                {formatCurrency(assignedTotal)}
              </p>
            </article>
            <article className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-100/70">
                Pool balance
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold">
                {formatCurrency(poolTotal)}
              </p>
            </article>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
                  Item pool
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
                  Unassigned lines waiting for a PO
                </h2>
              </div>
              {selectedPo ? (
                <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                  Selected PO: {selectedPo.reference}
                </p>
              ) : null}
            </div>

            <div className="mt-5 space-y-4">
              {poolItems.length ? (
                poolItems.map((item) => {
                  const supplierMismatch =
                    selectedPo?.supplier &&
                    selectedPo.supplier !== item.supplier;

                  return (
                    <article
                      key={item.id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-red">
                              {item.category}
                            </span>
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                              {item.supplier}
                            </span>
                          </div>
                          <p className="mt-3 text-lg font-semibold text-slate-900">
                            {item.description}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Qty {item.quantity} x{' '}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <p className="font-heading text-2xl font-semibold text-brand-blue">
                            {formatCurrency(getItemTotal(item))}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              selectedPo
                                ? moveItemToPo(item.id, selectedPo.id)
                                : undefined
                            }
                            disabled={!selectedPo || Boolean(supplierMismatch)}
                            className="inline-flex rounded-full bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1d1a45] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {!selectedPo
                              ? 'Create or select a PO'
                              : supplierMismatch
                              ? 'Supplier mismatch'
                              : `Move to ${selectedPo.reference}`}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="font-heading text-2xl font-semibold text-brand-blue">
                    Pool is clear
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Every split line is assigned to a purchase order. Move any
                    line back from a PO if procurement needs to reshuffle it.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
                  Active PO
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
                  {selectedPo
                    ? selectedPo.reference
                    : 'No purchase order selected'}
                </h2>
              </div>
              {selectedPo ? (
                <div className="rounded-[20px] bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  Supplier:{' '}
                  <span className="text-brand-blue">
                    {selectedPo.supplier ?? 'Not locked yet'}
                  </span>
                </div>
              ) : null}
            </div>

            {selectedPo ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-brand-blue/10 bg-brand-blue/5 p-4 text-sm leading-7 text-slate-700">
                  Each purchase order can only be linked to one supplier. The
                  first item moved in locks the supplier, and empty POs reset
                  back to reusable draft status.
                </div>

                {selectedPo.itemIds.length ? (
                  selectedPo.itemIds.map((itemId) => {
                    const item = itemMap[itemId];

                    return (
                      <article
                        key={item.id}
                        className="rounded-[24px] border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                              {item.category}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {item.description}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              Qty {item.quantity} x{' '}
                              {formatCurrency(item.unitPrice)}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-end">
                            <p className="font-heading text-2xl font-semibold text-brand-blue">
                              {formatCurrency(getItemTotal(item))}
                            </p>
                            <button
                              type="button"
                              onClick={() => moveItemToPool(item.id)}
                              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-red hover:text-brand-red"
                            >
                              Return to pool
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="font-heading text-2xl font-semibold text-brand-blue">
                      Draft PO is empty
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Select lines from the pool to start building this supplier
                      PO.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-heading text-2xl font-semibold text-brand-blue">
                  No PO available
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Open a new purchase order from the sidebar to start splitting
                  this request.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
              Purchase orders
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
              Supplier-linked PO list
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Review each PO, switch focus, and open another draft whenever you
              need to split more lines out of the pool.
            </p>
          </div>

          <div className="mt-5 flex-1 space-y-3">
            {poSummaries.map((purchaseOrder) => {
              const isActive = purchaseOrder.id === selectedPo?.id;

              return (
                <button
                  key={purchaseOrder.id}
                  type="button"
                  onClick={() => setSelectedPoId(purchaseOrder.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    isActive
                      ? 'border-brand-blue bg-brand-blue text-white shadow-surface'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-brand-blue/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
                          isActive ? 'text-sky-100/80' : 'text-slate-400'
                        }`}
                      >
                        {purchaseOrder.reference}
                      </p>
                      <p className="mt-2 font-heading text-xl font-semibold">
                        {purchaseOrder.supplier ?? 'Draft supplier'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'bg-brand-red/10 text-brand-red'
                      }`}
                    >
                      {purchaseOrder.items.length} line
                      {purchaseOrder.items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-sm ${
                      isActive ? 'text-slate-100' : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(purchaseOrder.total)}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={createNewPo}
            className="mt-5 inline-flex items-center justify-center rounded-[22px] border border-dashed border-brand-blue px-4 py-4 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white"
          >
            Open new PO
          </button>

          <Link href={`/pr/${purchaseRequest.id}`}>
            <a className="mt-3 inline-flex items-center justify-center rounded-[22px] border border-slate-300 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-brand-red hover:text-brand-red">
              Back to PR detail
            </a>
          </Link>
        </aside>
      </div>
    </div>
  );
}
