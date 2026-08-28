"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bot, 
  Play, 
  History, 
  Settings as SettingsIcon, 
  Wrench, 
  BrainCircuit, 
  Globe, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [browserStatus, setBrowserStatus] = useState<{ connected: boolean; tabs: any[] }>({
    connected: false,
    tabs: []
  });
  const [connecting, setConnecting] = useState(false);

  const fetchBrowserStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/browser/status");
      if (res.ok) {
        const data = await res.json();
        setBrowserStatus(data);
      }
    } catch (e) {
      // Backend starting
    }
  };

  useEffect(() => {
    fetchBrowserStatus();
    const interval = setInterval(fetchBrowserStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectChrome = async () => {
    setConnecting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/browser/connect?port=9222", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setBrowserStatus(data);
      }
    } catch (e) {
      console.error("Browser connect error", e);
    } finally {
      setConnecting(false);
    }
  };

  const navItems = [
    { label: "Dashboard & Agent", href: "/", icon: Play },
    { label: "Execution History", href: "/history", icon: History },
    { label: "Modular Skills", href: "/skills", icon: Wrench },
    { label: "Memory & Rules", href: "/memory", icon: BrainCircuit },
    { label: "Settings & API Keys", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-xl">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Agent Runtime
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
              <span>v0.1.0</span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">Open Source</span>
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/25 to-purple-600/25 text-indigo-200 border border-indigo-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Browser Integration Status Box */}
      <div className="p-4 m-3 glass-card rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Globe className="w-4 h-4 text-indigo-400" /> Chrome CDP Context
          </div>
          {browserStatus.connected ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              Isolated
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {browserStatus.connected
            ? `Attached to local Chrome context (${browserStatus.tabs?.length || 0} active tabs).`
            : "Running isolated Chromium instance for web navigation and evidence capture."}
        </p>

        {!browserStatus.connected && (
          <button
            onClick={handleConnectChrome}
            disabled={connecting}
            className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {connecting ? "Connecting..." : "Attach Chrome Session"}
          </button>
        )}
      </div>
    </aside>
  );
}
