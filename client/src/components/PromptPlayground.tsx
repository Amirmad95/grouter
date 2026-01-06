import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, AlertCircle, Copy, Check, Trash2, Cpu, Zap, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PromptPlaygroundProps {
  onSend: (prompt: string, modelOverride?: string) => Promise<string>;
  history: ChatMessage[];
  onClearHistory: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  availableModels: { id: string, name: string }[];
}

export function PromptPlayground({ 
  onSend, 
  history, 
  onClearHistory, 
  currentModel, 
  onModelChange,
  availableModels 
}: PromptPlaygroundProps) {
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
      await onSend(currentPrompt, currentModel);
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

  const activeModelName = availableModels.find(m => m.id === currentModel)?.name || currentModel;

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full overflow-hidden relative">
      {/* Model Selector Header */}
      <div className="flex justify-center pt-3 pb-2 shrink-0 relative z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2.5 rounded-full px-5 bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground border border-white/[0.05] hover:border-white/10 transition-all shadow-lg backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[11px] font-bold tracking-widest uppercase">{activeModelName}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-30" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 bg-[#1a1a1a] border-white/10 text-foreground">
            {availableModels.map((model) => (
              <DropdownMenuItem 
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 py-2 cursor-pointer focus:bg-primary/10 focus:text-primary",
                  currentModel === model.id && "bg-primary/5 text-primary"
                )}
              >
                <div className="font-medium text-sm">{model.name}</div>
                <div className="text-[10px] opacity-50 font-mono uppercase">{model.id}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-0 py-4 scrollbar-hide space-y-6"
      >
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 pt-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Awaiting Input</h2>
              <p className="text-muted-foreground text-xs max-w-[280px]">
                Active Node: <span className="text-primary font-mono">{currentModel}</span>
              </p>
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
                "group flex gap-3 md:gap-4 w-full max-w-3xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border",
                msg.role === 'user' 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {msg.role === 'user' ? <div className="text-[9px] font-bold">ME</div> : <Cpu className="w-3.5 h-3.5" />}
              </div>
              
              <div className={cn(
                "flex-1 space-y-1.5",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block rounded-2xl px-4 py-2 text-sm md:text-base leading-relaxed shadow-sm transition-all",
                  msg.role === 'user' 
                    ? "bg-[#2f2f2f] text-foreground" 
                    : "bg-transparent text-foreground/90"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                
                <div className={cn(
                  "flex items-center gap-3 text-[9px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-40 transition-opacity",
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
          <div className="flex gap-3 md:gap-4 w-full max-w-3xl mx-auto">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex-1 flex items-center h-7">
              <div className="flex gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto p-3 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-3 text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">SIGNAL_LOST:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:pb-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
          <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <textarea 
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeModelName}...`}
              className="w-full bg-transparent px-6 py-5 pr-14 text-sm md:text-base focus:outline-none resize-none min-h-[60px] max-h-[200px] placeholder:text-muted-foreground/30 leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button 
                size="icon"
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-300",
                  prompt.trim() 
                    ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-100" 
                    : "bg-white/5 text-muted-foreground scale-95 opacity-50"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="text-[10px] text-center mt-4 text-muted-foreground/30 uppercase tracking-[0.3em] font-bold">
            Encrypted Neural Link • v2.5.1
          </div>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute top-2 right-2 flex gap-1.5">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClearHistory}
          disabled={history.length === 0}
          className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/5"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
        </Button>
      </div>
    </div>
  );
}
