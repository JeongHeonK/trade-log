"use client";

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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>문제가 발생했습니다</CardTitle>
          <CardDescription>
            예상치 못한 오류가 발생했습니다. 아래 버튼을 눌러 다시 시도해
            주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">
            {error.message || "알 수 없는 오류"}
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={reset}>다시 시도</Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            홈으로 이동
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
