import Link from 'next/link';
import Card, { CardHeader } from '../../../components/atoms/Card';
import {
  purchaseRequests,
  PurchaseRequest,
} from '../../../utils/mockdata/purchaseRequestsData';

type PrSplitPageProps = {
  purchaseRequest: PurchaseRequest;
};

export default function PrSplitPage({ purchaseRequest }: PrSplitPageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          Split PR into Purchase Orders
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          {purchaseRequest.id}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Prepare vendor-level splits for this purchase request before PO
          generation.
        </p>
      </section>

      <Card as="section" variant="base" padding="lg" className="mb-5">
        <CardHeader
          subtitle="Purchase Request"
          title={purchaseRequest.title}
          className="mb-0"
          titleClassName="text-lg"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Department
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {purchaseRequest.department}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Requester
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {purchaseRequest.requester}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Current Vendor
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {purchaseRequest.vendor}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Total Amount
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              RM {purchaseRequest.amount.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
        >
          Create Split Draft
        </button>
        <Link href={`/pr/${purchaseRequest.id}`}>
          <a className="inline-flex items-center rounded-lg border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-brand-white">
            Back to PR details
          </a>
        </Link>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = purchaseRequests.map((item) => ({ params: { id: item.id } }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const purchaseRequest = purchaseRequests.find(
    (item) => item.id === params.id
  );

  if (!purchaseRequest) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      purchaseRequest,
    },
  };
}
