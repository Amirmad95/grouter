import { useState } from 'react';
import { ApiKey } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Eye, EyeOff, Power, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyManagerProps {
  keys: ApiKey[];
  onAdd: (key: string, label: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export function KeyManager({ keys, onAdd, onRemove, onToggle }: KeyManagerProps) {
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleAdd = () => {
    if (!newKey) return;
    onAdd(newKey, newLabel);
    setNewKey('');
    setNewLabel('');
  };

  const toggleShow = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-primary/10 pb-4">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Key className="w-4 h-4" />
          KEY_VAULT
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Add Key Form */}
        <div className="grid gap-2 p-4 border border-dashed border-primary/20 rounded-md bg-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input 
              placeholder="Label (e.g. 'Project Alpha')" 
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="bg-background/50 border-primary/20 focus-visible:ring-primary"
            />
            <Input 
              placeholder="Gemini API Key (AIza...)" 
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              type="password"
              className="md:col-span-2 bg-background/50 border-primary/20 focus-visible:ring-primary font-mono text-xs"
            />
          </div>
          <Button 
            onClick={handleAdd}
            disabled={!newKey}
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 transition-all uppercase tracking-wider text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Inject Key
          </Button>
        </div>

        {/* Key List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <AnimatePresence>
            {keys.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8 text-sm italic"
              >
                No keys detected in vault.
              </motion.div>
            )}
            {keys.map(key => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "group relative p-3 border rounded-md transition-all duration-300",
                  key.isActive 
                    ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
                    : "border-muted bg-muted/20 opacity-60 grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", key.isActive ? "bg-primary animate-pulse" : "bg-muted-foreground")} />
                    <span className="font-bold text-sm text-foreground">{key.label}</span>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary font-mono text-[10px]">
                    USED: {key.usageCount}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 bg-black/50 p-1.5 rounded text-[10px] font-mono text-muted-foreground truncate border border-white/5">
                    {showKey[key.id] ? key.key : '•••• •••• •••• •••• ' + key.key.slice(-4)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={() => toggleShow(key.id)}
                  >
                    {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onToggle(key.id)}
                    className={cn(
                      "flex-1 h-7 text-xs border-primary/20 hover:bg-primary/10 hover:text-primary",
                      !key.isActive && "hover:bg-primary/20"
                    )}
                  >
                    <Power className="w-3 h-3 mr-1.5" />
                    {key.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white"
                    onClick={() => onRemove(key.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
