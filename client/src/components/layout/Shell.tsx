import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Activity, ShieldCheck, ChevronRight, Settings, X, MessageSquare, History, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
  settingsContent?: React.ReactNode;
  historyContent?: React.ReactNode;
}

export function Shell({ children, settingsContent, historyContent }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Swipe logic
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX < 50) {
        setTouchStart(e.touches[0].clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart !== null) {
        const touchEnd = e.touches[0].clientX;
        if (touchEnd - touchStart > 70) {
          setIsSidebarOpen(true);
          setTouchStart(null);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchStart]);

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-[#e0e0e0] font-sans selection:bg-primary/30 selection:text-primary overflow-hidden">
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
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-accent border border-white/20 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse-subtle" />
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-30" />
            {children}
          </main>
        </div>
      </div>

      {/* Sidebar Overlay (Unified Chat History + Settings) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[101] w-full max-w-sm bg-[#111] border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Neural_Terminal</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
                {/* Chat History Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <History className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent_Signals</span>
                  </div>
                  <div className="space-y-1">
                    {historyContent}
                  </div>
                </div>

                {/* Settings/Cluster Section */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 px-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cluster_Vault</span>
                  </div>
                  <div className="px-1">
                    {settingsContent}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-foreground">OPERATOR_01</div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest">Status: Synchronized</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
