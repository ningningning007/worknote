export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = { ...req.body };

    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (body.stream) {
      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: 'Upstream error', raw: errText.slice(0, 300) });
        return;
      }
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
      return;
    }

    const text = await response.text();
    console.log('MiniMax status:', response.status);
    console.log('MiniMax response:', text.slice(0, 500));

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      return res.status(response.status).json({ error: 'Invalid JSON from MiniMax', raw: text.slice(0, 300) });
    }
  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
