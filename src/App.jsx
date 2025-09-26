import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sprout, Users, TrendingUp, Brain, Shield, Clock, MapPin, Droplets, Bug, Maximize2, Minimize2, Mic, Square, Loader2 } from 'lucide-react'
import './App.css'
import { sendChat, sendLocalChat } from './lib/chat'
import { fetchWeatherForClient } from './lib/weather'
import { transcribeAudio } from './lib/speech'
import FarmerInfoForm from './FarmerInfoForm'

const MAX_RECORDING_SECONDS = 10
const RECORDING_MIME_TYPE = 'audio/webm;codecs=opus'

async function convertBlobToWav(blob, audioContextRef) {
  const arrayBuffer = await blob.arrayBuffer()
  let audioContext = audioContextRef.current
  if (!audioContext) {
    audioContext = new AudioContext()
    audioContextRef.current = audioContext
  }

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch (error) {
      console.warn('Unable to resume audio context', error)
    }
  }

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
  const wavArrayBuffer = audioBufferToWav(audioBuffer)
  return new Blob([wavArrayBuffer], { type: 'audio/wav' })
}

function audioBufferToWav(audioBuffer) {
  const { numberOfChannels, length, sampleRate } = audioBuffer
  const bytesPerSample = 2
  const blockAlign = numberOfChannels * bytesPerSample
  const dataLength = length * blockAlign
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)
  let offset = 0

  const writeString = (str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
    offset += str.length
  }

  const interleaved = interleaveChannels(audioBuffer)

  writeString('RIFF')
  view.setUint32(offset, 36 + dataLength, true)
  offset += 4
  writeString('WAVE')
  writeString('fmt ')
  view.setUint32(offset, 16, true)
  offset += 4
  view.setUint16(offset, 1, true)
  offset += 2
  view.setUint16(offset, numberOfChannels, true)
  offset += 2
  view.setUint32(offset, sampleRate, true)
  offset += 4
  view.setUint32(offset, sampleRate * blockAlign, true)
  offset += 4
  view.setUint16(offset, blockAlign, true)
  offset += 2
  view.setUint16(offset, bytesPerSample * 8, true)
  offset += 2
  writeString('data')
  view.setUint32(offset, dataLength, true)
  offset += 4

  for (let i = 0; i < interleaved.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }

  return buffer
}

function interleaveChannels(audioBuffer) {
  const { numberOfChannels, length } = audioBuffer
  const channels = []
  for (let i = 0; i < numberOfChannels; i += 1) {
    channels.push(audioBuffer.getChannelData(i))
  }

  if (numberOfChannels === 1) {
    return channels[0]
  }

  const interleaved = new Float32Array(length * numberOfChannels)
  let index = 0

  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      interleaved[index] = channels[channel][i]
      index += 1
    }
  }

  return interleaved
}

