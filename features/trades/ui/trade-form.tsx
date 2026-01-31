"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { calcPnl, calcPnlPercent } from "@/features/trades/lib/calc-pnl";
import { cn } from "@/shared/lib/utils";
import type { TradeDirection, TradeStatus } from "@/shared/types/trade";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

interface TradeFormValues {
  ticker: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  entryDate: string;
  exitDate: string;
  tags: string;
  reasoning: string;
  reflection: string;
}

export interface TradeFormData {
  ticker: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  pnl?: number;
  pnlPercent?: number;
  tags: string[];
  reasoning: string;
  reflection?: string;
}

interface TradeFormProps {
  mode: "create" | "edit";
  defaultValues?: TradeFormData;
  onSubmit: (data: TradeFormData) => void;
}

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatPnl(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

function toFormValues(data?: TradeFormData): TradeFormValues {
  if (!data) {
    return {
      ticker: "",
      direction: "long",
      status: "open",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      entryDate: new Date().toISOString().slice(0, 10),
      exitDate: "",
      tags: "",
      reasoning: "",
      reflection: "",
    };
  }
  return {
    ticker: data.ticker,
    direction: data.direction,
    status: data.status,
    entryPrice: String(data.entryPrice),
    exitPrice: data.exitPrice !== undefined ? String(data.exitPrice) : "",
    quantity: String(data.quantity),
    entryDate: data.entryDate.slice(0, 10),
    exitDate: data.exitDate ? data.exitDate.slice(0, 10) : "",
    tags: data.tags.join(", "),
    reasoning: data.reasoning,
    reflection: data.reflection ?? "",
  };
}

function PnlPreview({
  entryPrice,
  exitPrice,
  quantity,
  direction,
  status,
}: {
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  direction: TradeDirection;
  status: TradeStatus;
}) {
  const pnlData = useMemo(() => {
    if (status !== "closed") return null;
    const entry = Number.parseFloat(entryPrice);
    const exit = Number.parseFloat(exitPrice);
    const qty = Number.parseFloat(quantity);
    if (Number.isNaN(entry) || Number.isNaN(exit) || Number.isNaN(qty)) {
      return null;
    }
    if (entry <= 0 || qty <= 0) return null;
    const pnl = calcPnl(entry, exit, qty, direction);
    const pnlPercent = calcPnlPercent(entry, exit, direction);
    return { pnl, pnlPercent };
  }, [entryPrice, exitPrice, quantity, direction, status]);

  if (!pnlData) return null;

  const color =
    pnlData.pnl > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : pnlData.pnl < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <p className="text-muted-foreground mb-1 text-xs font-medium">
        PnL 미리보기
      </p>
      <p className={cn("text-lg font-semibold", color)}>
        {formatPnl(pnlData.pnl)}
        <span className="ml-1.5 text-sm font-normal">
          ({formatPercent(pnlData.pnlPercent)})
        </span>
      </p>
    </div>
  );
}

