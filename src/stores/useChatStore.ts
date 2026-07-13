import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isCode?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  appendChunk: (chunk: string) => void;
  setLoading: (loading: boolean) => void;
}

const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: 'welcome-msg',
      role: 'ai',
      content: 'Hello! I am OmniAI, your advanced assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ],
  isLoading: false,
  addMessage: (msg) => 
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        },
      ],
    })),
  appendChunk: (chunk) => 
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const lastIndex = msgs.length - 1;
        if (msgs[lastIndex].role === 'ai') {
          msgs[lastIndex] = { ...msgs[lastIndex], content: msgs[lastIndex].content + chunk };
        }
      }
      return { messages: msgs };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useChatStore;
