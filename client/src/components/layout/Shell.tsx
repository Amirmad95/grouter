import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Terminal, Activity, ShieldCheck, ChevronRight, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
  settingsContent?: React.ReactNode;
}

export function Shell({ children, settingsContent }: ShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-[#e0e0e0] font-sans selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-black/0 to-black/20">
          <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="font-bold tracking-tight text-base">Gemini<span className="text-primary">Router</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span>Cluster Active</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-20" />
              <span className="text-foreground/40 font-mono">v2.5.0-flash</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-accent border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse-subtle" />
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-30" />
            {children}
          </main>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-2 right-2 bottom-2 z-[101] w-full max-w-lg bg-[#111]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            >
              <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Cluster_Management</span>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {settingsContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
