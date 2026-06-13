
"use client";

import React, { useState, useEffect, useRef } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, Info, Globe, ShieldCheck, Wifi, WifiOff } from "lucide-react";
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
        
        // 1. Register Service Worker for background FCM
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }

        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          
          if (currentToken) {
            // Store token in global pool with a unique key based on the token itself
            const shortId = btoa(currentToken).substring(0, 32).replace(/[/+=]/g, '');
            const tokenRef = doc(db, "tokens", shortId);
            await setDoc(tokenRef, {
              token: currentToken,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        }

        // 2. Listen for foreground FCM messages
        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          AudioEngine.playQuack();
          toast({
            title: "QUACK!",
            description: payload.notification?.body || "Broadcast received!",
          });
        });

        // 3. Listen for Firestore "Quack" events (Real-time Broadcast)
        const quacksRef = collection(db, "quacks");
        const q = query(quacksRef, orderBy("timestamp", "desc"), limit(1));
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const time = data.timestamp?.toMillis() || Date.now();
            
            // Only play if it's a new event (not historical load)
            if (lastQuackRef.current && time > lastQuackRef.current) {
              AudioEngine.playQuack();
              toast({
                title: "QUACK!",
                description: "Broadcast received via Cloud Sync",
              });
            }
            lastQuackRef.current = time;
          } else {
            // If empty, initialize the ref to current time so old quacks don't trigger
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
      // 1. Local real-time sync (write to Firestore)
      // This is the fastest way to alert other open apps
      await addDoc(collection(db, "quacks"), {
        timestamp: serverTimestamp(),
        senderId: "web-client",
      });

      // 2. Background broadcast (call API to send FCM to all registered tokens)
      // This reaches apps that are currently closed or in the background
      fetch('/api/quack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => console.error("FCM broadcast failed", err));

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
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Broadcast Mode</p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12">
        <div className="w-full space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-secondary-foreground text-xs font-semibold">
                Network Sync Active
              </p>
            </div>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
              Tapping the button alerts every device in the loop, anywhere in the world.
            </p>
          </div>
          
          <QuackButton 
            onTrigger={triggerBroadcastQuack} 
            disabled={!isInitialized || !isOnline} 
          />

          <div className="flex justify-center">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 px-6 py-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Global Broadcast Protocol V1</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full max-w-md py-8">
        <div className="flex items-center justify-center gap-4 text-muted-foreground/30">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Secure Real-time Mesh</span>
        </div>
      </footer>
    </main>
  );
}
