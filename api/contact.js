// Vercel Serverless Function — /api/contact
// 문의 폼 처리: Google Sheets 기록 + 이메일 알림 (Resend)
//
// 환경변수 (Vercel 대시보드에서 설정):
//   GOOGLE_SHEETS_WEBHOOK  — Google Apps Script 웹 앱 URL
//   RESEND_API_KEY         — Resend.com API 키 (선택, 없으면 이메일 발송 skip)
//   CONTACT_EMAIL          — 수신 이메일 (기본: kohips@naver.com)

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders()
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: '잘못된 요청 형식입니다.' }, 400);
  }

  const { company, name, phone, email, message } = body;

  // 필수 필드 검증
  if (!name || !phone || !email || !message) {
    return jsonResponse({ error: '필수 항목을 모두 입력해주세요.' }, 400);
  }

  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const results = { sheets: null, email: null };

  // 1) Google Sheets 기록
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
  if (sheetsUrl) {
    try {
      await fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          company: company || '',
          name,
          phone,
          email,
          message,
          source: req.headers.get('referer') || 'direct'
        })
      });
      results.sheets = 'ok';
    } catch (err) {
      console.error('[contact] Sheets error:', err.message);
      results.sheets = 'error';
    }
  }

  // 2) 이메일 발송 (Resend API)
  const resendKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL || 'kohips@naver.com';

  if (resendKey) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'KOHIPS 웹사이트 <onboarding@resend.dev>',
          to: [contactEmail],
          subject: `[코힙스테크 문의] ${company || '회사명 없음'} - ${name}`,
          html: `
            <h2>새로운 문의가 접수되었습니다</h2>
            <table style="border-collapse:collapse;width:100%;max-width:600px;">
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:100px;">접수시간</td><td style="padding:8px;border:1px solid #ddd;">${timestamp}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">회사명</td><td style="padding:8px;border:1px solid #ddd;">${company || '-'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">담당자</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">연락처</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">이메일</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">문의내용</td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap;">${message}</td></tr>
            </table>
            <p style="color:#888;margin-top:16px;font-size:12px;">이 메일은 kohipstech.com 문의 폼에서 자동 발송되었습니다.</p>
          `
        })
      });

      if (emailRes.ok) {
        results.email = 'ok';
      } else {
        const errData = await emailRes.text();
        console.error('[contact] Resend error:', errData);
        results.email = 'error';
      }
    } catch (err) {
      console.error('[contact] Email error:', err.message);
      results.email = 'error';
    }
  }

  // Sheets 또는 Email 중 하나라도 성공하면 OK
  const anySuccess = results.sheets === 'ok' || results.email === 'ok';

  // 둘 다 설정 안 된 경우에도 일단 성공 처리 (Sheets webhook이 config.js에서 호출됨)
  if (!sheetsUrl && !resendKey) {
    return jsonResponse({
      success: true,
      message: '문의가 접수되었습니다. (백엔드 설정 필요)',
      results
    }, 200);
  }

  if (anySuccess) {
    return jsonResponse({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.',
      results
    }, 200);
  }

  return jsonResponse({
    error: '전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
    results
  }, 500);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}
