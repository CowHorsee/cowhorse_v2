import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button, { buttonClassName } from '../../components/atoms/Button';
import Card, { CardHeader } from '../../components/atoms/Card';
import { useToast } from '../../components/ToastProvider';
import { ApiError } from '../../utils/api/apiClient';
import { getUserSession } from '../../utils/localStorage';
import { createPurchaseRequest } from '../../utils/api/prApi';
import {
  fetchInventoryCounts,
  fetchInventoryItems,
  type WarehouseInventoryRow,
} from '../../utils/api/inventoryApi';

type DraftItemRow = {
  sku: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
};

type CreatedMeta = {
  id: string;
  date: string;
};

type ItemOption = {
  sku: string;
  itemName: string;
  unit: string;
  unitPrice: number;
};

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapWarehouseRowsToOptions(
  rows: WarehouseInventoryRow[]
): ItemOption[] {
  return rows.map((row, index) => ({
    sku: row.itemId || `ITEM-${String(index + 1).padStart(3, '0')}`,
    itemName: row.itemName,
    unit: row.unit || 'pcs',
    unitPrice: row.unitPrice || 0,
  }));
}

function mapCountsToOptions(counts: Record<string, number>) {
  return Object.keys(counts).map((itemName, index) => ({
    sku: `ITEM-${String(index + 1).padStart(3, '0')}`,
    itemName,
    unit: 'pcs',
    unitPrice: 0,
  }));
}

