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
├── config.js       # API URL 환경 감지 (로컬/프로덕션) + Google Sheets webhook
├── assets/         # 이미지, 폰트 등
├── vercel.json     # Vercel 배포 설정 + API 프록시 rewrite
├── robots.txt
└── sitemap.xml
```

## 분석 및 SEO

**GA4 트래킹** (GA4 ID: `G-EQELRNXZBE`):

| 이벤트 | 용도 | 파라미터 |
|--------|------|----------|
| `page_view` (가상) | 섹션 전환 시 가상 페이지뷰 | page_title, page_path |
| `section_view` | 섹션 스크롤 진입 | section_id |
| `section_dwell` | 섹션 체류시간 (2초+) | section_id, dwell_seconds |
| `scroll_depth` | 스크롤 깊이 마일스톤 | percent (25/50/75/100) |
| `contact_form_submit` | 문의 폼 전송 성공 | has_file, company, contact_email |
| `contact_form_error` | 문의 폼 전송 실패 | error |
| `form_start` | 문의 폼 첫 입력 시작 | form_name |
| `generate_lead` | 리드 전환 (GA4 권장 이벤트) | currency, value |
| `cta_click` | CTA 버튼 클릭 | label |
| `phone_click` | 전화번호 클릭 | phone |
| `map_direction_click` | 지도 경로안내 클릭 | provider (google/naver/kakao) |
| `map_view` | 지도 iframe 노출 | map_provider |
| `contact_section_view` | 문의 섹션 도달 | referrer |
| `outbound_click` | 외부 링크 클릭 | url, label |
| `language_switch` | 언어 전환 | to (ko/en) |

이벤트 전송 헬퍼: `main.js` 상단의 `gaEvent(eventName, params)` 함수 사용.

**문의 기록**: Google Sheets webhook (`config.js`의 `GOOGLE_SHEETS_WEBHOOK`)으로 자동 기록. 설정 방법은 README 참조.

**SEO 구성** (`index.html`):
- Open Graph, Twitter Card 메타 태그
- JSON-LD LocalBusiness 구조화 데이터
- `robots.txt`, `sitemap.xml`

## API 연동 (`config.js` + `vercel.json`)

- 로컬: `http://localhost:3000` 직접 호출
- 프로덕션: Vercel의 `/api/*` rewrite → Railway 백엔드로 프록시
- 백엔드 URL: `vercel.json`의 `rewrites[0].destination` 참고
- 문의 이메일: `kohips@naver.com` (config.js COMPANY.email)

## 배포 주의사항

- `vercel.json` 수정 시 Railway 백엔드 URL 변경 여부 확인
- `sitemap.xml` 수정 시 도메인이 실제 프로덕션 URL인지 확인