export function TradeForm({ mode, defaultValues, onSubmit }: TradeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    defaultValues: toFormValues(defaultValues),
  });

  const watchedStatus = useWatch({ control, name: "status" });
  const watchedDirection = useWatch({ control, name: "direction" });
  const watchedEntryPrice = useWatch({ control, name: "entryPrice" });
  const watchedExitPrice = useWatch({ control, name: "exitPrice" });
  const watchedQuantity = useWatch({ control, name: "quantity" });

  const isClosed = watchedStatus === "closed";

  const processSubmit = (values: TradeFormValues) => {
    const entry = Number.parseFloat(values.entryPrice);
    const exit = values.exitPrice
      ? Number.parseFloat(values.exitPrice)
      : undefined;
    const qty = Number.parseFloat(values.quantity);

    let pnl: number | undefined;
    let pnlPercent: number | undefined;

    if (isClosed && exit !== undefined && !Number.isNaN(exit) && entry > 0) {
      pnl = calcPnl(entry, exit, qty, values.direction);
      pnlPercent = calcPnlPercent(entry, exit, values.direction);
    }

    const tags = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      ticker: values.ticker.toUpperCase().trim(),
      direction: values.direction,
      status: values.status,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      entryDate: new Date(values.entryDate).toISOString(),
      exitDate: values.exitDate
        ? new Date(values.exitDate).toISOString()
        : undefined,
      pnl,
      pnlPercent,
      tags,
      reasoning: values.reasoning,
      reflection: values.reflection || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(processSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.ticker || undefined}>
          <FieldLabel htmlFor="ticker">종목코드</FieldLabel>
          <Input
            id="ticker"
            placeholder="AAPL"
            aria-invalid={!!errors.ticker}
            aria-describedby={errors.ticker ? "ticker-error" : undefined}
            {...register("ticker", {
              required: "종목코드를 입력하세요",
            })}
          />
          {errors.ticker && (
            <FieldError id="ticker-error">{errors.ticker.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="direction">방향</FieldLabel>
          <Select
            value={watchedDirection}
            onValueChange={(v) => {
              if (v === "long" || v === "short") {
                setValue("direction", v);
              }
            }}
          >
            <SelectTrigger id="direction" className="w-full" aria-label="방향">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="status">상태</FieldLabel>
          <Select
            value={watchedStatus}
            onValueChange={(v) => {
              if (v === "open" || v === "closed") {
                setValue("status", v);
              }
            }}
          >
            <SelectTrigger id="status" className="w-full" aria-label="상태">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field data-invalid={!!errors.entryPrice || undefined}>
          <FieldLabel htmlFor="entryPrice">진입가</FieldLabel>
          <Input
            id="entryPrice"
            type="number"
            step="any"
            placeholder="0"
            aria-invalid={!!errors.entryPrice}
            aria-describedby={
              errors.entryPrice ? "entryPrice-error" : undefined
            }
            {...register("entryPrice", {
              required: "진입가를 입력하세요",
              validate: (v) =>
                Number.parseFloat(v) > 0 || "0보다 큰 값을 입력하세요",
            })}
          />
          {errors.entryPrice && (
            <FieldError id="entryPrice-error">
              {errors.entryPrice.message}
            </FieldError>
          )}
        </Field>

        {isClosed && (
          <Field>
            <FieldLabel htmlFor="exitPrice">청산가</FieldLabel>
            <Input
              id="exitPrice"
              type="number"
              step="any"
              placeholder="0"
              {...register("exitPrice")}
            />
          </Field>
        )}

        <Field data-invalid={!!errors.quantity || undefined}>
          <FieldLabel htmlFor="quantity">수량</FieldLabel>
          <Input
            id="quantity"
            type="number"
            step="any"
            placeholder="0"
            aria-invalid={!!errors.quantity}
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
            {...register("quantity", {
              required: "수량을 입력하세요",
              validate: (v) =>
                Number.parseFloat(v) > 0 || "0보다 큰 값을 입력하세요",
            })}
          />
          {errors.quantity && (
            <FieldError id="quantity-error">
              {errors.quantity.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.entryDate || undefined}>
          <FieldLabel htmlFor="entryDate">진입일</FieldLabel>
          <Input
            id="entryDate"
            type="date"
            aria-invalid={!!errors.entryDate}
            aria-describedby={errors.entryDate ? "entryDate-error" : undefined}
            {...register("entryDate", {
              required: "진입일을 입력하세요",
            })}
          />
          {errors.entryDate && (
            <FieldError id="entryDate-error">
              {errors.entryDate.message}
            </FieldError>
          )}
        </Field>

        {isClosed && (
          <Field>
            <FieldLabel htmlFor="exitDate">청산일</FieldLabel>
            <Input id="exitDate" type="date" {...register("exitDate")} />
          </Field>
        )}
      </div>

      {isClosed && (
        <PnlPreview
          entryPrice={watchedEntryPrice}
          exitPrice={watchedExitPrice}
          quantity={watchedQuantity}
          direction={watchedDirection}
          status={watchedStatus}
        />
      )}

      <Field>
        <FieldLabel htmlFor="tags">태그</FieldLabel>
        <Input
          id="tags"
          placeholder="스윙, 실적발표, 돌파 (쉼표로 구분)"
          {...register("tags")}
        />
      </Field>

      <Field data-invalid={!!errors.reasoning || undefined}>
        <FieldLabel htmlFor="reasoning">매매 근거</FieldLabel>
        <Textarea
          id="reasoning"
          rows={4}
          placeholder="이 매매를 시작한 이유를 작성하세요"
          aria-invalid={!!errors.reasoning}
          aria-describedby={errors.reasoning ? "reasoning-error" : undefined}
          {...register("reasoning", {
            required: "매매 근거를 입력하세요",
          })}
        />
        {errors.reasoning && (
          <FieldError id="reasoning-error">
            {errors.reasoning.message}
          </FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="reflection">회고</FieldLabel>
        <Textarea
          id="reflection"
          rows={3}
          placeholder="매매 후 느낀 점이나 개선할 점을 작성하세요"
          {...register("reflection")}
        />
      </Field>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting
            ? "저장 중..."
            : mode === "create"
              ? "등록하기"
              : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
