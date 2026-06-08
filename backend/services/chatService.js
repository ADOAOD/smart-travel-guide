const axios = require('axios');

async function chatWithArk(messages, itineraryData, apiConfig = null) {
  // 确定使用的配置
  let arkChatApiKey = process.env.ARK_CHAT_API_KEY;
  let arkChatModelId = process.env.ARK_CHAT_MODEL_ID;
  let arkBaseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  
  // 如果有前端传来的配置，优先使用
  if (apiConfig) {
    if (apiConfig.arkChatApiKey) arkChatApiKey = apiConfig.arkChatApiKey;
    if (apiConfig.arkChatModelId) arkChatModelId = apiConfig.arkChatModelId;
    if (apiConfig.arkBaseUrl) arkBaseUrl = apiConfig.arkBaseUrl;
  }

  // System prompt to set the AI's persona and context
  const systemPrompt = {
    role: 'system',
    content: `你是一个专业的旅行管家AI。用户已经生成了一份旅行攻略，现在交由你托管。
你需要根据这份攻略的内容来回答用户的问题。如果用户的问题超出了攻略范围，你可以结合通用知识提供帮助，但始终以原攻略为基准。
语气要亲切、专业、像小红书博主一样活泼。

以下是用户的旅行攻略上下文：
目的地：${itineraryData.destination}
摘要：${itineraryData.summary}
行程安排：
${itineraryData.itinerary?.join('\n')}

必打卡景点：
${itineraryData.attractions?.join('\n')}

美食推荐：
${itineraryData.food?.join('\n')}

交通及预算：
${itineraryData.transportation}
${itineraryData.budget}

注意事项：
${itineraryData.tips?.join('\n')}
`
  };

  const payload = {
    model: arkChatModelId,
    messages: [systemPrompt, ...messages],
    stream: true
  };

  try {
    const response = await axios.post(
      `${arkBaseUrl}/chat/completions`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${arkChatApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream',
        timeout: 60000 // 1 minute timeout
      }
    );

    return response.data; // This is now a stream
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message);
    throw new Error('AI 管家暂时无法响应，请稍后再试。');
  }
}

module.exports = { chatWithArk };
