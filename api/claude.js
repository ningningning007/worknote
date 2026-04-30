export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    // Override model to ensure correct MiniMax model name
    const body = { ...req.body, model: 'MiniMax-M2.7' };
    
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
 
    const text = await response.text();
    
    // Log for debugging in Vercel logs
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
