"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Camera, 
  Sparkles, 
  Globe, 
  UserCheck, 
  Copy, 
  Check,
  FileText
} from "lucide-react";

interface FinalOutputCardProps {
  finalResult: {
    summary: string;
    metrics_summary?: string;
    verification?: {
      status: string;
      reasoning: string;
    };
  };
  sources: any[];
  evidence: any[];
}

export default function FinalOutputCard({ finalResult, sources = [], evidence = [] }: FinalOutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract URLs from text and merge with sources array
  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s\)\>]+)/g;
    return text.match(urlRegex) || [];
  };

  const textUrls = extractUrls(finalResult.summary || "");
  const allLinks = Array.from(new Set([
    ...textUrls,
    ...sources.map((s) => s.url).filter(Boolean)
  ]));

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 via-slate-900/80 to-slate-950/90 shadow-2xl space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              Verified Executive Abstract & Direct Links <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">Synthesized research abstract, actionable links, and empirical proof</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {finalResult.verification && (
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {finalResult.verification.status || "Verified"}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1.5 transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Abstract"}
          </button>
        </div>
      </div>

      {/* Executive Abstract & Findings Section */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Executive Research Abstract & Findings Overview
          </h4>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            Synthesized Summary
          </span>
        </div>

        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
          {finalResult.summary}
        </div>

        {finalResult.metrics_summary && (
          <div className="pt-2 border-t border-slate-850 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-300">Execution Audit:</span> {finalResult.metrics_summary}
          </div>
        )}
      </div>

      {/* Actionable Direct Profile & Source Links */}
      {allLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Actionable Direct Profile & Source Links ({allLinks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allLinks.map((url, i) => {
              const isLinkedIn = url.includes("linkedin.com");
              const isGitHub = url.includes("github.com");
              const domain = new URL(url).hostname.replace("www.", "");

              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-indigo-500/60 flex items-center justify-between group transition shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl ${isLinkedIn ? 'bg-blue-600/20 text-blue-400' : isGitHub ? 'bg-purple-600/20 text-purple-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition truncate">
                        {isLinkedIn ? "LinkedIn Profile / Post" : isGitHub ? "GitHub Repository" : domain}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">{url}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Screenshot Proof Gallery */}
      {evidence.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" /> Empirical Evidence Screenshots ({evidence.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {evidence.map((item) => {
              const filename = item.path.split(/[\\/]/).pop();
              const runId = item.path.split(/[\\/]/).reverse()[2] || "";
              const imgUrl = `http://127.0.0.1:8000/runs_files/${runId}/screenshots/${filename}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedScreenshot(imgUrl)}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800 group hover:border-emerald-500/60 cursor-pointer transition shadow-md"
                >
                  <div className="aspect-video bg-slate-950 overflow-hidden relative">
                    <img
                      src={imgUrl}
                      alt={item.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-medium text-slate-300 truncate">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screenshot Modal Lightbox */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-[#080d1a]/85 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="max-w-4xl w-full bg-slate-900 rounded-3xl p-5 border border-slate-700 space-y-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" /> Verified Evidence Proof Screenshot
              </span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-100 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700"
              >
                ✕ Close
              </button>
            </div>
            <img src={selectedScreenshot} alt="Full evidence view" className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain border border-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
}
