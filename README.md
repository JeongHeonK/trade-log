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

## 이 프로젝트에 적용한 방식

Trade Log는 위 아키텍처의 핵심 원칙을 매매일지 도메인에 적용한 테스트용 서비스다.

- **Yjs (CRDT)** 로 앱 상태를 관리하고, y-indexeddb로 브라우저에 자동 영속화
- **Dexie.js** 로 IndexedDB 위에 인덱싱 기반 쿼리 레이어 구성
- 다중 탭 동시 접근 시 CRDT가 충돌 없이 자동 병합
- 외부 API, 인증 서버, DB 서버 일체 없음

## 주요 기능

- 매매 등록/수정/삭제 (Yjs CRDT 기반 실시간 반영)
- 매매 목록 조회 및 필터링 (상태, 방향)
- 매매 상세 정보 확인
- 대시보드 통계 (총 매매 수, 승률, 평균 수익률, 총 손익)
- 오프라인 완전 동작

## 기술 스택

- **Next.js 16** + TypeScript + React 19
- **Yjs** + y-indexeddb (CRDT 상태 + 영속화)
- **Dexie.js** (IndexedDB 쿼리/인덱싱)
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
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # Biome 린트 체크
pnpm format       # Biome 포맷팅
```

## 참고

- [The Zero Marginal Cost Architecture (원문)](https://medium.com/@mmostagirbhuiyan/the-zero-marginal-cost-architecture-why-i-built-a-wealth-planner-to-run-entirely-on-the-edge-e632ba727490)
- [한국어 번역](https://velog.io/@tap_kim/the-zero-marginal-cost-architecture)
