import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { RouterVisualizer } from '@/components/RouterVisualizer';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { keys, addKey, removeKey, toggleKey, getNextKey, incrementUsage } = useGeminiKeys();
  const { toast } = useToast();
  
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPrompt = async (prompt: string): Promise<string> => {
    const keyToUse = getNextKey();
    
    if (!keyToUse) {
        toast({
            title: "Routing Error",
            description: "No active API keys available. Please add or activate a key.",
            variant: "destructive"
        });
        throw new Error("No active keys available");
    }

    setIsProcessing(true);
    setActiveKeyId(keyToUse.id);

    try {
        const response = await sendGeminiPrompt(keyToUse.key, prompt);
        incrementUsage(keyToUse.id);
        
        toast({
            title: "Request Routed Successfully",
            description: `Handled by ${keyToUse.label}`,
            className: "border-primary text-primary"
        });
        
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        setIsProcessing(false);
        // Keep the active visualization for a moment longer
        setTimeout(() => setActiveKeyId(null), 2000);
    }
  };

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Key Management */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <KeyManager 
            keys={keys}
            onAdd={addKey}
            onRemove={removeKey}
            onToggle={toggleKey}
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
            <div className="flex-1 overflow-hidden">
                <PromptPlayground onSend={handleSendPrompt} />
            </div>
        </div>
      </div>
    </Shell>
  );
}
