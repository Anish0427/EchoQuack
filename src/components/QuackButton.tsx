
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
      // Local feedback sound
      await AudioEngine.playQuack();
      
      // Global trigger (Firestore + API)
      await onTrigger();
      
      toast({
        title: "Broadcast sent!",
        description: "Alerting all network devices...",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the broadcast server.",
      });
    } finally {
      setTimeout(() => setIsQuacking(false), 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="relative">
        {isQuacking && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
        <button
          onClick={handleQuack}
          disabled={disabled}
          className={`
            quack-ripple relative flex items-center justify-center
            w-64 h-64 rounded-full shadow-2xl transition-all duration-300
            ${disabled ? 'bg-muted cursor-not-allowed grayscale' : 'bg-primary hover:bg-primary/90 active:scale-95'}
            group
          `}
        >
          <div className="flex flex-col items-center text-primary-foreground">
            <SendHorizontal className={`w-16 h-16 mb-2 transition-transform duration-500 ${isQuacking ? 'translate-y-[-10px] scale-110' : ''}`} />
            <span className="text-2xl font-bold tracking-widest">QUACK</span>
          </div>
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] opacity-60">
        <Zap className="w-4 h-4 fill-primary" />
        <span>Broadcasting Live</span>
      </div>
    </div>
  );
}
