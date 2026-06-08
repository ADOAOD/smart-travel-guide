import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 300000, // 将前端超时时间延长至 5 分钟 (300秒)
});

export const analyzeVideoUrl = async (videoUrl, preferences, apiConfig) => {
  try {
    const response = await api.post('/analyze-video-url', { videoUrl, preferences, apiConfig });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('视频解析时间较长，请稍后重试');
    }
    throw new Error(error.response?.data?.error || '生成失败，请稍后再试');
  }
};

export const analyzeUpload = async (file, preferences, apiConfig) => {
  try {
    const formData = new FormData();
    formData.append('video', file);
    if (preferences) {
      formData.append('preferences', JSON.stringify(preferences));
    }
    if (apiConfig) {
      formData.append('apiConfig', JSON.stringify(apiConfig));
    }
    
    const response = await api.post('/analyze-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('视频解析时间较长，请稍后重试');
    }
    throw new Error(error.response?.data?.error || '生成失败，请稍后再试');
  }
};

export const sendChatMessage = async (messages, itineraryData, apiConfig) => {
  const response = await api.post('/chat', {
    messages,
    itineraryData,
    apiConfig
  });
  return response.data;
};
