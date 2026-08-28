"use client";

import React, { useState } from "react";
import { Send, Square, Sparkles, UserSearch, Briefcase, Search } from "lucide-react";

interface TaskInputProps {
  onSubmit: (prompt: string) => void;
  onStop: () => void;
  isExecuting: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    title: "HR & Recruiter Scout",
    prompt: "Find me the top AI recruitment HR profiles hiring actively for freshers 2026 btech passedout batch",
    icon: UserSearch
  },
  {
    title: "AI Hiring Research",
    prompt: "Research AI hiring opportunities in Hyderabad for freshers",
    icon: Search
  },
  {
    title: "AI Startups Sourcing",
    prompt: "Find open-source AI startups hiring entry-level engineers in Hyderabad",
    icon: Briefcase
  }
];

export default function TaskInput({ onSubmit, onStop, isExecuting }: TaskInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isExecuting) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-75 transition duration-300"></div>
        
        <div className="relative flex items-center bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-2xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any natural-language objective (e.g. Find top AI recruitment HR profiles hiring freshers 2026)..."
            disabled={isExecuting}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          {isExecuting ? (
            <button
              type="button"
              onClick={onStop}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-rose-600/20"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Execution
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Execute Goal</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
        </span>
        {EXAMPLE_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(item.prompt);
                if (!isExecuting) onSubmit(item.prompt);
              }}
              className="px-3 py-1.5 glass-card rounded-xl text-xs text-slate-300 hover:text-white hover:border-indigo-500/50 flex items-center gap-1.5 transition shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
