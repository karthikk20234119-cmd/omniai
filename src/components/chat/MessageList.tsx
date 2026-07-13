import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Check, Copy } from 'lucide-react';
import useChatStore from '../../stores/useChatStore';

const CodeBlock = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-[#11131a] rounded-xl overflow-hidden border border-border mt-3 mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between px-4 py-2 bg-surface/50 border-b border-border text-xs text-textMuted font-sans">
        <span className="opacity-80">code</span>
        <button 
          onClick={handleCopy} 
          className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:text-white" 
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[14px] font-mono tracking-tight text-gray-300 leading-normal custom-scrollbar">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default function MessageList() {
  const { messages, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Robust auto-scroll mapping to content changes to catch streaming chunks
  useEffect(() => {
    const scrollToBottom = () => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    
    scrollToBottom();
    // Use an observer or short timeout to capture immediate DOM reflows cleanly
    const timeoutMsg = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutMsg);
  }, [messages, messages.map(m => m.content).join(''), isLoading]);

  return (
    <div className="flex-1 overflow-y-auto w-full pt-8 pb-48 px-4 md:px-8 custom-scrollbar relative z-10 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex gap-4 md:gap-6 group"
          >
            {/* Avatar Block */}
            <div className="shrink-0 mt-0.5">
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-textMuted" />
                </div>
              )}
            </div>
            
            {/* Message Content Block (ChatGPT / Cursor Style unified column) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 leading-none">
                <span className="font-semibold text-textMain text-[15px]">
                  {msg.role === 'ai' ? 'OmniAI' : 'You'}
                </span>
                <span className="text-xs text-textMuted/60 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="prose prose-invert max-w-none text-textMain/90 leading-relaxed break-words text-[15px]">
                {msg.isCode ? (
                  <CodeBlock content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}{msg.role === 'ai' && msg.content.length > 0 && isLoading && msg.id === messages[messages.length-1]?.id ? <span className="inline-block w-2.5 h-4 ml-1 align-middle bg-primary/70 animate-pulse rounded-sm" /> : ''}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 md:gap-6"
          >
            <div className="shrink-0 mt-0.5">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-6 mt-4" />
      </div>
    </div>
  );
}
