import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import FormData from 'form-data';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AutoTokenizer, AutoModelForCausalLM } from '@xenova/transformers'; // <-- transformers.js
import fetch from "node-fetch"; // make sure to npm install node-fetch


dotenv.config();

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  console.warn('[WARN] API_KEY not set. /api/chat will return 500 until it is configured.');
}
if (!MODEL) {
  console.warn('[WARN] MODEL not set. /api/chat will return 500 until it is configured.');
}
if (!WEATHER_API_KEY) {
  console.warn('[WARN] WEATHER_API_KEY not set. /api/weather will return 500 until it is configured.');
}

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || '';

/* ---------------- Existing Online API chat ---------------- */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, locale = 'ml-IN' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured: API_KEY missing' });
    if (!MODEL) return res.status(500).json({ error: 'Server not configured: MODEL missing' });

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const userTranscript = messages
      .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nLocale: ${locale}\n\nConversation so far:\n${userTranscript}\n\nAssistant:`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ reply: text });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
});

/* ---------------- New Local Model chat ---------------- */


app.post('/api/localchat', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5005/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.json({ reply: data.reply });
  } catch (err) {
    console.error('Local chat proxy error:', err);
    return res.status(500).json({ error: 'Failed to generate local response' });
  }
});

/* ---------------- Speech to Text proxy ---------------- */
app.post('/api/speechtotext', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'audio file is required' });
    }

    const language = typeof req.body.language === 'string' && req.body.language.trim()
      ? req.body.language.trim()
      : 'English';
    const questionPrev = typeof req.body.question_prev === 'string'
      ? req.body.question_prev
      : typeof req.body.questionPrev === 'string'
        ? req.body.questionPrev
        : '';
    const answerPrev = typeof req.body.answer_prev === 'string'
      ? req.body.answer_prev
      : typeof req.body.answerPrev === 'string'
        ? req.body.answerPrev
        : '';

    const formData = new FormData();
    formData.append('language', language);
    formData.append('question_prev', questionPrev);
    formData.append('answer_prev', answerPrev);
    formData.append('audio', file.buffer, {
      filename: file.originalname || 'audio.wav',
      contentType: file.mimetype || 'audio/wav'
    });

    const upstreamResp = await fetch('https://api1.kissangpt.com/v1/inference/web', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://kissan.ai',
        'Referer': 'https://kissan.ai/'
      },
      body: formData
    });

    const bodyText = await upstreamResp.text();

    if (!upstreamResp.ok) {
      let upstreamError = null;
      try {
        upstreamError = JSON.parse(bodyText);
      } catch (_) {}
      const message = upstreamError?.error || 'Upstream service error';
      return res.status(upstreamResp.status || 502).json({ error: message });
    }

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Speech to text parse error:', parseError);
      return res.status(502).json({ error: 'Invalid response from upstream service' });
    }

    const questionRaw = typeof data.question === 'string' ? data.question : null;
    const questionFallback = typeof data.question_en === 'string' ? data.question_en : null;
    const transcription = questionRaw || questionFallback;

    if (!transcription) {
      return res.status(502).json({ error: 'Upstream response did not include a question' });
    }

    return res.json({ speechtotext: transcription });
  } catch (error) {
    console.error('Speech to text proxy error:', error);
    return res.status(502).json({ error: 'Failed to proxy speech to text request' });
  }
});

/* ---------------- Weather endpoint ---------------- */
app.get('/api/weather', async (req, res) => {
  try {
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Server not configured: WEATHER_API_KEY missing' });
    }

    const requestedIp = typeof req.query.ip === 'string' ? req.query.ip.trim() : Array.isArray(req.query.ip) ? req.query.ip[0]?.trim() : '';
    const fallbackIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const queryTarget = requestedIp || fallbackIp || 'auto:ip';

    if (!queryTarget) {
      return res.status(400).json({ error: 'ip query parameter required' });
    }

    const url = new URL('https://api.weatherapi.com/v1/current.json');
    url.searchParams.set('key', WEATHER_API_KEY);
    url.searchParams.set('q', queryTarget);

    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = err?.error?.message || 'Failed to fetch weather data';
      const status = response.status >= 400 ? response.status : 502;
      return res.status(status).json({ error: message });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

/* ---------------- Misc endpoints ---------------- */
app.get('/api/ip', (req, res) => {
  const forwarded = typeof req.headers['x-forwarded-for'] === 'string'
    ? req.headers['x-forwarded-for']
    : Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : '';
  const headerIp = forwarded.split(',')[0].trim();
  const socketIp = (req.socket?.remoteAddress || '').split(',')[0].trim();
  const ip = headerIp || socketIp || null;
  return res.json({ ip });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* ---------------- Start server ---------------- */
app.listen(PORT, async () => {
  console.log(`Chat backend listening on http://localhost:${PORT}`);
});

