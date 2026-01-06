import { useState } from 'react';
import { ApiKey } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Eye, EyeOff, Power, Key, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface KeyManagerProps {
  keys: ApiKey[];
  autoSwitch: boolean;
  onToggleAutoSwitch: () => void;
  onAdd: (key: string, label: string, limit: number) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdateLimit: (id: string, limit: number) => void;
}

export function KeyManager({ 
  keys, 
  autoSwitch, 
  onToggleAutoSwitch, 
  onAdd, 
  onRemove, 
  onToggle
}: KeyManagerProps) {
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLimit, setNewLimit] = useState('1500');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleAdd = () => {
    if (!newKey) return;
    onAdd(newKey, newLabel, parseInt(newLimit) || 1500);
    setNewKey('');
    setNewLabel('');
    setNewLimit('1500');
  };

  const toggleShow = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-primary/10 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <ShieldCheck className="w-4 h-4" />
            SECURE_ROUTER
          </CardTitle>
          <div className="flex items-center space-x-2 bg-primary/5 px-2 py-1 rounded border border-primary/10">
            <Zap className={cn("w-3 h-3 transition-colors", autoSwitch ? "text-primary" : "text-muted-foreground")} />
            <Label htmlFor="auto-switch" className="text-[10px] uppercase font-bold tracking-widest cursor-pointer">CIRCUIT_BREAKER</Label>
            <Switch 
              id="auto-switch" 
              checked={autoSwitch} 
              onCheckedChange={onToggleAutoSwitch}
              className="scale-75 data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Add Key Form */}
        <div className="grid gap-3 p-4 border border-dashed border-primary/20 rounded-md bg-primary/5">
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Input 
                placeholder="Label" 
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary text-xs h-8"
              />
              <Input 
                placeholder="RPM Limit" 
                value={newLimit}
                type="number"
                onChange={e => setNewLimit(e.target.value)}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary text-xs h-8"
              />
            </div>
            <Input 
              placeholder="GEMINI_API_KEY" 
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              type="password"
              className="bg-background/50 border-primary/20 focus-visible:ring-primary font-mono text-xs h-8"
            />
          </div>
          <Button 
            onClick={handleAdd}
            disabled={!newKey}
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 transition-all uppercase tracking-wider text-xs font-bold h-8"
          >
            <Plus className="w-3 h-3 mr-2" />
            Sync New Node
          </Button>
        </div>

        {/* Key List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <AnimatePresence>
            {keys.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8 text-xs italic"
              >
                NO ACTIVE NODES IN CLUSTER
              </motion.div>
            )}
            {keys.map(key => {
              const usagePercent = (key.usageCount / key.limit) * 100;
              const isCritical = usagePercent >= 90;
              const inCooldown = key.isCooldown;
              
              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "group relative p-3 border rounded-md transition-all duration-300",
                    inCooldown ? "border-destructive/40 bg-destructive/5" :
                    key.isActive ? "border-primary/30 bg-primary/5" : "border-muted bg-muted/20 opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full", 
                        inCooldown ? "bg-destructive animate-pulse" :
                        key.isActive ? (isCritical ? "bg-orange-500 animate-pulse" : "bg-primary animate-pulse") : "bg-muted-foreground"
                      )} />
                      <span className="font-bold text-xs uppercase tracking-tight">
                        {key.label}
                        {inCooldown && <span className="ml-2 text-destructive text-[8px]">[COOLDOWN]</span>}
                      </span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "font-mono text-[9px] h-4 px-1",
                      inCooldown ? "border-destructive/50 text-destructive" :
                      isCritical ? "border-orange-500/50 text-orange-500" : "border-primary/20 text-primary"
                    )}>
                      {key.usageCount}/{key.limit}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <Progress 
                      value={usagePercent} 
                      className="h-1 bg-white/5" 
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 bg-black/50 p-1.5 rounded text-[10px] font-mono text-muted-foreground truncate border border-white/5">
                      {showKey[key.id] ? key.key : '•••• •••• ' + key.key.slice(-4)}
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
                        "flex-1 h-7 text-[10px] font-bold border-primary/20 hover:bg-primary/10 hover:text-primary",
                        inCooldown ? "text-destructive border-destructive/20 hover:bg-destructive/10" :
                        !key.isActive && "hover:bg-primary/20"
                      )}
                    >
                      <Power className="w-3 h-3 mr-1.5" />
                      {inCooldown ? 'RESET_NODE' : key.isActive ? 'OFFLINE' : 'ONLINE'}
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
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
