# Niko AI App - Next.js 변환 완료

이 프로젝트가 Vite에서 Next.js로 성공적으로 변환되었습니다.

## 변경 사항

### 구조 변경

- `index.tsx` → `app/page.tsx` (메인 페이지)
- `App.tsx` → `app/page.tsx` (클라이언트 컴포넌트로 통합)
- `index.html` → `app/layout.tsx` (Next.js 레이아웃)
- 새로운 `app/globals.css` (Tailwind CSS 설정)

### 설정 파일

- `vite.config.ts` → `next.config.js`
- `package.json` - Next.js 의존성으로 업데이트
- `tsconfig.json` - Next.js 설정으로 업데이트
- 새로운 `tailwind.config.js`
- 새로운 `postcss.config.js`

### 주요 변경점

1. **React 18로 다운그레이드**: Next.js 15는 React 18을 사용합니다
2. **'use client' 지시어**: 클라이언트 컴포넌트에 추가
3. **폰트 최적화**: next/font/google 사용
4. **Tailwind CSS**: CDN에서 PostCSS 기반으로 변경
5. **경로 alias**: `@/` prefix로 모듈 import

## 설치 및 실행

\`\`\`bash

# 의존성 설치

npm install

# 개발 서버 실행

npm run dev

# 프로덕션 빌드

npm run build

# 프로덕션 서버 실행

npm start
\`\`\`

## 개발 서버

- 주소: http://localhost:3000

## 이전 파일들

다음 파일들은 더 이상 필요하지 않습니다:

- `index.html`
- `index.tsx`
- `vite.config.ts`
- `App.tsx`

## 참고사항

- Firebase 설정은 `services/firebaseConfig.ts`에 있습니다
- Gemini API 키는 `services/geminiService.ts`에 있습니다
