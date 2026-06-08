# 智旅攻略

> 上传一段旅游视频，让 AI 自动整理成专属旅行攻略

## 功能特性

- 📹 **视频上传/链接解析** - 支持上传本地视频或粘贴视频链接
- 🤖 **AI 智能生成** - 基于火山引擎 ARK 大模型，自动分析视频内容生成攻略
- 🎨 **个性化定制** - 支持设置出发地、天数、预算、人数、年龄段等偏好
- 💬 **AI 行程管家** - 生成攻略后可与 AI 对话，实时调整行程
- 📝 **文案推荐** - 自动生成适合发朋友圈/抖音的爆款文案
- 🎵 **沉浸体验** - 内置背景音乐和精心设计的 UI 界面

## 技术栈

**前端**
- React 18 + Vite
- Lucide React Icons
- Axios

**后端**
- Node.js + Express
- Multer (文件上传)
- 火山引擎 ARK API

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/webtrip.git
cd webtrip
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖（新终端）
cd ../frontend
npm install
```

### 3. 配置 API

**方式一：前端配置（推荐）**

1. 启动应用后，点击页面右上角的「API 配置」按钮
2. 填入你的火山引擎 ARK API 密钥
3. 保存即可

**方式二：环境变量配置**

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
ARK_API_KEY=your_ark_api_key_here
ARK_MODEL_ID=your_ark_model_id_here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
PORT=3000
```

### 4. 启动服务

```bash
# 启动后端（终端 1）
cd backend
npm start

# 启动前端（终端 2）
cd frontend
npm run dev
```

### 5. 访问应用

打开浏览器访问：http://localhost:5173

## 使用说明

### 生成攻略

1. **上传视频或输入链接**
   - 点击上传区域选择本地视频文件
   - 或粘贴视频直链/抖音分享口令

2. **填写偏好设置**
   - 出发地（必填）
   - 游玩天数、预算、人数、年龄段
   - 出行方式、旅行风格、特殊需求

3. **点击生成**
   - 等待 AI 分析并生成攻略
   - 支持实时查看生成进度

### 托管行程

1. 生成攻略后，点击「托管行程」按钮
2. 进入 AI 对话界面
3. 可以随时询问关于行程的问题
4. 历史托管行程保存在本地

## 项目结构

```
WebTrip/
├── backend/
│   ├── prompts/
│   │   └── travelPrompt.js     # AI 提示词
│   ├── services/
│   │   ├── arkService.js       # 视觉模型服务
│   │   └── chatService.js      # 对话模型服务
│   ├── utils/
│   │   └── parseJson.js        # JSON 解析工具
│   ├── server.js               # 服务器入口
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js          # API 请求封装
    │   ├── components/          # React 组件
    │   ├── styles/
    │   │   └── index.css       # 全局样式
    │   ├── App.jsx             # 主应用
    │   └── main.jsx            # 入口文件
    ├── index.html
    └── package.json
```

## 获取火山引擎 API

1. 访问 [火山引擎官网](https://www.volcengine.com/)
2. 注册并登录账号
3. 开通 ARK 服务
4. 创建 API Key 和 Model ID
5. 在应用配置中填入

## 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ARK_API_KEY` | 视觉模型的 API 密钥 | 是 |
| `ARK_MODEL_ID` | 视觉模型的 ID | 是 |
| `ARK_BASE_URL` | API 地址（默认已配置） | 否 |
| `ARK_CHAT_API_KEY` | 对话模型的 API 密钥 | 否 |
| `ARK_CHAT_MODEL_ID` | 对话模型的 ID | 否 |
| `PORT` | 服务器端口（默认 3000） | 否 |

## 设计风格

- 🎨 莫兰迪色系，鼠尾草绿为主色调
- 📄 米白色纸张质感背景
- ✏️ 手写风格标题 + 现代无衬线正文
- 💫 丝滑的卡片展开动画
- 🎮 Loading 页面内置 Chrome 恐龙小游戏

## License

MIT License - 欢迎 Star 和 Fork！

---

*Made with ❤️ using React + Express + ARK*
