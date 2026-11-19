exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt || prompt.length > 3000) return { statusCode: 400, body: 'Bad prompt' };

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 6000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const d = await r.json();
    if (!r.ok) return { statusCode: 502, body: JSON.stringify(d) };

    const text = (d.content || []).map(c => c.text || '').join('');
    const a = text.indexOf('['), b = text.lastIndexOf(']');
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: text.slice(a, b + 1)
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
