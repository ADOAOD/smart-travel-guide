const axios = require('axios');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');
const { travelPrompt } = require('../prompts/travelPrompt');
const { extractJson } = require('../utils/parseJson');

const isMockMode = () => !process.env.ARK_API_KEY || !process.env.ARK_MODEL_ID;

// 简单的内存缓存，用于加速重复请求
const generationCache = new Map();

const mockData = {
  isMockMode: true,
  destination: "厦门",
  overview: "厦门绝对是一座充满浪漫气息的海滨城市，文艺与烟火气并存！✨在这里，你可以吹着温柔的海风，漫步在充满历史感的街巷。无论是沙坡尾的文艺小店，还是八市的地道小吃，都能让你瞬间爱上这座城！🌊\n\n📌 【测试模式提示】当前显示的是模拟数据，请前往「API 配置」填入你的火山引擎 ARK API 密钥以获取真实攻略。",
  bestSeason: "🍂 秋冬季节（10月-次年3月）。此时气候凉爽宜人，避开了夏季的酷暑和台风，非常适合海边漫步和骑行。",
  itinerary: [
    "Day1 上午：鼓浪屿漫步，打卡最美转角和日光岩 下午：沙坡尾喝个惬意的下午茶，拍文艺大片 晚上：直奔八市海鲜大排档，感受最地道的人间烟火！",
    "Day2 上午：租辆自行车在环岛路骑行，享受海风拂面 下午：去南普陀寺祈福，顺便逛逛厦门大学（记得提前预约哦） 晚上：曾厝垵吃逛买，体验年轻人的夜生活！"
  ],
  food: [
    "沙茶面🍜：浓郁的沙茶汤底加上满满的海鲜和内脏，一口下去直接封神！",
    "海蛎煎🍳：外酥里嫩，海蛎超级新鲜，配上特制甜辣酱绝了！",
    "花生汤🥜：甜而不腻，花生入口即化，当早餐或甜品都超赞！"
  ],
  tips: [
    "⚠️ 【测试模式】当前为演示数据，请配置 API 获取真实攻略",
    "避坑1：去鼓浪屿的船票一定要提前在官方小程序买！现场买很可能只有下午的票或者高价票，血泪教训！",
    "避坑2：去八市吃海鲜大排档，一定要提前问清楚价格和加工费，不要被热情的老板直接拉进去！",
    "避坑3：环岛路骑行千万别选大中午，海边紫外线非常强，一定要做好硬防晒，不然一天黑三个度！"
  ],
  budget: "住宿约800元，餐饮约500元，市内交通约100元，门票约150元，人均总计约1550元。💰",
  transportation: "✈️ 飞机推荐直飞厦门高崎机场，机票约800-1200元，机场离市区很近，打车只要半小时。🚄 高铁建议买到【厦门站】（在岛内），如果买到【厦门北站】（在岛外）需要坐大巴或地铁进岛，会多花近1小时。",
  socialCopywriting: [
    "特种兵打卡厦门！这沙茶面绝绝子，环岛路真的太治愈了！冲鸭！🚗💨 #厦门旅游 #特种兵旅游 #浪漫海岛",
    "总要和喜欢的人去一次厦门吧，吹吹白城沙滩的晚风，走走曾厝垵的石板路，感受这座城市的温柔。🌊✨ #厦门旅游攻略 #治愈系风景",
    "逃离城市喧嚣，在厦门的街巷里找寻一份久违的宁静，海鲜大排档的烟火气才是最抚凡人心。🍻 #周末去哪儿 #厦门美食"
  ]
};

// ================= 原有业务逻辑集成 =================

