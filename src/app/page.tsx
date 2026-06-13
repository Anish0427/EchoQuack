
"use client";

import React, { useState, useEffect } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, ShieldCheck, Wifi, WifiOff, Zap, Download } from "lucide-react";
import { AudioEngine } from "@/app/lib/audio-engine";
import { useFirebaseApp } from "@/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

export default function EchoQuackHome() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  
  const app = useFirebaseApp();

  useEffect(() => {
    // Local ephemeral ID for this session
    let id = localStorage.getItem("echoquack_device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("echoquack_device_id", id);
    }
    setDeviceId(id);

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
            // Register this token for the broadcast topic (No DB storage)
            await fetch('/api/quack', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'subscribe', token: currentToken })
            });
          }
        }

        // Foreground listener (Direct FCM receipt)
        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          console.log("FCM Foreground received", payload);
          AudioEngine.playQuack();
          toast({
            title: "QUACK!",
            description: "New signal received!",
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
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [app]);

  const triggerBroadcastQuack = async () => {
    try {
      // Trigger Topic Broadcast
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
    <main className="min-h-screen flex flex-col items-center justify-between p-6 bg-background">
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <Bird className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">EchoQuack</h1>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Private Loop</p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold uppercase">{isOnline ? 'Active' : 'Offline'}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12">
        <div className="w-full space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-secondary-foreground text-xs font-semibold">
                Cloud Broadcast Ready
              </p>
            </div>
          </div>
          
          <QuackButton 
            onTrigger={triggerBroadcastQuack} 
            disabled={!isInitialized || !isOnline} 
          />

          {deferredPrompt && (
            <div className="flex justify-center">
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-2xl shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Install App</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full max-w-md py-8">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-center">Topic Protocol v3.0</p>
          <p className="text-[9px] text-center max-w-[220px] leading-relaxed">
            No logs. No database. Just pure, instant connection.
          </p>
        </div>
      </footer>
    </main>
  );
}
