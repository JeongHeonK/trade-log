# Trade Log

로컬 퍼스트 매매일지 앱. 백엔드 없이 브라우저만으로 동작한다.

## 핵심 철학: Zero Marginal Cost Architecture

"가장 안전한 데이터는 아예 서버에 보내지 않는 데이터"

- 백엔드 서버 없음, API 키 없음, 인증 없음, 월간 서버 비용 없음
- 모든 데이터는 브라우저 IndexedDB에 저장
- 오프라인에서도 완전히 동작해야 함
- 외부 API 호출(주가 조회 등)은 클라이언트에서 직접 public API를 호출

## 데이터 아키텍처: Yjs + Dexie 이중 구조

### Yjs (CRDT 상태 관리)
- `Y.Doc` 싱글턴으로 앱 전체 상태 관리 (`shared/infrastructure/yjs/doc.ts`)
- `y-indexeddb`로 IndexedDB에 자동 영속화
- 델타 업데이트: 변경분만 저장하여 효율적
- 다중 탭 동시 접근 시 CRDT로 충돌 없이 병합
- **새 기능 추가 시 Yjs shared type(YMap, YArray 등)을 우선 고려할 것**
- YjsProvider는 `next/dynamic`으로 SSR 제외 로딩 (`app/providers.tsx`)

### Dexie (IndexedDB 쿼리)
- 인덱싱 기반 검색/필터링용 (`shared/infrastructure/db/schema.ts`)
- 종목별, 날짜별, 태그별 복합 쿼리에 사용
- Yjs가 실시간 상태, Dexie가 구조화된 조회 담당

### 데이터 흐름 원칙
1. 쓰기: Yjs shared type에 변경 → y-indexeddb가 자동 영속화
2. 읽기(단순): Yjs observe로 실시간 구독
3. 읽기(복합 쿼리): Dexie 인덱스로 조회
4. 서버 동기화: 하지 않음. 모든 것은 로컬에서 완결

## 기술 스택

- Next.js 16 + TypeScript + React 19
- Yjs + y-indexeddb (CRDT 상태 + 영속화)
- Dexie.js (IndexedDB 쿼리/인덱싱)
- Lightweight Charts (TradingView 금융 차트)
- React Hook Form (폼 관리)
- Tailwind CSS 4 + shadcn (base-vega 스타일, hugeicons)
- Biome (lint + format)

## 프로젝트 구조 (단순화 FSD)

의존 방향: `app/` → `features/` → `shared/` (역방향 금지)

```
app/                              # Next.js App Router (라우팅)
  layout.tsx                      # 서버 컴포넌트, Providers + AppSidebar 감싸기
  providers.tsx                   # 클라이언트 전용, ClientProviders dynamic import
  page.tsx                        # 대시보드 (/)
  trades/
    page.tsx                      # 매매 목록 (/trades)
    new/page.tsx                  # 매매 등록 (/trades/new)
    [id]/page.tsx                 # 매매 상세 (/trades/[id])
    [id]/edit/page.tsx            # 매매 수정 (/trades/[id]/edit)
shared/                           # 공통 레이어
  ui/                             # shadcn 생성 컴포넌트 (직접 수정 지양)
  lib/
    utils.ts                      # cn() 등 유틸
  types/
    trade.ts                      # Trade 타입 정의
    trade-filters.ts              # TradeFilters 타입
  infrastructure/                 # 로컬 퍼스트 데이터 레이어
    yjs/doc.ts                    # Y.Doc 싱글턴 + y-indexeddb persistence
    yjs/provider.tsx              # YjsContext + useYjs 훅
    yjs/trades.ts                 # Yjs trades shared type (CRUD)
    db/schema.ts                  # Dexie IndexedDB 스키마
    sync/trades-sync.ts           # Yjs → Dexie 단방향 동기화
    sync/sync-provider.tsx        # SyncProvider (동기화 시작/정리)
    client-providers.tsx          # YjsProvider + SyncProvider 조합
features/                         # 비즈니스 피처 레이어
  layout/
    app-sidebar.tsx               # 사이드바 네비게이션 (데스크탑 + 모바일)
  trades/
    api/trade-repository.ts       # Dexie 기반 조회 (필터, 단건, 최근)
    lib/calc-pnl.ts               # PnL 계산 순수 함수
    ui/trade-card.tsx             # 매매 카드 컴포넌트
    ui/trade-form.tsx             # 매매 폼 (React Hook Form)
    ui/trade-form-page.tsx        # 폼 페이지 (등록/수정 모드)
    ui/trade-detail-page.tsx      # 매매 상세 페이지
    ui/trades-filter-bar.tsx      # 필터 바 (상태/방향)
    ui/trades-list-page.tsx       # 매매 목록 페이지
  dashboard/
    lib/calc-stats.ts             # 대시보드 통계 계산
    ui/stat-card.tsx              # 통계 카드 컴포넌트
    ui/dashboard-page.tsx         # 대시보드 페이지
hooks/                            # 커스텀 훅
  use-trades.ts                   # Dexie live query 기반 매매 목록 구독
  use-trade-mutations.ts          # Yjs 기반 매매 CRUD 훅
```

## 코딩 컨벤션

### 코드 스타일
- TypeScript strict 모드 사용, `any` 타입 금지
- default export 대신 named export 사용
- CSS: Tailwind 유틸리티 클래스 사용, 커스텀 CSS 파일 금지

### 금지 사항
- 백엔드 서버, 서버 사이드 DB, 외부 인증 서비스 도입 금지
- barrel file(index.ts로 re-export) 사용 금지. 직접 경로 import
- shared/ui/ 아래 shadcn 생성 파일 직접 수정 지양

### Next.js / React
- layout.tsx는 서버 컴포넌트 유지. 클라이언트 로직은 providers.tsx에 격리
- 브라우저 전용 라이브러리(Yjs, Dexie, Lightweight Charts)는 반드시 `next/dynamic` + `ssr: false` 또는 `"use client"` 내에서만 사용
- `Promise.all()`로 독립적 비동기 작업 병렬 처리
- 상태 구독 최소화: 필요한 derived value만 subscribe

### 스타일
- Tailwind CSS 유틸리티 클래스 사용, cn() 헬퍼로 조건부 병합
- shadcn 컴포넌트 활용 (base-vega 스타일, hugeicons 아이콘)

### Lint / Format
- Biome 사용 (`pnpm lint`, `pnpm lint:fix`, `pnpm format`)
- space 2칸, double quote, semicolons, 80자 줄폭
- import 자동 정렬 활성화

## 중요 사항

- .env 파일은 절대 커밋하지 마세요

## 커맨드

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # Biome 린트 체크
pnpm lint:fix     # Biome 린트 자동 수정
pnpm format       # Biome 포맷팅
```
