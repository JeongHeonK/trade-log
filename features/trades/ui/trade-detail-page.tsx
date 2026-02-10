"use client";

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { getTradeById } from "@/features/trades/api/trade-repository";
import { useDeleteTrade } from "@/features/trades/hooks/use-trade-mutations";
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatPnl,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

interface TradeDetailPageProps {
  id: string;
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

export function TradeDetailPage({ id }: TradeDetailPageProps) {
  const router = useRouter();
  const deleteTrade = useDeleteTrade();

  const trade = useLiveQuery(
    () => getTradeById(id).then((t) => t ?? null),
    [id],
  );

  const handleDelete = useCallback(() => {
    const result = deleteTrade(id);
    if (!result.success) {
      toast.error(`매매 삭제 실패: ${result.error}`);
      return;
    }
    toast.success("매매가 삭제되었습니다");
    router.push("/trades");
  }, [id, deleteTrade, router]);

  if (trade === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (trade === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          매매를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const pnlColor =
    trade.pnl !== undefined && trade.pnl > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : trade.pnl !== undefined && trade.pnl < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">{trade.ticker}</h1>
          <Badge
            variant={trade.direction === "long" ? "default" : "destructive"}
          >
            {trade.direction === "long" ? "Long" : "Short"}
          </Badge>
          <Badge
            variant={trade.status === "open" ? "secondary" : "outline"}
            className={
              trade.status === "open"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : ""
            }
          >
            {trade.status === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/trades/${id}/edit`} />}
          >
            <HugeiconsIcon
              icon={PencilEdit02Icon}
              size={14}
              strokeWidth={2}
              data-icon="inline-start"
              aria-hidden
            />
            수정
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={14}
                    strokeWidth={2}
                    data-icon="inline-start"
                    aria-hidden
                  />
                  삭제
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>매매 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  이 매매 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>매매 정보</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <InfoRow label="진입가">{formatNumber(trade.entryPrice)}</InfoRow>
            <Separator />
            {trade.exitPrice !== undefined && (
              <>
                <InfoRow label="청산가">
                  {formatNumber(trade.exitPrice)}
                </InfoRow>
                <Separator />
              </>
            )}
            <InfoRow label="수량">{formatNumber(trade.quantity)}</InfoRow>
            <Separator />
            <InfoRow label="진입일">{formatDate(trade.entryDate)}</InfoRow>
            {trade.exitDate && (
              <>
                <Separator />
                <InfoRow label="청산일">{formatDate(trade.exitDate)}</InfoRow>
              </>
            )}
            {trade.pnl !== undefined && (
              <>
                <Separator />
                <InfoRow label="손익">
                  <span className={cn("font-semibold", pnlColor)}>
                    {formatPnl(trade.pnl)}
                    {trade.pnlPercent !== undefined && (
                      <span className="ml-1 text-xs font-normal">
                        ({formatPercent(trade.pnlPercent)})
                      </span>
                    )}
                  </span>
                </InfoRow>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>태그</CardTitle>
          </CardHeader>
          <CardContent>
            {trade.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trade.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">태그 없음</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>매매 근거</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {trade.reasoning}
            </p>
          </CardContent>
        </Card>

        {trade.reflection && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>회고</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {trade.reflection}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
