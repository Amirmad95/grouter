import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Terminal, Activity, ShieldCheck, ChevronRight, Settings } from 'lucide-react';

export function Shell({ children }: { children: React.ReactNode }) {
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
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-lg">Gemini<span className="text-primary">Router</span></span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Systems</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Neural_Link</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Node_Vault</span>
            </button>
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase">
                <span>Cluster Health</span>
                <span className="text-primary">Stable</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-black/0 to-black/20">
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 md:bg-transparent bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-2 md:hidden">
              <Terminal className="w-5 h-5 text-primary" />
              <span className="font-bold tracking-tight">GeminiRouter</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Router Active</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-20" />
              <span className="text-foreground/60">v2.5.0-flash</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
