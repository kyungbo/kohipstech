/**
 * KOHIPS TECH - Runtime Configuration
 *
 * 환경변수를 런타임에서 참조하기 위한 설정 파일.
 * Vercel 배포 시 vercel.json의 rewrites가 /api/* 요청을 Railway로 프록시합니다.
 *
 * 로컬 개발: API_URL을 localhost로 설정
 * 프로덕션:  API_URL을 실제 Railway 도메인으로 설정
 */
const CONFIG = (() => {
  // 현재 호스트 기반으로 환경 자동 감지
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDev = isLocal || hostname.includes('vercel.app');

  // 프로덕션: Vercel 프록시를 통해 Railway로 전달 (상대경로 사용)
  // vercel.json rewrites: /api/* → https://kohipstech-production.up.railway.app/api/*
  const PROD_API_URL = '';
  // 로컬 개발: Railway 직접 호출 또는 로컬 백엔드
  const DEV_API_URL = 'http://localhost:3000';

  return Object.freeze({
    // 환경
    ENV: isLocal ? 'development' : 'production',
    IS_DEV: isDev,

    // API
    API_URL: isLocal ? DEV_API_URL : PROD_API_URL,
    CONTACT_ENDPOINT: '/api/contact',

    // Google Sheets Webhook (문의 기록 자동 저장)
    // Google Apps Script 웹 앱 URL을 여기에 입력하세요
    GOOGLE_SHEETS_WEBHOOK: 'https://script.google.com/macros/s/AKfycbyMPUyYs0v0_W131I7w_J4EJrpz0UUHpGUHYFTZN68u-FcoU1mn4PQ_niGXDomw0VxEuA/exec',

    // 사이트
    SITE_URL: isLocal ? `http://localhost:${window.location.port || 8080}` : 'https://kohipstech.com',
    SITE_NAME: '코힙스테크 KOHIPS TECH',

    // 회사 정보
    COMPANY: {
      name: '코힙스테크 (KOHIPS TECH CO.)',
      ceo: '이명배',
      tel: '053-857-3541',
      fax: '053-857-3543',
      email: 'kohips@naver.com',
      address: '경상북도 경산시 진량읍 공단9로 103 (신제리 527)',
    },

    // 유틸리티 메서드
    apiUrl(path) {
      return `${this.API_URL}${path}`;
    }
  });
})();

// 디버그 로그 (개발환경에서만)
if (CONFIG.IS_DEV) {
  console.log('[KOHIPS Config]', {
    ENV: CONFIG.ENV,
    API_URL: CONFIG.API_URL,
    SITE_URL: CONFIG.SITE_URL,
  });
}
