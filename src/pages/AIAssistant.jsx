import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Upload, Mic, MicOff, Camera, Globe, 
  Sparkles, ShieldCheck, FileText, Image, Languages, 
  Trash2, Copy, Check, Volume2, VolumeX, X 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { generateAIResponse } from '../api/ai';
import { useToast } from '../components/Toast';
import './AIAssistant.css';

export default function AIAssistant() {
  const { t, i18n } = useTranslation('ai');

  const initialMessages = [
    { role: 'assistant', content: t('greeting') },
  ];

  const quickActions = [
    { icon: <Camera size={16} />, label: t('quickActions.analyzeImage'), color: 'var(--color-accent)', type: 'upload' },
    { icon: <FileText size={16} />, label: t('quickActions.generateDescription'), color: 'var(--color-forest)', type: 'prompt', template: 'Generate an SEO-optimized product title, bullet points, tags, and artisan story for: ' },
    { icon: <ShieldCheck size={16} />, label: t('quickActions.verifyAuthenticity'), color: 'var(--color-info)', type: 'send', prompt: 'How do I verify the authenticity of a handmade craft? What pattern and material signs should I check for?' },
    { icon: <Languages size={16} />, label: t('quickActions.translateContent'), color: 'var(--color-secondary)', type: 'prompt', template: 'Translate the following craft product details into Hindi, Tamil, and Telugu: ' },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null); // { name, size, type, previewUrl, content, isImage }
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  // Clean up SpeechSynthesis and SpeechRecognition on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // --- Voice / Microphone Handling (Web Speech API) ---
  // Helper to remove <think> tags and their content from AI messages
  const cleanMessage = (text) => {
    if (typeof text !== 'string') return '';
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  };

  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.', 'error');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      const langMap = {
        hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
        ml: 'ml-IN', mr: 'mr-IN', gu: 'gu-IN', bn: 'bn-IN',
        pa: 'pa-IN', ur: 'ur-IN', en: 'en-IN'
      };
      recognition.lang = langMap[i18n.language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Microphone access was denied. Please allow microphone permissions in your browser.', 'error');
        } else if (event.error === 'no-speech') {
          showToast('No speech detected. Please try again.', 'info');
        } else {
          showToast(`Voice error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      showToast('Could not start voice recognition. Please try again.', 'error');
    }
  };

  // --- File / Image Upload Handling ---
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File size must be under 5 MB.', 'error');
      e.target.value = '';
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') || 
                   file.name.endsWith('.md') || 
                   file.name.endsWith('.json') || 
                   file.name.endsWith('.csv');

    if (!isImage && !isText && file.type !== 'application/pdf') {
      showToast('Please upload an image (PNG, JPG, WEBP) or a text document.', 'error');
      e.target.value = '';
      return;
    }

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          file,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          isImage: true,
          previewUrl: reader.result,
        });
        showToast(`Attached image: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          file,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          isImage: false,
          content: reader.result,
        });
        showToast(`Attached document: ${file.name}`, 'success');
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  // --- Message Sending ---
  const handleSendMessage = async (userMsg, attachedFile = attachment) => {
    const trimmed = userMsg ? userMsg.trim() : '';
    if (!trimmed && !attachedFile) return;

    let displayMsg = trimmed;
    let promptToSend = trimmed;

    // Construct prompt with file context if present
    if (attachedFile) {
      if (attachedFile.isImage) {
        if (!displayMsg) displayMsg = `Analyze uploaded image: ${attachedFile.name}`;
        promptToSend = `[Attached Image: ${attachedFile.name}]\n${promptToSend || 'Please analyze this craft product image for authenticity indicators, weave/material characteristics, and generate an SEO title and description.'}`;
      } else {
        if (!displayMsg) displayMsg = `Analyze uploaded document: ${attachedFile.name}`;
        promptToSend = `[Attached Document: ${attachedFile.name}]\nContent:\n${attachedFile.content || ''}\n\n${promptToSend || 'Please review and summarize this craft document.'}`;
      }
    }

    const newUserMessage = {
      role: 'user',
      content: displayMsg,
      prompt: promptToSend,
      image: attachedFile && attachedFile.isImage ? attachedFile.previewUrl : null,
      attachment: attachedFile ? { ...attachedFile } : null,
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    setAttachment(null);
    setIsTyping(true);

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsListening(false);
    }

    try {
      // Map messages array to send content/prompts to AI API
      // Map messages array to send content/prompts and image data to AI API
      const apiPayload = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.prompt || m.content,
        image: m.image || (m.attachment && m.attachment.isImage ? m.attachment.previewUrl : null),
      }));

      const response = await generateAIResponse(apiPayload, i18n.language);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage(response) }]);
    } catch (error) {
      console.error('AI Error:', error);
      showToast(error.message || 'Failed to communicate with AI', 'error');
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: `**Error:** ${error.message || 'I encountered an unexpected issue connecting to my brain. Please try again later.'}` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => handleSendMessage(input);

  const handleQuickAction = (action) => {
    if (action.type === 'upload') {
      handleFileClick();
    } else if (action.type === 'prompt') {
      setInput(action.template);
      inputRef.current?.focus();
    } else if (action.type === 'send') {
      handleSendMessage(action.prompt);
    } else {
      handleSendMessage(action.label);
    }
  };

  // --- Copy Message to Clipboard ---
  const handleCopyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      showToast('Failed to copy text', 'error');
    }
  };

  // --- Text-to-Speech (Read Aloud) ---
  const handleSpeakMessage = (text, idx) => {
    if (!window.speechSynthesis) {
      showToast('Text-to-speech is not supported in this browser.', 'error');
      return;
    }

    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Remove markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[#*_`~>-]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(idx);
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setAttachment(null);
    setMessages([{ role: 'assistant', content: t('greeting') }]);
    showToast(t('chatCleared'), 'info');
  };

  return (
    <div className="ai-page">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif,.txt,.md,.json,.csv"
        style={{ display: 'none' }}
      />

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
          <div className="ai-capability ai-capability--clickable" onClick={handleFileClick}>
            <Image size={14} /> {t('capabilities.visionAnalysis')}
          </div>
          <div className="ai-capability ai-capability--clickable" onClick={handleToggleListening}>
            <Mic size={14} /> {t('capabilities.voiceInput')}
          </div>
          <div className="ai-capability ai-capability--clickable" onClick={() => { setInput('Explain how you support 23 Indian languages.'); inputRef.current?.focus(); }}>
            <Globe size={14} /> {t('capabilities.multiLanguage')}
          </div>
          <div className="ai-capability ai-capability--clickable" onClick={() => handleSendMessage('What are the key criteria for verifying authentic handmade handicrafts?')}>
            <ShieldCheck size={14} /> {t('capabilities.verification')}
          </div>
          <div className="ai-capability ai-capability--clickable" onClick={() => { setInput('Write an SEO product listing with keywords, tags, and story for: '); inputRef.current?.focus(); }}>
            <FileText size={14} /> {t('capabilities.seoGeneration')}
          </div>
          <div className="ai-capability ai-capability--clickable" onClick={() => handleSendMessage('Create a fun 3-question craft knowledge quiz about traditional Indian pottery and weaving.')}>
            <Sparkles size={14} /> {t('capabilities.smartQuizzes')}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={clearChat} style={{ width: '100%', color: 'var(--color-text-secondary)' }}>
            {t('clearChat')}
          </Button>
        </div>
      </aside>

      {/* Chat Area */}
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
                  {/* Attachment in chat message */}
                  {msg.attachment && (
                    <div className="ai-message__attachment">
                      {msg.attachment.isImage ? (
                        <img src={msg.attachment.previewUrl} alt={msg.attachment.name} className="ai-message__attachment-img" />
                      ) : (
                        <div className="ai-message__attachment-doc">
                          <FileText size={14} />
                          <span>{msg.attachment.name} ({msg.attachment.size})</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ai-message__text markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Assistant Message Actions (Copy & Read Aloud) */}
                  {msg.role === 'assistant' && (
                    <div className="ai-message__actions">
                      <button 
                        type="button"
                        className="ai-message__action-btn"
                        onClick={() => handleCopyMessage(msg.content, i)}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? <Check size={14} color="#38a169" /> : <Copy size={14} />}
                        <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button 
                        type="button"
                        className={`ai-message__action-btn ${speakingIndex === i ? 'ai-message__action-btn--active' : ''}`}
                        onClick={() => handleSpeakMessage(msg.content, i)}
                        title={speakingIndex === i ? 'Stop speaking' : 'Read aloud'}
                      >
                        {speakingIndex === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span>{speakingIndex === i ? 'Stop' : 'Read'}</span>
                      </button>
                    </div>
                  )}
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

        {/* Input Area */}
        <div className="ai-chat__input-area">
          {/* Pending Attachment Preview Bar */}
          {attachment && (
            <div className="ai-attachment-bar">
              {attachment.isImage ? (
                <img src={attachment.previewUrl} alt={attachment.name} className="ai-attachment-thumb" />
              ) : (
                <FileText size={24} color="var(--color-accent)" />
              )}
              <div className="ai-attachment-info">
                <span className="ai-attachment-name">{attachment.name}</span>
                <span className="ai-attachment-size">{attachment.size}</span>
              </div>
              <button 
                type="button"
                className="ai-attachment-remove" 
                onClick={handleRemoveAttachment}
                title="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="ai-chat__input-wrap">
            {/* Upload Button */}
            <button 
              type="button"
              className="ai-chat__attach" 
              onClick={handleFileClick} 
              aria-label={t('input.uploadImage')}
              title="Upload craft image or document (PNG, JPG, PDF, TXT)"
            >
              <Upload size={18} />
            </button>

            {/* Microphone Button */}
            <button 
              type="button"
              className={`ai-chat__attach ${isListening ? 'ai-chat__attach--listening' : ''}`}
              onClick={handleToggleListening} 
              aria-label={t('input.voiceInput')}
              title={isListening ? 'Stop listening' : 'Voice input (Speak to type)'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              ref={inputRef}
              type="text"
              className="ai-chat__input"
              placeholder={isListening ? 'Listening... Speak now' : t('input.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />

            <motion.button
              type="button"
              className="ai-chat__send"
              onClick={handleSend}
              whileTap={{ scale: 0.9 }}
              disabled={(!input.trim() && !attachment) || isTyping}
              title={t('input.send')}
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
