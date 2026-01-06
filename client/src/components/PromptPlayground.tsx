import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Terminal, Loader2, Sparkles, AlertCircle, Copy, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/gemini';

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
  
  // Robust auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend();
    }
  };

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-primary/10 pb-4 flex flex-shrink-0 flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Terminal className="w-4 h-4" />
          NEURAL_LINK
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearHistory}
          disabled={history.length === 0}
          className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          CLEAR_CACHE
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Chat History Area - Added min-h-0 and flex-1 to ensure scrolling works */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm border-b border-primary/10 bg-black/20 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent space-y-6 min-h-0"
        >
          {history.length === 0 && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2">
              <Sparkles className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest text-center px-4">Neural link inactive. Awaiting signal...</span>
            </div>
          )}
          
          <div className="flex flex-col gap-6">
            {history.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "group flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-tighter opacity-50",
                    msg.role === 'user' ? "text-accent" : "text-primary"
                  )}>
                    {msg.role === 'user' ? 'LOCAL_INPUT' : 'REMOTE_NODE'}
                  </span>
                  <span className="text-[8px] opacity-30">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={cn(
                  "relative max-w-[85%] p-3 rounded-md border text-xs leading-relaxed group",
                  msg.role === 'user' 
                    ? "bg-accent/10 border-accent/20 text-foreground" 
                    : "bg-primary/5 border-primary/20 text-foreground/90"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col gap-2 items-start animate-pulse">
                <div className="text-[10px] uppercase font-bold tracking-tighter opacity-50 text-primary">
                  REMOTE_NODE
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-md flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-[10px] uppercase text-primary">Routing...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-destructive border border-destructive/20 bg-destructive/10 p-4 rounded flex gap-2 items-start animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                      <div className="font-bold uppercase mb-1">NETWORK_FAILURE</div>
                      <div className="opacity-80 leading-relaxed">{error}</div>
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Flex-shrink-0 to prevent compression */}
        <div className="p-4 bg-primary/5 flex-shrink-0">
            <div className="relative group">
                <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <div className="relative">
                  <Textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="BROADCAST SIGNAL (CTRL+ENTER)..."
                      className="min-h-[60px] max-h-[120px] bg-background/80 border-primary/20 focus-visible:ring-primary pr-12 font-mono text-sm resize-none placeholder:text-primary/20 placeholder:text-[10px] placeholder:uppercase"
                  />
                  <Button 
                      size="icon"
                      onClick={handleSend}
                      disabled={loading || !prompt.trim()}
                      className="absolute bottom-2 right-2 h-8 w-8 bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/50 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all"
                  >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
