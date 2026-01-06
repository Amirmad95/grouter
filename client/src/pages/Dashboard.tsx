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
    toggleAutoSwitch, 
    addKey, 
    removeKey, 
    toggleKey, 
    updateLimit,
    getNextKey, 
    incrementUsage 
  } = useGeminiKeys();
  const { toast } = useToast();
  
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPrompt = async (prompt: string): Promise<string> => {
    const keyToUse = getNextKey();
    
    if (!keyToUse) {
        toast({
            title: "ROUTING FAILURE",
            description: "NO ACTIVE NODES DETECTED. PLEASE INITIALIZE KEYS.",
            variant: "destructive"
        });
        throw new Error("No active keys available");
    }

    setIsProcessing(true);
    setActiveKeyId(keyToUse.id);

    try {
        const response = await sendGeminiPrompt(keyToUse.key, prompt);
        incrementUsage(keyToUse.id);
        
        return response;
    } catch (error: any) {
        console.error(error);
        toast({
            title: "TRANSMISSION ERROR",
            description: error.message || "FAILED TO REACH GEMINI NODE.",
            variant: "destructive"
        });
        throw error;
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

        {/* Right Column: Visualization & Playground */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex-shrink-0">
                <RouterVisualizer 
                    keys={keys}
                    activeKeyId={activeKeyId}
                    isProcessing={isProcessing}
                />
            </div>
            <div className="flex-1 overflow-hidden min-h-[400px]">
                <PromptPlayground onSend={handleSendPrompt} />
            </div>
        </div>
      </div>
    </Shell>
  );
}
