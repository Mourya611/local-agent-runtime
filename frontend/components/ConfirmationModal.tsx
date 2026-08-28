"use client";

import React from "react";
import { ShieldAlert, Check, X } from "lucide-react";

interface ConfirmationModalProps {
  data: {
    confirmation_id: string;
    step_id: string;
    action: string;
    reason: string;
    risk_level: string;
  };
  onConfirm: (approved: boolean) => void;
}

export default function ConfirmationModal({ data, onConfirm }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-[#080d1a]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel bg-slate-900 rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/15 text-amber-300 rounded-2xl border border-amber-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-sm">Human Confirmation Required</h3>
            <p className="text-xs text-slate-400">
              The Agent Policy Engine detected a sensitive tool request requiring explicit approval.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Action Requested:</span>
            <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{data.action}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Assessed Risk Level:</span>
            <span className="font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{data.risk_level}</span>
          </div>
          <div className="pt-2 border-t border-slate-850">
            <span className="text-slate-400 font-semibold block mb-1">Policy Engine Context:</span>
            <p className="text-slate-300 leading-relaxed">{data.reason}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <X className="w-4 h-4" /> Reject Action
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/25"
          >
            <Check className="w-4 h-4" /> Approve Action
          </button>
        </div>
      </div>
    </div>
  );
}
