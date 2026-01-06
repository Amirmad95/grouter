import { useState, useEffect } from 'react';

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  usageCount: number;
  limit: number;
  lastUsed?: number;
}

const STORAGE_KEY = 'gemini_router_keys';
const AUTO_SWITCH_KEY = 'gemini_router_auto_switch';

export function useGeminiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [autoSwitch, setAutoSwitch] = useState(true);

  useEffect(() => {
    const storedKeys = localStorage.getItem(STORAGE_KEY);
    const storedAuto = localStorage.getItem(AUTO_SWITCH_KEY);
    
    if (storedKeys) {
      try {
        setKeys(JSON.parse(storedKeys));
      } catch (e) {
        console.error("Failed to parse keys", e);
      }
    }
    
    if (storedAuto !== null) {
      setAutoSwitch(storedAuto === 'true');
    }
  }, []);

  const saveKeys = (newKeys: ApiKey[]) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const toggleAutoSwitch = () => {
    const newVal = !autoSwitch;
    setAutoSwitch(newVal);
    localStorage.setItem(AUTO_SWITCH_KEY, String(newVal));
  };

  const addKey = (key: string, label: string, limit: number = 1500) => {
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      key,
      label: label || `Key ${keys.length + 1}`,
      isActive: true,
      usageCount: 0,
      limit: limit || 1500
    };
    saveKeys([...keys, newKey]);
  };

  const removeKey = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
  };

  const toggleKey = (id: string) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const updateLimit = (id: string, limit: number) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, limit } : k));
  };

  const incrementUsage = (id: string) => {
    const newKeys = keys.map(k => {
      if (k.id === id) {
        const newUsage = k.usageCount + 1;
        let isActive = k.isActive;
        
        // Auto-switch logic: if usage reaches 90% and auto-switch is on, deactivate
        if (autoSwitch && newUsage >= k.limit * 0.9) {
          isActive = false;
        }
        
        return { ...k, usageCount: newUsage, lastUsed: Date.now(), isActive };
      }
      return k;
    });
    saveKeys(newKeys);
  };

  const getNextKey = (): ApiKey | null => {
    const activeKeys = keys.filter(k => k.isActive && k.usageCount < k.limit);
    if (activeKeys.length === 0) return null;
    
    // Weighted Round Robin / Least Used
    return activeKeys.sort((a, b) => (a.usageCount / a.limit) - (b.usageCount / b.limit))[0];
  };

  return { 
    keys, 
    autoSwitch, 
    toggleAutoSwitch, 
    addKey, 
    removeKey, 
    toggleKey, 
    updateLimit,
    getNextKey, 
    incrementUsage 
  };
}

export async function sendGeminiPrompt(key: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch from Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}
