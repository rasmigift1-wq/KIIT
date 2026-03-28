import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your ClimaCare AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || data.message || "I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300",
          "bg-gradient-to-tr from-primary to-secondary text-white",
          "hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] border border-white/20",
          isOpen ? "opacity-0 scale-50 pointer-events-none" : "opacity-100"
        )}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] w-[340px] sm:w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[80vh] flex flex-col"
          >
            <GlassCard hover={false} glowColor="primary" className="flex flex-col h-full !p-0 overflow-hidden border-primary/20 bg-background/80 backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">ClimaCare AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "max-w-[85%] rounded-2xl p-3 text-[13px] leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground ml-auto rounded-tr-sm" 
                        : "bg-white/10 text-foreground border border-white/5 mr-auto rounded-tl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-white/10 text-foreground border border-white/5 max-w-[85%] rounded-2xl p-3 mr-auto w-16 flex justify-center items-center rounded-tl-sm">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 border-t border-border/50 bg-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about sustainability..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
