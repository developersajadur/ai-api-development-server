import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, serverUrl, setServerUrl, onCheckConnection, serverStatus }) {
  const [testUrl, setTestUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await fetch(`${testUrl.replace(/\/$/, '')}/`, { method: 'GET' });
      const duration = Math.round(performance.now() - start);
      if (res.ok) {
        setTestResult({ success: true, message: `Connected successfully (${duration}ms)` });
      } else {
        setTestResult({ success: false, message: `Server returned status ${res.status}` });
      }
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setServerUrl(testUrl);
    localStorage.setItem('qwen_server_url', testUrl);
    onCheckConnection(testUrl);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Server Settings</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="serverUrlInput">Model API Endpoint Base URL</label>
            <input
              id="serverUrlInput"
              className="form-input"
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Default FastAPI endpoint with <code>/chat</code> route.
            </small>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="secondary-btn"
              onClick={handleTest}
              disabled={testing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={testing ? 'spin' : ''} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              className="secondary-btn"
              onClick={() => setTestUrl('http://localhost:8000')}
              style={{ fontSize: '12px' }}
            >
              Reset to Default
            </button>
          </div>

          {testResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: testResult.success ? '#34d399' : '#f87171',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
