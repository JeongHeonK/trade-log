# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Trade Log

로컬 퍼스트 매매일지 PWA. 백엔드 없이 브라우저만으로 동작한다.

## 핵심 철학: Zero Marginal Cost Architecture

"가장 안전한 데이터는 아예 서버에 보내지 않는 데이터"

- 백엔드 서버 없음, API 키 없음, 인증 없음, 월간 서버 비용 없음
- 모든 데이터는 브라우저 IndexedDB에 저장
- 오프라인에서도 완전히 동작해야 함 (PWA + Service Worker)
- 외부 API 호출(주가 조회 등)은 클라이언트에서 직접 public API를 호출

## 커맨드

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드 (--webpack 플래그 사용, PWA SW 생성 때문)
pnpm lint         # Biome 린트 체크
pnpm lint:fix     # Biome 린트 자동 수정
pnpm format       # Biome 포맷팅
```

## 데이터 아키텍처: Yjs + Dexie 이중 구조

### Yjs (CRDT 상태 관리) — 쓰기의 진실 원천(source of truth)
- `Y.Doc` 싱글턴으로 앱 전체 상태 관리 (`shared/infrastructure/yjs/doc.ts`)
- `y-indexeddb`로 IndexedDB에 자동 영속화 (DB명: `trade-log-yjs`)
- 다중 탭 동시 접근 시 CRDT로 충돌 없이 병합
- **새 기능 추가 시 Yjs shared type(YMap, YArray 등)을 우선 고려할 것**

### Dexie (IndexedDB 쿼리) — 읽기 전용 복제본
- 인덱싱 기반 검색/필터링용 (`shared/infrastructure/db/schema.ts`, DB명: `trade-log`)
- 종목별, 날짜별, 태그별 복합 쿼리에 사용
- `dexie-react-hooks`의 `useLiveQuery`로 반응형 구독

### 데이터 흐름
1. **쓰기**: Yjs shared type에 변경 → y-indexeddb가 자동 영속화
2. **동기화**: Yjs observe → Dexie bulkPut/bulkDelete (단방향, `sync/trades-sync.ts`)
3. **읽기(목록/필터)**: Dexie `useLiveQuery`로 구독 (`features/trades/hooks/use-trades.ts`)
4. **읽기(단건)**: Yjs에서 직접 조회도 가능 (`shared/infrastructure/yjs/trades.ts`)
5. 서버 동기화 없음. 모든 것은 로컬에서 완결

### 새 엔티티 추가 시 패턴
1. `shared/types/`에 타입 정의
2. `shared/infrastructure/yjs/`에 shared type CRUD 함수
3. `shared/infrastructure/db/schema.ts`에 Dexie 테이블 추가
4. `shared/infrastructure/sync/`에 Yjs → Dexie 동기화 로직
5. `features/<name>/hooks/`에 mutation 훅 (Yjs 쓰기) + query 훅 (Dexie 읽기)

## Provider 체인 (SSR 방지 구조)

```
layout.tsx (서버 컴포넌트)
  └─ Providers (app/providers.tsx, "use client")
       └─ ClientProviders (next/dynamic, ssr: false)
            ├─ YjsProvider     — Y.Doc 초기화 + synced 상태 제공
            ├─ SeedProvider    — 초회 시 시드 데이터 주입 (localStorage 플래그)
            └─ SyncProvider    — Yjs → Dexie 동기화 시작
       └─ SWProvider (next/dynamic, ssr: false) — Service Worker 생명주기
            ├─ UpdatePrompt   — SW 업데이트 알림
            └─ InstallPrompt  — PWA 설치 프롬프트
```

모든 브라우저 전용 Provider는 `next/dynamic` + `ssr: false`로 감싸서 서버 렌더링에서 제외한다.

## 기술 스택

- Next.js 16 + TypeScript strict + React 19
- Yjs + y-indexeddb (CRDT 상태 + 영속화)
- Dexie.js + dexie-react-hooks (IndexedDB 쿼리/구독)
- Lightweight Charts (TradingView 금융 차트)
- React Hook Form (폼 관리)
- Tailwind CSS 4 + shadcn (base-vega 스타일, hugeicons 아이콘)
- Biome (lint + format)
- @ducanh2912/next-pwa (Service Worker, 오프라인 fallback: `/~offline`)

## 프로젝트 구조 (단순화 FSD)

경로 alias: `@/*` → 프로젝트 루트 (`tsconfig.json` paths)

의존 방향: `app/` → `features/` → `shared/` (역방향 금지)

```
app/                              # Next.js App Router (라우팅만 담당)
  layout.tsx                      # 서버 컴포넌트
  providers.tsx                   # 클라이언트 전용, dynamic import
  trades/                         # /trades, /trades/new, /trades/[id], /trades/[id]/edit
  ~offline/page.tsx               # PWA 오프라인 fallback
  manifest.ts                     # PWA Web App Manifest
shared/
  ui/                             # shadcn 생성 컴포넌트 (직접 수정 지양)
  lib/utils.ts                    # cn() 등 유틸
  types/                          # Trade, TradeFilters 등 타입 정의
  infrastructure/
    yjs/                          # Y.Doc 싱글턴, Provider, trades CRUD
    db/schema.ts                  # Dexie 스키마
    sync/                         # Yjs → Dexie 단방향 동기화
    seed/                         # 초회 시드 데이터 (SeedProvider + trades-seed)
    pwa/sw-lifecycle.tsx          # Service Worker 등록/업데이트 관리
    client-providers.tsx          # Yjs + Seed + Sync Provider 조합
features/
  layout/app-sidebar.tsx          # 사이드바 네비게이션
  trades/
    hooks/use-trades.ts           # Dexie live query 기반 매매 목록 구독
    hooks/use-trade-mutations.ts  # Yjs 기반 매매 CRUD 훅
    api/trade-repository.ts       # Dexie 기반 조회 (필터, 단건)
    lib/calc-pnl.ts               # PnL 계산 순수 함수
    ui/                           # trade-card, trade-form, trade-detail-page 등
  dashboard/
    lib/calc-stats.ts             # 대시보드 통계 계산
    ui/                           # stat-card, dashboard-page
  pwa/ui/                         # install-prompt, update-prompt
```

## 코딩 컨벤션

### 코드 스타일
- TypeScript strict 모드, `any` 타입 금지
- default export 대신 named export 사용
- CSS: Tailwind 유틸리티 클래스 사용, 커스텀 CSS 파일 금지

### 금지 사항
- 백엔드 서버, 서버 사이드 DB, 외부 인증 서비스 도입 금지
- barrel file(index.ts로 re-export) 사용 금지. 직접 경로 import
- shared/ui/ 아래 shadcn 생성 파일 직접 수정 지양
- 커밋 메시지, PR 본문에 AI attribution 금지 ("Generated with Claude Code", "Co-Authored-By: Claude" 등)

### Next.js / React
- layout.tsx는 서버 컴포넌트 유지. 클라이언트 로직은 providers.tsx에 격리
- 브라우저 전용 라이브러리(Yjs, Dexie, Lightweight Charts)는 반드시 `next/dynamic` + `ssr: false` 또는 `"use client"` 내에서만 사용
- `Promise.all()`로 독립적 비동기 작업 병렬 처리
- 상태 구독 최소화: 필요한 derived value만 subscribe

### Lint / Format (Biome)
- space 2칸, double quote, semicolons, 80자 줄폭
- import 자동 정렬 활성화
- `shared/ui/**`는 일부 lint 규칙 완화 (shadcn 생성 코드이므로)

## 중요 사항

- .env 파일은 절대 커밋하지 마세요
