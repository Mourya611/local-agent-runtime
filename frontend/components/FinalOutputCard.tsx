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
  FileText,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface FinalResult {
  summary?: string;
  finalAnswer?: string;
  metrics_summary?: string;
  verification?: {
    status: string;
    reasoning: string;
  };
  [key: string]: unknown;
}

interface SourceItem {
  title?: string;
  url?: string;
  content?: string;
  results?: SourceItem[];
  [key: string]: unknown;
}

interface EvidenceItem {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  path: string;
  source_url?: string;
  [key: string]: unknown;
}

interface FinalOutputCardProps {
  finalResult: FinalResult | null;
  sources: SourceItem[];
  evidence: EvidenceItem[];
  isExecuting?: boolean;
  currentState?: string;
  objective?: string;
}

function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="list-disc list-inside space-y-1.5 my-2 text-slate-200 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s\)\>]+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(<strong key={match.index} className="font-bold text-emerald-300">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-xs text-indigo-300 border border-slate-800">{token.slice(1, -1)}</code>);
      } else if (token.startsWith("[") && token.includes("](")) {
        const linkText = token.substring(1, token.indexOf("]("));
        const url = token.substring(token.indexOf("](") + 2, token.length - 1);
        parts.push(
          <a key={match.index} href={url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-1">
            {linkText} <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      } else if (token.startsWith("http")) {
        parts.push(
          <a key={match.index} href={token} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-medium truncate max-w-[250px] inline-block align-bottom">
            {token}
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      flushList();
      renderedElements.push(
        <h3 key={idx} className="text-base font-bold text-emerald-400 mt-4 mb-2 flex items-center gap-2 border-b border-slate-800/80 pb-1">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      renderedElements.push(
        <h2 key={idx} className="text-lg font-extrabold text-slate-100 mt-5 mb-2 border-b border-emerald-500/30 pb-1.5">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      renderedElements.push(
        <h1 key={idx} className="text-xl font-black text-slate-100 mt-6 mb-3">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {parseInline(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const contentStr = trimmed.replace(/^\d+\.\s/, "");
      inList = true;
      listItems.push(
        <li key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {parseInline(contentStr)}
        </li>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList();
      renderedElements.push(
        <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1.5 my-2 bg-indigo-950/20 rounded-r-xl text-xs text-slate-300 italic">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed === "") {
      flushList();
      renderedElements.push(<div key={idx} className="h-2" />);
    } else {
      flushList();
      renderedElements.push(
        <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1.5">{renderedElements}</div>;
}

export default function FinalOutputCard({ 
  finalResult, 
  sources = [], 
  evidence = [], 
  isExecuting = false, 
  currentState = "IDLE",
  objective = "" 
}: FinalOutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const answerText = finalResult?.finalAnswer || finalResult?.summary || "";

  const handleCopy = () => {
    if (answerText) {
      navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s\)\>]+)/g;
    return text.match(urlRegex) || [];
  };

  const textUrls = extractUrls(answerText);
  const allLinks = Array.from(new Set([
    ...textUrls,
    ...sources.map((s) => s.url).filter((u): u is string => Boolean(u))
  ]));

  const isFailed = currentState === "FAILED" || currentState === "CANCELLED";

  return (
    <div className={`glass-panel p-6 rounded-3xl border ${
      isFailed 
        ? "border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-900/80 to-slate-950/90 shadow-rose-950/20"
        : isExecuting 
        ? "border-indigo-500/40 bg-gradient-to-b from-indigo-950/25 via-slate-900/80 to-slate-950/90 shadow-indigo-950/20 animate-pulse-slow"
        : "border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 via-slate-900/80 to-slate-950/90"
    } shadow-2xl space-y-6 transition-all duration-300`}>
      
      {/* Top Banner & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border shadow-md ${
            isFailed
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
              : isExecuting 
              ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" 
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          }`}>
            {isFailed ? (
              <AlertTriangle className="w-6 h-6" />
            ) : isExecuting ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2 tracking-wide">
              ✨ FINAL AGENT OUTPUT 
              {!isExecuting && !isFailed && <Sparkles className="w-4 h-4 text-emerald-400" />}
            </h3>
            <p className="text-xs text-slate-400">
              {isExecuting 
                ? "Synthesizing web research and empirical evidence into a final structured answer..."
                : isFailed
                ? "Execution stopped or failed before final answer completion."
                : "Dynamic synthesized answer, actionable citations, and verified evidence"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isExecuting ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating final answer... ({sources.length} sources)
            </span>
          ) : isFailed ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> {currentState}
            </span>
          ) : (
            <>
              {finalResult?.verification && (
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> {finalResult.verification.status || "VERIFIED"}
                </span>
              )}
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1.5 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Output"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Output Content Panel */}
      <div className="bg-slate-950/85 p-5 rounded-2xl border border-slate-800/90 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Synthesized Answer & Research Results
          </h4>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            {isExecuting ? "Executing Loop" : `${sources.length} Sources Analyzed`}
          </span>
        </div>

        {isExecuting ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">The agent is currently executing your objective:</p>
              <p className="text-xs font-mono text-indigo-300 italic mt-1 max-w-lg mx-auto">{objective ? `"${objective}"` : "Processing query..."}</p>
            </div>
            <div className="max-w-md mx-auto bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span>State: <strong className="text-indigo-400">{currentState}</strong></span>
                <span>Web Sources Collected: <strong className="text-emerald-400">{sources.length}</strong></span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="py-6 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-rose-300">Final answer could not be generated.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Task execution stopped or failed. Please check the Execution Timeline below for detailed logs and diagnostics.
            </p>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-3">
            <SimpleMarkdown content={answerText} />
          </div>
        )}

        {finalResult?.metrics_summary && !isExecuting && (
          <div className="pt-3 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-300">Execution Audit:</span> {finalResult.metrics_summary}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Direct Profile & Source Links */}
      {allLinks.length > 0 && !isExecuting && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Actionable Direct Profile & Source Links ({allLinks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allLinks.map((url, i) => {
              const isLinkedIn = url.includes("linkedin.com");
              const isGitHub = url.includes("github.com");
              let domain = url;
              try {
                domain = new URL(url).hostname.replace("www.", "");
              } catch (_) {}

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
      {evidence.length > 0 && !isExecuting && (
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
