import { useState } from 'react';
import { ApiKey } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Eye, EyeOff, Power, Key, Zap, ShieldCheck, Cpu, MessageSquareText, List, Settings2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface KeyManagerProps {
  keys: ApiKey[];
  autoSwitch: boolean;
  onToggleAutoSwitch: () => void;
  onAdd: (key: string, label: string, limit: number, model: string, systemPrompt?: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdateConfig: (id: string, updates: Partial<ApiKey>) => void;
}

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-flash-native-audio-dialog', name: 'Gemini 2.5 Flash Native Audio' },
  { id: 'gemini-2.5-flash-tts', name: 'Gemini 2.5 Flash TTS' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemini-embedding-1.0', name: 'Gemini Embedding 1.0' },
  { id: 'gemini-robotics-er-1.5-preview', name: 'Gemini Robotics 1.5' },
  { id: 'gemma-3-12b', name: 'Gemma 3 12B' },
  { id: 'gemma-3-1b', name: 'Gemma 3 1B' },
  { id: 'gemma-3-27b', name: 'Gemma 3 27B' },
  { id: 'gemma-3-2b', name: 'Gemma 3 2B' },
  { id: 'gemma-3-4b', name: 'Gemma 3 4B' },
];

export function KeyManager({ 
  keys, 
  autoSwitch, 
  onToggleAutoSwitch, 
  onAdd, 
  onRemove, 
  onToggle,
  onUpdateConfig
}: KeyManagerProps) {
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLimit, setNewLimit] = useState('1500');
  const [newModel, setNewModel] = useState('gemini-1.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isListing, setIsListing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<Partial<ApiKey>>({});

  const handleAdd = () => {
    if (!newKey) return;
    onAdd(newKey, newLabel, parseInt(newLimit) || 1500, newModel, systemPrompt);
    setNewKey('');
    setNewLabel('');
    setNewLimit('1500');
    setSystemPrompt('');
  };

  const startEditing = (key: ApiKey) => {
    setEditingId(key.id);
    setEditConfig({
      label: key.label,
      limit: key.limit,
      model: key.model,
      systemPrompt: key.systemPrompt || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditConfig({});
  };

  const saveEdit = (id: string) => {
    onUpdateConfig(id, editConfig);
    setEditingId(null);
    setEditConfig({});
    toast({
      title: "NODE_UPDATED",
      description: "Configuration changes synced successfully.",
      className: "border-primary text-primary"
    });
  };

  const handleListModels = async (manualKey?: string) => {
    const keyToUse = manualKey || newKey || keys.find(k => k.isActive)?.key;
    if (!keyToUse) {
      toast({
        title: "AUTH_REQUIRED",
        description: "Please enter an API key to list available models.",
        variant: "destructive"
      });
      return;
    }

    setIsListing(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
      const data = await response.json();
      
      if (data.models) {
        console.log("Available Models:", data.models);
        const modelNames = data.models.map((m: any) => m.name.replace('models/', '')).join(', ');
        toast({
          title: "MODELS_DISCOVERED",
          description: `Supported: ${modelNames}`,
          className: "border-primary text-primary"
        });
      } else {
        throw new Error(data.error?.message || "No models found");
      }
    } catch (error: any) {
      toast({
        title: "DISCOVERY_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsListing(false);
    }
  };

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-primary/10 pb-4 space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <ShieldCheck className="w-4 h-4" />
            SECURE_ROUTER
          </CardTitle>
          <div className="flex items-center space-x-2 bg-primary/5 px-2 py-1 rounded border border-primary/10">
            <Zap className={cn("w-3 h-3 transition-colors", autoSwitch ? "text-primary" : "text-muted-foreground")} />
            <Label htmlFor="auto-switch" className="text-[10px] uppercase font-bold tracking-widest cursor-pointer">CIRCUIT_BREAKER</Label>
            <Switch id="auto-switch" checked={autoSwitch} onCheckedChange={onToggleAutoSwitch} className="scale-75 data-[state=checked]:bg-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent flex flex-col gap-4">
        {/* Add Key Form */}
        <div className="grid gap-3 p-4 border border-dashed border-primary/20 rounded-md bg-primary/5 flex-shrink-0">
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Node Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="bg-background/50 border-primary/20 text-xs h-8" />
              <Input placeholder="RPM Limit" value={newLimit} type="number" onChange={e => setNewLimit(e.target.value)} className="bg-background/50 border-primary/20 text-xs h-8" />
            </div>
            
            <div className="flex gap-2">
              <Select value={newModel} onValueChange={setNewModel}>
                <SelectTrigger className="flex-1 bg-background/50 border-primary/20 text-xs h-8">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 border-primary/20">
                  {MODELS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleListModels()}
                disabled={isListing}
                className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/10"
                title="Discover Available Models"
              >
                <List className={cn("w-4 h-4", isListing && "animate-spin")} />
              </Button>
            </div>

            <Textarea placeholder="System Instruction (Optional)" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="bg-background/50 border-primary/20 text-[10px] min-h-[40px] max-h-[80px]" />
            <Input placeholder="GEMINI_API_KEY" value={newKey} onChange={e => setNewKey(e.target.value)} type="password" className="bg-background/50 border-primary/20 font-mono text-xs h-8" />
          </div>
          <Button onClick={handleAdd} disabled={!newKey} className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 text-xs font-bold h-8 uppercase">
            Initialize Node
          </Button>
        </div>

        <div className="space-y-3 pb-4">
          <AnimatePresence>
            {keys.map(key => {
              const usagePercent = (key.usageCount / key.limit) * 100;
              const inCooldown = key.isCooldown;
              const isEditing = editingId === key.id;

              return (
                <motion.div key={key.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={cn("group p-3 border rounded-md transition-all duration-300", 
                  inCooldown ? "border-destructive/40 bg-destructive/5" : key.isActive ? "border-primary/30 bg-primary/5" : "border-muted bg-muted/20 opacity-60")}>
                  
                  {isEditing ? (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="Label" 
                          value={editConfig.label} 
                          onChange={e => setEditConfig({...editConfig, label: e.target.value})}
                          className="bg-background/50 border-primary/30 text-xs h-7"
                        />
                        <Input 
                          placeholder="Limit" 
                          type="number"
                          value={editConfig.limit} 
                          onChange={e => setEditConfig({...editConfig, limit: parseInt(e.target.value) || 0})}
                          className="bg-background/50 border-primary/30 text-xs h-7"
                        />
                      </div>
                      <Select 
                        value={editConfig.model} 
                        onValueChange={v => setEditConfig({...editConfig, model: v})}
                      >
                        <SelectTrigger className="bg-background/50 border-primary/30 text-xs h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 border-primary/20">
                          {MODELS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Textarea 
                        placeholder="System Prompt" 
                        value={editConfig.systemPrompt}
                        onChange={e => setEditConfig({...editConfig, systemPrompt: e.target.value})}
                        className="bg-background/50 border-primary/30 text-[10px] min-h-[40px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => saveEdit(key.id)}
                          className="flex-1 bg-primary/20 text-primary border border-primary/50 h-7 text-[10px] font-bold uppercase"
                        >
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                        <Button 
                          onClick={cancelEditing}
                          variant="ghost"
                          className="flex-1 border border-white/5 h-7 text-[10px] font-bold uppercase"
                        >
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", inCooldown ? "bg-destructive animate-pulse" : key.isActive ? "bg-primary animate-pulse" : "bg-muted-foreground")} />
                          <span className="font-bold text-xs uppercase tracking-tight">{key.label}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[8px] h-3 px-1 border-primary/20 text-primary">{key.model}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2 opacity-50">
                        <div className="flex items-center gap-1 text-[8px] uppercase"><Cpu className="w-2 h-2" />{key.model}</div>
                        {key.systemPrompt && <div className="flex items-center gap-1 text-[8px] uppercase"><MessageSquareText className="w-2 h-2" />SYS_SET</div>}
                      </div>

                      <Progress value={usagePercent} className="h-1 bg-white/5 mb-3" />

                      <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 bg-black/50 p-1.5 rounded text-[10px] font-mono text-muted-foreground truncate border border-white/5">
                          {showKey[key.id] ? key.key : '•••• •••• ' + key.key.slice(-4)}
                        </code>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => setShowKey(p => ({...p, [key.id]: !p[key.id]}))}>
                            {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => startEditing(key)}>
                            <Settings2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onToggle(key.id)} className="flex-1 h-7 text-[10px] font-bold border-primary/20">
                          <Power className="w-3 h-3 mr-1.5" />{inCooldown ? 'RESET' : key.isActive ? 'OFFLINE' : 'ONLINE'}
                        </Button>
                        <Button variant="destructive" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(key.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