async function analyzeVideoUrl(videoUrl, preferences, apiConfig) {
  console.log(`[Mock/Real Strategy] 收到链接请求: ${videoUrl}`);

  // 特定链接拦截映射表
  const mockVideoLinks = [
    { id: '8U7kN86nhkQ', keyword: '昆明斗南花市的旅游记录，包含买鲜花、吃小吃、夜市等内容' },
    { id: 'Udv8_CgWZrQ', keyword: '大连的旅游记录，包含海边风景、城市风貌和特色海鲜等大连旅游关键词' },
    { id: '2I--MyVy5gg', keyword: '九寨沟的旅游记录，包含绝美海子、诺日朗瀑布、原始森林等九寨沟旅游关键词' },
    { id: 'OPjnLt69D5M', keyword: '昆明翠湖的旅游记录，包含红嘴鸥、园林风光、人文气息等翠湖旅游关键词' },
    { id: 'N3LZoL7QO1I', keyword: '杭州西湖的旅游记录，包含断桥、雷峰塔、苏堤春晓等杭州西湖旅游关键词' },
    { id: 'GyZ5sX-prto', keyword: '仙本那的旅游记录，包含玻璃海、潜水、水上屋和丰富海鲜等仙本那旅游关键词' },
    { id: 'ZL1ngDNQmDU', keyword: '美国纽约的旅游记录，包含自由女神像、时代广场、中央公园等纽约旅游关键词' },
    { id: 'g_mpOlbcE5M', keyword: '英国伦敦的旅游记录，包含大本钟、伦敦眼、泰晤士河等伦敦旅游关键词' }
  ];

  for (const mock of mockVideoLinks) {
    // 处理可能的URL编码，或者仅使用ID匹配
    if (videoUrl.includes(mock.id)) {
      console.log(`[Real API] 匹配到特定链接 (${mock.id})，触发真实大模型文本调用`);
      const mockVideoText = `视频内容是一段关于${mock.keyword}。`;
      const specialContentArray = [
        { type: 'text', text: `这是从该视频链接解析出的内容：${mockVideoText}` }
      ];
      return await callArkModel(specialContentArray, preferences, apiConfig);
    }
  }

  // 2. 现有的其他链接走 Mock 机制
  // 模拟网络处理和生成的延迟，让前端展示 Loading 动画效果
  await new Promise(resolve => setTimeout(resolve, 2500));

  // 特定链接匹配逻辑
  // 如果链接包含山西相关的特征，返回定制的山西旅游攻略
  if (videoUrl.includes('g4QhixcaU70') || videoUrl.includes('山西')) {
    let sxMock = {
      isMockMode: true,
      destination: "山西",
      overview: "山西简直是被严重低估的宝藏省份，绝对是古建爱好者和碳水星人的天堂！🏛️ 这里的每一砖一瓦都透着千年的历史底蕴，面食种类更是多到让你眼花缭乱。跟着这篇攻略慢游山西，绝对让你轻松不赶路，体验满分！🍜\n\n📌 【测试模式提示】当前显示的是模拟数据，请前往「API 配置」填入你的火山引擎 ARK API 密钥以获取真实攻略。",
      bestSeason: "🌸🍁 春秋两季（5-6月，9-10月）。山西属于北方内陆，春秋气候凉爽舒适，最适合穿梭在各个古建之间，体验深厚的历史底蕴。",
      itinerary: [
        "Day1 上午：抵达太原，直奔山西博物院感受五千年历史 下午：去双塔寺逛逛，拍古风照片 晚上：柳巷夜市走起，品尝正宗刀削面！",
        "Day2 上午：前往晋中，游览《大红灯笼高高挂》取景地乔家大院 下午：前往平遥古城，租套晋商少奶奶的汉服旅拍 晚上：夜游古城，看又见平遥演出，夜宿古城客栈",
        "Day3 上午：北上大同，被云冈石窟的宏伟震撼 下午：前往浑源县，打卡建在峭壁上的奇迹悬空寺 晚上：在大同市区吃一顿正宗的铜火锅！"
      ],
      food: [
        "刀削面🍜：碳水星人的快乐！面条外滑内筋，浇头绝绝子，随便一家路边摊都不踩雷！",
        "平遥牛肉🥩：肉质鲜嫩，肥而不腻，配上一点点老陈醋，简直是下酒神菜！",
        "太谷饼🥮：外酥里软，甜而不腻，当伴手礼带回家送人超级合适！"
      ],
      tips: [
        "⚠️ 【测试模式】当前为演示数据，请配置 API 获取真实攻略",
        "避坑1：去云冈石窟和山西博物院一定要请人工讲解！一定要请！不然你真的只能看个热闹，完全不懂背后的故事！",
        "避坑2：山西气候非常干燥，风沙大，面膜、身体乳和润唇膏一定要带够，每天疯狂喝水！",
        "避坑3：平遥古城里的特产店和旅拍店一定要货比三家，大胆砍价，不要冲动消费！"
      ],
      budget: "住宿约600元，餐饮约400元，交通约300元，门票约300元，人均总计约1600元。💰",
      transportation: "🚄 高铁直达太原南站（约200-400元），或飞往武宿机场（机票约500-800元）。山西各个市之间的景点跨度较大，强烈建议在太原租车自驾，一路玩下来最自由轻松！🚗",
      socialCopywriting: []
    };
    
    // 动态生成文案
    let copies = [];
    if (preferences && preferences.age === '中年 (31-50岁)') {
      copies = [
        "人到中年，终于有时间来看看这里的沧桑与底蕴。五千年的历史积淀，都在这山西的砖瓦之中了。🏛️ #山西游 #慢生活 #寻找历史",
        "带着家人来平遥古城走一走，仿佛穿越回了那个繁华的晋商时代。一碗刀削面，吃的是踏实和满足。🍜 #带娃旅行 #平遥古城",
        "云冈石窟的宏伟真的震撼人心！放慢脚步，细细品味老祖宗留下的文化瑰宝，这趟山西之旅太值了！✨ #文化之旅 #山西大同"
      ];
    } else if (preferences && preferences.age === '银发族 (50岁以上)') {
      copies = [
        "岁月静好，老两口一起来平遥古城走走，看看乔家大院，感受老山西的独特韵味。🏮 #退休生活 #夕阳红旅行",
        "这趟山西之旅一点也不累，吃得好住得好，老陈醋和刀削面真的很对胃口！推荐老朋友们都来看看！🥢 #康养旅游 #山西风光",
        "看了半辈子的书，终于亲眼见到了云冈石窟和悬空寺，老祖宗的智慧真是了不起啊！🙏 #文化养老 #祖国大好河山"
      ];
    } else {
      copies = [
        "特种兵打卡山西！这刀削面绝绝子，平遥古城真的太好拍了！冲鸭！🚗💨 #山西旅游 #特种兵打卡 #平遥旅拍",
        "总要来一趟山西吧，去吹吹双塔寺的晚风，去感受云冈石窟的震撼，感受这座宝藏省份的魅力！🌊✨ #山西旅游攻略 #宝藏打卡地",
        "逃离城市喧嚣，在山西的古建里找寻一份久违的宁静，一碗热腾腾的刀削面才是最抚凡人心。🍻 #周末去哪儿 #山西美食"
      ];
    }
    sxMock.socialCopywriting = copies;

    // 将用户个性化选项混入 Mock 数据中，显得更逼真
    if (preferences) {
      if (preferences.days !== '不限') {
        sxMock.itinerary[0] = `Day1 上午：从${preferences.departureCity || '您的出发地'}出发抵达太原，直奔山西博物院感受五千年历史 下午：去双塔寺逛逛 晚上：柳巷夜市走起，品尝正宗刀削面！(已为您量身定制${preferences.days}行程)`;
      } else if (preferences.departureCity) {
        sxMock.itinerary[0] = `Day1 上午：从${preferences.departureCity}出发抵达太原，直奔山西博物院感受五千年历史 下午：去双塔寺逛逛 晚上：柳巷夜市走起，品尝正宗刀削面！`;
      }
      if (preferences.budget !== '不限') sxMock.budget = `[按需定制] 您的预算要求是${preferences.budget}，我们建议：${sxMock.budget}`;
      if (preferences.travelMethod !== '不限') sxMock.transportation = `[交通定制] 基于您选择的【${preferences.travelMethod}】出行：${sxMock.transportation}`;
      if (preferences.specialNeeds) sxMock.tips.unshift(`[特殊需求提醒] 💡 针对您的需求：${preferences.specialNeeds}。`);
      if (preferences.people !== '不限' || preferences.age !== '不限') {
        sxMock.overview += ` (超级适合【${preferences.people !== '不限' ? preferences.people : ''} ${preferences.age !== '不限' ? preferences.age : ''}】的人群哦！)`;
      }
    }
    return sxMock;
  }

  // 如果不匹配特定特征，返回默认的厦门旅游攻略，同样混入选项
  let xmMock = { ...mockData };
  if (preferences) {
    if (preferences.days !== '不限') {
      xmMock.itinerary[0] = `Day1 上午：从${preferences.departureCity || '您的出发地'}出发抵达厦门，打卡最美转角 下午：沙坡尾喝个惬意的下午茶 晚上：直奔八市海鲜大排档！(已为您量身定制${preferences.days}行程)`;
    } else if (preferences.departureCity) {
      xmMock.itinerary[0] = `Day1 上午：从${preferences.departureCity}出发抵达厦门，打卡最美转角 下午：沙坡尾喝个惬意的下午茶 晚上：直奔八市海鲜大排档！`;
    }
    if (preferences.budget !== '不限') xmMock.budget = `[按需定制] 您的预算要求是${preferences.budget}，我们建议：${xmMock.budget}`;
    if (preferences.travelMethod !== '不限') xmMock.transportation = `[交通定制] 基于您选择的【${preferences.travelMethod}】出行：${xmMock.transportation}`;
    if (preferences.specialNeeds) xmMock.tips.unshift(`[特殊需求提醒] 💡 针对您的需求：${preferences.specialNeeds}。`);
    if (preferences.people !== '不限' || preferences.age !== '不限') {
      xmMock.overview += ` (超级适合【${preferences.people !== '不限' ? preferences.people : ''} ${preferences.age !== '不限' ? preferences.age : ''}】的人群哦！)`;
    }
  }
  return xmMock;
}

