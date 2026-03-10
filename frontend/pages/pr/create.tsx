import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/apiClient';
import { getUserSession } from '../../utils/localStorage';
import { createPurchaseRequest } from '../../utils/prApi';

export default function CreatePrPage() {
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [justification, setJustification] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const sessionUser = getUserSession();
    const normalizedItemName = itemName.trim();
    const normalizedQuantity = Number(quantity);
    const normalizedJustification = justification.trim();

    if (!sessionUser?.user_id) {
      setErrorMessage('User session required before creating a PR.');
      return;
    }

    if (!normalizedItemName) {
      setErrorMessage('Item name is required.');
      return;
    }

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }

    if (!normalizedJustification) {
      setErrorMessage('Justification is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createPurchaseRequest({
        user_id: sessionUser.user_id,
        proc_item: { [normalizedItemName]: normalizedQuantity },
        justification: normalizedJustification,
      });

      const nextPrId = String(response.pr_id || response.id || '').trim();
      setSuccessMessage(
        nextPrId
          ? `Purchase request ${nextPrId} created successfully.`
          : 'Purchase request created successfully.'
      );
      setItemName('');
      setQuantity('1');
      setJustification('');

      setTimeout(() => {
        void router.push(
          nextPrId ? `/pr/details?id=${encodeURIComponent(nextPrId)}` : '/pr'
        );
      }, 900);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the purchase request right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
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
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="item-name"
              className="text-sm font-bold text-brand-blue"
            >
              Item Name
            </label>
            <input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="e.g. Ceiling Fan 56-inch"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-brand-blue"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label
              htmlFor="justification"
              className="text-sm font-bold text-brand-blue"
            >
              Justification
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              rows={5}
              placeholder="Why is this purchase needed?"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <p className="text-xs text-slate-500">
            This form maps directly to the live `create_pr` contract: `user_id`,
            `proc_item`, and `justification`.
          </p>

          {errorMessage ? (
            <p className="text-sm font-medium text-brand-red">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm font-medium text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting ? 'Submitting...' : 'Submit PR'}
            </button>
            <Link href="/pr">
              <a className="inline-flex items-center rounded-lg border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white">
                Back to PR Board
              </a>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
