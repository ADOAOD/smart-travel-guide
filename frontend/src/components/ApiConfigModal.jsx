import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

function ApiConfigModal({ isOpen, onClose, config, onSave }) {
  const [localConfig, setLocalConfig] = useState({
    arkApiKey: '',
    arkModelId: '',
    arkBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    arkChatApiKey: '',
    arkChatModelId: ''
  });

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Settings size={20} /> API 配置</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            配置火山引擎 ARK API 密钥，用于生成旅行攻略和对话功能。
          </p>
          
          <div className="config-section">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>视觉模型配置</h3>
            
            <div className="config-item">
              <label>API Key</label>
              <input
                type="password"
                value={localConfig.arkApiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, arkApiKey: e.target.value })}
                placeholder="输入 ARK_API_KEY"
              />
            </div>
            
            <div className="config-item">
              <label>Model ID</label>
              <input
                type="text"
                value={localConfig.arkModelId}
                onChange={(e) => setLocalConfig({ ...localConfig, arkModelId: e.target.value })}
                placeholder="输入 ARK_MODEL_ID"
              />
            </div>
            
            <div className="config-item">
              <label>Base URL</label>
              <input
                type="text"
                value={localConfig.arkBaseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, arkBaseUrl: e.target.value })}
                placeholder="https://ark.cn-beijing.volces.com/api/v3"
              />
            </div>
          </div>
          
          <div className="config-section" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>对话模型配置</h3>
            
            <div className="config-item">
              <label>Chat API Key</label>
              <input
                type="password"
                value={localConfig.arkChatApiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, arkChatApiKey: e.target.value })}
                placeholder="输入 ARK_CHAT_API_KEY (可选)"
              />
            </div>
            
            <div className="config-item">
              <label>Chat Model ID</label>
              <input
                type="text"
                value={localConfig.arkChatModelId}
                onChange={(e) => setLocalConfig({ ...localConfig, arkChatModelId: e.target.value })}
                placeholder="输入 ARK_CHAT_MODEL_ID (可选)"
              />
            </div>
          </div>
          
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem', 
            marginTop: '1.5rem',
            fontStyle: 'italic'
          }}>
            💡 配置将保存到浏览器本地存储，下次打开应用时自动加载。
          </p>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSave}>保存配置</button>
        </div>
      </div>
    </div>
  );
}

export default ApiConfigModal;
