
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender, COLORS, AppMode } from '../types';

interface ChatBubbleProps {
  message: Message;
  mode: AppMode;
  onAction: (action: 'copy' | 'summarize' | 'quiz', content: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, mode, onAction }) => {
  const isUser = message.sender === Sender.USER;
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determina a cor baseado no modo
  const theme = mode === 'giga' ? COLORS.giga : COLORS.standard;
  
  // Bolhas
  const userBg = theme.primary; // Vermelho
  const aiBg = theme.surface;   // roxo profundo
  
  const handleCopy = () => {
    onAction('copy', message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-message-enter`}>
      <div 
        className={`
          relative max-w-[85%] md:max-w-[70%] px-6 py-4 
          rounded-[2.5rem] transition-all duration-500
          ${isUser 
            ? 'text-white rounded-br-none shadow-md' 
            : `text-white rounded-bl-none shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] translate-y-[-2px] border border-white/5 ${mode === 'giga' ? 'animate-giga-chat-pulse' : ''}` 
          }
        `}
        style={{ 
          backgroundColor: isUser ? userBg : aiBg,
        }}
      >
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-xl mb-3 border border-white/10" />
        )}
        
        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/30 max-w-none text-sm md:text-base font-light">
          {isUser ? (
             <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
             <ReactMarkdown>{message.text}</ReactMarkdown>
          )}
        </div>

        {/* Sources Toggle */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-2">
            <button 
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
            >
              {showSources ? 'Esconder Fontes' : `Ver ${message.sources.length} Fontes`}
              <svg className={`w-3 h-3 transition-transform ${showSources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7 7"></path></svg>
            </button>
            
            {showSources && (
              <div className="mt-2 flex flex-col gap-1">
                {message.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-300 hover:underline truncate block"
                  >
                    {source.title || source.uri}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botões de ação para as respostas */}
        {!isUser && (
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
             <button 
               onClick={handleCopy} 
               className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-xs text-white/70"
             >
               {copied ? (
                 <span className="text-green-400">Copiado!</span>
               ) : (
                 <>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                   <span>Copiar</span>
                 </>
               )}
             </button>

             <button 
               onClick={() => onAction('summarize', message.text)}
               className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-xs text-white/70"
             >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
               <span>Resumir</span>
             </button>

             <button 
               onClick={() => onAction('quiz', message.text)}
               className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-xs text-white/70"
             >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
               <span>Quiz</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
