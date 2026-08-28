"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Key, ShieldCheck, CheckCircle2, XCircle, Info, Lock } from "lucide-react";

export default function SettingsPage() {
  const [providers, setProviders] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentState="SETTINGS" />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">System Configuration & Credentials</h1>
              <p className="text-xs text-slate-400">Environment variables and provider security status</p>
            </div>
          </div>

          {/* Security Notice Alert */}
          <div className="p-5 glass-panel rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-slate-950/80 flex items-start gap-3.5 shadow-xl">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-indigo-300 text-sm">API Credentials Security Guarantee</span>
              <p className="text-slate-300 leading-relaxed">
                All credentials are stored securely in local <code className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-indigo-300 font-mono">.env</code> environment variables. 
                API keys are never displayed in raw text, never printed in logs, and never exposed to client-side scripts or LLM models.
              </p>
            </div>
          </div>

          {/* Provider Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-3 py-12 text-center text-xs text-slate-500">Loading settings status...</div>
            ) : (
              Object.entries(providers).map(([key, info]: [string, any]) => (
                <div key={key} className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{info.name}</span>
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">Configuration Status:</span>
                    {info.configured ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800">
                        <XCircle className="w-3.5 h-3.5" /> Not Configured
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Setup Guide Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" /> Environment File Setup (.env)
            </h3>
            <p className="text-xs text-slate-400">
              To add or update API providers, edit your root <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300 font-mono">.env</code> file:
            </p>
            <pre className="bg-slate-950 p-4 rounded-2xl text-xs text-indigo-300 font-mono border border-slate-800/80 overflow-x-auto leading-relaxed shadow-inner">
{`GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here`}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}
