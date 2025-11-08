const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Waste image classification (stub)
router.post('/classify-waste', auth(['citizen', 'staff', 'admin']), async (req, res) => {
  const { imageData } = req.body; // base64 or URL
  if (!imageData) return res.status(400).json({ message: 'imageData required' });
  // Very naive heuristic based on keywords; replace with TensorFlow.js later
  const guess = imageData.toString().toLowerCase().includes('plastic') ? 'plastic' : 'mixed_waste';
  return res.json({ label: guess, confidence: 0.62 });
});

// Predict future waste trend per ward/locality (stub)
router.get('/predict-waste-trend', auth(['admin']), async (req, res) => {
  const { ward = 'A' } = req.query;
  const now = new Date();
  const data = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1),
    predictedTons: 5 + Math.sin(i / 2) * 0.8 + (ward.charCodeAt(0) % 3) * 0.3
  }));
  return res.json({ ward, forecast: data });
});

// Chatbot proxy (OpenAI if configured, else canned)
router.post('/chat', auth(['citizen', 'staff', 'admin']), async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'message required' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ reply: 'Sort waste into wet, dry, and hazardous. Rinse recyclables before disposal.' });
  }
  try {
    // Lazy import to avoid dependency issues if not installed
    const fetch = (await import('node-fetch')).default;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an eco assistant helping with proper waste disposal and recycling.' },
          { role: 'user', content: message }
        ]
      })
    });
    const json = await resp.json();
    const reply = json?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.json({ reply });
  } catch (_) {
    return res.json({ reply: 'Sort waste into wet, dry, and hazardous. Rinse recyclables before disposal.' });
  }
});

module.exports = router;


