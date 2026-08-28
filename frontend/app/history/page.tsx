"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { History, Clock, ExternalLink } from "lucide-react";

export default function HistoryPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/runs")
      .then((res) => res.json())
      .then((data) => {
        setRuns(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentState="HISTORY" />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Agent Task Execution History</h1>
              <p className="text-xs text-slate-400">Complete execution traces and historical run logs</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading history runs...</div>
            ) : runs.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500 italic">No historical runs recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {runs.map((r) => (
                  <div key={r.run_id} className="p-5 hover:bg-slate-900/60 transition flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                          {r.run_id}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate">{r.prompt}</p>
                      {r.result_summary && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{r.result_summary}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.status === "COMPLETED" 
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
