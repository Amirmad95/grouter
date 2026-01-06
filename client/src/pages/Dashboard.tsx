import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KeyManager } from '@/components/KeyManager';
import { PromptPlayground } from '@/components/PromptPlayground';
import { useGeminiKeys, sendGeminiPrompt } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Activity, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, subDays, startOfDay } from 'date-fns';

// Verified models for the chat selector
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemma-3-27b', name: 'Gemma 3 27B' },
  { id: 'gemma-3-12b', name: 'Gemma 3 12B' },
  { id: 'gemma-3-4b', name: 'Gemma 3 4B' },
];

export default function Dashboard() {
  const { 
    keys, autoSwitch, chatHistory, toggleAutoSwitch, addKey, 
    removeKey, toggleKey, updateKeyConfig, getNextKey, 
    handleRequestSuccess, handleRequestFailure, addChatMessage, clearChat
  } = useGeminiKeys();
  const { toast } = useToast();
  
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleSendPrompt = async (prompt: string, modelOverride?: string): Promise<string> => {
    const keyToUse = getNextKey();
    if (!keyToUse) {
        toast({ title: "CLUSTER_FAILURE", description: "ALL NODES EXHAUSTED. WAIT FOR CIRCUIT RESET.", variant: "destructive" });
        throw new Error("Cluster offline");
    }

    setIsProcessing(true);
    setActiveKeyId(keyToUse.id);
    addChatMessage('user', prompt);

    const effectiveKey = { ...keyToUse, model: modelOverride || selectedModel };

    try {
        const response = await sendGeminiPrompt(effectiveKey, prompt, chatHistory);
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

  const userMessages = chatHistory.filter(m => m.role === 'user');

  // Cluster history by time periods
  const clusterHistory = () => {
    const groups: { [key: string]: typeof userMessages } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    userMessages.forEach(msg => {
      const date = new Date(msg.timestamp);
      if (isToday(date)) groups['Today'].push(msg);
      else if (isYesterday(date)) groups['Yesterday'].push(msg);
      else if (date > subDays(startOfDay(new Date()), 7)) groups['Previous 7 Days'].push(msg);
      else groups['Older'].push(msg);
    });

    return groups;
  };

  const clusters = clusterHistory();

  const historyContent = (
    <div className="space-y-6">
      {userMessages.length === 0 ? (
        <div className="px-4 py-8 text-center border border-dashed border-white/5 rounded-xl">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50 font-bold">No Signal Logs</p>
        </div>
      ) : (
        Object.entries(clusters).map(([label, messages]) => (
          messages.length > 0 && (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-2 px-2 opacity-40">
                <Calendar className="w-2.5 h-2.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
              </div>
              <div className="space-y-1">
                {messages.map((msg) => (
                  <button 
                    key={msg.id}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-3 h-3 text-primary/40 group-hover:text-primary/70 transition-colors shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="text-[11px] font-medium text-foreground/80 truncate leading-tight">{msg.content}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        ))
      )}
    </div>
  );

  const settingsPanel = (
    <KeyManager 
      keys={keys} 
      autoSwitch={autoSwitch} 
      onToggleAutoSwitch={toggleAutoSwitch} 
      onAdd={addKey} 
      onRemove={removeKey} 
      onToggle={toggleKey} 
      onUpdateConfig={updateKeyConfig} 
    />
  );

  return (
    <Shell settingsContent={settingsPanel} historyContent={historyContent}>
      <div className="h-full flex flex-col relative">
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Minimalist Router Status Bar */}
            <div className="flex-shrink-0 px-4 py-1.5 bg-black/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {keys.length > 0 ? (
                  keys.map(k => (
                    <div key={k.id} className="flex items-center gap-1 flex-shrink-0 group cursor-help" title={`${k.label}: ${k.isActive ? 'Active' : 'Offline'}`}>
                      <div className={cn(
                        "w-0.5 h-3 rounded-full transition-all duration-500",
                        activeKeyId === k.id ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                        k.isCooldown ? "bg-destructive/40" : 
                        k.isActive ? "bg-primary/20 group-hover:bg-primary/40" : "bg-white/5"
                      )} />
                      <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-tighter group-hover:text-muted-foreground transition-colors">{k.label}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[9px] text-muted-foreground/20 uppercase tracking-widest font-black">Cluster_Link_Null</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[8px] font-black text-primary/30 uppercase ml-4 tracking-[0.2em]">
                <Activity className={cn("w-2.5 h-2.5", isProcessing && "animate-pulse text-primary")} />
                <span className={cn("hidden sm:inline", isProcessing && "text-primary")}>
                  {isProcessing ? "Routing..." : "Signal Stable"}
                </span>
              </div>
            </div>
            
            <PromptPlayground 
              onSend={handleSendPrompt} 
              history={chatHistory} 
              onClearHistory={clearChat}
              currentModel={selectedModel}
              onModelChange={handleModelChange}
              availableModels={MODELS}
            />
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}
