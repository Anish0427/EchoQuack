
"use client";

import React, { useState, useEffect } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, ShieldCheck, Wifi, WifiOff, Zap, Download, Globe } from "lucide-react";
import { AudioEngine } from "@/app/lib/audio-engine";
import { useFirebaseApp } from "@/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

export default function EchoQuackHome() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [networkLatency, setNetworkLatency] = useState(24);
  
  const app = useFirebaseApp();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window === "undefined" || !app) return;

    const setupBroadcast = async () => {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
        }

        const messaging = getMessaging(app);
        
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          
          if (currentToken) {
            await fetch('/api/quack', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'subscribe', token: currentToken })
            });
          }
        }

        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          AudioEngine.playQuack();
          toast({
            title: "INCOMING SIGNAL",
            description: "A quack has been detected on the secure network.",
          });
        });

        setIsInitialized(true);
        return () => unsubscribeMessaging();
      } catch (err) {
        console.error("Setup error:", err);
        setIsInitialized(true);
      }
    };

    setupBroadcast();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulated latency jitter for aesthetic
    const interval = setInterval(() => {
      setNetworkLatency(Math.floor(20 + Math.random() * 15));
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, [app]);

  const triggerBroadcastQuack = async () => {
    try {
      await fetch('/api/quack', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' })
      });
    } catch (error) {
      console.error("Quack trigger error:", error);
      throw error;
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 bg-background relative overflow-hidden">
      <div className="scanline" />
      
      <header className="w-full max-w-md flex items-center justify-between py-6 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2.5 rounded-2xl border border-primary/30 quack-glow">
            <Bird className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">EchoQuack</h1>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-primary/80">E2E Protocol</p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 backdrop-blur-md ${isOnline ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          <div className="relative flex items-center justify-center">
            {isOnline && <div className="absolute w-2 h-2 rounded-full bg-primary pulse-ring" />}
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary' : 'bg-red-500'}`} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-16 z-10">
        <div className="w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-secondary/50 border border-white/5 rounded-full backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5 text-primary/60" />
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em]">
                Relay: <span className="text-white">{networkLatency}ms</span>
              </p>
            </div>
            <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest">Global Broadcast Range Enabled</p>
          </div>
          
          <QuackButton 
            onTrigger={triggerBroadcastQuack} 
            disabled={!isInitialized || !isOnline} 
          />

          {deferredPrompt && (
            <div className="flex justify-center">
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl hover:bg-white/10 active:scale-95 transition-all group"
              >
                <Download className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Deploy Locally</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full max-w-md py-10 z-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <div className="w-1 h-1 rounded-full bg-primary/40" />
          </div>
          <p className="text-[10px] text-center max-w-[240px] leading-relaxed uppercase font-black tracking-[0.3em] text-muted-foreground/30">
            Encrypted • Anonymous • P2P
          </p>
        </div>
      </footer>
    </main>
  );
}
