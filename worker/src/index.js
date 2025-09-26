export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    const url = new URL(request.url)

    if (url.pathname === '/api/texttospeech' && request.method === 'POST') {
      try {
        const { text, voice, lang, format } = await request.json()
        if (!text || typeof text !== 'string') {
          return json({ error: 'text is required' }, 400)
        }
        const AZURE_TTS_KEY = env.AZURE_TTS_KEY
        const AZURE_TTS_REGION = env.AZURE_TTS_REGION
        const AZURE_TTS_VOICE = env.AZURE_TTS_VOICE
        if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
          return json({ error: 'Azure TTS not configured' }, 500)
        }
        const ttsVoice = voice || AZURE_TTS_VOICE
        const ttsLang = lang || 'en-US'
        if (!ttsVoice) {
          return json({ error: 'Azure TTS voice not configured' }, 500)
        }
        const endpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`
        const sanitiseForSsml = (value = '') => String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
          .replace(/\r?\n/g, '<break time="400ms"/>')
        const safeText = sanitiseForSsml(text)
        const ssml = `<?xml version='1.0' encoding='utf-8'?>\n<speak version='1.0' xml:lang='${ttsLang}'>\n  <voice xml:lang='${ttsLang}' xml:gender='Female' name='${ttsVoice}'>\n    ${safeText}\n  </voice>\n</speak>`
        const outputFormat = typeof format === 'string' && format.trim()
          ? format.trim()
          : 'riff-16khz-16bit-mono-pcm'
        const ttsResp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': outputFormat,
            'User-Agent': 'favourite-farmer-app'
          },
          body: ssml
        })
        if (!ttsResp.ok) {
          const err = await ttsResp.text()
          return json({ error: err }, ttsResp.status)
        }
        const audio = await ttsResp.arrayBuffer()
        return new Response(audio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'inline; filename="tts.wav"',
            ...corsHeaders()
          }
        })
      } catch (err) {
        return json({ error: 'Failed to synthesize speech' }, 500)
      }
    }
    if (url.pathname === '/api/health') {
      return json({ ok: true })
    }

    if (url.pathname === '/api/ip') {
      const forwardedHeader = request.headers.get('x-forwarded-for') || ''
      const forwardedIp = forwardedHeader.split(',')[0].trim()
      const connectingIp = (request.headers.get('cf-connecting-ip') || '').trim()
      const realIp = connectingIp || forwardedIp || null
      return json({ ip: realIp })
    }

    if (url.pathname === '/api/weather' && request.method === 'GET') {
      if (!env.WEATHER_API_KEY) {
        return json({ error: 'Server not configured: WEATHER_API_KEY missing' }, 500)
      }

      const ipParam = (url.searchParams.get('ip') || '').trim()
      const forwardedHeader = request.headers.get('x-forwarded-for') || ''
      const forwardedIp = forwardedHeader.split(',')[0].trim()
      const connectingIp = (request.headers.get('cf-connecting-ip') || '').trim()
      const queryTarget = ipParam || connectingIp || forwardedIp || 'auto:ip'

      const weatherUrl = new URL('https://api.weatherapi.com/v1/current.json')
      weatherUrl.searchParams.set('key', env.WEATHER_API_KEY)
      weatherUrl.searchParams.set('q', queryTarget)

      const resp = await fetch(weatherUrl.toString(), { headers: { Accept: 'application/json' } })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        const message = err?.error?.message || 'Failed to fetch weather data'
        const status = resp.status >= 400 ? resp.status : 502
        return json({ error: message }, status)
      }

      const data = await resp.json()
      return json(data)
    }

    if (url.pathname === '/api/speechtotext' && request.method === 'POST') {
      try {
        const formData = await request.formData()
        const audio = formData.get('audio')

        if (!(audio instanceof File)) {
          return json({ error: 'audio file is required' }, 400)
        }

        const forwardForm = new FormData()
        const language = formData.get('language') || 'English'
        const questionPrev = formData.get('question_prev') ?? formData.get('questionPrev') ?? ''
        const answerPrev = formData.get('answer_prev') ?? formData.get('answerPrev') ?? ''

        forwardForm.set('language', language)
        forwardForm.set('question_prev', typeof questionPrev === 'string' ? questionPrev : '')
        forwardForm.set('answer_prev', typeof answerPrev === 'string' ? answerPrev : '')
        forwardForm.set('audio', audio, audio.name || 'audio.wav')

        const endpoint = typeof env.STT_API_ENDPOINT === 'string' ? env.STT_API_ENDPOINT.trim() : ''
        if (!endpoint) {
          return json({ error: 'Server not configured: STT_API_ENDPOINT missing' }, 500)
        }

        const upstreamResp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0',
            'Accept': 'application/json, text/plain, */*',
          },
          body: forwardForm
        })

        const bodyText = await upstreamResp.text()

        if (!upstreamResp.ok) {
          let upstreamError = null
          try {
            upstreamError = JSON.parse(bodyText)
          } catch (_) {}
          const message = upstreamError?.error || 'Upstream service error'
          return json({ error: message }, upstreamResp.status || 502)
        }

        let data
        try {
          data = JSON.parse(bodyText)
        } catch (parseError) {
          return json({ error: 'Invalid response from upstream service' }, 502)
        }

        const questionRaw = typeof data.question === 'string' ? data.question : null
        const questionFallback = typeof data.question_en === 'string' ? data.question_en : null
        const transcription = questionRaw || questionFallback

        if (!transcription) {
          return json({ error: 'Upstream response did not include a question' }, 502)
        }

        return json({ speechtotext: transcription })
      } catch (error) {
        return json({ error: 'Failed to proxy speech to text request' }, 502)
      }
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages = [], locale = env.LOCALE || 'ml-IN', sessionId } = await request.json()
        if (!Array.isArray(messages) || messages.length === 0) {
          return json({ error: 'messages array required' }, 400)
        }

        const apiKey = env.API_KEY
        if (!apiKey) {
          return json({ error: 'Server not configured: API_KEY missing' }, 500)
        }

        const model = env.MODEL && String(env.MODEL).trim()
        if (!model) {
          return json({ error: 'Server not configured: MODEL missing' }, 500)
        }

  const sysPrompt = (env.SYSTEM_PROMPT && String(env.SYSTEM_PROMPT).trim()) || ''

        const contentsClient = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))

        let memorySummary = ''
        let recentTurns = []

        if (sessionId && env.SESSION_MEMORY) {
          const id = env.SESSION_MEMORY.idFromName(sessionId)
          const stub = env.SESSION_MEMORY.get(id)
          const mem = await (await stub.fetch('https://do/session', {
            method: 'POST',
            body: JSON.stringify({ op: 'get' })
          })).json()
          memorySummary = mem.summary || ''
          recentTurns = Array.isArray(mem.recent) ? mem.recent : []

          const lastUser = messages[messages.length - 1]
          if (lastUser && lastUser.sender === 'user') {
            await stub.fetch('https://do/session', {
              method: 'POST',
              body: JSON.stringify({ op: 'append', turn: lastUser })
            })
          }
        }

        const summaryInstruction = memorySummary ? `\n\nSession summary (context): ${memorySummary}` : ''
        const seen = new Set()
        const dedup = arr => arr.filter(t => {
          const key = `${t.role}:${t.parts?.[0]?.text || ''}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        const contents = dedup([ ...recentTurns, ...contentsClient ])

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { role: 'system', parts: [{ text: `${sysPrompt}\n\nLocale: ${locale}${summaryInstruction}`.trim() }] },
              contents
            })
          }
        )

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          return json({ error: err.error?.message || 'API request failed' }, 500)
        }

        const data = await resp.json()
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'ക്ഷമിക്കണം, ഇപ്പോൾ മറുപടി നൽകാൻ കഴിഞ്ഞില്ല.'

        if (sessionId && env.SESSION_MEMORY) {
          const id = env.SESSION_MEMORY.idFromName(sessionId)
          const stub = env.SESSION_MEMORY.get(id)
          await stub.fetch('https://do/session', { method: 'POST', body: JSON.stringify({ op: 'append', turn: { sender: 'bot', text: reply } }) })
          if (Math.floor(Math.random() * 4) === 0) {
            await stub.fetch('https://do/session', { method: 'POST', body: JSON.stringify({ op: 'summarize' }) })
          }
        }

        return json({ reply })
      } catch (e) {
        return json({ error: 'Failed to generate response' }, 500)
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders() })
  }
}

