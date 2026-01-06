import React from 'react';
import background from '@assets/generated_images/abstract_cyberpunk_network_data_flow_background.png';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-x-hidden font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center border-b border-primary/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary uppercase">
              Gemini<span className="text-foreground">Router</span>_v1.0
            </h1>
          </div>
          <div className="text-xs text-muted-foreground hidden md:block">
            SYSTEM_STATUS: <span className="text-primary">ONLINE</span>
          </div>
        </header>
        
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
