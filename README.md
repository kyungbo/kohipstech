# KOHIPS TECH - 코힙스테크 공식 홈페이지

국내 최초 H.I.P(Hot Isostatic Press) 처리 전문기업 코힙스테크의 공식 웹사이트입니다.

## 배포 구조

| 서비스 | 역할 | URL |
|--------|------|-----|
| **Vercel** | 프론트엔드 (정적 사이트) 호스팅 | kohipstech.com |
| **Railway** | 백엔드 API 서버 | kohipstech.com/api/* |

## 프로젝트 구조

```
kohipstech/
├── index.html          # 메인 HTML (SPA)
├── styles.css          # 스타일시트
├── config.js           # 런타임 환경설정 (API URL 등)
├── main.js             # 인터랙션 & 기능 스크립트
├── vercel.json         # Vercel 배포 설정 & API 프록시
├── robots.txt          # 검색 크롤러 설정
├── sitemap.xml         # 사이트맵 (SEO)
├── .env.example        # 환경변수 예시
├── .gitignore
└── assets/             # 이미지, 아이콘 등
```

## 환경 설정

### 환경변수 (config.js)

`config.js`에서 환경을 자동 감지합니다:

- **localhost / 127.0.0.1** → `development` (API: `http://localhost:3000`)
- **그 외** → `production` (API: `https://kohipstech.com`)

### Vercel 환경변수 (선택)

Vercel 대시보드에서 아래 환경변수를 설정할 수 있습니다:

```
VITE_API_URL=https://kohipstech.com
VITE_SITE_URL=https://kohipstech.com
```

## 로컬 개발

```bash
# 정적 서버로 실행
npx serve .
# 또는
python3 -m http.server 8080
```

## 배포

GitHub `main` 브랜치에 푸시하면 Vercel이 자동 배포합니다.

```bash
git add .
git commit -m "Update site"
git push origin main
```

## API 프록시

`vercel.json`의 rewrites 설정으로 `/api/*` 요청이 Railway 백엔드로 프록시됩니다:

```
프론트엔드 (Vercel)  →  /api/contact  →  Railway (https://kohipstech.com/api/contact)
```

## 기술 스택

- HTML5 / CSS3 / Vanilla JS (프레임워크 없음)
- Vercel (정적 호스팅 + 프록시)
- Railway (백엔드 API)
- Google Fonts (Noto Sans KR, Inter)
