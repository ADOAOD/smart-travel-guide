require('dotenv').config();
const { analyzeVideoUrl } = require('./services/arkService');

(async () => {
  try {
    console.log('Testing Ark API...');
    const res = await analyzeVideoUrl('https://example.com/video.mp4');
    console.log('Success:', res);
  } catch (err) {
    console.error('Test Error:', err.message);
  }
})();
