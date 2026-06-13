
"use client";

import React, { useState, useEffect, useRef } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, ShieldCheck, Wifi, WifiOff, Zap, Download, Clock } from "lucide-react";
import { AudioEngine } from "@/app/lib/audio-engine";
import { useFirebaseApp, useFirestore } from "@/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function EchoQuackHome() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [lastQuackTime, setLastQuackTime] = useState<Date | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const lastQuackRef = useRef<number | null>(null);
  
  const app = useFirebaseApp();
  const db = useFirestore();

  useEffect(() => {
    // Generate or retrieve a persistent device ID
    let id = localStorage.getItem("echoquack_device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("echoquack_device_id", id);
    }
    setDeviceId(id);

    // Handle PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window === "undefined" || !app || !db) return;

    const setupBroadcast = async () => {
      try {
        // Register Service Worker for FCM
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
        }

        const messaging = getMessaging(app);
        
        // Request Permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          
          if (currentToken) {
            const shortId = btoa(currentToken).substring(0, 32).replace(/[/+=]/g, '');
            const tokenRef = doc(db, "tokens", shortId);
            await setDoc(tokenRef, {
              token: currentToken,
              updatedAt: serverTimestamp(),
              deviceId: id,
            }, { merge: true });
          }
        }

        // Foreground FCM Listener
        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          // Only play if not currently in foreground (FCM usually handles background)
          // But on some browsers it might hit both. We rely on Firestore sync for foreground.
          console.log("FCM Payload received", payload);
        });

        // Real-time Firestore Sync (Primary foreground response)
        const quacksRef = collection(db, "quacks");
        const q = query(quacksRef, orderBy("timestamp", "desc"), limit(1));
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const time = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now();
            
            setLastQuackTime(new Date(time));

            // Logic: Play sound if it's a NEW quack and NOT from this device
            if (lastQuackRef.current && time > lastQuackRef.current) {
              if (data.senderId !== id) {
                AudioEngine.playQuack();
                toast({
                  title: "QUACK!",
                  description: "New signal from your partner!",
                });
              }
            }
            lastQuackRef.current = time;
          } else {
            lastQuackRef.current = Date.now();
          }
        });

        setIsInitialized(true);
        return () => {
          unsubscribeMessaging();
          unsubscribeFirestore();
        };
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
  }, [app, db]);

  const triggerBroadcastQuack = async () => {
    if (!db) return;
    try {
      // 1. Log to Firestore (triggers immediate sync for open apps)
      await addDoc(collection(db, "quacks"), {
        timestamp: serverTimestamp(),
        senderId: deviceId,
      });

      // 2. Trigger FCM (triggers background notification for closed apps)
      fetch('/api/quack', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: deviceId })
      }).catch(e => console.error("FCM trigger failed", e));

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
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Connected Loop</p>
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
                Network Broadcast Ready
              </p>
            </div>
            
            {lastQuackTime && (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Last quack: {formatDistanceToNow(lastQuackTime)} ago</span>
              </div>
            )}
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
          <p className="text-[10px] font-bold uppercase tracking-wider text-center">Sync Protocol v2.6</p>
          <p className="text-[9px] text-center max-w-[220px] leading-relaxed">
            Notifications work anywhere. iPhone users: Add to Home Screen for background alerts.
          </p>
        </div>
      </footer>
    </main>
  );
}
