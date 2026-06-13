
"use client";

import React, { useState, useEffect, useRef } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, Globe, Wifi, WifiOff, AlertTriangle } from "lucide-react";
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
  addDoc
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function EchoQuackHome() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const lastQuackRef = useRef<number | null>(null);
  
  const app = useFirebaseApp();
  const db = useFirestore();

  useEffect(() => {
    if (typeof window === "undefined" || !app || !db) return;

    const setupBroadcast = async () => {
      try {
        const messaging = getMessaging(app);
        
        // 1. Register Static Service Worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }

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
            }, { merge: true });
          }
        }

        // 2. Listen for foreground messages
        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          AudioEngine.playQuack();
          toast({
            title: "QUACK!",
            description: payload.notification?.body || "Signal received!",
          });
        });

        // 3. Firestore Real-time Sync (Primary for Static Hosting)
        const quacksRef = collection(db, "quacks");
        const q = query(quacksRef, orderBy("timestamp", "desc"), limit(1));
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const time = data.timestamp?.toMillis() || Date.now();
            
            if (lastQuackRef.current && time > lastQuackRef.current) {
              AudioEngine.playQuack();
              toast({
                title: "QUACK!",
                description: "Sync signal received!",
              });
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
    };
  }, [app, db]);

  const triggerBroadcastQuack = async () => {
    if (!db) return;

    try {
      // Real-time sync via Firestore (Works on static hosting)
      await addDoc(collection(db, "quacks"), {
        timestamp: serverTimestamp(),
        senderId: "static-client",
      });

      // Note: Background FCM broadcast is disabled on static hosting 
      // as it requires a server-side API.
    } catch (error) {
      console.error("Quack trigger error:", error);
      throw error;
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
              <Globe className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Static Sync Mode</p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12">
        <div className="w-full space-y-10">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Static Mode Note</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Background notifications are disabled on static hosting. Keep the app open to receive signals.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-secondary-foreground text-xs font-semibold">
                Direct Cloud Sync
              </p>
            </div>
          </div>
          
          <QuackButton 
            onTrigger={triggerBroadcastQuack} 
            disabled={!isInitialized || !isOnline} 
          />

          <div className="flex justify-center">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 px-6 py-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Static Protocol V1.0</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full max-w-md py-8">
        <div className="flex items-center justify-center gap-4 text-muted-foreground/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Open App = Active Connection</span>
        </div>
      </footer>
    </main>
  );
}
