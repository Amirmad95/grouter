import { useState, useEffect } from 'react';

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  usageCount: number;
  lastUsed?: number;
}

const STORAGE_KEY = 'gemini_router_keys';

export function useGeminiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setKeys(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse keys", e);
      }
    }
  }, []);

  const saveKeys = (newKeys: ApiKey[]) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const addKey = (key: string, label: string) => {
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      key,
      label: label || `Key ${keys.length + 1}`,
      isActive: true,
      usageCount: 0
    };
    saveKeys([...keys, newKey]);
  };

  const removeKey = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
  };

  const toggleKey = (id: string) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const incrementUsage = (id: string) => {
    saveKeys(keys.map(k => {
      if (k.id === id) {
        return { ...k, usageCount: k.usageCount + 1, lastUsed: Date.now() };
      }
      return k;
    }));
  };

  const getNextKey = (): ApiKey | null => {
    const activeKeys = keys.filter(k => k.isActive);
    if (activeKeys.length === 0) return null;
    
    // Simple Round Robin based on usage count (least used first)
    // In a real router, you might want more complex logic (latency based, etc.)
    return activeKeys.sort((a, b) => a.usageCount - b.usageCount)[0];
  };

  return { keys, addKey, removeKey, toggleKey, getNextKey, incrementUsage };
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
