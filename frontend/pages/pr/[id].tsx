import Link from 'next/link';
import Card, { CardHeader } from '../../components/atoms/Card';
import {
  purchaseRequests,
  PurchaseRequest,
} from '../../utils/purchaseRequestsData';

type PrDetailsPageProps = {
  purchaseRequest: PurchaseRequest;
};

export default function PrDetailsPage({ purchaseRequest }: PrDetailsPageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          Purchase request detail
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          {purchaseRequest.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{purchaseRequest.id}</p>
      </section>

      <Card as="section" variant="base" padding="lg" className="mb-5">
        <CardHeader
          subtitle="Request Summary"
          title={purchaseRequest.title}
          className="mb-1"
          titleClassName="text-lg"
        />
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Department</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.department}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Requester</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.requester}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Status</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.status}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Vendor</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.vendor}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Amount</p>
          <strong className="font-semibold text-brand-blue">
            RM {purchaseRequest.amount.toLocaleString()}
          </strong>
        </div>
        <div className="flex flex-col py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Last update</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.updatedAt}
          </strong>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
          {purchaseRequest.description}
        </p>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href={`/pr/split/${purchaseRequest.id}`}>
          <a className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]">
            Split into POs
          </a>
        </Link>
        <Link href="/pr">
          <a className="inline-flex items-center rounded-lg border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-brand-white">
            Back to PR board
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
