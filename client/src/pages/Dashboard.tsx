import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { RouterVisualizer } from '@/components/RouterVisualizer';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-160px)]">
        {/* Left Column: Key Management */}
        <div className="lg:col-span-1 h-[600px] lg:h-full overflow-hidden">
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

        {/* Right Column: Visualization & Chat */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex-shrink-0">
                <RouterVisualizer 
                    keys={keys}
                    activeKeyId={activeKeyId}
                    isProcessing={isProcessing}
                />
            </div>
            <div className="flex-1 overflow-hidden min-h-[450px]">
                <PromptPlayground 
                  onSend={handleSendPrompt} 
                  history={chatHistory}
                  onClearHistory={clearChat}
                />
            </div>
        </div>
      </div>
    </Shell>
  );
}