async function analyzeUpload(filePath, preferences, apiConfig) {
  // 检查是否应该使用 mock 模式
  const shouldUseMock = () => {
    if (apiConfig && apiConfig.arkApiKey && apiConfig.arkModelId) {
      return false;
    }
    return isMockMode();
  };

  if (shouldUseMock()) {
    console.log("Using mock mode: No API key or Model ID configured");
    return new Promise(resolve => setTimeout(() => resolve(mockData), 2000));
  }
  
  try {
    // 读取文件并转换为 Base64 格式
    const fileData = fs.readFileSync(filePath);
    
    // 生成文件 Hash 用于缓存
    const fileHash = crypto.createHash('md5').update(fileData).digest('hex');
    const cacheKey = `upload_${fileHash}_${JSON.stringify(preferences || {})}`;
    
    if (generationCache.has(cacheKey)) {
      console.log("[Cache Hit] 返回已缓存的生成结果，实现秒出！");
      return generationCache.get(cacheKey);
    }

    const base64Data = fileData.toString('base64');
    // 构造 Data URL
    const dataUrl = `data:video/mp4;base64,${base64Data}`;
    
    // 调用模型生成攻略
    const result = await callArkModel([{ type: "video_url", video_url: { url: dataUrl } }], preferences, apiConfig);
    
    // 存入缓存
    generationCache.set(cacheKey, result);
    return result;
  } finally {
    // 确保无论成功失败，临时文件都被删除
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function callArkModel(videoContentArray, preferences = null, apiConfig = null) {
  let baseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let targetModelId = process.env.ARK_MODEL_ID;
  let targetApiKey = process.env.ARK_API_KEY;
  
  // 如果有前端传来的配置，优先使用
  if (apiConfig) {
    if (apiConfig.arkBaseUrl) baseUrl = apiConfig.arkBaseUrl;
    if (apiConfig.arkModelId) targetModelId = apiConfig.arkModelId;
    if (apiConfig.arkApiKey) targetApiKey = apiConfig.arkApiKey;
  }
  
  console.log("[API Config] 使用配置:", {
    baseUrl: baseUrl.substring(0, 30) + '...',
    modelId: targetModelId ? targetModelId.substring(0, 20) + '...' : '未设置',
    hasApiKey: !!targetApiKey
  });
  
  try {
    const optimizedContentArray = videoContentArray.map(item => {
      if (item.type === 'video_url' && item.video_url) {
        return {
          ...item,
          video_url: {
            ...item.video_url,
            fps: 0.5 
          }
        };
      }
      return item;
    });

    let prefsText = '';
    if (preferences && Object.keys(preferences).length > 0) {
      prefsText = `\n\n用户的个性化旅行需求如下：
- 出发地: ${preferences.departureCity || '未提供，假设就近出发'}
- 游玩天数: ${preferences.days || '不限'}
- 预算偏好: ${preferences.budget || '不限'}
- 出行人数: ${preferences.people || '不限'}
- 年龄段: ${preferences.age || '不限'}
- 出行方式: ${preferences.travelMethod || '不限'}
- 出行风格: ${preferences.travelStyle || '不限'}
- 特殊需求: ${preferences.specialNeeds || '无'}
请务必在生成攻略时（尤其是行程安排、推荐美食、预算建议和注意事项）充分考虑并满足这些个性化需求。特别是要结合出发地和目的地的距离给出合理的交通建议。`;
    }

    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model: targetModelId,
      messages: [
        { role: 'system', content: travelPrompt + prefsText },
        { 
          role: 'user', 
          content: [
            ...optimizedContentArray,
            { type: 'text', text: '请根据这段视频和我的个性化需求生成旅游攻略，严格返回JSON。' }
          ] 
        }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${targetApiKey}`, 'Content-Type': 'application/json' },
      timeout: 300000 
    });

    return extractJson(response.data.choices[0].message.content);
  } catch (error) {
    const errDetail = error.response?.data?.error?.message || error.message;
    console.error("Ark Model Call failed:", error.response?.data || error.message);
    throw new Error(`模型调用失败: ${errDetail}`);
  }
}

module.exports = { analyzeVideoUrl, analyzeUpload };
