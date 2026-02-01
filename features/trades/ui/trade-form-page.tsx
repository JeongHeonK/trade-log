"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { getTradeById } from "@/features/trades/api/trade-repository";
import {
  useAddTrade,
  useUpdateTrade,
} from "@/features/trades/hooks/use-trade-mutations";
import { TradeForm, type TradeFormData } from "@/features/trades/ui/trade-form";

interface TradeFormPageProps {
  id?: string;
}

export function TradeFormPage({ id }: TradeFormPageProps) {
  const router = useRouter();
  const addTrade = useAddTrade();
  const updateTrade = useUpdateTrade();
  const isEdit = !!id;

  const trade = useLiveQuery(() => (id ? getTradeById(id) : undefined), [id]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(
    (data: TradeFormData) => {
      try {
        if (isEdit && id) {
          updateTrade(id, {
            ...data,
            updatedAt: new Date().toISOString(),
          });
          toast.success("매매가 수정되었습니다");
          router.push(`/trades/${id}`);
        } else {
          addTrade(data);
          toast.success("매매가 등록되었습니다");
          router.push("/trades");
        }
      } catch {
        toast.error("오류가 발생했습니다");
      }
    },
    [isEdit, id, addTrade, updateTrade, router],
  );

  if (isEdit && trade === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (isEdit && trade === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          매매를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const defaultValues: TradeFormData | undefined = trade
    ? {
        ticker: trade.ticker,
        direction: trade.direction,
        status: trade.status,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        entryDate: trade.entryDate,
        exitDate: trade.exitDate,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        tags: trade.tags,
        reasoning: trade.reasoning,
        reflection: trade.reflection,
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight">
        {isEdit ? "매매 수정" : "새 매매 등록"}
      </h1>
      <TradeForm
        mode={isEdit ? "edit" : "create"}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
