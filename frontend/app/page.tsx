"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskInput from "@/components/TaskInput";
import Timeline from "@/components/Timeline";
import EvidencePanel from "@/components/EvidencePanel";
import FinalOutputCard from "@/components/FinalOutputCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import ChallengeModal from "@/components/ChallengeModal";
import { Sparkles, Activity } from "lucide-react";

export default function Dashboard() {
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<string>("IDLE");
  const [events, setEvents] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [finalResult, setFinalResult] = useState<any | null>(null);
  
  const [pendingConfirmation, setPendingConfirmation] = useState<any | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const isExecuting = !["IDLE", "COMPLETED", "FAILED", "CANCELLED"].includes(currentState);

  const startTask = async (prompt: string) => {
    setEvents([]);
    setEvidence([]);
    setSources([]);
    setFinalResult(null);
    setPendingConfirmation(null);
    setPendingChallenge(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error("Failed to start task");
      const data = await res.json();
      setCurrentRunId(data.run_id);
      connectWebSocket(data.run_id);
    } catch (err) {
      console.error(err);
      alert("Error starting task. Ensure Python backend server is running on http://127.0.0.1:8000");
    }
  };

  const connectWebSocket = (runId: string) => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/execution/${runId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { type, data } = payload;

      if (type === "state_transition") {
        setCurrentState(data.state);
      } else if (type === "source_found") {
        setSources((prev) => [...prev, data]);
      } else if (type === "screenshot_captured") {
        setEvidence((prev) => [...prev, data]);
      } else if (type === "confirmation_required") {
        setPendingConfirmation(data);
      } else if (type === "challenge_created") {
        setPendingChallenge(data);
      } else if (type === "task_completed") {
        setFinalResult(data);
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
          screenshot_url: type === "screenshot_captured" 
            ? `http://127.0.0.1:8000/runs_files/${runId}/screenshots/${data.path.split(/[\\/]/).pop()}` 
            : undefined,
          sources: type === "web_search" ? data.results : undefined
        }
      ]);
    };

    ws.onclose = () => console.log("WebSocket disconnected");
  };

  const formatEventTitle = (type: string, data: any) => {
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

  const formatEventDescription = (type: string, data: any) => {
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
      await fetch(`http://127.0.0.1:8000/api/runs/${currentRunId}/stop`, { method: "POST" });
      setCurrentState("CANCELLED");
    }
  };

  const handleConfirmAction = async (approved: boolean) => {
    if (currentRunId) {
      await fetch(`http://127.0.0.1:8000/api/runs/${currentRunId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      setPendingConfirmation(null);
    }
  };

  const handleResolveChallenge = async (choice: string) => {
    if (currentRunId) {
      await fetch(`http://127.0.0.1:8000/api/runs/${currentRunId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice })
      });
      setPendingChallenge(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentState={currentState} />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Task Command Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Natural-Language Objective Orchestrator
              </h2>
              <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3 text-indigo-400" /> Real-time CDP Session
              </span>
            </div>
            <TaskInput onSubmit={startTask} onStop={handleStopTask} isExecuting={isExecuting} />
          </div>

          {/* Prominent Output View when task completes */}
          {finalResult && (
            <FinalOutputCard finalResult={finalResult} sources={sources} evidence={evidence} />
          )}

          {/* Main Grid: Execution Timeline + Evidence Vault */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Execution Timeline */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
              <Timeline events={events} />
            </div>

            {/* Evidence & Citations Vault */}
            <div className="lg:col-span-5 space-y-6">
              <EvidencePanel evidence={evidence} sources={sources} verification={finalResult?.verification} />
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation & Challenge Modals */}
      {pendingConfirmation && (
        <ConfirmationModal data={pendingConfirmation} onConfirm={handleConfirmAction} />
      )}

      {pendingChallenge && (
        <ChallengeModal data={pendingChallenge} onResolve={handleResolveChallenge} />
      )}
    </div>
  );
}
