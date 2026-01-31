import { TradeFormPage } from "@/features/trades/ui/trade-form-page";

export default async function EditTradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TradeFormPage id={id} />;
}