function App() {
  // Language selection (ml | en)
  const getInitialLang = () => {
    try {
      const saved = localStorage.getItem('pfa_lang')
      return saved === 'en' ? 'en' : 'ml'
    } catch {
      return 'ml'
    }
  }
  const [lang, setLang] = useState(getInitialLang())
  const locale = lang === 'ml' ? 'ml-IN' : 'en-US'

  const TEXTS = {
    ml: {
      brand: 'കൃഷി സഖി',
      chatNow: 'Chat Now',
      heroSubtitle: 'Kerala കർഷകർക്കായി വ്യക്തിഗതമാക്കിയ, സമയോചിതമായ കാർഷിക ഉപദേശം നൽകുന്ന ഡിജിറ്റൽ സുഹൃത്ത്',
      provideInfo: 'വിവരങ്ങൾ നൽകുക',
      ctaPrimary: 'Start Farming Journey',
      ctaSecondary: 'Learn More',
  localChat: 'ലോക്കൽ ചാറ്റ്',
  assistantTag: 'നിങ്ങളുടെ AI കാർഷിക സഹായി',
  cloudModeLabel: 'ക്ലൗഡ് മോഡൽ (Online)',
  localModeLabel: 'ലോക്കൽ മോഡൽ (ഓഫ്‌ലൈൻ)',
      challengeTitle: 'The Challenge',
      challengePara: 'Kerala-ലെ ചെറുകിട കർഷകർക്ക് പലപ്പോഴും വ്യക്തിഗതമാക്കിയ, സമയോചിതമായ കാർഷിക ഉപദേശങ്ങളിലേക്കുള്ള പ്രവേശനം ഇല്ല. പൊതുവായ ഉപദേശങ്ങൾ പ്രാദേശിക വിള തിരഞ്ഞെടുപ്പുകൾ, കാലാവസ്ഥ, മണ്ണിന്റെ അവസ്ഥ അല്ലെങ്കിൽ കൃഷി രീതികൾ എന്നിവ കണക്കിലെടുക്കുന്നതിൽ പരാജയപ്പെടുന്നു.',
      featuresTitle: 'Core Features',
      featuresTag: 'വ്യാപകമായ സവിശേഷതകളോടെ നിങ്ങളുടെ കൃഷി യാത്രയെ മാറ്റിമറിക്കുന്നു',
      featDesc: {
        profile: 'വ്യക്തിഗത വിവരങ്ങൾ, സ്ഥലം, നിലത്തിന്റെ വലിപ്പം, വിളകൾ, മണ്ണിന്റെ തരം എന്നിവ കാപ്ചർ ചെയ്യുക',
        convo: 'മലയാളത്തിൽ വോയ്സ് അല്ലെങ്കിൽ ടെക്സ്റ്റ് വഴി കർഷകരെ ഇടപെടാൻ പ്രാപ്തമാക്കുക',
        activity: 'വിത്ത് വിതയൽ, നനയ്ക്കൽ, ഇൻപുട്ട് ഉപയോഗം അല്ലെങ്കിൽ കീട പ്രശ്നങ്ങൾ പോലുള്ള സംഭവങ്ങൾ ലോഗ് ചെയ്യുക',
        advisory: 'AI ഉപയോഗിച്ച് സജീവവും സന്ദർഭോചിതവുമായ മാർഗ്ഗനിർദ്ദേശം നൽകുക',
        alerts: 'വിള പ്രവർത്തനങ്ങൾ, സ്കീം ഡെഡ്‌ലൈനുകൾ, വില ട്രെൻഡുകൾ എന്നിവയ്ക്കായി സമയബന്ധിതമായ നഡ്ജുകൾ അയയ്ക്കുക',
        knowledge: 'പ്രാദേശിക ക്രോപ്പ് കലണ്ടറുകൾ, പെസ്റ്റ് ഡാറ്റ, മികച്ച രീതികൾ എന്നിവയിൽ നിന്ന് വലിച്ചെടുക്കുക'
      },
      weather: {
        title: 'പ്രാദേശിക കാലാവസ്ഥ',
        subtitle: 'ഇപ്പൊഴത്തെ കാലാവസ്ഥയുടെ ചുരുക്കം',
        loading: 'കാലാവസ്ഥ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു…',
        error: 'ഇപ്പോൾ കാലാവസ്ഥ വിവരങ്ങൾ ലഭ്യമല്ല.',
        location: 'സ്ഥലം',
        condition: 'കാലാവസ്ഥ',
        temperature: 'താപനില',
        feelsLike: 'അനുഭവിക്കുന്ന താപനില',
        humidity: 'ആർദ്രത',
        wind: 'കാറ്റ്',
        precipitation: 'മഴ',
        updated: 'അവസാനം പുതുക്കിയത്',
        ipLabel: 'IP ഉപയോഗിച്ചത്'
      },
      impactTitle: 'Expected Impact',
      impactTag: '"കൃഷി സഖി" - വിള ചക്രത്തിലുടനീളം കർഷകനോടൊപ്പം നടക്കുന്ന ഒരു ഡിജിറ്റൽ സുഹൃത്ത്',
      impacts: [
        'വ്യക്തിഗതമാക്കിയ, ആവശ്യാനുസരണം പിന്തുണയോടെ കർഷകരെ ശാക്തീകരിക്കുന്നു',
        'സമയബന്ധിതമായ പ്രവർത്തനങ്ങളിലൂടെ ഉൽപ്പാദനക്ഷമതയും സുസ്ഥിരതയും വർദ്ധിപ്പിക്കുന്നു',
        'AI + പ്രാദേശിക സന്ദർഭം ഉപയോഗിച്ച് അറിവിന്റെ വിടവ് നികത്തുന്നു'
      ],
      footerTag: 'AI-Powered Personal Farming Assistant for Kerala Farmers',
      footerNote: 'Fund availability is subject to availability through government sanction.',
      greeting: 'നമസ്കാരം! ഞാൻ കൃഷി സഖി, നിങ്ങളുടെ വ്യക്തിഗത കാർഷിക സഹായി. എങ്ങനെ സഹായിക്കാം?',
      placeholder: 'എങ്ങനെ സഹായിക്കാം?',
      error: 'ക്ഷമിക്കണം, സർവറിൽ ഒരു പ്രശ്നം നേരിട്ടു. പിന്നീട് വീണ്ടും ശ്രമിക്കാം.'
    },
    en: {
      brand: 'Krishi Sakhi',
      chatNow: 'Chat Now',
      heroSubtitle: 'A digital companion delivering personalized, timely farm advice for Kerala farmers',
      ctaPrimary: 'Start Farming Journey',
      ctaSecondary: 'Learn More',
  localChat: 'Local Chat',
  assistantTag: 'Your AI Farming Assistant',
  cloudModeLabel: 'Cloud model (Online)',
  localModeLabel: 'Local model (Offline)',
      challengeTitle: 'The Challenge',
      challengePara: 'Smallholder farmers in Kerala often lack access to timely, personalized advisory. Generic guidance may miss local crop choices, weather, soil conditions, and farming practices.',
      featuresTitle: 'Core Features',
      featuresTag: 'Transform your farming journey with a rich feature set',
      featDesc: {
        profile: 'Capture location, land size, crops, soil type, and irrigation details',
        convo: 'Enable voice/text conversations in Malayalam or English',
        activity: 'Log events like sowing, irrigation, inputs usage, and pest issues',
        advisory: 'Provide proactive, contextual guidance powered by AI',
        alerts: 'Send timely nudges for crop tasks, scheme deadlines, and price trends',
        knowledge: 'Draw from local crop calendars, pest data, and best practices'
      },
      weather: {
        title: 'Local Weather Snapshot',
        subtitle: 'Current conditions near you',
        loading: 'Fetching weather details…',
        error: 'Weather data is temporarily unavailable.',
        location: 'Location',
        condition: 'Condition',
        temperature: 'Temperature',
        feelsLike: 'Feels like',
        humidity: 'Humidity',
        wind: 'Wind',
        precipitation: 'Rain',
        updated: 'Last updated',
        ipLabel: 'IP used'
      },
      impactTitle: 'Expected Impact',
      impactTag: 'A digital friend who walks with the farmer across the crop cycle',
      impacts: [
        'Empowers farmers with personalized, on-demand support',
        'Improves productivity and sustainability through timely actions',
        'Bridges knowledge gaps using AI and local context'
      ],
      footerTag: 'AI-Powered Personal Farming Assistant for Kerala Farmers',
      footerNote: 'Fund availability is subject to availability through government sanction.',
      greeting: 'Hello! I am Krishi Sakhi, your personal farming assistant. How can I help?',
      placeholder: 'How can I help?',
      error: 'Sorry, there was a server issue. Please try again later.',
      provideInfo: 'Provide Info',
    }
  }
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isFarmerFormOpen, setIsFarmerFormOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [chatMode, setChatMode] = useState('cloud')
  const defaultMessages = (lng) => ([{ id: 1, text: TEXTS[lng].greeting, sender: 'bot' }])
  const getHistoryKey = (mode) => (mode === 'local' ? 'pfa_chat_history_local' : 'pfa_chat_history')
  const loadHistory = (mode, lng = lang) => {
    try {
      if (typeof window === 'undefined') return defaultMessages(lng)
      const stored = localStorage.getItem(getHistoryKey(mode))
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return defaultMessages(lng)
  }
  const [messages, setMessages] = useState(() => loadHistory('cloud'))
  const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)
  const [weatherInfo, setWeatherInfo] = useState(null)
  const [weatherIp, setWeatherIp] = useState('auto:ip')
  const [weatherError, setWeatherError] = useState(null)
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  // Theme (dark | light), default dark
  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem('pfa_theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return 'dark'
  }
  const [theme, setTheme] = useState(getInitialTheme())

  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingTimeoutRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const recordingStartRef = useRef(0)
  const recordingMimeTypeRef = useRef(RECORDING_MIME_TYPE)
  const audioContextRef = useRef(null)
  const messagesRef = useRef(messages)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const clearRecordingTimers = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
  }

  const handleRecorderStop = () => {
    clearRecordingTimers()
    setIsRecording(false)
    setRecordingDuration(0)
    stopMediaStream()
    mediaRecorderRef.current = null

    const chunks = recordedChunksRef.current
    recordedChunksRef.current = []

    if (!chunks.length) return

    const mimeType = recordingMimeTypeRef.current || 'audio/webm'
    const audioBlob = new Blob(chunks, { type: mimeType })
    processVoiceBlob(audioBlob)
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state !== 'inactive') {
      try {
        recorder.stop()
      } catch (error) {
        console.error('Failed to stop recorder:', error)
      }
    }
  }

  const processVoiceBlob = async (rawBlob) => {
    if (!rawBlob || !rawBlob.size) return
    setIsVoiceProcessing(true)
    try {
      const wavBlob = await convertBlobToWav(rawBlob, audioContextRef)
      const history = messagesRef.current || []
      const previousUser = [...history].reverse().find(m => m.sender === 'user')?.text || ''
      const previousBot = [...history].reverse().find(m => m.sender === 'bot')?.text || ''

      const languageLabel = lang === 'ml' ? 'Malayalam' : 'English'
      const transcription = await transcribeAudio(wavBlob, {
        language: languageLabel,
        questionPrev: previousUser,
        answerPrev: previousBot
      })

      await handleSendMessage(transcription)
    } catch (error) {
      console.error('Voice transcription failed:', error)
      setMessages(prev => [...prev, { id: Date.now(), text: 'Sorry, I could not understand that voice message.', sender: 'bot' }])
    } finally {
      setIsVoiceProcessing(false)
    }
  }

  const startRecording = async () => {
    if (isRecording || isVoiceProcessing) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages(prev => [...prev, { id: Date.now(), text: 'Voice input is not supported in this browser.', sender: 'bot' }])
      return
    }

    try {
      clearRecordingTimers()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const options = MediaRecorder.isTypeSupported(RECORDING_MIME_TYPE)
        ? { mimeType: RECORDING_MIME_TYPE }
        : undefined
      const recorder = new MediaRecorder(stream, options)
      recordingMimeTypeRef.current = recorder.mimeType || RECORDING_MIME_TYPE

      recordedChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = handleRecorderStop

      recorder.start()
      mediaRecorderRef.current = recorder
      recordingStartRef.current = Date.now()
      setRecordingDuration(0)
      setIsRecording(true)

      recordingIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartRef.current) / 1000
        setRecordingDuration(Number(Math.min(MAX_RECORDING_SECONDS, elapsed).toFixed(1)))
      }, 100)

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording()
      }, MAX_RECORDING_SECONDS * 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      stopMediaStream()
      clearRecordingTimers()
      setIsRecording(false)
      setRecordingDuration(0)
      mediaRecorderRef.current = null
      const message = error?.name === 'NotAllowedError'
        ? 'Microphone access was denied. Please enable it to record voice messages.'
        : 'Unable to access the microphone.'
      setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'bot' }])
    }
  }

  useEffect(() => {
    return () => {
      clearRecordingTimers()
      stopMediaStream()
      if (audioContextRef.current) {
        const ctx = audioContextRef.current
        audioContextRef.current = null
        ctx.close?.().catch(() => {})
      }
    }
  }, [])

    // Persist language and update default greeting only for a fresh session
    useEffect(() => {
      try { localStorage.setItem('pfa_lang', lang) } catch {}
    }, [lang])

    // Apply theme to document and persist
    useEffect(() => {
      try { localStorage.setItem('pfa_theme', theme) } catch {}
      document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    // Persist on change
    useEffect(() => {
      try { localStorage.setItem(getHistoryKey(chatMode), JSON.stringify(messages)) } catch {}
    }, [messages, chatMode])

    // Lock body scroll when chat is open
    useEffect(() => {
      const body = document.body
      if (isChatOpen) {
        const prev = body.style.overflow
        body.dataset.prevOverflow = prev
        body.style.overflow = 'hidden'
        return () => {
          body.style.overflow = body.dataset.prevOverflow || ''
          delete body.dataset.prevOverflow
        }
      }
      return () => {}
    }, [isChatOpen])

    useEffect(() => {
      let cancelled = false
      async function loadWeather() {
        setIsWeatherLoading(true)
        try {
          const { data, ip } = await fetchWeatherForClient()
          if (!cancelled) {
            setWeatherInfo(data)
            setWeatherIp(ip)
            setWeatherError(null)
          }
        } catch (error) {
          if (!cancelled) {
            setWeatherError(error?.message || 'Weather unavailable')
            setWeatherInfo(null)
          }
        } finally {
          if (!cancelled) setIsWeatherLoading(false)
        }
      }
      loadWeather()
      return () => {
        cancelled = true
      }
    }, [locale])

  const openChat = (mode = 'cloud') => {
    setChatMode(mode)
    setMessages(loadHistory(mode))
    setInputMessage('')
    setIsTyping(false)
    setIsChatOpen(true)
  }

  const handleSendMessage = async (overrideText) => {
    const source = typeof overrideText === 'string' ? overrideText : inputMessage
    const text = source.trim()
    if (!text) return

    const userMsg = { id: Date.now(), text, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    if (typeof overrideText !== 'string') {
      setInputMessage('')
    }
    setIsTyping(true)

    try {
      // Limit history to last 12 turns to keep prompt small
      const history = [...messages, userMsg]
      const trimmed = history.slice(-24) // messages are single turns, 24 ~ 12 exchanges
      const sendFn = chatMode === 'local' ? sendLocalChat : sendChat
      const { reply } = await sendFn(trimmed, { locale })
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot' }])
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 2, text: TEXTS[lang].error, sender: 'bot' }])
    } finally {
      setIsTyping(false)
    }
  }

  const features = [
    { icon: Users, title: 'Farmer & Farm Profiling', getDesc: d => d.profile },
    { icon: MessageCircle, title: 'Conversational Interface', getDesc: d => d.convo },
    { icon: Clock, title: 'Activity Tracking', getDesc: d => d.activity },
    { icon: Brain, title: 'Personalized Advisory', getDesc: d => d.advisory },
    { icon: Shield, title: 'Reminders & Alerts', getDesc: d => d.alerts },
    { icon: Sprout, title: 'Knowledge Engine', getDesc: d => d.knowledge }
  ]

  const weatherStrings = TEXTS[lang].weather
  const weatherCurrent = weatherInfo?.current || null
  const weatherLocation = weatherInfo?.location || null

  const formatNumber = (value, suffix = '') => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '--'
    const rounded = Math.round(value * 10) / 10
    return `${rounded}${suffix}`
  }

  const conditionIconRaw = weatherCurrent?.condition?.icon || ''
  const conditionIcon = conditionIconRaw
    ? (conditionIconRaw.startsWith('http') ? conditionIconRaw : `https:${conditionIconRaw}`)
    : null
  const conditionText = weatherCurrent?.condition?.text || ''

  const locationLabel = weatherLocation
    ? [weatherLocation.name, weatherLocation.region, weatherLocation.country].filter(Boolean).join(', ')
    : ''

  const temperatureLabel = formatNumber(weatherCurrent?.temp_c, '°C')
  const feelsLikeLabel = formatNumber(weatherCurrent?.feelslike_c, '°C')
  const humidityLabel = formatNumber(weatherCurrent?.humidity, '%')
  const precipLabel = formatNumber(weatherCurrent?.precip_mm, ' mm')

  const windLabel = typeof weatherCurrent?.wind_kph === 'number'
    ? `${formatNumber(weatherCurrent.wind_kph, ' km/h')}${weatherCurrent?.wind_dir ? ` ${weatherCurrent.wind_dir}` : ''}`.trim()
    : '--'

  const weatherUpdated = weatherCurrent?.last_updated || weatherLocation?.localtime || ''

  const weatherMetrics = [
    { label: weatherStrings.feelsLike, value: feelsLikeLabel },
    { label: weatherStrings.humidity, value: humidityLabel },
    { label: weatherStrings.wind, value: windLabel },
    { label: weatherStrings.precipitation, value: precipLabel }
  ]

  // impacts moved into TEXTS

  const chatModeLabel = chatMode === 'local'
    ? TEXTS[lang].localModeLabel
    : TEXTS[lang].cloudModeLabel

  return (
  <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-gray-900 to-gray-800' : 'from-green-50 to-emerald-100'}`}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
  className={`${theme === 'dark' ? 'bg-dark-nav' : 'bg-white/90'} backdrop-blur-sm shadow-lg sticky top-0 z-50`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 nav-inner">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">{TEXTS[lang].brand}</span>
          </motion.div>
          <div className="nav-controls">
            <div className="lang-toggle">
              <button
                onClick={() => setLang('ml')}
                className={`lang-btn ${lang === 'ml' ? 'active' : ''}`}
                aria-pressed={lang === 'ml'}
              >ML</button>
              <button
                onClick={() => setLang('en')}
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                aria-pressed={lang === 'en'}
              >EN</button>
            </div>
            <div className="lang-toggle" aria-label="Theme toggle">
              <button
                onClick={() => setTheme('dark')}
                className={`lang-btn ${theme === 'dark' ? 'active' : ''}`}
                aria-pressed={theme === 'dark'}
                title="Dark"
              >🌙</button>
              <button
                onClick={() => setTheme('light')}
                className={`lang-btn ${theme === 'light' ? 'active' : ''}`}
                aria-pressed={theme === 'light'}
                title="Light"
              >☀️</button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openChat('cloud')}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl chat-launch-btn"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{TEXTS[lang].chatNow}</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
  <section className="py-16 px-4 md:py-20 md:px-6">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl font-bold text-green-800 mb-6 leading-tight"
          >
            AI-Powered Personal<br />
            <span className="text-green-600">Farming Assistant</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-green-700 mb-8 max-w-3xl mx-auto"
          >
            {TEXTS[lang].heroSubtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFarmerFormOpen(true)}
              className="text-green-700 px-7 py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 cta-btn secondary-cta"
            >
              {TEXTS[lang].provideInfo}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-7 py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cta-btn primary-cta"
            >
              {TEXTS[lang].ctaPrimary}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-green-700 px-7 py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 cta-btn secondary-cta"
            >
              {TEXTS[lang].ctaSecondary}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openChat('local')}
              className="text-green-700 border border-green-500 px-7 py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 cta-btn local-cta"
            >
              {TEXTS[lang].localChat}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
  <section className="py-14 px-4 md:py-16 md:px-6 bg-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">{TEXTS[lang].challengeTitle}</h2>
            <p className="text-xl text-green-700 max-w-4xl mx-auto">
              {TEXTS[lang].challengePara}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
  <section className="py-16 px-4 md:py-20 md:px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">{TEXTS[lang].featuresTitle}</h2>
            <p className="text-xl text-green-700">{TEXTS[lang].featuresTag}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100"
              >
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4">{feature.title}</h3>
                <p className="text-green-700">{feature.getDesc(TEXTS[lang].featDesc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Impact Section */}
  <section className="py-16 px-4 md:py-20 md:px-6 bg-green-600 text-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{TEXTS[lang].impactTitle}</h2>
            <p className="text-xl opacity-90">{TEXTS[lang].impactTag}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TEXTS[lang].impacts.map((impact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300"
              >
                <TrendingUp className="w-12 h-12 mb-6 text-green-200" />
                <p className="text-lg leading-relaxed">{impact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

{/* Weather Section */}
  <section className="weather-section px-4 md:px-6">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          {weatherStrings.title}
        </h2>
        <p className="text-green-700 py-14">
          {weatherStrings.subtitle}
        </p>
      </motion.div>

      {isWeatherLoading ? (
        <div className="weather-card weather-message">
          {weatherStrings.loading}
        </div>
      ) : weatherError ? (
        <div className="weather-card weather-message weather-message-error">
          {weatherError || weatherStrings.error}
        </div>
      ) : weatherInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="weather-card"
        >
          <div className="weather-top">
            <div className="weather-top-left">
              {conditionIcon && (
                <img
                  src={conditionIcon}
                  alt={conditionText || 'Weather icon'}
                  className="weather-icon"
                  loading="lazy"
                />
              )}
              <div>
                <p className="weather-location">{locationLabel || weatherStrings.location}</p>
                <p className="weather-condition">{conditionText || weatherStrings.condition}</p>
              </div>
            </div>
            <div className="weather-temp">
              <span className="weather-temp-value">{temperatureLabel}</span>
              <span className="weather-temp-label">{weatherStrings.temperature}</span>
            </div>
          </div>

          <div className="weather-metrics">
            {weatherMetrics.map(metric => (
              <div key={metric.label} className="weather-metric">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </div>
            ))}
          </div>

          <div className="weather-meta">
            <span>{weatherStrings.updated}: {weatherUpdated || '--'}</span>
            {weatherIp && (
              <span>{weatherStrings.ipLabel}: {weatherIp}</span>
            )}
          </div>
        </motion.div>
      ) : null}
    </div>
  </section>

      {/* Footer */}
  <footer className="bg-green-800 text-green-600 py-10 px-4 md:py-12 md:px-6">
        <div className="container mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <Sprout className="w-8 h-8" />
            <span className="text-2xl font-bold text-green-800">{TEXTS[lang].brand}</span>
          </motion.div>
          <p className="text-green-200 mb-4">{TEXTS[lang].footerTag}</p>
          <p className="text-green-300 text-sm">{TEXTS[lang].footerNote}</p>
        </div>
      </footer>

      

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/50 z-50 flex ${isFullScreen ? '' : 'items-center justify-center'} ${isFullScreen ? 'p-0' : 'p-2 sm:p-4'}`}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`bg-white ${isFullScreen ? 'w-screen h-100dvh rounded-none fullscreen' : 'w-full max-w-2xl h-85dvh sm:h-[600px] rounded-2xl'} flex flex-col shadow-2xl chat-modal`}
            >
              {/* Chat Header */}
              <div className={`bg-green-600 text-white p-6 ${isFullScreen ? '' : 'rounded-t-2xl'} flex justify-between items-center chat-header`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{TEXTS[lang].brand}</h3>
                    <p className="text-green-100 text-sm">
                      {TEXTS[lang].assistantTag}
                      <span className="block text-green-100/80 text-xs mt-1">{chatModeLabel}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullScreen(v => !v)}
                    className="hover:bg-green-500 p-2 rounded-full transition-colors icon-btn"
                    title={isFullScreen ? 'Exit full screen' : 'Full screen'}
                  >
                    {isFullScreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => { setIsChatOpen(false); setIsFullScreen(false); }}
                    className="hover:bg-green-500 p-2 rounded-full transition-colors icon-btn"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 chat-messages">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message-row ${message.sender === 'user' ? 'from-user' : 'from-bot'}`}
                  >
                    {message.sender !== 'user' && (
                      <div className="avatar bot">
                        <Sprout className="w-5 h-5" />
                      </div>
                    )}
                    <div
                      className={`bubble ${
                        message.sender === 'user' ? 'user-bubble' : 'bot-bubble'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.sender === 'user' && (
                      <div className="avatar user">🧑‍🌾</div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="message-row from-bot">
                    <div className="avatar bot"><Sprout className="w-5 h-5" /></div>
                    <div className="bubble bot-bubble typing">
                      <span className="typing-dot">•</span>
                      <span className="typing-dot">•</span>
                      <span className="typing-dot">•</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200 chat-input-area">
                <div className="chat-input-wrap">
                  <div className="chat-input-row">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`voice-btn ${isRecording ? 'recording' : ''}`}
                      disabled={isVoiceProcessing}
                      title={isRecording ? 'Stop recording' : 'Record voice message'}
                    >
                      {isVoiceProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isRecording ? (
                        <Square className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={TEXTS[lang].placeholder}
                      className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 chat-input"
                      disabled={isVoiceProcessing}
                    />
                    <motion.button
                      whileHover={{ scale: (isTyping || isVoiceProcessing) ? 1 : 1.05 }}
                      whileTap={{ scale: (isTyping || isVoiceProcessing) ? 1 : 0.95 }}
                      onClick={() => handleSendMessage()}
                      className={`bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors send-btn ${(isTyping || isVoiceProcessing) ? 'disabled' : ''}`}
                      disabled={isTyping || isVoiceProcessing}
                    >
                      <Send className="w-6 h-6" />
                    </motion.button>
                  </div>
                  {(isRecording || isVoiceProcessing) && (
                    <div className="voice-status">
                      {isRecording
                        ? `Recording… ${recordingDuration.toFixed(1)}s`
                        : 'Transcribing voice message…'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFarmerFormOpen && <FarmerInfoForm isOpen={isFarmerFormOpen} onClose={() => setIsFarmerFormOpen(false)} language={lang} />}
      </AnimatePresence>
    </div>
  )
}

export default App
