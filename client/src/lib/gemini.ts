import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  usageCount: number;
  limit: number;
  lastUsed?: number;
  isCooldown?: boolean;
  cooldownUntil?: number;
  consecutiveErrors: number;
  model: string;
  systemPrompt?: string;
}

const STORAGE_KEY = 'gemini_router_keys_v5';
const AUTO_SWITCH_KEY = 'gemini_router_auto_switch_v5';
const CHAT_HISTORY_KEY = 'gemini_router_chat_history_v5';
const JITTER_MAX = 5000; // 5 seconds max jitter

const MAX_CONSECUTIVE_ERRORS = 3;
const COOLDOWN_DURATION = 60000;

export function useGeminiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const storedKeys = localStorage.getItem(STORAGE_KEY);
    const storedAuto = localStorage.getItem(AUTO_SWITCH_KEY);
    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    
    if (storedKeys) {
      try {
        const parsedKeys: ApiKey[] = JSON.parse(storedKeys);
        const now = Date.now();
        setKeys(parsedKeys.map(k => ({
          ...k,
          isCooldown: k.cooldownUntil ? k.cooldownUntil > now : false,
          model: k.model || 'gemini-2.5-flash',
          consecutiveErrors: k.consecutiveErrors || 0
        })));
      } catch (e) {
        console.error("Failed to parse keys", e);
      }
    }
    
    if (storedAuto !== null) {
      setAutoSwitch(storedAuto === 'true');
    }

    if (storedHistory) {
      try {
        setChatHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setKeys(prev => {
        let changed = false;
        const next = prev.map(k => {
          if (k.isCooldown && k.cooldownUntil && k.cooldownUntil <= now) {
            changed = true;
            return { ...k, isCooldown: false, cooldownUntil: undefined, consecutiveErrors: 0 };
          }
          return k;
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveKeys = (newKeys: ApiKey[]) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const saveChatHistory = (history: ChatMessage[]) => {
    setChatHistory(history);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  };

  const toggleAutoSwitch = () => {
    const newVal = !autoSwitch;
    setAutoSwitch(newVal);
    localStorage.setItem(AUTO_SWITCH_KEY, String(newVal));
  };

  const addKey = (key: string, label: string, limit: number = 1500, model: string = 'gemini-2.5-flash', systemPrompt?: string) => {
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      key,
      label: label || `Key ${keys.length + 1}`,
      isActive: true,
      usageCount: 0,
      limit: limit || 1500,
      consecutiveErrors: 0,
      model,
      systemPrompt
    };
    saveKeys([...keys, newKey]);
  };

  const removeKey = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
  };

  const toggleKey = (id: string) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, isActive: !k.isActive, consecutiveErrors: 0, isCooldown: false } : k));
  };

  const updateKeyConfig = (id: string, updates: Partial<ApiKey>) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const handleRequestSuccess = (id: string) => {
    const newKeys = keys.map(k => {
      if (k.id === id) {
        const newUsage = k.usageCount + 1;
        let isActive = k.isActive;
        if (autoSwitch && newUsage >= k.limit * 0.9) {
          isActive = false;
        }
        return { ...k, usageCount: newUsage, lastUsed: Date.now(), isActive, consecutiveErrors: 0 };
      }
      return k;
    });
    saveKeys(newKeys);
  };

  const handleRequestFailure = (id: string, isRateLimit: boolean) => {
    const newKeys = keys.map(k => {
      if (k.id === id) {
        const errors = k.consecutiveErrors + 1;
        const shouldCooldown = isRateLimit || errors >= MAX_CONSECUTIVE_ERRORS;
        if (shouldCooldown) {
          return {
            ...k,
            consecutiveErrors: errors,
            isCooldown: true,
            cooldownUntil: Date.now() + (isRateLimit ? COOLDOWN_DURATION * 5 : COOLDOWN_DURATION) // Exponential backoff for rate limits
          };
        }
        return { ...k, consecutiveErrors: errors };
      }
      return k;
    });
    saveKeys(newKeys);
  };

  const addChatMessage = (role: 'user' | 'model', content: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: Date.now()
    };
    saveChatHistory([...chatHistory, newMessage]);
  };

  const clearChat = () => {
    saveChatHistory([]);
  };

  const getNextKey = (): ApiKey | null => {
    const now = Date.now();
    const availableKeys = keys.filter(k => 
      k.isActive && 
      k.usageCount < k.limit && 
      (!k.isCooldown || (k.cooldownUntil && k.cooldownUntil <= now))
    );
    if (availableKeys.length === 0) return null;
    
    // Sort by usage percentage + add small randomization for load balancing
    return availableKeys.sort((a, b) => {
      const usageA = (a.usageCount / a.limit) + (Math.random() * 0.05);
      const usageB = (b.usageCount / b.limit) + (Math.random() * 0.05);
      return usageA - usageB;
    })[0];
  };

  return { 
    keys, 
    autoSwitch, 
    chatHistory,
    toggleAutoSwitch, 
    addKey, 
    removeKey, 
    toggleKey, 
    updateKeyConfig,
    getNextKey, 
    handleRequestSuccess,
    handleRequestFailure,
    addChatMessage,
    clearChat
  };
}

export async function sendGeminiPrompt(key: ApiKey, prompt: string, history: ChatMessage[] = []) {
  // Anti-fingerprinting: Add random jitter to request timing
  const jitter = Math.random() * JITTER_MAX;
  await new Promise(resolve => setTimeout(resolve, jitter));

  // The error "models/gemini-1.5-flash is not found for API version v1beta"
  // suggests that either the model name is incorrect for v1beta or needs a different path.
  // We'll try using the standard v1beta path which often expects just the model name if not using full path.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${key.model}:generateContent?key=${key.key}`;
  
  const contents = history.slice(-8).map(msg => ({ 
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  if (key.systemPrompt) {
    contents.unshift({
      role: 'user',
      parts: [{ text: `System Instruction: ${key.systemPrompt}` }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error Data:", errorData);
    const message = errorData.error?.message || 'Failed to fetch from Gemini';
    const isRateLimit = response.status === 429;
    throw { message, isRateLimit };
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}
