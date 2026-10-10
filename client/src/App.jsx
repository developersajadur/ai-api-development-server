import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Menu, 
  Sparkles, 
  Settings, 
  Trash2, 
  Bot, 
  Code, 
  Cpu, 
  BookOpen, 
  Layers,
  ArrowUp
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import SettingsModal from './components/SettingsModal';
import './App.css';

const DEFAULT_SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SUGGESTIONS = [
  {
    icon: <Code size={18} />,
    title: 'Python Script',
    desc: 'Fetch data from an API and save it to a JSON file',
    prompt: 'Write a clean Python script using requests to fetch JSON from an API and save it with error handling.'
  },
  {
    icon: <Cpu size={18} />,
    title: 'LLM Mechanics',
    desc: 'Explain how attention and transformers work',
    prompt: 'Explain how transformer self-attention works in simple, intuitive terms.'
  },
  {
    icon: <Layers size={18} />,
    title: 'FastAPI Endpoint',
    desc: 'Build a production-ready API with Pydantic',
    prompt: 'Create a clean FastAPI POST endpoint that validates input with Pydantic and returns a structured response.'
  },
  {
    icon: <BookOpen size={18} />,
    title: 'বাংলায় প্রশ্ন (Bangla)',
    desc: 'পাইথন প্রোগ্রামিং শেখার সেরা রোডম্যাপ',
    prompt: 'আমাকে বিগিনার থেকে অ্যাডভান্সড পাইথন প্রোগ্রামার হওয়ার একটি বিস্তারিত রোডম্যাপ দিন।'
  }
];

export default function App() {
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('qwen_server_url') || DEFAULT_SERVER_URL;
  });

  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('qwen_chat_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading sessions', e);
    }
    const initialId = 'sess_' + Date.now();
    return [{
      id: initialId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: []
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return sessions[0]?.id || 'sess_' + Date.now();
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Active session
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('qwen_chat_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save sessions to localStorage', err);
    }
  }, [sessions]);

  // Check server health
  const checkServerHealth = async (urlToCheck = serverUrl) => {
    setServerStatus('checking');
    try {
      const cleanUrl = urlToCheck.replace(/\/$/, '');
      let response;
      try {
        response = await fetch(`${cleanUrl}/`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      } catch (err) {
        if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1:8000')) {
          response = await fetch('/api/', { method: 'GET', signal: AbortSignal.timeout(3000) });
        } else {
          throw err;
        }
      }
      if (response && response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (e) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServerHealth(serverUrl);
    const interval = setInterval(() => checkServerHealth(serverUrl), 15000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  // Scroll to bottom on message change or loading state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  };

  // Create new session
  const handleNewSession = () => {
    const newId = 'sess_' + Date.now();
    const newSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      const freshId = 'sess_' + Date.now();
      const fresh = [{
        id: freshId,
        title: 'New Conversation',
        createdAt: new Date().toISOString(),
        messages: []
      }];
      setSessions(fresh);
      setCurrentSessionId(freshId);
    } else {
      setSessions(updated);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      const freshId = 'sess_' + Date.now();
      const fresh = [{
        id: freshId,
        title: 'New Conversation',
        createdAt: new Date().toISOString(),
        messages: []
      }];
      setSessions(fresh);
      setCurrentSessionId(freshId);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    // Update session title if first message
    const isFirstMessage = messages.length === 0;
    const sessionTitle = isFirstMessage 
      ? prompt.slice(0, 32) + (prompt.length > 32 ? '...' : '') 
      : currentSession.title;

    // Append user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: sessionTitle,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const cleanUrl = serverUrl.replace(/\/$/, '');
      let response;
      try {
        response = await fetch(`${cleanUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
      } catch (directErr) {
        if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1:8000')) {
          response = await fetch('/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });
        } else {
          throw directErr;
        }
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const botContent = data.content || data.response || 'No response content received.';

      const botMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botContent,
        timestamp: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, botMessage],
            };
          }
          return s;
        })
      );
      setServerStatus('online');
    } catch (err) {
      console.error('Chat API Error:', err);
      const errorMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Connection Error**: Unable to reach the model server at \`${serverUrl}\`.\n\n*Details:* ${err.message}\n\nPlease verify that the server is running (\`python main.py\`) and accessible.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMessage],
            };
          }
          return s;
        })
      );
      setServerStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Retry last message
  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        serverStatus={serverStatus}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <div className="header-left">
            <button
              className="menu-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>

            <div className="header-model-card">
              <div className="model-title">
                <span>Nexus AI</span>
                <span className="model-pill">
                  <span className={`status-indicator ${serverStatus}`} style={{ width: 6, height: 6 }} />
                  Neural Core • Local Engine
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {messages.length > 0 && (
              <button
                className="icon-btn"
                title="Clear current conversation"
                onClick={() => {
                  if (window.confirm('Clear all messages in this conversation?')) {
                    setSessions((prev) =>
                      prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [] } : s))
                    );
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              className="icon-btn"
              onClick={() => setSettingsOpen(true)}
              title="Connection Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Message Container */}
        <div className="messages-container">
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="welcome-hero">
                <div className="welcome-logo">
                  <Sparkles size={34} color="#ffffff" />
                </div>
                <h2>Explore Nexus AI Intelligence</h2>
                <p>
                  Experience ultralow-latency local AI generation powered by high-performance neural architecture.
                </p>

                <div className="suggestions-grid">
                  {SUGGESTIONS.map((item, idx) => (
                    <div
                      key={idx}
                      className="suggestion-card"
                      onClick={() => handleSendMessage(item.prompt)}
                    >
                      <div className="sug-icon">{item.icon}</div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onRetry={handleRetryLast}
                />
              ))
            )}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="message-row assistant">
                <div className="message-avatar assistant">
                  <Bot size={20} />
                </div>
                <div className="message-content-wrapper">
                  <div className="message-bubble typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="input-floating-container">
          <div className="input-box-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask Nexus AI anything... (Shift + Enter for new line)"
              rows={1}
              value={inputPrompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <button
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputPrompt.trim()}
              title="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.6} />
            </button>
          </div>

          <div className="input-footer-hint">
            <span>Engine: Nexus Neural Intelligence</span>
            <span>•</span>
            <span>API: {serverUrl}/chat</span>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        serverUrl={serverUrl}
        setServerUrl={setServerUrl}
        onCheckConnection={checkServerHealth}
        serverStatus={serverStatus}
      />
    </div>
  );
}
