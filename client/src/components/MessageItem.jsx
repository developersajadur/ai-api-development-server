import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, RotateCcw } from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function MessageItem({ message, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopyMessage = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Strip all <think>...</think> and internal monologues completely
  const cleanContent = (rawContent) => {
    if (!rawContent) return '';
    // Strip complete <think>...</think> blocks
    let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Strip unclosed <think> blocks if tokens ran out
    if (cleaned.includes('<think>')) {
      const parts = cleaned.split('<think>');
      cleaned = parts[0].trim();
      // If nothing before <think>, and only think content was produced, extract readable text
      if (!cleaned) {
        cleaned = parts.slice(1).join('<think>').trim();
      }
    }
    return cleaned || rawContent;
  };

  const displayContent = isAssistant ? cleanContent(message.content) : message.content;

  return (
    <div className={`message-row ${message.role}`}>
      <div className={`message-avatar ${message.role}`}>
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div className="message-content-wrapper">
        <div className="message-bubble">
          {isAssistant ? (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (!inline && (match || codeString.includes('\n'))) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={codeString}
                        />
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{displayContent}</div>
          )}
        </div>

        <div className="message-meta">
          <span>{formatTime(message.timestamp)}</span>
          {isAssistant && (
            <>
              <button
                className="action-chip"
                onClick={() => handleCopyMessage(displayContent)}
                title="Copy entire response"
              >
                {copied ? (
                  <>
                    <Check size={12} color="#10b981" />
                    <span style={{ color: '#10b981' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {message.isError && onRetry && (
                <button
                  className="action-chip"
                  onClick={onRetry}
                  title="Retry prompt"
                >
                  <RotateCcw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
