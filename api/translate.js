// Vercel Serverless Function — /api/translate
// Claude API로 한→영 번역 처리
// 환경변수: ANTHROPIC_API_KEY (Vercel 대시보드에서 설정)

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { texts } = body;  // { key: "한국어 텍스트", ... }
  if (!texts || typeof texts !== 'object') {
    return new Response(JSON.stringify({ error: 'texts required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 빈 텍스트 필터링
  const filtered = Object.fromEntries(
    Object.entries(texts).filter(([, v]) => v && v.trim().length > 1)
  );

  const prompt = `You are a professional Korean-to-English translator for a B2B manufacturing company website (KOHIPS TECH, specialized in HIP processing and precision parts).

Translate each Korean text value to natural English. Keep technical terms accurate:
- HIP(Hot Isostatic Press) → keep as HIP or Hot Isostatic Press
- 가스아토마이즈 → Gas Atomization
- 연료분사노즐 → Fuel Injection Nozzle
- Keep company names, proper nouns, and numbers unchanged
- Use professional B2B tone
- Return ONLY valid JSON with the same keys

Input JSON:
${JSON.stringify(filtered, null, 2)}

Return translated JSON only, no explanation:`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',  // 번역은 Haiku로 빠르고 저렴하게
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      throw new Error(`Anthropic API error: ${apiRes.status} ${err}`);
    }

    const data = await apiRes.json();
    const rawText = data.content?.[0]?.text || '{}';

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonStr = rawText.replace(/```json?\n?|\n?```/g, '').trim();
    const translations = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ translations }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400'  // 번역 결과 24시간 캐시
      }
    });
  } catch (err) {
    console.error('[translate] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
