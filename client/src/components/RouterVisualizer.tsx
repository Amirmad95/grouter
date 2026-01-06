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
  const radius = 100; // Radius of the circle

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px]" />

      {/* Central Router Node */}
      <div className="relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background z-20 relative",
          isProcessing ? "border-primary shadow-[0_0_30px_hsl(var(--primary))]" : "border-muted-foreground/30"
        )}>
          <Activity className={cn("w-8 h-8 transition-colors", isProcessing ? "text-primary animate-pulse" : "text-muted-foreground")} />
        </div>
        
        {/* Pulse rings */}
        {isProcessing && (
          <>
            <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20" />
            <div className="absolute inset-[-10px] rounded-full border border-primary/30 animate-pulse opacity-10" />
          </>
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
            {/* Connection Line */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] pointer-events-none z-[-1]" style={{ transform: `translate(-50%, -50%) rotate(${angle * 57.29}deg)` }}>
              {/* This logic is a bit hacky for absolute positioning lines, but simpler for mockup */}
            </svg>
            
            {/* Connection Line (CSS based for simplicity relative to center) */}
            <div 
                className={cn(
                    "absolute top-1/2 left-1/2 w-[100px] h-[2px] origin-left transition-colors duration-300",
                    isActive ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-muted-foreground/20"
                )}
                style={{
                    transform: `rotate(${angle + Math.PI}rad) translate(0, -50%)`, // Point towards center
                    left: 0,
                    top: 0
                }}
            />

            {/* Node */}
            <div className={cn(
              "w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-300 bg-background",
              isActive 
                ? "border-primary bg-primary/20 text-primary scale-125 shadow-[0_0_15px_hsl(var(--primary))]" 
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {index + 1}
            </div>
            
            {/* Tooltip-ish Label */}
            <div className={cn(
                "absolute top-10 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap px-2 py-0.5 rounded bg-black/80 border transition-colors",
                isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            )}>
                {key.label}
            </div>
          </motion.div>
        );
      })}

      {activeKeys.length === 0 && (
         <div className="absolute bottom-4 text-xs text-destructive font-mono">
            OFFLINE: NO ACTIVE NODES
         </div>
      )}
    </div>
  );
}
