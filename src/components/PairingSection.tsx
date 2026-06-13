
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, UserPlus, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PairingSectionProps {
  myToken: string;
  onPartnerTokenSave: (token: string) => void;
  partnerToken?: string;
}

export function PairingSection({ myToken, onPartnerTokenSave, partnerToken: initialPartnerToken }: PairingSectionProps) {
  const [inputToken, setInputToken] = useState(initialPartnerToken || "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myToken);
    toast({
      title: "Token copied",
      description: "Send this to your partner.",
    });
  };

  const handleSave = () => {
    if (!inputToken) return;
    onPartnerTokenSave(inputToken);
    toast({
      title: "Partner Paired",
      description: "You're now ready to quack!",
    });
  };

  return (
    <Card className="w-full max-w-md border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Direct Pairing
        </CardTitle>
        <CardDescription>
          Exchange tokens to link your devices securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">My Device Token</label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={myToken || "Generating..."} 
              className="bg-muted/50 border-none font-mono text-[10px]"
            />
            <Button size="icon" variant="outline" onClick={copyToClipboard} disabled={!myToken}>
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Partner Token</label>
          <div className="flex gap-2">
            <Input 
              placeholder="Paste partner's token here" 
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="bg-muted/50 border-none font-mono text-[10px]"
            />
            <Button onClick={handleSave} size="icon">
              <ShieldCheck className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {initialPartnerToken && (
          <div className="flex items-center gap-2 text-xs text-accent font-medium bg-accent/10 p-2 rounded-md">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Connected to partner device
          </div>
        )}
      </CardContent>
    </Card>
  );
}
