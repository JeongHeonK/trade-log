"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function TradeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TradeDetailError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>매매 정보를 불러올 수 없습니다</CardTitle>
          <CardDescription>
            매매 데이터를 로드하는 중 오류가 발생했습니다. 데이터가 손상되었거나
            존재하지 않을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">
            {error.message || "알 수 없는 오류"}
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" render={<Link href="/trades" />}>
            매매 목록으로
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