// Durable Object for session memory
export class SessionMemory {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.storage = state.storage
  }

  async fetch(request) {
    const { pathname } = new URL(request.url)
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    const { op, turn } = await request.json().catch(() => ({}))
    const data = await this.storage.get('data') || { summary: '', recent: [] }

    if (op === 'get') {
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    }

    if (op === 'append' && turn && turn.text) {
      const role = turn.sender === 'user' ? 'user' : 'model'
      const entry = { role, parts: [{ text: String(turn.text) }] }
      data.recent.push(entry)
      if (data.recent.length > 12) data.recent = data.recent.slice(-12)
      await this.storage.put('data', data)
      return new Response(JSON.stringify({ ok: true }))
    }

    if (op === 'summarize') {
      const texts = data.recent.map(r => `${r.role === 'user' ? 'User' : 'Assistant'}: ${r.parts?.[0]?.text || ''}`).join('\n')
      const compact = texts.length > 800 ? texts.slice(-800) : texts
      const combined = `${data.summary ? data.summary + '\n' : ''}${compact}`
      data.summary = combined.length > 2000 ? combined.slice(-2000) : combined
      if (data.recent.length > 6) data.recent = data.recent.slice(-6)
      await this.storage.put('data', data)
      return new Response(JSON.stringify({ ok: true }))
    }

    return new Response(JSON.stringify({ error: 'bad op' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}

// Utility helpers
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
}

// no default system prompt; env.SYSTEM_PROMPT should be set as a wrangler secret; empty by default
