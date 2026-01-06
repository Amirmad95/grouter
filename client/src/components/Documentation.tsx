import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Key, Zap, MessageSquare, ShieldCheck, Cpu } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function Documentation() {
  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 tracking-tight uppercase">
          <BookOpen className="w-6 h-6" />
          System_Documentation
        </h2>
        <p className="text-xs text-muted-foreground font-mono">GEMINI_ROUTER_V1.0_CORE_GUIDE</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border-primary/20 bg-primary/5 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary">
              <Key className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Initialization</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-foreground/80 leading-relaxed font-mono space-y-3 pb-4">
            <p>To begin routing, navigate to the <span className="text-primary">NODE_VAULT</span> and inject at least one Google Gemini API Key.</p>
            <div className="bg-black/40 p-3 rounded border border-white/5 space-y-2">
              <p className="text-primary font-bold">Steps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Acquire API Keys from Google AI Studio.</li>
                <li>Assign a unique label for tracking.</li>
                <li>Set a RPM (Requests Per Minute) limit based on your tier.</li>
                <li>Click "Initialize Node" to sync with the cluster.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-primary/20 bg-primary/5 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary">
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Routing Engine</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-foreground/80 leading-relaxed font-mono space-y-3 pb-4">
            <p>The system uses a <span className="text-primary">Weighted Least-Used Algorithm</span> to distribute traffic.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-primary/20 rounded bg-black/20">
                <p className="text-primary font-bold mb-1">Load Balancing</p>
                <p>Traffic is directed to nodes with the lowest usage percentage to ensure even exhaustion.</p>
              </div>
              <div className="p-3 border border-primary/20 rounded bg-black/20">
                <p className="text-primary font-bold mb-1">Auto-Switching</p>
                <p>When enabled, nodes are deactivated at 90% usage to prevent total tier exhaustion.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-primary/20 bg-primary/5 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Circuit Breaker</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-foreground/80 leading-relaxed font-mono space-y-3 pb-4">
            <p>A built-in safety layer protects the cluster from cascading failures.</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-destructive font-bold">RATE_LIMIT:</span>
                <span>Detection of 429 status codes triggers an immediate 120s cooldown.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">FAULT_LIMIT:</span>
                <span>3 consecutive transmission failures trigger a 60s cooldown.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">AUTO_RESET:</span>
                <span>Nodes automatically heartbeat back into the cluster after cooldown expires.</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border-primary/20 bg-primary/5 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Neural Link</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-foreground/80 leading-relaxed font-mono space-y-3 pb-4">
            <p>The chat interface maintains a context-aware link with the cluster.</p>
            <div className="bg-black/40 p-3 rounded border border-white/5">
              <p className="text-primary font-bold mb-2">Context Optimization:</p>
              <p>Only the last 10 turns are transmitted to Gemini. This optimizes token usage and prevents rate-limiting due to large prompt sizes.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-4 border border-primary/20 rounded bg-primary/5 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
        NOTICE: DATA IS STORED LOCALLY VIA BROWSER_PERSISTENCE (LOCALSTORAGE). CLEARING BROWSER DATA WILL WIPE THE CLUSTER CONFIGURATION.
      </div>
    </div>
  );
}
