import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { RouterVisualizer } from '@/components/RouterVisualizer';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Key, MessageSquare, Activity } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'chat' | 'nodes'>('chat');

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

  return (
    <Shell>
      <div className="h-full flex flex-col relative">
        {/* Navigation - Mobile Bottom / Desktop Floating Toggle */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-xs md:max-w-sm">
          <div className="bg-[#2f2f2f]/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center p-1.5 shadow-2xl overflow-hidden">
            <button 
              onClick={() => setActiveTab('chat')} 
              className={cn(
                "flex items-center justify-center gap-2 flex-1 py-2.5 rounded-full transition-all text-xs font-bold uppercase tracking-widest", 
                activeTab === 'chat' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button 
              onClick={() => setActiveTab('nodes')} 
              className={cn(
                "flex items-center justify-center gap-2 flex-1 py-2.5 rounded-full transition-all text-xs font-bold uppercase tracking-widest", 
                activeTab === 'nodes' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Key className="w-4 h-4" />
              <span>Nodes</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden pb-24 h-full">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Router Visualizer - Minimalist Header Version */}
                <div className="flex-shrink-0 px-6 py-2 bg-black/20 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                    {keys.length > 0 ? (
                      keys.map(k => (
                        <div key={k.id} className="flex items-center gap-1.5 flex-shrink-0">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            activeKeyId === k.id ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-125" : 
                            k.isCooldown ? "bg-destructive/40" : "bg-primary/20"
                          )} />
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">{k.label}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">No Active Nodes</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase ml-4">
                    <Activity className={cn("w-3 h-3", isProcessing && "animate-pulse")} />
                    <span className="hidden sm:inline">Cluster Ready</span>
                  </div>
                </div>
                
                <PromptPlayground onSend={handleSendPrompt} history={chatHistory} onClearHistory={clearChat} />
              </motion.div>
            ) : (
              <motion.div 
                key="nodes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8"
              >
                <div className="mb-8 space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Node Management</h2>
                  <p className="text-muted-foreground text-sm">Initialize and configure your Gemini API cluster nodes.</p>
                </div>
                <div className="flex-1 overflow-hidden">
                   <KeyManager keys={keys} autoSwitch={autoSwitch} onToggleAutoSwitch={toggleAutoSwitch} onAdd={addKey} onRemove={removeKey} onToggle={toggleKey} onUpdateConfig={updateKeyConfig} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Shell>
  );
}
