"use client";

import React, { useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskInput from "@/components/TaskInput";
import Timeline from "@/components/Timeline";
import EvidencePanel from "@/components/EvidencePanel";
import FinalOutputCard from "@/components/FinalOutputCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import ChallengeModal from "@/components/ChallengeModal";
import { Sparkles, Activity } from "lucide-react";

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws");
};

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

interface VerificationResult {
  status: string;
  reasoning: string;
}

interface FinalResult {
  summary: string;
  metrics_summary?: string;
  verification?: VerificationResult;
  [key: string]: unknown;
}

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  description?: string;
  tool?: string;
  duration_ms?: number;
  screenshot_url?: string;
  sources?: SourceItem[];
}

interface ConfirmationData {
  confirmation_id: string;
  step_id: string;
  action: string;
  reason: string;
  risk_level: string;
}

interface ChallengeData {
  challenge_id: string;
  prompt_requested: string;
  evidence_found: string;
  reason: string;
  recommendation: string;
}

type EventPayload = Record<string, unknown> & {
  state?: string;
  tool?: string;
  duration_ms?: number;
  path?: string;
  results?: SourceItem[];
  title?: string;
  url?: string;
  steps?: unknown[];
  step_id?: string;
  reasoning?: string;
  reason?: string;
  summary?: string;
  description?: string;
  error?: string;
  status?: string;
};

export default function Dashboard() {
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<string>("IDLE");
  const [currentObjective, setCurrentObjective] = useState<string>("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationData | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const isExecuting = !["IDLE", "COMPLETED", "FAILED", "CANCELLED"].includes(currentState);

  const startTask = async (prompt: string) => {
    setCurrentObjective(prompt);
    setEvents([]);
    setEvidence([]);
    setSources([]);
    setFinalResult(null);
    setPendingConfirmation(null);
    setPendingChallenge(null);

    try {
      const res = await fetch(`${getApiUrl()}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(errData.detail || "Failed to start task");
      }
      const data = await res.json();
      setCurrentRunId(data.run_id);
      connectWebSocket(data.run_id);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error starting task. Ensure backend server is running.";
      alert(message);
    }
  };

  const connectWebSocket = (runId: string) => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${getWsUrl()}/ws/execution/${runId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string; data: EventPayload };
      const { type, data } = payload;

      if (type === "state_transition") {
        setCurrentState(data.state || "IDLE");
      } else if (type === "source_found") {
        setSources((prev) => [...prev, data as SourceItem]);
      } else if (type === "screenshot_captured") {
        setEvidence((prev) => [...prev, data as EvidenceItem]);
      } else if (type === "confirmation_required") {
        setPendingConfirmation(data as unknown as ConfirmationData);
      } else if (type === "challenge_created") {
        setPendingChallenge(data as unknown as ChallengeData);
      } else if (type === "task_completed") {
        setFinalResult(data as FinalResult);
      }

      setEvents((prev) => [
        ...prev,
        {
          id: `${type}_${Date.now()}_${Math.random()}`,
          type: type,
          timestamp: new Date().toLocaleTimeString(),
          title: formatEventTitle(type, data),
          description: formatEventDescription(type, data),
          tool: data?.tool,
          duration_ms: data?.duration_ms,
          screenshot_url: type === "screenshot_captured" && data.path
            ? `${getApiUrl()}/runs_files/${runId}/screenshots/${data.path.split(/[\\/]/).pop()}` 
            : undefined,
          sources: type === "web_search" ? data.results : undefined
        }
      ]);
    };

    ws.onclose = () => console.log("WebSocket disconnected");
  };

  const formatEventTitle = (type: string, data: EventPayload) => {
    switch (type) {
      case "state_transition": return `State changed to: ${data.state}`;
      case "planning_started": return "Task Planning Phase Started";
      case "plan_created": return `Plan Generated (${data.steps?.length || 0} steps)`;
      case "tool_started": return `Executing step: ${data.title}`;
      case "tool_completed": return `Completed step using ${data.step_id}`;
      case "source_found": return `Found web source: ${data.title || data.url}`;
      case "screenshot_captured": return "Captured Screenshot Evidence";
      case "confirmation_required": return "Human Confirmation Required";
      case "challenge_created": return "Agent Challenge Raised";
      case "verification_started": return "Verification Audit Started";
      case "verification_completed": return `Verification Audit: ${data.status}`;
      case "task_completed": return "Task Completed Successfully";
      case "task_failed": return "Task Execution Failed";
      default: return type;
    }
  };

  const formatEventDescription = (type: string, data: EventPayload) => {
    if (type === "plan_created") return data.reasoning;
    if (type === "confirmation_required") return data.reason;
    if (type === "challenge_created") return data.reason;
    if (type === "verification_completed") return data.reasoning;
    if (type === "task_completed") return data.summary;
    if (type === "task_failed") return data.error;
    return data?.summary || data?.description || "";
  };

  const handleStopTask = async () => {
    if (currentRunId) {
      await fetch(`${getApiUrl()}/api/runs/${currentRunId}/stop`, { method: "POST" });
      setCurrentState("CANCELLED");
    }
  };

  const handleConfirmAction = async (approved: boolean) => {
    if (currentRunId) {
      await fetch(`${getApiUrl()}/api/runs/${currentRunId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      setPendingConfirmation(null);
    }
  };

  const handleResolveChallenge = async (choice: string) => {
    if (currentRunId) {
      await fetch(`${getApiUrl()}/api/runs/${currentRunId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice })
      });
      setPendingChallenge(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#080d1a] text-slate-100 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header currentState={currentState} />

        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Objective Entry Section */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-extrabold tracking-wide uppercase text-indigo-200">
                  Natural-Language Objective Orchestrator
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Real-time CDP Session
                </span>
              </div>
            </div>

            <TaskInput onSubmit={startTask} onStop={handleStopTask} isExecuting={isExecuting} />
          </div>

          {/* Prominent Final Agent Output Display */}
          {(isExecuting || finalResult || currentState === "FAILED" || currentState === "CANCELLED") && (
            <FinalOutputCard 
              finalResult={finalResult} 
              sources={sources} 
              evidence={evidence} 
              isExecuting={isExecuting}
              currentState={currentState}
              objective={currentObjective}
            />
          )}

          {/* Execution Timeline & Evidence Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Timeline events={events} />
            </div>
            <div>
              <EvidencePanel evidence={evidence} sources={sources} />
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation & Challenge Modals */}
      {pendingConfirmation && (
        <ConfirmationModal
          data={pendingConfirmation}
          onConfirm={handleConfirmAction}
        />
      )}

      {pendingChallenge && (
        <ChallengeModal
          data={pendingChallenge}
          onResolve={handleResolveChallenge}
        />
      )}
    </div>
  );
}
