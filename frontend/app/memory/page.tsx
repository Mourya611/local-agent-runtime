"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { BrainCircuit, Plus, Trash2 } from "lucide-react";

export default function MemoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [category, setCategory] = useState("preference");
  const [content, setContent] = useState("");

  const loadMemories = () => {
    fetch("http://127.0.0.1:8000/api/memories")
      .then((res) => res.json())
      .then((data) => setMemories(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await fetch("http://127.0.0.1:8000/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, content })
    });
    setContent("");
    loadMemories();
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://127.0.0.1:8000/api/memories/${id}`, { method: "DELETE" });
    loadMemories();
  };

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentState="MEMORY" />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Persistent User Memory & Rules</h1>
              <p className="text-xs text-slate-400">User preferences injected into agent planner before task execution</p>
            </div>
          </div>

          {/* Form to add custom preference */}
          <form onSubmit={handleAddMemory} className="glass-panel p-4 rounded-3xl border border-slate-800/80 flex gap-3 shadow-xl">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. preference)"
              className="w-40 bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none text-indigo-300 font-medium"
            />
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add persistent rule (e.g. 'Always prefer official primary company sources')"
              className="flex-1 bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Save Rule
            </button>
          </form>

          {/* List of persistent rules */}
          <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800/80 text-xs font-bold text-slate-300 uppercase tracking-wider">
              Stored Persistent Preferences
            </div>
            <div className="divide-y divide-slate-800/80">
              {memories.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 italic">No persistent memory items stored yet.</div>
              ) : (
                memories.map((m) => (
                  <div key={m.memory_id} className="p-4 hover:bg-slate-900/60 transition flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-wide">
                        [{m.category}]
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{m.content}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(m.memory_id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete memory rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
