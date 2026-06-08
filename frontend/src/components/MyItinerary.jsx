import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';

const MyItinerary = ({ itinerary, onUpdateMessages, onBack, apiConfig }) => {
  const { data, messages } = itinerary;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    onUpdateMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: newMessages, itineraryData: data, apiConfig })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentContent = '';
      let hasStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              const deltaContent = parsed.choices[0]?.delta?.content;
              if (deltaContent) {
                if (!hasStarted) {
                  hasStarted = true;
                  setIsLoading(false); // 收到第一个字时关闭 loading
                }
                currentContent += deltaContent;
                onUpdateMessages([...newMessages, { role: 'assistant', content: currentContent }]);
              }
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      onUpdateMessages([...newMessages, { role: 'assistant', content: '抱歉，我现在有点开小差，请稍后再试哦。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-itinerary-container">
      <div className="itinerary-sidebar">
         <button className="btn-back" onClick={onBack}><ArrowLeft size={18} /> 返回攻略</button>
         <h3>我的行程：{data.destination}</h3>
         <div className="sidebar-content">
            <p className="summary">{data.summary}</p>
            <ul className="mini-itinerary">
              {data.itinerary?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
         </div>
      </div>
      <div className="chat-area">
         <div className="chat-header">
           <Bot size={24} className="bot-icon" />
           <h2>AI 行程管家</h2>
         </div>
         <div className="chat-messages">
           {messages.map((msg, idx) => (
             // 防止渲染空的助手消息气泡
             msg.content && (
               <div key={idx} className={`chat-message ${msg.role}`}>
                 <div className="message-avatar">
                   {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                 </div>
                 <div className="message-bubble">
                   {msg.content}
                 </div>
               </div>
             )
           ))}
           {/* 只在完全没有生成任何字的时候才显示 loading 动画 */}
           {isLoading && (
             <div className="chat-message assistant">
               <div className="message-avatar"><Bot size={20} /></div>
               <div className="message-bubble loading">
                 <span className="dot"></span><span className="dot"></span><span className="dot"></span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
         </div>
         <div className="chat-input-area">
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             placeholder="询问关于行程的任何问题..."
           />
           <button onClick={handleSend} disabled={isLoading || !input.trim()}>
             <Send size={18} />
           </button>
         </div>
      </div>
    </div>
  );
};

export default MyItinerary;