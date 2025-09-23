import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sprout, Users, TrendingUp, Brain, Shield, Clock, MapPin, Droplets, Bug } from 'lucide-react'
import './App.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "നമസ്കാരം! ഞാൻ കൃഷി സഖി, നിങ്ങളുടെ വ്യക്തിഗത കാർഷിക സഹായി. എങ്ങനെ സഹായിക്കാം?", sender: "bot" }
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: inputMessage, sender: "user" }])
      setInputMessage("")
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: "നിങ്ങളുടെ ചോദ്യം മനസ്സിലായി. AI സിസ്റ്റം ഇപ്പോൾ വികസിപ്പിച്ചുകൊണ്ടിരിക്കുന്നു. ദയവായി കാത്തിരിക്കുക.", 
          sender: "bot" 
        }])
      }, 1000)
    }
  }

  const features = [
    {
      icon: Users,
      title: "Farmer & Farm Profiling",
      description: "വ്യക്തിഗത വിവരങ്ങൾ, സ്ഥലം, നിലത്തിന്റെ വലിപ്പം, വിളകൾ, മണ്ണിന്റെ തരം എന്നിവ കാപ്ചർ ചെയ്യുക"
    },
    {
      icon: MessageCircle,
      title: "Conversational Interface",
      description: "മലയാളത്തിൽ വോയ്സ് അല്ലെങ്കിൽ ടെക്സ്റ്റ് വഴി കർഷകരെ ഇടപെടാൻ പ്രാപ്തമാക്കുക"
    },
    {
      icon: Clock,
      title: "Activity Tracking",
      description: "വിത്ത് വിതയൽ, നനയ്ക്കൽ, ഇൻപുട്ട് ഉപയോഗം അല്ലെങ്കിൽ കീട പ്രശ്നങ്ങൾ പോലുള്ള സംഭവങ്ങൾ ലോഗ് ചെയ്യുക"
    },
    {
      icon: Brain,
      title: "Personalized Advisory",
      description: "AI ഉപയോഗിച്ച് സജീവവും സന്ദർഭോചിതവുമായ മാർഗ്ഗനിർദ്ദേശം നൽകുക"
    },
    {
      icon: Shield,
      title: "Reminders & Alerts",
      description: "വിള പ്രവർത്തനങ്ങൾ, സ്കീം ഡെഡ്‌ലൈനുകൾ, വില ട്രെൻഡുകൾ എന്നിവയ്ക്കായി സമയബന്ധിതമായ നഡ്ജുകൾ അയയ്ക്കുക"
    },
    {
      icon: Sprout,
      title: "Knowledge Engine",
      description: "പ്രാദേശിക ക്രോപ്പ് കലണ്ടറുകൾ, പെസ്റ്റ് ഡാറ്റ, മികച്ച രീതികൾ എന്നിവയിൽ നിന്ന് വലിച്ചെടുക്കുക"
    }
  ]

  const impacts = [
    "വ്യക്തിഗതമാക്കിയ, ആവശ്യാനുസരണം പിന്തുണയോടെ കർഷകരെ ശാക്തീകരിക്കുന്നു",
    "സമയബന്ധിതമായ പ്രവർത്തനങ്ങളിലൂടെ ഉൽപ്പാദനക്ഷമതയും സുസ്ഥിരതയും വർദ്ധിപ്പിക്കുന്നു",
    "AI + പ്രാദേശിക സന്ദർഭം ഉപയോഗിച്ച് അറിവിന്റെ വിടവ് നികത്തുന്നു"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">കൃഷി സഖി</span>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl chat-launch-btn"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat Now</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-green-800 mb-6 leading-tight"
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
            Kerala കർഷകർക്കായി വ്യക്തിഗതമാക്കിയ, സമയോചിതമായ കാർഷിക ഉപദേശം നൽകുന്ന ഡിജിറ്റൽ സുഹൃത്ത്
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cta-btn primary-cta"
            >
              Start Farming Journey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-green-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cta-btn secondary-cta"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">The Challenge</h2>
            <p className="text-xl text-green-700 max-w-4xl mx-auto">
              Kerala-ലെ ചെറുകിട കർഷകർക്ക് പലപ്പോഴും വ്യക്തിഗതമാക്കിയ, സമയോചിതമായ കാർഷിക ഉപദേശങ്ങളിലേക്കുള്ള പ്രവേശനം ഇല്ല. 
              പൊതുവായ ഉപദേശങ്ങൾ പ്രാദേശിക വിള തിരഞ്ഞെടുപ്പുകൾ, കാലാവസ്ഥ, മണ്ണിന്റെ അവസ്ഥ അല്ലെങ്കിൽ കൃഷി രീതികൾ എന്നിവ കണക്കിലെടുക്കുന്നതിൽ പരാജയപ്പെടുന്നു.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">Core Features</h2>
            <p className="text-xl text-green-700">
              വ്യാപകമായ സവിശേഷതകളോടെ നിങ്ങളുടെ കൃഷി യാത്രയെ മാറ്റിമറിക്കുന്നു
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <p className="text-green-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Impact Section */}
      <section className="py-20 px-6 bg-green-600 text-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Expected Impact</h2>
            <p className="text-xl opacity-90">
              "കൃഷി സഖി" - വിള ചക്രത്തിലുടനീളം കർഷകനോടൊപ്പം നടക്കുന്ന ഒരു ഡിജിറ്റൽ സുഹൃത്ത്
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {impacts.map((impact, index) => (
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

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <Sprout className="w-8 h-8" />
            <span className="text-2xl font-bold">കൃഷി സഖി</span>
          </motion.div>
          <p className="text-green-200 mb-4">
            AI-Powered Personal Farming Assistant for Kerala Farmers
          </p>
          <p className="text-green-300 text-sm">
            Fund availability is subject to availability through government sanction.
          </p>
        </div>
      </footer>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl chat-modal"
            >
              {/* Chat Header */}
              <div className="bg-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center chat-header">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">കൃഷി സഖി</h3>
                    <p className="text-green-100 text-sm">Your AI Farming Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-green-500 p-2 rounded-full transition-colors icon-btn"
                >
                  <X className="w-6 h-6" />
                </button>
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
                {/* Typing indicator placeholder (when AI added, toggle visibility) */}
                {/* <div className="message-row from-bot">
                  <div className="avatar bot"><Sprout className="w-5 h-5" /></div>
                  <div className="bubble bot-bubble typing">
                    <span className="typing-dot">•</span>
                    <span className="typing-dot">•</span>
                    <span className="typing-dot">•</span>
                  </div>
                </div> */}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200 chat-input-area">
                <div className="flex space-x-4 chat-input-wrap">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="എങ്ങനെ സഹായിക്കാം?"
                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 chat-input"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors send-btn"
                  >
                    <Send className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
