import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { RouterVisualizer } from '@/components/RouterVisualizer';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Key, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { 
    keys, 
    autoSwitch, 
    chatHistory,
    toggleAutoSwitch, 
    addKey, 
    removeKey, 
    toggleKey, 
    updateLimit,
    getNextKey, 
    handleRequestSuccess,
    handleRequestFailure,
    addChatMessage,
    clearChat
  } = useGeminiKeys();
  const { toast } = useToast();
  
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'nodes'>('chat');

  const handleSendPrompt = async (prompt: string): Promise<string> => {
    const keyToUse = getNextKey();
    
    if (!keyToUse) {
        toast({
            title: "CLUSTER_FAILURE",
            description: "ALL NODES ARE OFFLINE OR IN COOLDOWN. WAIT FOR CIRCUIT RESET.",
            variant: "destructive"
        });
        throw new Error("Cluster offline: all nodes exhausted or in cooldown");
    }

    setIsProcessing(true);
    setActiveKeyId(keyToUse.id);
    addChatMessage('user', prompt);

    try {
        const response = await sendGeminiPrompt(keyToUse.key, prompt, chatHistory);
        handleRequestSuccess(keyToUse.id);
        addChatMessage('model', response);
        
        return response;
    } catch (error: any) {
        console.error(error);
        const isRateLimit = error.isRateLimit;
        handleRequestFailure(keyToUse.id, isRateLimit);
        
        toast({
            title: isRateLimit ? "RATE_LIMIT_DETECTED" : "TRANSMISSION_ERROR",
            description: isRateLimit ? `NODE ${keyToUse.label} ENTERED COOLDOWN.` : "NODE ENCOUNTERED A CRITICAL FAULT.",
            variant: "destructive"
        });
        throw new Error(error.message || "Transmission failed");
    } finally {
        setIsProcessing(false);
        setTimeout(() => setActiveKeyId(null), 1500);
    }
  };

  return (
    <Shell>
      <div className="flex flex-col h-[calc(100vh-140px)] relative">
        {/* Top Visualization */}
        <div className="flex-shrink-0 mb-4 h-[180px] lg:h-[220px]">
          <RouterVisualizer 
            keys={keys}
            activeKeyId={activeKeyId}
            isProcessing={isProcessing}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden pb-24">
          <div className={cn("h-full", activeTab !== 'chat' && "hidden")}>
            <PromptPlayground 
              onSend={handleSendPrompt} 
              history={chatHistory}
              onClearHistory={clearChat}
            />
          </div>
          <div className={cn("h-full", activeTab !== 'nodes' && "hidden")}>
            <KeyManager 
              keys={keys}
              autoSwitch={autoSwitch}
              onToggleAutoSwitch={toggleAutoSwitch}
              onAdd={addKey}
              onRemove={removeKey}
              onToggle={toggleKey}
              onUpdateLimit={updateLimit}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 rounded-2xl flex items-center justify-around p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-all",
                  activeTab === 'chat' ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Neural_Link</span>
              </button>
              
              <button
                onClick={() => setActiveTab('nodes')}
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-all",
                  activeTab === 'nodes' ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Key className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Node_Vault</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
