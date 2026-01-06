import { useEffect, useState } from 'react';
import { ApiKey } from '@/lib/gemini';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface RouterVisualizerProps {
  keys: ApiKey[];
  activeKeyId?: string | null;
  isProcessing: boolean;
}

export function RouterVisualizer({ keys, activeKeyId, isProcessing }: RouterVisualizerProps) {
  const activeKeys = keys.filter(k => k.isActive);
  const radius = 60; // Reduced radius for smaller height

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:15px_15px]" />

      {/* Central Router Node */}
      <div className="relative z-10 scale-75 md:scale-100">
        <div className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background z-20 relative",
          isProcessing ? "border-primary shadow-[0_0_20px_hsl(var(--primary))]" : "border-muted-foreground/30"
        )}>
          <Activity className={cn("w-6 h-6 transition-colors", isProcessing ? "text-primary animate-pulse" : "text-muted-foreground")} />
        </div>
        
        {isProcessing && (
          <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20" />
        )}
      </div>

      {/* Keys Distributed in Circle */}
      {activeKeys.map((key, index) => {
        const angle = (index / activeKeys.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isActive = activeKeyId === key.id;

        return (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10"
            style={{ x, y }}
          >
            {/* Node */}
            <div className={cn(
              "w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-bold transition-all duration-300 bg-background",
              isActive 
                ? "border-primary bg-primary/20 text-primary scale-125 shadow-[0_0_10px_hsl(var(--primary))]" 
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {index + 1}
            </div>
            
            {/* Active Indicator Line */}
            {isActive && (
                <div 
                    className="absolute top-1/2 left-1/2 w-[60px] h-[1px] bg-primary shadow-[0_0_5px_hsl(var(--primary))] origin-left"
                    style={{ transform: `rotate(${angle + Math.PI}rad) translate(0, -50%)`, left: 0, top: 0 }}
                />
            )}
          </motion.div>
        );
      })}

      {activeKeys.length === 0 && (
         <div className="absolute bottom-2 text-[8px] text-destructive font-mono uppercase tracking-widest">
            OFFLINE: NO ACTIVE NODES
         </div>
      )}
    </div>
  );
}
