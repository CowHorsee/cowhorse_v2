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
    <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1440px]">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-[calc(100vh-4rem)] flex-col rounded-[28px] bg-[#d9d9d9] p-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-400/40 pb-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600">
              Purchase request
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-blue">
              {purchaseRequest.id}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {purchaseRequest.title}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] bg-white/70 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  PR total
                </p>
                <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                  {formatCurrency(purchaseRequest.amount)}
                </p>
              </div>
              <div className="rounded-[22px] bg-white/70 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Pool balance
                </p>
                <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                  {formatCurrency(poolTotal)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{summary}</p>
          </div>

          <div className="mt-6 flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600">
                  PO list
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
                  Open purchase orders
                </h2>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
                {poSummaries.length} total
              </span>
            </div>

            <div className="mt-5 max-h-[calc(100vh-29rem)] space-y-3 overflow-y-auto pr-1">
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
                        : 'border-transparent bg-white/75 text-slate-900 hover:border-brand-blue/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
                            isActive ? 'text-sky-100/80' : 'text-slate-500'
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
                            : 'bg-slate-900/5 text-slate-600'
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
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={createNewPo}
              className="inline-flex items-center justify-center rounded-[22px] bg-brand-blue px-4 py-4 text-sm font-bold text-white transition hover:bg-[#1d1a45]"
            >
              Open new PO
            </button>

            <Link href={`/pr/${purchaseRequest.id}`}>
              <a className="inline-flex items-center justify-center rounded-[22px] border border-slate-500/30 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-brand-red hover:text-brand-red">
                Back to PR detail
              </a>
            </Link>
          </div>
        </aside>

        <div className="grid min-h-[calc(100vh-4rem)] gap-6 xl:grid-rows-[minmax(0,2fr)_minmax(260px,1fr)]">
          <section className="overflow-hidden rounded-[28px] bg-[#8fd5be] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-3 border-b border-emerald-900/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-950/55">
                    PO review
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                    {selectedPo
                      ? `${selectedPo.reference} details`
                      : 'No purchase order selected'}
                  </h2>
                </div>
                {selectedPo ? (
                  <div className="rounded-[20px] bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700">
                    Supplier:{' '}
                    <span className="text-brand-blue">
                      {selectedPo.supplier ?? 'Not locked yet'}
                    </span>
                  </div>
                ) : null}
              </div>

              {selectedPo ? (
                <div className="mt-5 flex h-full flex-col">
                  <div className="grid gap-3 md:grid-cols-3">
                    <article className="rounded-[22px] bg-white/60 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Assigned amount
                      </p>
                      <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                        {formatCurrency(
                          poSummaries.find((item) => item.id === selectedPo.id)
                            ?.total ?? 0
                        )}
                      </p>
                    </article>
                    <article className="rounded-[22px] bg-white/60 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Line items
                      </p>
                      <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                        {selectedPo.itemIds.length}
                      </p>
                    </article>
                    <article className="rounded-[22px] bg-white/60 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Assigned total
                      </p>
                      <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                        {formatCurrency(assignedTotal)}
                      </p>
                    </article>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-white/55 p-4 text-sm leading-7 text-slate-700">
                    Each purchase order can only be linked to one supplier. The
                    first assigned item locks the supplier, and moving every
                    item out sends the PO back into draft mode.
                  </div>

                  <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
                    {selectedPo.itemIds.length ? (
                      selectedPo.itemIds.map((itemId) => {
                        const item = itemMap[itemId];

                        return (
                          <article
                            key={item.id}
                            className="rounded-[24px] bg-white/70 p-4"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                                    {item.category}
                                  </span>
                                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
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
                                  onClick={() => moveItemToPool(item.id)}
                                  className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-red hover:text-brand-red"
                                >
                                  Return to pool
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-emerald-900/20 bg-white/45 p-8 text-center">
                        <div>
                          <p className="font-heading text-2xl font-semibold text-brand-blue">
                            Draft PO is empty
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            Move a line from the pool into this PO to start the
                            supplier review.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-emerald-900/20 bg-white/45 p-8 text-center">
                  <div>
                    <p className="font-heading text-2xl font-semibold text-brand-blue">
                      No PO selected
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Select a purchase order from the left panel to review its
                      details here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] bg-[#df8e8e] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-3 border-b border-rose-950/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-950/55">
                    Pool
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
                    Unassigned lines
                  </h2>
                </div>
                {selectedPo ? (
                  <p className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700">
                    Move into {selectedPo.reference}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
                {poolItems.length ? (
                  poolItems.map((item) => {
                    const supplierMismatch =
                      selectedPo?.supplier &&
                      selectedPo.supplier !== item.supplier;

                    return (
                      <article
                        key={item.id}
                        className="rounded-[24px] bg-white/70 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
                                {item.category}
                              </span>
                              <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
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
                              disabled={
                                !selectedPo || Boolean(supplierMismatch)
                              }
                              className="inline-flex rounded-full bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1d1a45] disabled:cursor-not-allowed disabled:bg-slate-400"
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
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-[24px] border border-dashed border-rose-950/20 bg-white/45 p-8 text-center">
                    <div>
                      <p className="font-heading text-2xl font-semibold text-brand-blue">
                        Pool is clear
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Every line is already assigned to a purchase order.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
