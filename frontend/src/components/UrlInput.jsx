import React from 'react';
import { Link } from 'lucide-react';

const UrlInput = ({ url, setUrl }) => {
  return (
    <div className="url-input-container">
      <div className="url-input-wrapper">
        <Link className="url-icon" size={20} />
        <input 
          type="text" 
          placeholder="或者粘贴可公网访问的视频直链，或完整的抖音分享口令" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
      </div>
      <p className="upload-hint" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        支持如 "https://v.douyin.com/xxx/" 格式的抖音分享口令
      </p>
    </div>
  );
};

export default UrlInput;
