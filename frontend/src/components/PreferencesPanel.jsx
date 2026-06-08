import React, { useState, useRef, useEffect } from 'react';
import { Settings2, ChevronDown } from 'lucide-react';

const CustomSelect = ({ name, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || '不限';

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-header ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'up' : ''}`} />
      </div>
      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PreferencesPanel = ({ preferences, setPreferences }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const DAYS_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '1日游 (周边游)', label: '1日游 (周边游)' },
    { value: '2-3天 (周末短途)', label: '2-3天 (周末短途)' },
    { value: '4-5天 (小长假)', label: '4-5天 (小长假)' },
    { value: '6天以上 (深度游)', label: '6天以上 (深度游)' }
  ];

  const BUDGET_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '穷游特种兵 (200元内/天)', label: '穷游特种兵 (200元内/天)' },
    { value: '经济舒适 (200-500元/天)', label: '经济舒适 (200-500元/天)' },
    { value: '豪华享受 (500元以上/天)', label: '豪华享受 (500元以上/天)' }
  ];

  const PEOPLE_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '单人独游', label: '单人独游' },
    { value: '情侣/双人', label: '情侣/双人' },
    { value: '家庭亲子', label: '家庭亲子' },
    { value: '朋友组团 (4人以上)', label: '朋友组团 (4人以上)' }
  ];

  const AGE_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '青年 (18-30岁)', label: '青年 (18-30岁)' },
    { value: '中年 (31-50岁)', label: '中年 (31-50岁)' },
    { value: '银发族 (50岁以上)', label: '银发族 (50岁以上)' },
    { value: '全年龄段混合', label: '全年龄段混合' }
  ];

  const TRAVEL_METHOD_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '飞机', label: '飞机' },
    { value: '高铁/动车', label: '高铁/动车' },
    { value: '自驾游', label: '自驾游' }
  ];

  const TRAVEL_STYLE_OPTIONS = [
    { value: '不限', label: '不限' },
    { value: '慢旅行 (休闲放松)', label: '慢旅行 (休闲放松)' },
    { value: '打卡游 (热门景点全覆盖)', label: '打卡游 (热门景点全覆盖)' },
    { value: '深度游 (体验当地文化)', label: '深度游 (体验当地文化)' },
    { value: '特种兵 (高强度极限打卡)', label: '特种兵 (高强度极限打卡)' }
  ];

  const MODEL_OPTIONS = [
    { value: 'vision', label: 'Doubao-1.5-Vision (原模型)' },
    { value: 'flash', label: 'Doubao-1.5-Flash (新模型)' }
  ];

  return (
    <div className="preferences-panel">
      <div className="preferences-title">
        <Settings2 size={18} />
        <span>个性化定制需求</span>
      </div>
      <div className="preferences-grid">
        <div className="pref-item">
          <label>📍 出发地 <span style={{color: 'var(--error-color)', fontSize: '12px'}}>*必填</span></label>
          <input 
            type="text" 
            name="departureCity" 
            value={preferences.departureCity} 
            onChange={handleChange} 
            placeholder="如：北京、上海、广州..."
          />
        </div>

        <div className="pref-item">
          <label>⏱️ 游玩天数</label>
          <CustomSelect name="days" value={preferences.days} options={DAYS_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item">
          <label>💰 预算偏好</label>
          <CustomSelect name="budget" value={preferences.budget} options={BUDGET_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item">
          <label>� 出行人数</label>
          <CustomSelect name="people" value={preferences.people} options={PEOPLE_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item">
          <label>🎂 主要年龄段</label>
          <CustomSelect name="age" value={preferences.age} options={AGE_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item">
          <label>🚄 出行方式</label>
          <CustomSelect name="travelMethod" value={preferences.travelMethod} options={TRAVEL_METHOD_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item">
          <label>🎒 出行风格</label>
          <CustomSelect name="travelStyle" value={preferences.travelStyle} options={TRAVEL_STYLE_OPTIONS} onChange={handleChange} />
        </div>

        <div className="pref-item" style={{ gridColumn: '1 / -1' }}>
          <label>✨ 特殊人群 / 其他需求</label>
          <input 
            type="text" 
            name="specialNeeds" 
            value={preferences.specialNeeds} 
            onChange={handleChange} 
            placeholder="如：带宠物、轮椅出行、素食主义等..."
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesPanel;
