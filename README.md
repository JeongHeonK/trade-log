# Trade Log

[Zero Marginal Cost Architecture](https://medium.com/@mmostagirbhuiyan/the-zero-marginal-cost-architecture-why-i-built-a-wealth-planner-to-run-entirely-on-the-edge-e632ba727490) 철학을 기반으로 만든 로컬 퍼스트 매매일지 앱.

백엔드 서버 없이, 브라우저만으로 완전히 동작한다.

## Zero Marginal Cost Architecture란?

> "가장 안전한 데이터는 아예 서버에 보내지 않는 데이터"

브라우저를 단순한 화면 렌더러가 아닌 **독립적인 컴퓨팅 노드**로 활용하는 아키텍처다. 모든 데이터 저장과 처리를 클라이언트에서 수행하여 서버 인프라 비용을 완전히 제거한다.

| 기존 방식 | Zero Marginal Cost |
|-----------|-------------------|
| 서버에 데이터 저장 | 브라우저 IndexedDB에 저장 |
| API 호출로 CRUD | 로컬 CRDT로 즉시 반영 |
| 인증/인가 서버 필요 | 인증 불필요 (데이터가 로컬) |
| 서버 비용 발생 | 인프라 비용 제로 |
| 오프라인 시 사용 불가 | 오프라인에서도 완전 동작 |

## 아키텍처 설계 결정

### 1. 왜 서버를 없앴는가

매매일지는 본질적으로 개인 데이터다. 공유할 필요가 없고, 실시간 협업도 필요 없다. 서버가 존재하는 유일한 이유가 "데이터 저장"이라면, 브라우저 IndexedDB로 충분하다.

서버를 제거하면 인증, API 설계, 배포 파이프라인, 서버 비용이 모두 사라진다. 남는 것은 정적 파일 호스팅뿐이고, 이마저도 PWA Service Worker가 캐싱하면 CDN 요청도 제거된다.

### 2. 왜 Yjs(CRDT)인가

로컬 퍼스트 앱에서 상태 관리의 핵심 문제는 **다중 탭 충돌**이다. 사용자가 탭 A에서 매매를 수정하고 탭 B에서 삭제하면, 일반적인 상태 관리(Redux, Zustand)로는 마지막 쓰기가 이전 변경을 덮어쓴다.

Yjs는 CRDT(Conflict-free Replicated Data Type) 알고리즘으로 이 문제를 구조적으로 해결한다:

- **자동 충돌 해소**: 동시 편집을 수학적으로 병합, 수동 충돌 처리 코드 불필요
- **델타 업데이트**: 전체 상태가 아닌 변경분만 저장하여 효율적
- **y-indexeddb**: 별도 영속화 코드 없이 IndexedDB에 자동 저장

### 3. 왜 이중 계층(Yjs + Dexie)인가

Yjs는 실시간 상태 관리에 최적화되어 있지만, "종목별 승률", "날짜 범위 필터링" 같은 구조화된 쿼리에는 적합하지 않다. IndexedDB 네이티브 인덱싱이 필요한 영역이다.

```
쓰기: UI → Yjs shared type → y-indexeddb (자동 영속화)
읽기(실시간): Yjs observe → 컴포넌트 리렌더
읽기(쿼리): Yjs → Dexie 동기화 → Dexie 인덱스 조회
```

- **Yjs**: 쓰기 + 실시간 구독 (CRDT 상태의 single source of truth)
- **Dexie**: 읽기 전용 쿼리 레이어 (인덱싱 기반 필터/정렬/집계)
- **단방향 동기화**: Yjs → Dexie로만 흐르며, Dexie는 절대 Yjs에 쓰지 않음

### 4. 왜 PWA인가

서버를 없앴지만, 정적 호스팅(Vercel)에서 앱을 로딩할 때는 여전히 네트워크 요청이 발생한다. 오프라인 상태에서는 데이터가 로컬에 있어도 앱 자체를 로딩할 수 없다.

PWA Service Worker가 이 마지막 간극을 메운다:

| 계층 | 오프라인 전 | PWA 적용 후 |
|------|-----------|------------|
| 앱 코드 (HTML/JS/CSS) | CDN에서 매번 fetch | SW가 캐싱, 네트워크 요청 0건 |
| 데이터 (매매 기록) | IndexedDB에 이미 로컬 | 변경 없음 |
| 앱 업데이트 | 페이지 새로고침 | SW가 백그라운드 감지 → 사용자 알림 |

**Cache Strategy 설계:**

- `NetworkFirst` - 페이지, API 응답 (최신 우선, 오프라인 시 캐시 폴백)
- `CacheFirst` - 폰트, 정적 JS 번들 (변경 없는 자산은 캐시 우선)
- `StaleWhileRevalidate` - 이미지, CSS (즉시 캐시 제공 + 백그라운드 갱신)

**앱 업데이트 UX:**

```
새 SW 감지(waiting) → toast 알림 → 사용자 "업데이트" 클릭
→ messageSkipWaiting → controlling 이벤트 대기 → 페이지 새로고침
```

**결과**: 데이터도 로컬, 앱 코드도 로컬. 설치 후 네트워크 요청 0건으로 완전한 Zero Marginal Cost 달성.

## 주요 기능

- 매매 등록/수정/삭제 (Yjs CRDT 기반 실시간 반영)
- 매매 목록 조회 및 필터링 (상태, 방향)
- 매매 상세 정보 확인
- 대시보드 통계 (총 매매 수, 승률, 평균 수익률, 총 손익)
- PWA 설치 (홈 화면 추가, 독립 앱으로 실행)
- 오프라인 완전 동작 (앱 코드 + 데이터 모두 로컬)
- 앱 업데이트 자동 감지 및 알림

## 기술 스택

- **Next.js 16** + TypeScript + React 19
- **Yjs** + y-indexeddb (CRDT 상태 + 영속화)
- **Dexie.js** (IndexedDB 쿼리/인덱싱)
- **@ducanh2912/next-pwa** + workbox-window (Service Worker + 캐싱)
- **React Hook Form** (폼 관리)
- **Tailwind CSS 4** + shadcn/ui (base-vega 스타일)
- **Biome** (lint + format)

## 시작하기

```bash
pnpm install
pnpm dev
```

## 커맨드

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드 (Webpack, SW 생성)
pnpm start        # 프로덕션 서버 (PWA 테스트)
pnpm lint         # Biome 린트 체크
pnpm format       # Biome 포맷팅
```

## 참고

- [The Zero Marginal Cost Architecture (원문)](https://medium.com/@mmostagirbhuiyan/the-zero-marginal-cost-architecture-why-i-built-a-wealth-planner-to-run-entirely-on-the-edge-e632ba727490)
- [한국어 번역](https://velog.io/@tap_kim/the-zero-marginal-cost-architecture)
