const axios = require('axios');

async function test() {
  const shortUrl = 'https://v.douyin.com/g4QhixcaU70/';
  try {
    const redirectRes = await axios.get(shortUrl, {
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Location:', redirectRes.headers.location);
    const longUrl = redirectRes.headers.location || redirectRes.request?.res?.responseUrl;
    console.log('Long URL:', longUrl);
    
    // 抖音新版链接有时候 ID 会藏在 modal_id 里
    const idMatch = longUrl.match(/video\/(\d+)/) || longUrl.match(/note\/(\d+)/) || longUrl.match(/modal_id=(\d+)/);
    console.log('ID Match:', idMatch);
    
    if (idMatch) {
      const videoId = idMatch[1];
      // 换用更新的移动端接口试试
      const apiUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${videoId}`;
      const apiRes = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log('API Res data keys:', Object.keys(apiRes.data));
      if (apiRes.data.item_list && apiRes.data.item_list.length > 0) {
        console.log('Found video url!');
      } else {
        console.log('Empty item_list. Try fallback API...');
        const fallbackApiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}&device_platform=webapp&aid=6383`;
        const fallbackRes = await axios.get(fallbackApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.douyin.com/'
          }
        });
        console.log('Fallback API Res data keys:', Object.keys(fallbackRes.data));
        if (fallbackRes.data.aweme_detail) {
            console.log('Found in fallback API!');
            const playAddr = fallbackRes.data.aweme_detail.video?.play_addr?.url_list[0];
            console.log('Play Addr:', playAddr);
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}
test();