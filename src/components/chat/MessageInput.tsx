import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, StopCircle, X, Sparkles } from 'lucide-react';
import useChatStore from '../../stores/useChatStore';
import { sendMessageToAI } from '../../services/api';

export default function MessageInput() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addMessage, setLoading, appendChunk } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && files.length === 0) return;

    let content = input.trim();
    if (files.length > 0) {
      content += `\n\n[Attached Reference: ${files.map(f => f.name).join(', ')}]`;
    }

    addMessage({ role: 'user', content });
    setInput('');
    setFiles([]);
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Direct call to Flask Backend which calls Ollama
      const response = await sendMessageToAI(content, 'mistral');
      setLoading(false);
      
      const aiResponseText = response.response || 'No response from model.';
      const isCode = aiResponseText.includes('```'); // Simple generic markdown heuristic

      // Initialize an empty message first to act as the base for chunks
      addMessage({ 
        role: 'ai', 
        content: '',
        isCode
      });

      // Stream the content chunk by chunk to simulate AI typing (since backend doesn't stream yet)
      let i = 0;
      const chunks = aiResponseText.match(/.{1,3}/g) || [];
      
      const intervalId = setInterval(() => {
        if (i < chunks.length) {
          appendChunk(chunks[i]);
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 25);
      
    } catch (error) {
      setLoading(false);
      addMessage({ 
        role: 'ai', 
        content: 'Sorry, I encountered an error connecting to the OmniAI Backend. Make sure the Flask server (port 5000) and Ollama (port 11434) are running.' 
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInput((prev) => prev + (prev ? ' ' : '') + 'This is a mock transcribed voice message from Web Speech API.');
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 3));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-16 pb-6 px-4 md:px-8 z-20">
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {files.map((f, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm text-textMain z-10 shadow-md">
                <span className="truncate max-w-[150px] font-medium">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-textMuted hover:text-white transition-colors" title="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form 
          onSubmit={handleSubmit}
          className="relative bg-surface/80 backdrop-blur-xl border border-border shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-3xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 flex flex-col p-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Log entries, write code, or ask OmniAI anything..."
            className="w-full bg-transparent text-textMain placeholder:text-textMuted/70 outline-none resize-none px-4 py-3 max-h-[250px] min-h-[56px] custom-scrollbar text-[15px] leading-relaxed"
            rows={1}
            title="Message Input"
          />
          
          <div className="flex items-center justify-between px-2 pb-1 pt-2 border-t border-border/40 mt-1">
            <div className="flex items-center gap-1">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.xlsx,.csv"
                title="File Upload Input"
              />
              <button
                type="button"
                className="p-2.5 rounded-full text-textMuted hover:text-textMain hover:bg-white/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files (PDF, TXT, Excel)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-full transition-colors relative flex items-center justify-center ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-textMuted hover:text-textMain hover:bg-white/5'}`}
                title="Voice Input"
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-5 h-5 relative z-10" />
                    <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></span>
                  </>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() && files.length === 0}
              className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary/90 disabled:opacity-20 disabled:hover:bg-primary disabled:cursor-not-allowed text-white rounded-full transition-all shadow-lg shadow-primary/20"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-textMuted/80 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-primary/70" />
          <span>OmniAI can make mistakes. Consider verifying important information.</span>
        </div>
      </div>
    </div>
  );
}
