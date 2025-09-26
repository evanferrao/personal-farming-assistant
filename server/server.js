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
const STT_API_ENDPOINT = process.env.STT_API_ENDPOINT?.trim();

if (!API_KEY) {
  console.warn('[WARN] API_KEY not set. /api/chat will return 500 until it is configured.');
}
if (!MODEL) {
  console.warn('[WARN] MODEL not set. /api/chat will return 500 until it is configured.');
}
if (!WEATHER_API_KEY) {
  console.warn('[WARN] WEATHER_API_KEY not set. /api/weather will return 500 until it is configured.');
}
if (!STT_API_ENDPOINT) {
  console.warn('[WARN] STT_API_ENDPOINT not set. /api/speechtotext will return 500 until it is configured.');
}

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY;
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION;
const AZURE_TTS_VOICE = process.env.AZURE_TTS_VOICE;

if (!AZURE_TTS_KEY || !AZURE_TTS_REGION || !AZURE_TTS_VOICE) {
  console.warn('[WARN] Azure TTS env vars not set. /api/texttospeech will return 500 until configured.');
}

const sanitiseForSsml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')
  .replace(/\r?\n/g, '<break time="400ms"/>');

/* ---------------- Azure Text to Speech endpoint ---------------- */
app.post('/api/texttospeech', async (req, res) => {
  try {
    const { text, voice, lang, format } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
      return res.status(500).json({ error: 'Azure TTS not configured' });
    }
    const ttsVoice = voice || AZURE_TTS_VOICE;
    const ttsLang = lang || 'en-US';
    if (!ttsVoice) {
      return res.status(500).json({ error: 'Azure TTS voice not configured' });
    }

    // <-- FIXED endpoint
    const endpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const safeText = sanitiseForSsml(text);
    const ssml = `<?xml version='1.0' encoding='utf-8'?>
<speak version='1.0' xml:lang='${ttsLang}'>
  <voice xml:lang='${ttsLang}' xml:gender='Female' name='${ttsVoice}'>
    ${safeText}
  </voice>
</speak>`;
    const outputFormat = typeof format === 'string' && format.trim()
      ? format.trim()
      : 'riff-16khz-16bit-mono-pcm';

    const ttsResp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': outputFormat,
        'User-Agent': 'favourite-farmer-app'
      },
      body: ssml
    });

    if (!ttsResp.ok) {
      const err = await ttsResp.text();
      return res.status(ttsResp.status).json({ error: err });
    }

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'inline; filename="tts.wav"'
    });
    ttsResp.body.pipe(res);
  } catch (err) {
    console.error('Azure TTS error:', err);
    return res.status(500).json({ error: 'Failed to synthesize speech' });
  }
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

    if (!STT_API_ENDPOINT) {
      return res.status(500).json({ error: 'Server not configured: STT_API_ENDPOINT missing' });
    }

    const formData = new FormData();
    formData.append('language', language);
    formData.append('question_prev', questionPrev);
    formData.append('answer_prev', answerPrev);
    formData.append('audio', file.buffer, {
      filename: file.originalname || 'audio.wav',
      contentType: file.mimetype || 'audio/wav'
    });

    const upstreamResp = await fetch(STT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0',
        'Accept': 'application/json, text/plain, */*'
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

