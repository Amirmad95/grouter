import { useState } from 'react';
import { ApiKey } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Eye, EyeOff, Power, List, Settings2, Save, X, Cpu, ShieldAlert, Activity, ChevronDown, ChevronUp } from 'lucide-react';
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
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemma-3-27b', name: 'Gemma 3 27B' },
  { id: 'gemma-3-12b', name: 'Gemma 3 12B' },
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
  const [newModel, setNewModel] = useState('gemini-2.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isListing, setIsListing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<Partial<ApiKey>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAdd = () => {
    if (!newKey) return;
    onAdd(newKey, newLabel || `Node ${keys.length + 1}`, parseInt(newLimit) || 1500, newModel, systemPrompt);
    setNewKey('');
    setNewLabel('');
    setNewLimit('1500');
    setSystemPrompt('');
    setIsAddingNew(false);
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
      className: "bg-[#111] border-primary/20 text-primary"
    });
  };

  return (
    <div className="space-y-6">
      {/* Circuit Breaker Controls */}
      <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Activity className={cn("w-3.5 h-3.5 transition-colors", autoSwitch ? "text-primary" : "text-muted-foreground")} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Circuit_Breaker</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-tighter mt-0.5 opacity-50">Auto_Node_Bypass</span>
          </div>
        </div>
        <Switch 
          checked={autoSwitch} 
          onCheckedChange={onToggleAutoSwitch} 
          className="scale-75 data-[state=checked]:bg-primary"
        />
      </div>

      {/* Node List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {keys.map(key => {
            const usagePercent = (key.usageCount / key.limit) * 100;
            const inCooldown = key.isCooldown;
            const isEditing = editingId === key.id;

            return (
              <motion.div 
                key={key.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative group rounded-xl border transition-all duration-300 overflow-hidden",
                  inCooldown ? "border-destructive/40 bg-destructive/5" : 
                  key.isActive ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-black/40 opacity-50"
                )}
              >
                {isEditing ? (
                  <div className="p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase tracking-widest text-muted-foreground px-1">Label</Label>
                        <Input 
                          value={editConfig.label} 
                          onChange={e => setEditConfig({...editConfig, label: e.target.value})}
                          className="bg-black/40 border-white/10 text-xs h-8 focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase tracking-widest text-muted-foreground px-1">RPM_Limit</Label>
                        <Input 
                          type="number"
                          value={editConfig.limit} 
                          onChange={e => setEditConfig({...editConfig, limit: parseInt(e.target.value) || 0})}
                          className="bg-black/40 border-white/10 text-xs h-8 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-muted-foreground px-1">Model_Arch</Label>
                      <Select value={editConfig.model} onValueChange={v => setEditConfig({...editConfig, model: v})}>
                        <SelectTrigger className="bg-black/40 border-white/10 text-xs h-8 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10">
                          {MODELS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => saveEdit(key.id)} className="flex-1 bg-primary/10 text-primary border border-primary/20 h-8 text-[10px] font-black uppercase hover:bg-primary hover:text-primary-foreground">
                        <Save className="w-3 h-3 mr-1.5" /> Commit
                      </Button>
                      <Button onClick={cancelEditing} variant="ghost" className="flex-1 border border-white/5 h-8 text-[10px] font-black uppercase">
                        Abort
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          inCooldown ? "bg-destructive animate-pulse" : 
                          key.isActive ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-white/20"
                        )} />
                        <div>
                          <h4 className="text-[11px] font-bold tracking-tight text-foreground/90">{key.label}</h4>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <Cpu className="w-2 h-2" /> {key.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground hover:text-primary" onClick={() => startEditing(key)}>
                          <Settings2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => onRemove(key.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-[8px] uppercase tracking-tighter text-muted-foreground/60">
                        <span>Load_Distribution</span>
                        <span>{Math.round(usagePercent)}%</span>
                      </div>
                      <Progress value={usagePercent} className="h-1 bg-white/5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 rounded-lg border border-white/5 px-2 py-1.5 flex items-center justify-between">
                        <code className="text-[9px] font-mono text-muted-foreground/80 truncate pr-2">
                          {showKey[key.id] ? key.key : '••••••••' + key.key.slice(-4)}
                        </code>
                        <button 
                          onClick={() => setShowKey(p => ({...p, [key.id]: !p[key.id]}))}
                          className="text-muted-foreground/40 hover:text-primary transition-colors"
                        >
                          {showKey[key.id] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onToggle(key.id)} 
                        className={cn(
                          "h-7 px-3 text-[9px] font-black uppercase tracking-widest border-white/10",
                          key.isActive ? "bg-primary/5 text-primary border-primary/20" : "opacity-50"
                        )}
                      >
                        {inCooldown ? 'Reset' : key.isActive ? 'Live' : 'Off'}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add New Node Toggle */}
        {!isAddingNew ? (
          <button 
            onClick={() => setIsAddingNew(true)}
            className="w-full py-4 rounded-xl border border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group flex flex-col items-center gap-1"
          >
            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary/60">Initialize_New_Node</span>
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">New_Signal_Channel</span>
              <button onClick={() => setIsAddingNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Node Name" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="bg-black/40 border-white/10 text-xs h-8" />
                <Input placeholder="RPM (1500)" type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="bg-black/40 border-white/10 text-xs h-8" />
              </div>
              <Select value={newModel} onValueChange={setNewModel}>
                <SelectTrigger className="bg-black/40 border-white/10 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {MODELS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input 
                placeholder="GEMINI_API_KEY" 
                value={newKey} 
                onChange={e => setNewKey(e.target.value)} 
                type="password" 
                className="bg-black/40 border-white/10 font-mono text-xs h-8" 
              />
              <Textarea 
                placeholder="System Prompt (Optional)" 
                value={systemPrompt} 
                onChange={e => setSystemPrompt(e.target.value)} 
                className="bg-black/40 border-white/10 text-[10px] min-h-[60px] max-h-[120px]" 
              />
              <Button onClick={handleAdd} disabled={!newKey} className="w-full bg-primary text-primary-foreground text-[10px] font-black uppercase h-9 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                Deploy Node
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
