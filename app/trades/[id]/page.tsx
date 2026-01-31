import { TradeDetailPage } from "@/features/trades/ui/trade-detail-page";

export default async function TradeDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TradeDetailPage id={id} />;
}
