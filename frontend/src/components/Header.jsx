import React from 'react';
import { Plane } from 'lucide-react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Plane className="header-icon" size={32} />
        <div className="header-text">
        <h1>智旅攻略</h1>
        <p>上传一段旅游视频，让 AI 自动整理成攻略</p>
      </div>
      </div>
    </header>
  );
};

export default Header;
