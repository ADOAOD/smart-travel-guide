import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const loadingTexts = [
  "AI 正在逐帧观看视频...",
  "正在提取目的地与路线...",
  "正在为你撰写爆款文案...",
  "正在整理结构化旅行攻略...",
  "视频信息量较大，请耐心稍候..."
];

const DinoSvg = ({ isJumping, runStep, isGameOver }) => {
  return (
    <svg width="44" height="47" viewBox="0 0 44 47" fill="#535353">
      {/* 尾巴和下半身 */}
      <rect x="0" y="20" width="2" height="12" />
      <rect x="2" y="18" width="2" height="14" />
      <rect x="4" y="16" width="2" height="16" />
      <rect x="6" y="14" width="2" height="18" />
      <rect x="8" y="12" width="2" height="20" />
      <rect x="10" y="10" width="10" height="24" />
      
      {/* 上半身和头 */}
      <rect x="20" y="12" width="4" height="22" />
      <rect x="24" y="16" width="4" height="16" />
      <rect x="20" y="0" width="22" height="12" />
      <rect x="22" y="12" width="10" height="2" />
      <rect x="28" y="18" width="6" height="2" />
      <rect x="32" y="20" width="2" height="4" />

      {/* 眼睛 */}
      {isGameOver ? (
        <g fill="white">
          <rect x="24" y="4" width="2" height="2" />
          <rect x="26" y="6" width="2" height="2" />
          <rect x="24" y="8" width="2" height="2" />
          <rect x="28" y="4" width="2" height="2" />
          <rect x="28" y="8" width="2" height="2" />
        </g>
      ) : (
        <rect x="24" y="4" width="4" height="4" fill="white" />
      )}

      {/* 左腿 */}
      {(isJumping || runStep === 0) && (
        <g>
          <rect x="12" y="34" width="4" height="12" />
          <rect x="16" y="44" width="4" height="2" />
        </g>
      )}
      {(!isJumping && runStep === 1) && (
        <g>
          <rect x="12" y="34" width="6" height="4" />
          <rect x="16" y="38" width="2" height="4" />
        </g>
      )}

      {/* 右腿 */}
      {(isJumping || runStep === 1) && (
        <g>
          <rect x="20" y="34" width="4" height="12" />
          <rect x="24" y="44" width="4" height="2" />
        </g>
      )}
      {(!isJumping && runStep === 0) && (
        <g>
          <rect x="20" y="34" width="6" height="4" />
          <rect x="24" y="38" width="2" height="4" />
        </g>
      )}
    </svg>
  );
};

const CactusSvg = () => (
  <svg width="24" height="48" viewBox="0 0 24 48" fill="#535353">
    <rect x="8" y="0" width="8" height="48" />
    <rect x="0" y="12" width="4" height="16" />
    <rect x="4" y="24" width="4" height="4" />
    <rect x="16" y="8" width="4" height="16" />
    <rect x="20" y="8" width="4" height="16" />
    <rect x="16" y="20" width="8" height="4" />
  </svg>
);

const DinoGame = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('dinoHighScore') || '0'));
  const [isGameOver, setIsGameOver] = useState(false);
  const [runStep, setRunStep] = useState(0);
  
  const dinoRef = useRef(null);
  const cactusRef = useRef(null);

  const jump = () => {
    if (isGameOver) {
      setIsGameOver(false);
      setScore(0);
      return;
    }
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => {
        setIsJumping(false);
      }, 550); // 对应 CSS 跳跃动画时间
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        jump();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isJumping, isGameOver]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!dinoRef.current || !cactusRef.current) return;

      const dinoTop = parseInt(window.getComputedStyle(dinoRef.current).getPropertyValue('top'));
      const cactusLeft = parseInt(window.getComputedStyle(cactusRef.current).getPropertyValue('left'));

      if (cactusLeft > 30 && cactusLeft < 70 && dinoTop > 60) {
        setIsGameOver(true);
      }
    }, 10);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (!isGameOver) {
      const scoreInterval = setInterval(() => {
        setScore(s => s + 1);
      }, 100);
      
      const runInterval = setInterval(() => {
        setRunStep(s => (s === 0 ? 1 : 0));
      }, 100);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(runInterval);
      };
    } else {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('dinoHighScore', score);
      }
    }
  }, [isGameOver, score, highScore]);

  return (
    <div className="dino-game-container" onClick={jump}>
      <div className="game-score">
        HI {String(highScore).padStart(5, '0')} {String(score).padStart(5, '0')}
      </div>
      {isGameOver && (
        <div className="game-over">
          G A M E &nbsp; O V E R<br/>
          <span style={{fontSize:'0.8rem', color: '#535353', marginTop: '10px', display: 'inline-block'}}>
            点击或按空格重新开始
          </span>
        </div>
      )}
      <div className={`cloud cloud-1 ${!isGameOver ? 'move' : ''}`}>☁️</div>
      <div className={`cloud cloud-2 ${!isGameOver ? 'move' : ''}`}>☁️</div>
      
      <div ref={dinoRef} className={`dino ${isJumping ? 'jump' : ''}`}>
        <DinoSvg isJumping={isJumping} runStep={runStep} isGameOver={isGameOver} />
      </div>
      <div ref={cactusRef} className={`cactus ${!isGameOver ? 'move' : ''}`}>
        <CactusSvg />
      </div>
      <div className={`ground-line ${!isGameOver ? 'move' : ''}`}></div>
    </div>
  );
};

