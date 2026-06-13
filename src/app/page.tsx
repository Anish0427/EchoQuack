"use client";

import React, { useState, useEffect } from "react";
import { QuackButton } from "@/components/QuackButton";
import { PairingSection } from "@/components/PairingSection";
import { Settings, Info, Bird } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioEngine } from "@/app/lib/audio-engine";
import { useFirebaseApp } from "@/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

export default function EchoQuackHome() {
  const [showPairing, setShowPairing] = useState(false);
  const [myToken, setMyToken] = useState("");
  const [partnerToken, setPartnerToken] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const app = useFirebaseApp();

  useEffect(() => {
    // Load state from local storage
    const savedPartner = localStorage.getItem("echoquack_partner_token");
    if (savedPartner) setPartnerToken(savedPartner);

    const initMessaging = async () => {
      // Guard against server-side execution and ensure app is initialized
      if (typeof window === "undefined" || !app) return;
      
      try {
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (currentToken) {
            setMyToken(currentToken);
          }
        }

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground Quack received!", payload);
          AudioEngine.playQuack();
          toast({
            title: "QUACK!",
            description: payload.notification?.body || "Your partner is calling.",
          });
        });

        setIsInitialized(true);
        return () => unsubscribe();
      } catch (err) {
        console.error("Messaging init error:", err);
        setIsInitialized(true);
      }
    };

    initMessaging();
  }, [app]);

  const handlePartnerTokenSave = (token: string) => {
    setPartnerToken(token);
    localStorage.setItem("echoquack_partner_token", token);
  };

  const triggerRemoteQuack = async () => {
    if (!partnerToken) {
      throw new Error("No partner paired");
    }

    const response = await fetch('/api/quack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: partnerToken }),
    });

    if (!response.ok) throw new Error("Failed to send notification");
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
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Connected Device</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowPairing(!showPairing)}
          className={showPairing ? 'text-primary' : 'text-muted-foreground'}
        >
          <Settings className="w-6 h-6" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12">
        {showPairing ? (
          <div className="w-full animate-in slide-in-from-top duration-500">
            <PairingSection 
              myToken={myToken} 
              onPartnerTokenSave={handlePartnerTokenSave} 
              partnerToken={partnerToken}
            />
          </div>
        ) : (
          <div className="w-full space-y-24">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-sm font-medium tracking-wide">
                {partnerToken ? "Ready to alert your partner" : "Start by pairing your device"}
              </p>
            </div>
            
            <QuackButton 
              onTrigger={triggerRemoteQuack} 
              disabled={!partnerToken || !isInitialized} 
            />

            <div className="flex justify-center">
              <div className="bg-white/50 backdrop-blur-sm border border-white/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">System Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-md py-8">
        <div className="flex items-center justify-center gap-6 text-muted-foreground/40">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Powered by FCM & Sonic Variator GenAI</span>
        </div>
      </footer>
    </main>
  );
}
