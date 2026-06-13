
"use client";

import React, { useState } from "react";
import { AudioEngine } from "@/app/lib/audio-engine";
import { SendHorizontal, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuackButtonProps {
  onTrigger: () => Promise<void>;
  disabled?: boolean;
}

export function QuackButton({ onTrigger, disabled }: QuackButtonProps) {
  const [isQuacking, setIsQuacking] = useState(false);

  const handleQuack = async () => {
    if (disabled || isQuacking) return;
    
    setIsQuacking(true);
    try {
      await AudioEngine.playQuack();
      await onTrigger();
      
      toast({
        title: "SIGNAL TRANSMITTED",
        description: "Your quack is traversing the global relay...",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "LINK FAILURE",
        description: "The secure relay could not be reached.",
      });
    } finally {
      setTimeout(() => setIsQuacking(false), 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-10">
      <div className="relative group">
        {/* Exterior Glow Rings */}
        <div className={`absolute inset-[-40px] rounded-full border border-primary/20 transition-all duration-1000 ${isQuacking ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute inset-[-20px] rounded-full border border-primary/10 transition-all duration-700 delay-100 ${isQuacking ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`} />
        
        {isQuacking && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        )}
        
        <button
          onClick={handleQuack}
          disabled={disabled}
          className={`
            quack-ripple quack-glow relative flex items-center justify-center
            w-64 h-64 rounded-full transition-all duration-500
            ${disabled ? 'bg-white/5 cursor-not-allowed border border-white/5' : 'bg-primary border-4 border-white/20 hover:scale-[1.02] active:scale-95'}
          `}
        >
          <div className="flex flex-col items-center text-primary-foreground">
            <SendHorizontal className={`w-16 h-16 mb-2 transition-all duration-500 ${isQuacking ? 'translate-y-[-10px] scale-125 brightness-150' : 'group-hover:translate-x-1'}`} />
            <span className="text-3xl font-black tracking-[0.2em] italic uppercase">Quack</span>
          </div>
        </button>
      </div>
      
      <div className="flex items-center gap-3 text-primary/40 font-black text-[10px] uppercase tracking-[0.4em]">
        <Zap className={`w-3.5 h-3.5 ${isQuacking ? 'animate-pulse text-primary' : ''}`} />
        <span>Secure Broadcast</span>
      </div>
    </div>
  );
}
