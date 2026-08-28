"use client";

import React from "react";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";

interface ChallengeModalProps {
  data: {
    challenge_id: string;
    prompt_requested: string;
    evidence_found: string;
    reason: string;
    recommendation: string;
  };
  onResolve: (choice: string) => void;
}

export default function ChallengeModal({ data, onResolve }: ChallengeModalProps) {
  return (
    <div className="fixed inset-0 bg-[#080d1a]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full glass-panel bg-slate-900 rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/15 text-purple-300 rounded-2xl border border-purple-500/40 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
              ⚠️ AGENT CHALLENGE DETECTED
            </h3>
            <p className="text-xs text-slate-400">
              The agent discovered evidence that contradicts or compromises your original instruction scope.
            </p>
          </div>
        </div>

        {/* Evidence Analysis Box */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Challenge Reason:</span>
            <p className="text-slate-200">{data.reason}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Empirical Evidence Observed:</span>
            <p className="text-slate-300">{data.evidence_found}</p>
          </div>

          <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/30 space-y-1">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Recommended Resolution:</span>
            <p className="text-purple-200">{data.recommendation}</p>
          </div>
        </div>

        {/* Action Choice Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => onResolve("proceed_anyway")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Ignore & Proceed Anyway
          </button>
          <button
            onClick={() => onResolve("adopt_recommendation")}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-600/25"
          >
            <span>Adopt Recommendation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
