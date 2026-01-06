import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Terminal, Loader2, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptPlaygroundProps {
  onSend: (prompt: string) => Promise<string>;
}

export function PromptPlayground({ onSend }: PromptPlaygroundProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');
    
    try {
      const result = await onSend(prompt);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend();
    }
  };

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-primary/10 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Terminal className="w-4 h-4" />
          TEST_CONSOLE
        </CardTitle>
        {response && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-7 px-2 text-[10px] text-primary hover:bg-primary/10"
          >
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'COPIED' : 'COPY_RESULT'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm border-b border-primary/10 bg-black/20 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {!response && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2">
              <Sparkles className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest">Awaiting Input Signal...</span>
            </div>
          )}
          
          {loading && (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs uppercase">Processing via neural routing...</span>
            </div>
          )}

          {error && (
             <div className="text-destructive border border-destructive/20 bg-destructive/10 p-4 rounded flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                    <div className="font-bold uppercase mb-1">ERROR: REQUEST_FAILED</div>
                    <div className="opacity-80 leading-relaxed">{error}</div>
                </div>
             </div>
          )}

          {response && (
            <div className="animate-in fade-in duration-500">
                <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                    <span className="text-primary font-bold mr-2 opacity-50">{'>>'}</span>
                    {response}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest">
                  End of transmission
                </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-primary/5">
            <div className="relative group">
                <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <div className="relative">
                  <Textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="ENTER NEURAL PROMPT (CTRL+ENTER TO SEND)..."
                      className="min-h-[80px] bg-background/80 border-primary/20 focus-visible:ring-primary pr-12 font-mono text-sm resize-none placeholder:text-primary/20 placeholder:text-[10px] placeholder:uppercase"
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
