

export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  imageUrl?: string;
  isThinking?: boolean;
  isThinkingContent?: boolean;
  sources?: Source[];
}

export type AppMode = 'standard' | 'giga';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  mode: AppMode;
}

export const COLORS = {
  standard: {
    background: '#28282B',
    primary: '#BC2A24',
    secondary: '#353535',
    surface: '#3E3E3E',
    text: '#FFFFFF'
  },
  giga: {
    background: '#28282B',
    primary: '#BC2A24',
    secondary: '#353535',
    surface: '#3E3E3E',
    text: '#FFFFFF'
  },
  white: '#FFFFFF',
  grayLight: '#E5E7EB'
};
