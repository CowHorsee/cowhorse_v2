import PoSplitWorkspace from '../../../components/organisms/PoSplitWorkspace';
import { purchaseRequests } from '../../../utils/purchaseRequestsData';
import { buildPoSplitScenario } from '../../../utils/poSplitData';

type PrSplitPageProps = {
  purchaseRequest: typeof purchaseRequests[number];
};

export default function PrSplitPage({ purchaseRequest }: PrSplitPageProps) {
  const scenario = buildPoSplitScenario(purchaseRequest);

  return (
    <PoSplitWorkspace
      purchaseRequest={purchaseRequest}
      summary={scenario.summary}
      initialItems={scenario.lineItems}
      initialPurchaseOrders={scenario.purchaseOrders}
    />
  );
}

export async function getStaticPaths() {
  return {
    paths: purchaseRequests.map((item) => ({
      params: { id: item.id },
    })),
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
