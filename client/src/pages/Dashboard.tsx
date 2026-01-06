import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { 
    keys, autoSwitch, chatHistory, toggleAutoSwitch, addKey, 
    removeKey, toggleKey, updateKeyConfig, getNextKey, 
    handleRequestSuccess, handleRequestFailure, addChatMessage, clearChat
  } = useGeminiKeys();
  const { toast } = useToast();
  
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPrompt = async (prompt: string): Promise<string> => {
    const keyToUse = getNextKey();
    if (!keyToUse) {
        toast({ title: "CLUSTER_FAILURE", description: "ALL NODES EXHAUSTED. WAIT FOR CIRCUIT RESET.", variant: "destructive" });
        throw new Error("Cluster offline");
    }

    setIsProcessing(true);
    setActiveKeyId(keyToUse.id);
    addChatMessage('user', prompt);

    try {
        const response = await sendGeminiPrompt(keyToUse, prompt, chatHistory);
        handleRequestSuccess(keyToUse.id);
        addChatMessage('model', response);
        return response;
    } catch (error: any) {
        handleRequestFailure(keyToUse.id, error.isRateLimit);
        toast({ title: error.isRateLimit ? "RATE_LIMIT_DETECTED" : "TRANSMISSION_ERROR", description: `NODE ${keyToUse.label} OFFLINE.`, variant: "destructive" });
        throw new Error(error.message);
    } finally {
        setIsProcessing(false);
        setTimeout(() => setActiveKeyId(null), 1500);
    }
  };

  const settingsPanel = (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Node Vault</h2>
        <p className="text-muted-foreground text-xs">Configure your API cluster nodes and circuit breakers.</p>
      </div>
      <KeyManager 
        keys={keys} 
        autoSwitch={autoSwitch} 
        onToggleAutoSwitch={toggleAutoSwitch} 
        onAdd={addKey} 
        onRemove={removeKey} 
        onToggle={toggleKey} 
        onUpdateConfig={updateKeyConfig} 
      />
    </div>
  );

  return (
    <Shell settingsContent={settingsPanel}>
      <div className="h-full flex flex-col relative">
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Minimalist Router Status Bar */}
            <div className="flex-shrink-0 px-6 py-2 bg-black/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                {keys.length > 0 ? (
                  keys.map(k => (
                    <div key={k.id} className="flex items-center gap-1.5 flex-shrink-0 group cursor-help" title={`${k.label}: ${k.isActive ? 'Active' : 'Offline'}`}>
                      <div className={cn(
                        "w-1 h-4 rounded-full transition-all duration-500",
                        activeKeyId === k.id ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                        k.isCooldown ? "bg-destructive/40" : 
                        k.isActive ? "bg-primary/20 group-hover:bg-primary/40" : "bg-white/5"
                      )} />
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter group-hover:text-muted-foreground transition-colors">{k.label}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest font-bold">Waiting for Nodes...</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-primary/40 uppercase ml-4 tracking-widest">
                <Activity className={cn("w-3 h-3", isProcessing && "animate-pulse text-primary")} />
                <span className={cn("hidden sm:inline", isProcessing && "text-primary")}>
                  {isProcessing ? "Transmitting..." : "Link Stable"}
                </span>
              </div>
            </div>
            
            <PromptPlayground onSend={handleSendPrompt} history={chatHistory} onClearHistory={clearChat} />
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}
