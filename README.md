# Trade Log

로컬 퍼스트 매매일지 앱. 백엔드 없이 브라우저만으로 동작한다.

모든 데이터는 브라우저 IndexedDB에 저장되며, 서버 비용 없이 오프라인에서도 완전히 동작한다.

## 기술 스택

- Next.js 16 + TypeScript + React 19
- Yjs + y-indexeddb (CRDT 상태 + 영속화)
- Dexie.js (IndexedDB 쿼리/인덱싱)
- Tailwind CSS 4 + shadcn/ui
- Biome (lint + format)

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
