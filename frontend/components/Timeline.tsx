"use client";

import React from "react";
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Globe, 
  Camera, 
  AlertTriangle, 
  ShieldAlert, 
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  description?: string;
  tool?: string;
  duration_ms?: number;
  screenshot_url?: string;
  sources?: any[];
  status?: "pending" | "running" | "completed" | "failed";
}

interface TimelineProps {
  events: TimelineEvent[];
  planSteps?: any[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" /> Real-Time Execution Timeline
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative border-l-2 border-slate-800/80 ml-3 pl-6 space-y-5">
        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            No execution events recorded yet. Type an objective above to trigger execution.
          </div>
        ) : (
          events.map((ev, index) => {
            let Icon = Circle;
            let iconColor = "text-slate-400 bg-slate-900 border-slate-700";

            if (ev.type === "plan_created") {
              Icon = FileText;
              iconColor = "text-indigo-400 bg-indigo-950/80 border-indigo-500/60";
            } else if (ev.type === "tool_started" || ev.type === "tool_completed") {
              if (ev.tool === "web_search") {
                Icon = Search;
                iconColor = "text-amber-400 bg-amber-950/80 border-amber-500/60";
              } else if (ev.tool?.startsWith("browser_")) {
                Icon = Globe;
                iconColor = "text-cyan-400 bg-cyan-950/80 border-cyan-500/60";
              }
            } else if (ev.type === "screenshot_captured") {
              Icon = Camera;
              iconColor = "text-emerald-400 bg-emerald-950/80 border-emerald-500/60";
            } else if (ev.type === "challenge_created") {
              Icon = AlertTriangle;
              iconColor = "text-purple-400 bg-purple-950/80 border-purple-500/80";
            } else if (ev.type === "confirmation_required") {
              Icon = ShieldAlert;
              iconColor = "text-amber-400 bg-amber-950/80 border-amber-500/80";
            } else if (ev.type === "task_completed") {
              Icon = CheckCircle2;
              iconColor = "text-emerald-400 bg-emerald-950/80 border-emerald-500/80";
            }

            return (
              <div key={ev.id || index} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-[35px] top-0.5 p-1.5 rounded-full border ${iconColor} shadow-md transition-transform group-hover:scale-110`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Event content box */}
                <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">{ev.title}</span>
                    <div className="flex items-center gap-2">
                      {ev.duration_ms && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                          {ev.duration_ms} ms
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">{ev.timestamp}</span>
                    </div>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  {ev.screenshot_url && (
                    <div className="pt-2">
                      <a
                        href={ev.screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:underline bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30"
                      >
                        <Camera className="w-3.5 h-3.5" /> View Captured Evidence Screenshot ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
