import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Sparkles, 
  Activity,
  Layers
} from 'lucide-react';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
  isOpen,
  onClose,
  serverStatus,
  onOpenSettings
}) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-brand">
            <div className="logo-icon-wrapper">
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div className="brand-text">
              <h1>
                Nexus AI
                <span className="brand-badge">Pro</span>
              </h1>
              <p>Neural Intelligence Studio</p>
            </div>
          </div>
        </div>

        <button className="new-chat-btn" onClick={onNewSession}>
          <Plus size={16} />
          <span>Start New Chat</span>
        </button>

        <div className="chat-history-container">
          <div className="history-section-title">Conversations</div>

          {sessions.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No chat history yet
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth <= 768) onClose();
                }}
              >
                <div className="history-item-title">
                  <MessageSquare size={14} />
                  <span>{session.title || 'New Conversation'}</span>
                </div>
                <button
                  className="delete-chat-btn"
                  title="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div 
            className="server-status-pill" 
            onClick={onOpenSettings} 
            style={{ cursor: 'pointer' }}
            title="Click to configure server connection"
          >
            <div className="status-left">
              <div className={`status-indicator ${serverStatus}`} />
              <span>{serverStatus === 'online' ? 'API Online' : serverStatus === 'checking' ? 'Checking API...' : 'API Disconnected'}</span>
            </div>
            <Activity size={14} color="var(--text-muted)" />
          </div>

          {sessions.length > 0 && (
            <button className="sidebar-action-btn" onClick={onClearAllSessions}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}

          <button className="sidebar-action-btn" onClick={onOpenSettings}>
            <Settings size={14} />
            <span>Connection Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
