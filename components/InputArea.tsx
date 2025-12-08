import React, { useState } from 'react';
import { COLORS, AppMode } from '../types';

interface InputAreaProps {
  onSend: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, mode, setMode }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const theme = COLORS.standard;

  const handleSend = () => {
    if ((!input.trim()) || isLoading) return;
    
    // animação do gatilho
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isReadyToSend = input.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 w-full pb-6 pt-2 px-4 z-30">
      {/* Gradiente fade out */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[150%] pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${theme.background} 85%, transparent)`
        }}
      />

      <div className="max-w-3xl mx-auto relative flex items-end gap-3">
        
        {/* intermitente efeito de aura */}
        <div className="relative flex-1 group rounded-[2rem] overflow-hidden p-[4px]">
          
          {/* Background (Aura) - muda baseado no modo. */}
          <div 
            className={`
              absolute inset-0 transition-opacity duration-300 
              ${isFocused ? 'opacity-80' : 'opacity-0'}
              ${mode === 'giga' ? 'animate-running-aura-giga' : 'animate-running-aura-standard'}
            `}
          ></div>

          {/* entrada do conteúdo */}
          <div 
            className="relative z-10 flex-1 flex items-center gap-2 rounded-[1.8rem] bg-[#3E3E3E] shadow-lg px-2"
            style={{
              backgroundColor: theme.surface,
              minHeight: '3rem'
            }}
          >
            {/* Modo giga Ativado */}
            <button 
              onClick={() => setMode(mode === 'standard' ? 'giga' : 'standard')}
              className={`
                w-8 h-8 rounded-full transition-all duration-500 flex items-center justify-center flex-shrink-0 ml-1
                ${mode === 'giga' 
                  ? 'text-[#A855F7] drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' // roxo glow
                  : 'text-white/40 hover:text-white/80'
                }
              `}
            >
              <svg 
                className="w-6 h-6" 
                fill={mode === 'giga' ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </button>

            {/* texto de entrada */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={mode === 'giga' ? "Modo GIGA..." : "Pergunta ao Professor..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-wave-red resize-none py-3 max-h-32 leading-relaxed text-base"
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>
        </div>

        {/* botão de enviar */}
        <button 
          onClick={handleSend}
          disabled={isLoading || !isReadyToSend}
          className={`
            w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0 shadow-xl relative overflow-hidden z-40
            ${isAnimating ? 'animate-crystalline-trigger' : 'crystalline-active'}
            ${(!isReadyToSend) || isLoading 
              ? 'bg-[#2A2A2A] text-white/20' 
              : `text-white hover:scale-105 bg-[#BC2A24] shadow-[0_0_15px_rgba(188,42,36,0.4)]`
            }
          `}
        >
            {/* reflexão */}
            {isAnimating && (
              <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-reflection pointer-events-none"></div>
            )}

            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-5 h-5 relative z-10 ml-0.5 ${isReadyToSend ? 'drop-shadow-md' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
            )}
        </button>
        
      </div>
      <div className="h-2"></div>
    </div>
  );
};
