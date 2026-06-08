import React, { useState } from 'react';
import { MapPin, Calendar, Utensils, Wallet, Navigation, AlertTriangle, Copy, RefreshCw, PenTool, MessageCircle, Share2 } from 'lucide-react';

const ResultCard = ({ data, onReset, onHost }) => {
  const [activeTab, setActiveTab] = useState('guide');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareGuide = () => {
    const shareText = `🌟 我用【智旅攻略】生成了一份超棒的【${data.destination}】旅行攻略！\n\n` +
                      `✨ 行程亮点：${data.overview}\n` +
                      `💰 预算建议：${data.budget}\n\n` +
                      `👉 快来【智旅攻略】生成你的专属行程吧：http://${window.location.host}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    });
  };

  const handleCopyCopywriting = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('文案已复制到剪贴板，快去发小红书/抖音吧！');
    });
  };

  return (
    <div className="result-card">
      {/* Mock 模式提示 */}
      {data.isMockMode && (
        <div className="mock-mode-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>测试模式</strong>
            <p>当前显示的是模拟数据，请前往「API 配置」填入你的火山引擎 ARK API 密钥以获取真实攻略。</p>
          </div>
        </div>
      )}
      
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          行程攻略
        </button>
        <button 
          className={`tab-button ${activeTab === 'copywriting' ? 'active' : ''}`}
          onClick={() => setActiveTab('copywriting')}
        >
          发圈文案推荐
        </button>
      </div>

      {activeTab === 'guide' && (
        <>
          <div className="result-header">
            <h2><MapPin className="inline-icon" /> {data.destination}</h2>
            <p className="summary">{data.overview}</p>
          </div>

          <div className="result-grid">
            <div className="result-section full-width">
              <h3><Calendar className="inline-icon" style={{color: '#f59e0b'}} /> 最佳旅行季节</h3>
              <p style={{ color: '#d97706', fontWeight: 500 }}>{data.bestSeason}</p>
            </div>

            <div className="result-section full-width">
              <h3><Calendar className="inline-icon" /> 行程安排</h3>
              <ul>
                {data.itinerary?.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>

            <div className="result-section">
              <h3><Utensils className="inline-icon" /> 美食推荐</h3>
              <ul>
                {data.food?.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>

            <div className="result-section">
              <h3><AlertTriangle className="inline-icon" style={{color: '#ef4444'}} /> 避坑指南</h3>
              <ul>
                {data.tips?.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>

            <div className="result-section">
              <h3><Wallet className="inline-icon" /> 人均预算</h3>
              <p>{data.budget}</p>
            </div>

            <div className="result-section">
              <h3><Navigation className="inline-icon" /> 交通建议</h3>
              <p>{data.transportation}</p>
            </div>
          </div>

          <div className="result-actions">
            <button onClick={onReset} className="btn-secondary">
              <RefreshCw size={18} /> 重新生成
            </button>
            <button onClick={handleShareGuide} className="btn-primary">
              <Share2 size={18} /> {copiedShare ? '已复制，去微信/QQ粘贴吧' : '分享给好友'}
            </button>
            <button className="btn-primary" onClick={onHost} style={{ backgroundColor: '#c4b5fd', color: '#fff' }}>
              <MessageCircle size={18} /> 托管行程
            </button>
          </div>
        </>
      )}

      {activeTab === 'copywriting' && (
        <div className="copywriting-section">
          <div className="result-header">
            <h2><PenTool className="inline-icon" /> 热门文案推荐</h2>
            <p className="summary">为您智能生成的爆款文案，可直接复制发圈</p>
          </div>
          
          <div className="copywriting-list">
            {data.socialCopywriting?.map((copy, idx) => (
              <div key={idx} className="copywriting-item">
                <p>{copy}</p>
                <button 
                  onClick={() => handleCopyCopywriting(copy)} 
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <Copy size={16} /> 复制这条文案
                </button>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button onClick={onReset} className="btn-secondary">
              <RefreshCw size={18} /> 重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