export default function CreatePrPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [itemQuery, setItemQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [lineQuantity, setLineQuantity] = useState('');
  const [justification, setJustification] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<DraftItemRow[]>([]);
  const [itemCatalog, setItemCatalog] = useState<ItemOption[]>([]);
  const [itemLoadError, setItemLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [createdMeta, setCreatedMeta] = useState<CreatedMeta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemOptions = useMemo(() => {
    const normalized = itemQuery.trim().toLowerCase();

    return itemCatalog.filter((item) => {
      if (!normalized) {
        return true;
      }

      return (
        item.itemName.toLowerCase().includes(normalized) ||
        item.sku.toLowerCase().includes(normalized)
      );
    });
  }, [itemCatalog, itemQuery]);

  const selectedItem =
    itemCatalog.find((item) => item.sku === selectedSku) || null;

  const totalAmount = draftItems.reduce(
    (sum, row) => sum + row.quantity * row.unitPrice,
    0
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (
        dropdownRef.current &&
        target instanceof Node &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadItemCatalog() {
      try {
        const rows = await fetchInventoryItems();
        if (isMounted && rows.length) {
          setItemCatalog(mapWarehouseRowsToOptions(rows));
          setItemLoadError('');
          return;
        }

        const counts = await fetchInventoryCounts();
        if (isMounted) {
          setItemCatalog(mapCountsToOptions(counts));
          setItemLoadError('');
        }
      } catch (error) {
        if (isMounted) {
          setItemCatalog([]);
          setItemLoadError(
            error instanceof ApiError
              ? error.message
              : 'Unable to load item catalog from API.'
          );
        }
      }
    }

    void loadItemCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  function selectItem(sku: string) {
    const nextItem = itemCatalog.find((item) => item.sku === sku);
    if (!nextItem) {
      return;
    }

    setSelectedSku(nextItem.sku);
    setItemQuery(`${nextItem.itemName} (${nextItem.sku})`);
    setIsDropdownOpen(false);
  }

  function handleAddItem() {
    setFormError('');

    if (!selectedItem) {
      setFormError('Please select an item before adding to the list.');
      return;
    }

    const parsedQuantity = Number(lineQuantity);
    if (
      !lineQuantity.trim() ||
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setFormError('Quantity must be a valid number greater than zero.');
      return;
    }

    setDraftItems((currentRows) => [
      ...currentRows,
      {
        sku: selectedItem.sku,
        itemName: selectedItem.itemName,
        unit: selectedItem.unit,
        unitPrice: selectedItem.unitPrice,
        quantity: parsedQuantity,
      },
    ]);

    setSelectedSku('');
    setItemQuery('');
    setLineQuantity('');
    setCreatedMeta(null);
  }

  function removeItem(indexToRemove: number) {
    setDraftItems((currentRows) =>
      currentRows.filter((_, rowIndex) => rowIndex !== indexToRemove)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!draftItems.length) {
      setFormError('Add at least one item before submitting PR.');
      return;
    }

    const sessionUser = getUserSession();
    if (!sessionUser?.user_id) {
      setFormError('User session required before creating a PR.');
      return;
    }

    setIsSubmitting(true);

    try {
      const procItemPayload = draftItems.map((row) => ({
        [row.itemName]: row.quantity,
      }));

      const apiResponse = await createPurchaseRequest({
        user_id: sessionUser.user_id,
        proc_item: procItemPayload,
        justification:
          justification.trim() ||
          draftItems
            .map(
              (row, index) =>
                `${index + 1}. ${row.itemName} (${
                  row.sku
                }) - ${row.quantity.toLocaleString()} ${
                  row.unit
                } x RM ${row.unitPrice.toLocaleString()}`
            )
            .join(' | '),
      });

      const createdDate = formatToday();
      const generatedId = `PR-${Date.now()}`;
      const apiPrId = String((apiResponse.pr_id as string) || '').trim();
      const nextId = apiPrId || generatedId;

      if (typeof window !== 'undefined') {
        const key = `created-pr-items:${nextId}`;
        const justificationText =
          justification.trim() ||
          draftItems
            .map(
              (row, index) =>
                `${index + 1}. ${row.itemName} (${
                  row.sku
                }) - ${row.quantity.toLocaleString()} ${
                  row.unit
                } x RM ${row.unitPrice.toLocaleString()}`
            )
            .join(' | ');
        const value = JSON.stringify(
          draftItems.map((row) => ({
            itemName: row.itemName,
            sku: row.sku,
            quantity: row.quantity,
            unit: row.unit,
            unitPrice: row.unitPrice,
          }))
        );
        window.sessionStorage.setItem(key, value);
        window.sessionStorage.setItem(
          `created-pr-justification:${nextId}`,
          justificationText
        );
      }

      setCreatedMeta({ id: nextId, date: createdDate });
      showToast({
        title: 'PR created',
        description: `Purchase request ${nextId} created successfully.`,
        variant: 'success',
      });
      setDraftItems([]);
      setSelectedSku('');
      setItemQuery('');
      setLineQuantity('');
      setJustification('');
      await router.push(`/pr/${encodeURIComponent(nextId)}`);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the purchase request right now.'
      );
      showToast({
        title: 'Create PR failed',
        description:
          error instanceof ApiError
            ? error.message
            : 'Unable to create the purchase request right now.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <div className="mb-3 flex items-center">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <span className="text-brand-blue">Create PR</span>
          </div>
        </div>

        <CardHeader
          subtitle="Purchase requests"
          title="Create PR"
          className="mb-1"
          titleClassName="text-lg"
        />

        <form onSubmit={handleSubmit}>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end">
            <div>
              <label
                htmlFor="pr-item-search"
                className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Item
              </label>
              <div className="relative" ref={dropdownRef}>
                <input
                  id="pr-item-search"
                  type="text"
                  value={itemQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(event) => {
                    setItemQuery(event.target.value);
                    setSelectedSku('');
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Search item name or SKU"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
                />

                {isDropdownOpen ? (
                  <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                    {itemOptions.length ? (
                      itemOptions.map((item) => (
                        <button
                          key={item.sku}
                          type="button"
                          onClick={() => selectItem(item.sku)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span>{item.itemName}</span>
                          <span className="text-xs font-semibold text-slate-400">
                            {item.sku}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        No item found.
                      </p>
                    )}
                  </div>
                ) : null}
                {itemLoadError ? (
                  <p className="mt-2 text-xs font-semibold text-brand-red">
                    {itemLoadError}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor="pr-line-quantity"
                className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Quantity
              </label>
              <input
                id="pr-line-quantity"
                type="number"
                min="0"
                step="1"
                value={lineQuantity}
                onChange={(event) => setLineQuantity(event.target.value)}
                placeholder="e.g. 12"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
              />
            </div>

            <Button variant="outline" onClick={handleAddItem}>
              + Add Item
            </Button>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-100 bg-white">
                {draftItems.length ? (
                  draftItems.map((row, index) => (
                    <tr key={`${row.sku}-${index}`}>
                      <td className="px-4 py-3 text-slate-600">
                        Item {index + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-blue">
                        {row.itemName} ({row.sku})
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.quantity.toLocaleString()} {row.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        RM {row.unitPrice.toLocaleString()} / {row.unit}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-blue">
                        RM {(row.quantity * row.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="link"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No items added yet.
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 text-slate-600">
                    Total Amount (RM)
                  </td>
                  <td
                    colSpan={5}
                    className="px-4 py-3 font-semibold text-brand-blue"
                  >
                    {totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <label
              htmlFor="pr-justification"
              className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              Justification
            </label>
            <textarea
              id="pr-justification"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              rows={4}
              placeholder="Provide business reason for this request"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
            />
          </div>

          {formError ? (
            <p className="mt-3 text-sm font-semibold text-brand-red">
              {formError}
            </p>
          ) : null}

          {createdMeta ? (
            <Card variant="soft" padding="md" className="mt-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                PR created
              </p>
              <p className="mt-1 text-sm text-slate-700">
                ID:{' '}
                <span className="font-bold text-brand-blue">
                  {createdMeta.id}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                Date:{' '}
                <span className="font-bold text-brand-blue">
                  {createdMeta.date}
                </span>
              </p>
            </Card>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3 flex-justify-content-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create & Submit for Approval'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
