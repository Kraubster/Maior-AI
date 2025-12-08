
import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { Message, Sender, COLORS, AppMode } from './types';
import { WELCOME_MESSAGE, TIRA_20S_PROMPT } from './constants';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tira20sInputRef = useRef<HTMLInputElement>(null);

  const theme = COLORS.standard; // Always use standard theme colors for background

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to transition background color of body/html
  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
  }, [theme]);

  const handleSend = async (text: string, imageBase64?: string) => {
    const userMsgId = uuidv4();
    const userMessage: Message = {
      id: userMsgId,
      text: text,
      sender: Sender.USER,
      timestamp: new Date(),
      imageUrl: imageBase64,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const result = await generateResponse({
      prompt: text,
      imageBase64,
      mode,
      previousMessages: messages
    });

    const aiMsgId = uuidv4();
    const aiMessage: Message = {
      id: aiMsgId,
      text: result.text,
      sender: Sender.AI,
      timestamp: new Date(),
      sources: result.sources
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  // Handler specifically for "Tira 20s" feature
  const handleTira20sChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgBase64 = reader.result as string;
        handleSend(TIRA_20S_PROMPT, imgBase64);
        if (tira20sInputRef.current) tira20sInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBubbleAction = (action: 'copy' | 'summarize' | 'quiz', content: string) => {
    if (action === 'copy') {
      navigator.clipboard.writeText(content);
      return;
    }

    let prompt = "";
    if (action === 'summarize') {
      prompt = "Faz um resumo da tua explicação anterior em tópicos essenciais e fáceis de memorizar.";
    } else if (action === 'quiz') {
      prompt = "Cria um quiz rápido com 7 perguntas de escolha múltipla sobre o que acabaste de ensinar. Inclui as soluções no final.";
    }

    if (prompt) {
      handleSend(prompt);
    }
  };

  // Generate random bubbles for Giga Mode
  const renderBubbles = () => {
    if (mode !== 'giga') return null;
    
    // Create 25 bubbles with random properties (Increased count)
    const bubbles = Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 4 + 2; // 2px to 6px
      const left = Math.random() * 100; // 0% to 100%
      const delay = Math.random() * 1.5; // 0s to 1.5s
      // Shorter duration for faster, more erratic feel
      const duration = Math.random() * 1.2 + 0.8; // 0.8s to 2.0s (Much faster)
      
      return (
        <div
          key={i}
          className="absolute rounded-full backdrop-blur-[1px]"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: '40px', // Start near input
            backgroundColor: 'rgba(168, 85, 247, 0.5)', // Purple
            animation: `giga-bubble-erratic ${duration}s ease-out infinite`,
            animationDelay: `-${delay}s`, 
          }}
        />
      );
    });

    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {bubbles}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      
      {/* Giga Mode Bubbles */}
      {renderBubbles()}

      {/* Header */}
      <header 
        className="fixed top-0 left-0 w-full z-20 pt-4 pb-2 px-6 border-b border-white/5 shadow-sm"
        style={{ backgroundColor: `${theme.background}E6`, backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-white transition-all duration-300">
                {mode === 'giga' ? 'Prof. GIGANTE' : 'Prof. Maior'}
              </h1>
            </div>
          </div>
          
          {/* Tira 20s Button (Top Right) */}
          <button 
            onClick={() => tira20sInputRef.current?.click()}
            className={`
              relative px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 
              hover:scale-105 active:scale-95 overflow-hidden group animate-pretty-outline
              bg-white/5 backdrop-blur-md border border-white/20 text-white
            `}
          >
             <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             <span className="text-xs font-semibold tracking-wide">TIRA 20s</span>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1s_infinite]"></div>
          </button>
          <input 
            type="file" 
            ref={tira20sInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleTira20sChange} 
          />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-24 z-10 max-w-3xl mx-auto w-full custom-scrollbar">
        
        {messages.map((msg) => (
          <ChatBubble 
            key={msg.id} 
            message={msg} 
            mode={mode} 
            onAction={handleBubbleAction}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full mb-6">
            <div 
              className="px-6 py-4 rounded-[2rem] rounded-bl-none bg-white/5 border border-white/5 shadow-lg flex items-center gap-1"
              style={{ backgroundColor: theme.surface }}
            >
              <span className="w-2 h-2 bg-white/50 rounded-full typing-dot"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full typing-dot"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <InputArea 
        onSend={handleSend} 
        isLoading={isLoading}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
};

export default App;
