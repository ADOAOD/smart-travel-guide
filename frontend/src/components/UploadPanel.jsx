import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

const UploadPanel = ({ file, setFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-panel" onClick={triggerUpload}>
      <input 
        type="file" 
        accept="video/mp4,video/quicktime,video/x-msvideo" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <UploadCloud className="upload-icon" size={48} />
      <h3>{file ? file.name : "点击或拖拽上传本地视频文件"}</h3>
      <p className="upload-hint">支持的视频格式：mp4 优先，最大 100MB</p>
    </div>
  );
};

export default UploadPanel;
