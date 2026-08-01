import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Upload, Mic, Camera, Globe, Sparkles, ShieldCheck, FileText, Image, Languages, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SectionReveal from '../components/SectionReveal';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { generateAIResponse } from '../api/ai';
import { useToast } from '../components/Toast';
import './AIAssistant.css';

const initialMessages = [
  { role: 'assistant', content: 'Namaste! 🙏 I\'m Kalai, KalaConnect\'s AI Assistant. I can help you with:\n\n* **Product Listing** — Generate titles, descriptions & SEO tags from photos\n* **Authenticity Verification** — Analyze images for handmade indicators\n* **Translation** — Convert your product details into English, Hindi, Tamil, Telugu & Kannada\n* **Learning Support** — Summarize lessons, create quizzes & help with assignments\n\nHow can I help you today?' },
];

const quickActions = [
  { icon: <Camera size={16} />, label: 'Analyze Product Image', color: 'var(--color-accent)' },
  { icon: <FileText size={16} />, label: 'Generate Product Description', color: 'var(--color-forest)' },
  { icon: <ShieldCheck size={16} />, label: 'Verify Authenticity', color: 'var(--color-info)' },
  { icon: <Languages size={16} />, label: 'Translate Content', color: 'var(--color-secondary)' },
];

export default function AIAssistant() {
  const { t, i18n } = useTranslation('ai');

  const initialMessages = [
    { role: 'assistant', content: t('greeting') },
  ];

  const quickActions = [
    { icon: <Camera size={16} />, label: t('quickActions.analyzeImage'), color: 'var(--color-accent)' },
    { icon: <FileText size={16} />, label: t('quickActions.generateDescription'), color: 'var(--color-forest)' },
    { icon: <ShieldCheck size={16} />, label: t('quickActions.verifyAuthenticity'), color: 'var(--color-info)' },
    { icon: <Languages size={16} />, label: t('quickActions.translateContent'), color: 'var(--color-secondary)' },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSendMessage = async (userMsg) => {
    if (!userMsg.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Send the entire conversation history (excluding the first welcome message if it's too long, but we'll send it all for context)
      // OpenAI handles up to max_tokens limits
      const response = await generateAIResponse(newMessages, i18n.language);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI Error:', error);
      showToast(error.message || 'Failed to communicate with AI', 'error');
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error.message || 'I encountered an unexpected issue connecting to my brain. Please try again later.'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => handleSendMessage(input);

  const handleQuickAction = (action) => {
    handleSendMessage(action.label);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: t('greeting') }]);
    showToast(t('chatCleared'), 'info');
  };

  return (
    <div className="ai-page">
      {/* Sidebar */}
      <aside className="ai-sidebar">
        <div className="ai-sidebar__header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Logo variant="icon" size="sm" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{t('title')}</h2>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
          {t('subtitle')}
        </p>

        <h3 className="ai-sidebar__section-title">{t('quickActions.title')}</h3>
        <div className="ai-quick-actions">
          {quickActions.map((action, i) => (
            <button key={i} className="ai-quick-action" onClick={() => handleQuickAction(action)}>
              <span style={{ color: action.color }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <h3 className="ai-sidebar__section-title" style={{ marginTop: 'var(--space-8)' }}>{t('capabilities.title')}</h3>
        <div className="ai-capabilities">
          <div className="ai-capability"><Image size={14} /> {t('capabilities.visionAnalysis')}</div>
          <div className="ai-capability"><Mic size={14} /> {t('capabilities.voiceInput')}</div>
          <div className="ai-capability"><Globe size={14} /> {t('capabilities.multiLanguage')}</div>
          <div className="ai-capability"><ShieldCheck size={14} /> {t('capabilities.verification')}</div>
          <div className="ai-capability"><FileText size={14} /> {t('capabilities.seoGeneration')}</div>
          <div className="ai-capability"><Sparkles size={14} /> {t('capabilities.smartQuizzes')}</div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
           <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={clearChat} style={{ width: '100%', color: 'var(--color-text-secondary)' }}>
              {t('clearChat')}
            </Button>
        </div>
      </aside>

      {/* Chat */}
      <div className="ai-chat">
        <div className="ai-chat__messages">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`ai-message ai-message--${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ai-message__avatar">
                  {msg.role === 'assistant' ? (
                    <div className="avatar avatar--sm" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>
                      <Sparkles size={14} />
                    </div>
                  ) : (
                    <div className="avatar avatar--sm" style={{ background: 'linear-gradient(135deg, #4F6958, #3A5042)' }}>
                      <User size={14} />
                    </div>
                  )}
                </div>
                <div className="ai-message__content">
                  <div className="ai-message__text markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div key="typing" className="ai-message ai-message--assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="ai-message__avatar">
                  <div className="avatar avatar--sm" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}><Sparkles size={14} /></div>
                </div>
                <div className="ai-message__content">
                  <div className="ai-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat__input-area">
          <div className="ai-chat__input-wrap">
            <button className="ai-chat__attach" aria-label={t('input.uploadImage')}><Upload size={18} /></button>
            <button className="ai-chat__attach" aria-label={t('input.voiceInput')}><Mic size={18} /></button>
            <input
              ref={inputRef}
              type="text"
              className="ai-chat__input"
              placeholder={t('input.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />
            <motion.button
              className="ai-chat__send"
              onClick={handleSend}
              whileTap={{ scale: 0.9 }}
              disabled={!input.trim() || isTyping}
            >
              <Send size={18} />
            </motion.button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
            {t('poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
}
