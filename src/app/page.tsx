
"use client";

import React, { useState, useEffect } from "react";
import { QuackButton } from "@/components/QuackButton";
import { Bird, Info, Globe, ShieldCheck } from "lucide-react";
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
  const [lastQuackTime, setLastQuackTime] = useState<number | null>(null);
  const app = useFirebaseApp();
  const db = useFirestore();

  useEffect(() => {
    if (typeof window === "undefined" || !app || !db) return;

    const setupBroadcast = async () => {
      try {
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          
          if (currentToken) {
            // Register token in global pool
            const tokenRef = doc(db, "tokens", currentToken.substring(0, 32));
            setDoc(tokenRef, {
              token: currentToken,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        }

        // 1. Listen for foreground FCM messages
        const unsubscribeMessaging = onMessage(messaging, (payload) => {
          AudioEngine.playQuack();
          toast({
            title: "QUACK!",
            description: payload.notification?.body || "Someone in the loop quacked!",
          });
        });

        // 2. Listen for Firestore "Quack" events (Real-time Broadcast)
        const quacksRef = collection(db, "quacks");
        const q = query(quacksRef, orderBy("timestamp", "desc"), limit(1));
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const time = data.timestamp?.toMillis() || Date.now();
            
            // Only play if it's a new event (not historical load)
            if (lastQuackTime && time > lastQuackTime) {
              AudioEngine.playQuack();
              toast({
                title: "QUACK!",
                description: "Incoming quack from the network.",
              });
            }
            setLastQuackTime(time);
          } else {
            setLastQuackTime(Date.now());
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
  }, [app, db]);

  const triggerBroadcastQuack = async () => {
    if (!db) return;

    try {
      // 1. Local real-time sync (write to Firestore)
      await addDoc(collection(db, "quacks"), {
        timestamp: serverTimestamp(),
        senderId: "web-client", // Simplified
      });

      // 2. Background broadcast (call API to send FCM to all tokens)
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
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Bird className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">EchoQuack</h1>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Broadcast Mode</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase">Secure</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12">
        <div className="w-full space-y-24">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 bg-secondary rounded-full">
              <p className="text-secondary-foreground text-xs font-semibold tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Network Connected
              </p>
            </div>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
              Tapping the button will alert every device with EchoQuack installed.
            </p>
          </div>
          
          <QuackButton 
            onTrigger={triggerBroadcastQuack} 
            disabled={!isInitialized} 
          />

          <div className="flex justify-center">
            <div className="bg-white/50 backdrop-blur-sm border border-white/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-md py-8">
        <div className="flex items-center justify-center gap-6 text-muted-foreground/40">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Powered by Firebase Firestore & FCM</span>
        </div>
      </footer>
    </main>
  );
}
