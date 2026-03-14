import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button, { buttonClassName } from '../../components/atoms/Button';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/api/apiClient';
import {
  getCreatedPurchaseRequests,
  getUserSession,
  saveCreatedPurchaseRequest,
} from '../../utils/localStorage';
import { createPurchaseRequest } from '../../utils/api/prApi';
import { inventoryItems } from '../../utils/mockdata/inventoryItemsData';
import {
  purchaseRequests,
  type PurchaseRequest,
} from '../../utils/mockdata/purchaseRequestsData';

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

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextPrId(existingRows: PurchaseRequest[]) {
  const currentYear = new Date().getFullYear();
  const maxSequence = existingRows.reduce((maxValue, row) => {
    const match = row.id.match(/PR-(\d{4})-(\d+)$/);
    if (!match) {
      return maxValue;
    }

    const year = Number(match[1]);
    const sequence = Number(match[2]);

    if (year !== currentYear || Number.isNaN(sequence)) {
      return maxValue;
    }

    return Math.max(maxValue, sequence);
  }, 100);

  return `PR-${currentYear}-${String(maxSequence + 1).padStart(3, '0')}`;
}

export default function CreatePrPage() {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [itemQuery, setItemQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [lineQuantity, setLineQuantity] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<DraftItemRow[]>([]);
  const [formError, setFormError] = useState('');
  const [createdMeta, setCreatedMeta] = useState<CreatedMeta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemOptions = useMemo(() => {
    const normalized = itemQuery.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      if (!normalized) {
        return true;
      }

      return (
        item.itemName.toLowerCase().includes(normalized) ||
        item.sku.toLowerCase().includes(normalized)
      );
    });
  }, [itemQuery]);

  const selectedItem =
    inventoryItems.find((item) => item.sku === selectedSku) || null;

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

  function selectItem(sku: string) {
    const nextItem = inventoryItems.find((item) => item.sku === sku);
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
      const procItemPayload = draftItems.reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.itemName] = (acc[row.itemName] || 0) + row.quantity;
          return acc;
        },
        {}
      );

      const apiResponse = await createPurchaseRequest({
        user_id: sessionUser.user_id,
        proc_item: procItemPayload,
        justification: draftItems
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
      const existingRows = [
        ...getCreatedPurchaseRequests(),
        ...purchaseRequests,
      ];
      const generatedId = getNextPrId(existingRows);
      const apiPrId = String((apiResponse.pr_id as string) || '').trim();
      const nextId = apiPrId || generatedId;
      const firstItemName = draftItems[0]?.itemName || 'Requested item';

      const newRequest: PurchaseRequest = {
        id: nextId,
        title:
          draftItems.length > 1
            ? `${firstItemName} and ${draftItems.length - 1} more item(s)`
            : `${firstItemName} procurement request`,
        department: 'Operations',
        requester: sessionUser.name || 'Guest User',
        vendor: 'TBD',
        amount: totalAmount,
        status: 'Pending Approval',
        updatedAt: createdDate,
        description: draftItems
          .map(
            (row, index) =>
              `${index + 1}. ${row.itemName} (${
                row.sku
              }) - ${row.quantity.toLocaleString()} ${
                row.unit
              } x RM ${row.unitPrice.toLocaleString()}`
          )
          .join(' | '),
      };

      saveCreatedPurchaseRequest(newRequest);
      setCreatedMeta({ id: nextId, date: createdDate });
      setDraftItems([]);
      setSelectedSku('');
      setItemQuery('');
      setLineQuantity('');
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the purchase request right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <div className="mb-3 flex items-center">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Link href="/pr">
              <a className="transition hover:text-brand-blue">PR Board</a>
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
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

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit PR'}
            </Button>
            <Link href="/pr">
              <a className={buttonClassName({ variant: 'outline' })}>
                Back to PR Board
              </a>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
