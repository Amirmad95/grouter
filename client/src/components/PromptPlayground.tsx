import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, AlertCircle, Copy, Check, Trash2, ArrowDownCircle, Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptPlaygroundProps {
  onSend: (prompt: string) => Promise<string>;
  history: ChatMessage[];
  onClearHistory: () => void;
}

export function PromptPlayground({ onSend, history, onClearHistory }: PromptPlaygroundProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    const currentPrompt = prompt;
    setPrompt('');
    
    try {
      await onSend(currentPrompt);
    } catch (err: any) {
      setError(err.message || 'Transmission failed');
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full overflow-hidden relative">
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scrollbar-hide space-y-8"
      >
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 pt-20">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">How can I assist you today?</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Router v2.5 is active and distributed across your node cluster. Ready for signal broadcast.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-8">
              {['System check', 'List models', 'Router stats', 'Security audit'].map((hint) => (
                <button 
                  key={hint}
                  onClick={() => setPrompt(hint)}
                  className="p-3 text-left rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm group"
                >
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">{hint}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group flex gap-4 md:gap-6 w-full max-w-3xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border",
                msg.role === 'user' 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {msg.role === 'user' ? <div className="text-[10px] font-bold">ME</div> : <Cpu className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "flex-1 space-y-2",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block rounded-2xl px-4 py-2.5 text-sm md:text-base leading-relaxed shadow-sm transition-all",
                  msg.role === 'user' 
                    ? "bg-[#2f2f2f] text-foreground" 
                    : "bg-transparent text-foreground/90"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                
                <div className={cn(
                  "flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-40 transition-opacity",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <button onClick={() => navigator.clipboard.writeText(msg.content)} className="hover:text-primary transition-colors flex items-center gap-1">
                    <Copy className="w-3 h-3" /> COPY
                  </button>
                  {msg.role === 'model' && (
                    <span className="flex items-center gap-1 text-primary">
                      <Zap className="w-3 h-3" /> ROUTED
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-4 md:gap-6 w-full max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 flex items-center h-8">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold">TRANSMISSION_ERROR:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:pb-8 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pt-10">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative bg-[#212121] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <textarea 
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message GeminiRouter..."
              className="w-full bg-transparent px-4 py-4 pr-14 text-sm md:text-base focus:outline-none resize-none min-h-[56px] placeholder:text-muted-foreground/50"
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
              <Button 
                size="icon"
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  prompt.trim() ? "bg-primary text-black hover:bg-primary/90" : "bg-white/5 text-muted-foreground"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="text-[10px] text-center mt-3 text-muted-foreground/60 uppercase tracking-widest font-medium">
            Signal encryption active • End-to-end routing
          </div>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClearHistory}
          disabled={history.length === 0}
          className="rounded-full bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/5"
        >
          <Trash2 className="w-4 h-4 text-destructive/70" />
        </Button>
      </div>
    </div>
  );
}
