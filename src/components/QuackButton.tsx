
"use client";

import React, { useState, useEffect } from "react";
import { AudioEngine } from "@/app/lib/audio-engine";
import { Button } from "@/components/ui/button";
import { Mic, SendHorizontal, Zap } from "lucide-react";
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
      // Local feedback
      await AudioEngine.playQuack();
      
      // Remote trigger
      await onTrigger();
      
      toast({
        title: "Quack sent!",
        description: "Your partner should hear it shortly.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Quack failed",
        description: "Make sure you're paired with your partner.",
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
            <span className="text-xl font-semibold tracking-wider">QUACK</span>
          </div>
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground/60 text-sm font-medium">
        <Zap className="w-4 h-4" />
        <span>DIRECT FCM LINK</span>
      </div>
    </div>
  );
}
