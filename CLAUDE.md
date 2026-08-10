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

## 원격 경영 지휘소 (Remote Command Center)

CEO 원격 경영관리를 위한 대시보드 + 전자결재 시스템. `docs/` 디렉토리에 PRD와 프로토타입이 있다.

### 파일

```
docs/
├── PRD_Remote_Command_Center.md   # PRD v2.0 (아메바경영 반영)
└── dashboard-prototype.html       # 인터랙티브 프로토타입 (GA4 포함)
```

### 프로토타입 URL

- **Vercel**: https://project-dpe0o.vercel.app/docs/dashboard-prototype
- git push → main → Vercel 자동 배포

### 대시보드 구조

3탭 액션 기반:
- **현황**: 시간당 채산 히어로 + KPI + 아메바 랭킹 + 주간 트렌드 차트
- **결재**: 모두싸인 스타일 전자서명 (서명/반려 인터랙션)
- **알림**: 알림센터 (미확인/확인 필터, 개별/벌크 확인)

### 아메바경영 적용

이나모리 가즈오의 아메바경영 원칙을 기반으로, 45명 조직을 6개 아메바(HIP 처리, 진공로, 후가공, 영업, 구매/물류, 경영지원)로 편성. 핵심 지표는 시간당 채산 = (매출 - 경비) / 총 노동시간.

### GA4 이벤트 (대시보드 전용)

GA4 ID: `G-EQELRNXZBE` (메인 사이트 공용), 헬퍼: `ga(eventName, params)`

| 이벤트 | 트리거 | 파라미터 |
|--------|--------|----------|
| `tab_view` | 탭 전환 | tab |
| `approval_sign` | 전자서명 승인 | doc_title, doc_type, amount |
| `approval_reject` | 반려 | doc_title, doc_type, amount |
| `notif_ack` | 알림 개별 확인 | notif_title, severity, category |
| `notif_ack_all` | 모두 확인 | count |
| `notif_filter` | 알림 필터 변경 | filter |

### 디자인 원칙

- 일본어 표기 금지 (아메바경영 참조하되 한국어만 사용)
- 컬러 절제: 모노크롬 베이스, 의미 있는 곳에만 색상
- 아메바 6색 카테고리컬 팔레트 (CVD 검증 완료, 차트 내부에서만 사용)
- 모바일 퍼스트 (max-width 520px, 하단 탭 내비게이션)

### 다음 단계

- [ ] CEO 리뷰 후 피드백 반영
- [ ] 실제 데이터 연동 설계 (Power Automate + OneDrive 엑셀 → LLM → 대시보드)
- [ ] 카카오톡 알림톡 API 연동 프로토타입
- [ ] 사내매매가격 설정 UI
- [ ] 아메바 리더 전용 뷰

## 배포 주의사항

- `vercel.json` 수정 시 Railway 백엔드 URL 변경 여부 확인
- `sitemap.xml` 수정 시 도메인이 실제 프로덕션 URL인지 확인
