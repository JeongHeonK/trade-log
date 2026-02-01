/**
 * 공통 포맷팅 유틸리티
 *
 * 날짜, 숫자, 퍼센트, 손익 표시를 한국어 로케일 기준으로 포맷한다.
 */

/** ISO 날짜 문자열을 "YYYY. MM. DD." 형식으로 변환 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 숫자를 한국어 로케일 천단위 구분 형식으로 변환 (소수점 최대 2자리) */
export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** 퍼센트 값을 부호 포함 문자열로 변환 (예: "+12.34%", "-5.00%") */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** 손익 금액을 부호 + 천단위 구분 형식으로 변환 */
export function formatPnl(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

/** 통화 금액을 부호 + 천단위 구분 형식으로 변환 (0 이상이면 + 표시) */
export function formatCurrency(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ko-KR")}`;
}
