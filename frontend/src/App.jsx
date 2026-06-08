import React, { useState, useEffect, useRef } from 'react';
import { Compass, BookOpen, ChevronDown, Settings, Disc } from 'lucide-react';
import Header from './components/Header';
import UploadPanel from './components/UploadPanel';
import UrlInput from './components/UrlInput';
import PreferencesPanel from './components/PreferencesPanel';
import LoadingPanel from './components/LoadingPanel';
import ResultCard from './components/ResultCard';
import ErrorMessage from './components/ErrorMessage';
import MyItinerary from './components/MyItinerary';
import ApiConfigModal from './components/ApiConfigModal';
import { analyzeUpload, analyzeVideoUrl } from './api/api';

function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
// 偏好设置状态
  const [preferences, setPreferences] = useState({
    departureCity: '',
    days: '不限',
    budget: '不限',
    people: '不限',
    age: '不限',
    travelMethod: '不限',
    travelStyle: '不限',
    specialNeeds: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // API 配置状态
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : {
      arkApiKey: '',
      arkModelId: '',
      arkBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      arkChatApiKey: '',
      arkChatModelId: ''
    };
  });
  const [showApiConfig, setShowApiConfig] = useState(false);
  
  // 托管行程全局状态
  const [hostedItineraries, setHostedItineraries] = useState(() => {
    const saved = localStorage.getItem('hostedItineraries');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [isHosting, setIsHosting] = useState(false);
  const [showHostedMenu, setShowHostedMenu] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  const menuRef = useRef(null);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      audioRef.current?.pause();
    } else {
      // 降低音量，让音乐更加轻柔、不喧宾夺主
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
      }
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  useEffect(() => {
    localStorage.setItem('hostedItineraries', JSON.stringify(hostedItineraries));
  }, [hostedItineraries]);
  
  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);
  
  const handleSaveApiConfig = (config) => {
    setApiConfig(config);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowHostedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!file && !url) {
      setError('请上传视频文件或填写视频直链');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    setIsHosting(false);

    try {
      let data;
      if (file) {
        data = await analyzeUpload(file, preferences, apiConfig);
      } else {
        data = await analyzeVideoUrl(url, preferences, apiConfig);
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUrl('');
    setResult(null);
    setError('');
    setIsHosting(false);
    setActiveItineraryId(null);
  };

  const handleHostNew = () => {
    const newItinerary = {
      id: Date.now().toString(),
      data: result,
      messages: [
        { role: 'assistant', content: `你好！我是你的专属智能旅行管家。我已经记下了你的【${result.destination}】行程攻略。你可以随时问我关于这次旅行的任何问题，比如：“帮我调整一下第二天的行程”或者“推荐一下第一天晚上的餐厅”。` }
      ],
      timestamp: new Date().getTime()
    };
    setHostedItineraries(prev => [newItinerary, ...prev]);
    setActiveItineraryId(newItinerary.id);
    setIsHosting(true);
  };

  const openHostedItinerary = (id) => {
    setActiveItineraryId(id);
    setIsHosting(true);
    setResult(null);
    setShowHostedMenu(false);
  };

  const updateItineraryMessages = (id, newMessages) => {
    setHostedItineraries(prev => prev.map(it => 
      it.id === id ? { ...it, messages: newMessages } : it
    ));
  };

  return (
    <div className="app-container">
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3" 
      />
      <button 
        className={`music-toggle ${isPlayingMusic ? 'playing' : 'paused'}`} 
        onClick={toggleMusic}
        title={isPlayingMusic ? "暂停背景音乐" : "播放背景音乐"}
      >
        <Disc size={28} />
      </button>

      <header className="app-header" style={{ position: 'relative' }}>
        {(result || isHosting || loading) && (
          <div className="header-left" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
            <button 
              className="btn-hosted-menu" 
              onClick={handleReset}
              style={{ padding: '0.75rem 1rem' }}
            >
              🏠 返回首页
            </button>
          </div>
        )}

        <div className="header-container">
          <Compass size={40} className="header-icon" />
          <div className="header-text">
            <h1>智旅攻略</h1>
            <p>上传一段旅游视频，让 AI 自动整理成攻略</p>
          </div>
        </div>

        <div className="header-right" ref={menuRef} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          {/* API 配置按钮 */}
          {!loading && !result && !isHosting && (
            <button 
              className="btn-hosted-menu" 
              onClick={() => setShowApiConfig(true)}
              title="配置 API"
            >
              <Settings size={18} /> API 配置
            </button>
          )}

          <button className="btn-hosted-menu" onClick={() => setShowHostedMenu(!showHostedMenu)}>
            <BookOpen size={18} /> 我的托管行程 <ChevronDown size={16} className={`chevron ${showHostedMenu ? 'up' : ''}`} />
          </button>
          {showHostedMenu && (
            <div className="hosted-menu-dropdown">
              {hostedItineraries.length > 0 ? (
                hostedItineraries.map(it => (
                  <div key={it.id} className={`hosted-item ${activeItineraryId === it.id ? 'active' : ''}`} onClick={() => openHostedItinerary(it.id)}>
                    <div className="hosted-item-title">📍 {it.data.destination || '未知目的地'} 行程</div>
                    <div className="hosted-item-time">{new Date(it.timestamp).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="hosted-item" style={{ color: 'var(--text-muted)', textAlign: 'center', cursor: 'default' }}>
                  暂无历史托管行程
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main className="main-content">
        {!loading && !result && !isHosting && (
          <div className="input-section">
            <div className="input-left">
              <UploadPanel file={file} setFile={(f) => { setFile(f); setUrl(''); setError(''); }} />
              <div className="divider"><span>或者</span></div>
              <UrlInput url={url} setUrl={(u) => { setUrl(u); setFile(null); setError(''); }} />
              
              <ErrorMessage message={error} />
              
              <button 
                className="btn-submit" 
                onClick={handleSubmit}
                disabled={(!file && !url) || !preferences?.departureCity?.trim()}
                style={{ marginTop: 'auto', paddingTop: '1rem', paddingBottom: '1rem' }}
              >
                生成专属攻略
              </button>
            </div>
            
            <div className="input-right">
              <PreferencesPanel preferences={preferences} setPreferences={setPreferences} />
            </div>
          </div>
        )}

        {loading && <LoadingPanel />}

        {!loading && result && !isHosting && (
          <ResultCard data={result} onReset={handleReset} onHost={handleHostNew} />
        )}

        {!loading && isHosting && activeItineraryId && (
          <MyItinerary 
            itinerary={hostedItineraries.find(it => it.id === activeItineraryId)} 
            onUpdateMessages={(newMsgs) => updateItineraryMessages(activeItineraryId, newMsgs)}
            onBack={handleReset} 
            apiConfig={apiConfig}
          />
        )}
      </main>
      
      {/* API 配置模态框 */}
      <ApiConfigModal 
        isOpen={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        config={apiConfig}
        onSave={handleSaveApiConfig}
      />
    </div>
  );
}

export default App;
