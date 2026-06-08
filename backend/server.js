const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { analyzeVideoUrl, analyzeUpload } = require('./services/arkService');
const { chatWithArk } = require('./services/chatService');

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
// 将后端请求的大小限制提高，以防 Base64 转换后的视频太大导致 413 Payload Too Large
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());

// 设置全局超时时间为 5 分钟 (300000ms)
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

// 配置文件上传
const upload = multer({ dest: 'uploads/' });

// 根路由，提供友好的提示
app.get('/', (req, res) => {
  res.send('智旅攻略 Backend is running! 请访问前端地址 (通常是 http://localhost:5173) 来使用本项目。');
});

// 接口：解析视频直链或抖音分享口令
app.post('/api/analyze-video-url', async (req, res) => {
  const { videoUrl, preferences, apiConfig } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl 为空' });
  }

  try {
    const result = await analyzeVideoUrl(videoUrl, preferences, apiConfig);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/analyze-video-url:', error.message);
    res.status(500).json({ error: error.message || '生成失败，请稍后再试' });
  }
});

// 接口：解析上传视频
app.post('/api/analyze-upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未上传文件' });
  }
  
  // 简单验证文件类型
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  if (!validTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: '文件类型不支持，优先使用 mp4' });
  }

  const preferences = req.body.preferences ? JSON.parse(req.body.preferences) : {};
  const apiConfig = req.body.apiConfig ? JSON.parse(req.body.apiConfig) : null;

  try {
    const result = await analyzeUpload(req.file.path, preferences, apiConfig);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/analyze-upload:', error.message);
    res.status(500).json({ error: error.message || '生成失败，请稍后再试' });
  }
});

// 新增：AI 管家聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, itineraryData, apiConfig } = req.body;
    if (!messages || !itineraryData) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    const stream = await chatWithArk(messages, itineraryData, apiConfig);
    
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 将后端流 pipe 给前端
    stream.pipe(res);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'AI 管家暂时无法响应，请稍后再试。' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
