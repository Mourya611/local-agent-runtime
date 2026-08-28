"use client";

import React from "react";
import { ShieldCheck, Cpu, Sparkles } from "lucide-react";

interface HeaderProps {
  currentState?: string;
}

export default function Header({ currentState = "IDLE" }: HeaderProps) {
  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case "COMPLETED":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10";
      case "FAILED":
        return "bg-rose-500/15 text-rose-300 border-rose-500/40";
      case "WAITING_FOR_CONFIRMATION":
      case "WAITING_FOR_CLARIFICATION":
        return "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse";
      case "CHALLENGING":
        return "bg-purple-500/15 text-purple-300 border-purple-500/40 animate-pulse";
      case "IDLE":
        return "bg-slate-800/80 text-slate-400 border-slate-700/60";
      default:
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 animate-pulse";
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-sm text-slate-100 tracking-wide">
            Autonomous Agent Core
          </span>
          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Local-First
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Safety Engine: <strong className="text-slate-200 font-semibold">Active Policy</strong></span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${getStateBadgeColor(currentState)} flex items-center gap-2 transition`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>● {currentState}</span>
        </div>
      </div>
    </header>
  );
}