const travelTrivia = [
  "你知道吗？世界上名字最长的城市是曼谷，它的泰语全名包含167个字母。",
  "在冰岛，羊的数量是人口的两倍多。",
  "世界上最短的商业航班在苏格兰的韦斯特雷岛和帕帕韦斯特雷岛之间，飞行时间仅需约1.5分钟。",
  "法国是世界上游客最多的国家，每年接待超过8000万国际游客。",
  "沙特阿拉伯的面积大到跨越了11个时区。",
  "日本拥有世界上最多的自动售货机，大约每23人就有一台。",
  "加拿大拥有超过300万个湖泊，占世界天然湖泊总数的60%以上。",
  "威尼斯共有400多座桥梁，但只有4座横跨大运河。",
  "秘鲁拥有世界上最高的沙丘，叫做Cerro Blanco，高约1176米。",
  "如果你每天在巴黎卢浮宫看一件艺术品，看完全部藏品需要大约100年。",
  "在芬兰，有超过200万个桑拿房，几乎每个家庭都有一个。",
  "死海是世界上地势最低的湖泊，它的水面低于海平面约430米。",
  "世界上最陡峭的街道位于新西兰的达尼丁，名为鲍德温街。",
  "不丹拥有马丘比丘之外的另一个失落之城——Choquequirao。",
  "中国拥有世界上最高和最长的玻璃桥，位于张家界大峡谷。",
  "如果你把梵蒂冈的国界线走一圈，大约只需要不到一小时。",
  "其实特雷维喷泉在罗马，每天人们向里面投掷的硬币总计超过3000欧元。",
  "蒙古国是世界上唯一一个吸收二氧化碳多于排放的国家（碳负排放）。",
  "澳大利亚的海岸线长度超过2.5万公里，每天去一个不同的海滩需要27年才能走完。",
  "在挪威，你可以租到一个带有透明屋顶的玻璃冰屋，专门用来躺在床上看极光。",
  "夏威夷的沙滩有各种颜色：白色、黄色、黑色、红色，甚至还有绿色的！",
  "新加坡虽然是一个城市国家，但它由63个岛屿组成。",
  "马尔代夫是世界上极少数没有原生毒蛇和蚊子的国家之一。",
  "瑞士拥有世界上最长的铁路隧道——圣哥达基线隧道，全长57公里。",
  "迪拜拥有世界上最高的建筑哈利法塔，高达828米。",
  "南极洲是地球上唯一没有爬行动物的大洲。",
  "格陵兰岛没有蚂蚁，这对于害怕昆虫的旅行者来说是个好消息。",
  "罗马竞技场在建成时可以容纳5万到8万名观众，甚至还曾注水进行过海战表演。",
  "纽约埃菲尔铁塔...等等，埃菲尔铁塔在巴黎，但全世界有超过30个埃菲尔铁塔的复制品！",
  "印度尼西亚由17000多个岛屿组成，是世界上最大的群岛国家。",
  "在土耳其，有超过130座海拔超过3000米的山峰。",
  "伊斯坦布尔是世界上唯一横跨欧亚两大洲的城市。",
  "布拉格的地铁电梯非常深且速度极快，这是因为它们在冷战时期被设计为防空洞。",
  "新西兰的羊不仅多，而且新西兰也是地球上人类最晚定居的陆地之一。",
  "世界上最古老的餐厅位于西班牙马德里，名为Sobrino de Botín，自1725年营业至今。",
  "在中国，重庆被称为“8D魔幻城市”，导航在这里经常会迷路，因为路是立体的。",
  "西藏的布达拉宫是世界上海拔最高、最宏伟的宫堡式建筑群。",
  "英国的伦敦地铁是世界上最古老的地下铁道系统，于1863年开通。",
  "马来西亚拥有世界上最大的洞穴室——砂拉越洞厅，大到可以装下40架波音747飞机。",
  "在古巴，有一个被称为“粉红湖”的地方（Las Salinas），湖水因为微生物呈现粉红色。"
];

const LoadingPanel = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(() => Math.floor(Math.random() * travelTrivia.length));

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    
    const triviaInterval = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % travelTrivia.length);
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(triviaInterval);
    };
  }, []);

  return (
    <div className="loading-panel">
      <Loader2 className="spinner" size={48} style={{ margin: '0 auto' }} />
      <h3 className="loading-text" style={{ marginBottom: '1.5rem' }}>{loadingTexts[textIndex]}</h3>
      <p className="dino-hint">大模型看视频需要一点时间，按<b>空格键</b>或<b>点击下方</b>玩个小游戏吧 🦖</p>
      <DinoGame />
      
      <div className="trivia-box">
        <span className="trivia-icon">💡</span>
        <p className="trivia-text" key={triviaIndex}>{travelTrivia[triviaIndex]}</p>
      </div>
    </div>
  );
};

export default LoadingPanel;
