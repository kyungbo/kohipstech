# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**KOHIPS Tech 웹사이트** — 코힙스 테크 회사 소개 정적 웹사이트. Vercel에 배포되어 있으며 Railway 백엔드 API를 프록시합니다.

## 실행

```bash
# 로컬 개발: 정적 파일이므로 Live Server 또는 단순 HTTP 서버로 실행
npx serve .
# 또는
python3 -m http.server 8080
```

배포: git push → Vercel 자동 배포

## 파일 구조

```
kohips-website/
├── index.html      # 메인 페이지 (모든 섹션 포함)
├── main.js         # 인터랙션, 폼 처리, GA4 이벤트
├── styles.css      # 전체 스타일
├── config.js       # API URL 환경 감지 (로컬/프로덕션)
├── assets/         # 이미지, 폰트 등
├── vercel.json     # Vercel 배포 설정 + API 프록시 rewrite
├── robots.txt
└── sitemap.xml
```

## 분석 및 SEO

**GA4 트래킹** (GA4 ID: `G-EQELRNXZBE`):
- `section_view` — 섹션 스크롤 진입 시
- `contact_form_submit` / `contact_form_error` — 문의 폼
- `cta_click` — CTA 버튼 클릭
- `phone_click` — 전화번호 클릭

이벤트 전송 헬퍼: `main.js` 상단의 `gaEvent(eventName, params)` 함수 사용.

**SEO 구성** (`index.html`):
- Open Graph, Twitter Card 메타 태그
- JSON-LD LocalBusiness 구조화 데이터
- `robots.txt`, `sitemap.xml`

## API 연동 (`config.js` + `vercel.json`)

- 로컬: `http://localhost:3000` 직접 호출
- 프로덕션: Vercel의 `/api/*` rewrite → Railway 백엔드로 프록시
- 백엔드 URL: `vercel.json`의 `rewrites[0].destination` 참고

## 배포 주의사항

- `vercel.json` 수정 시 Railway 백엔드 URL 변경 여부 확인
- `sitemap.xml` 수정 시 도메인이 실제 프로덕션 URL인지 확인
