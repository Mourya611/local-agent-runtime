"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Wrench, Layers, Sparkles } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentState="SKILLS" />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Modular Skill Registry</h1>
              <p className="text-xs text-slate-400">Extensible skill modules loaded without modifying Agent Core</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {skills.map((skill) => (
              <div key={skill.name} className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-indigo-300 capitalize flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> {skill.name} Skill
                  </span>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold">
                    v{skill.version || "1.0.0"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>

                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Tools:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.required_tools?.map((tool: string) => (
                      <span key={tool} className="text-[10px] font-semibold bg-slate-900/90 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {skill.instructions && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Skill Rules & Guidance:</span>
                    <pre className="bg-slate-950 p-3 rounded-xl text-[11px] text-slate-300 font-sans overflow-x-auto max-h-40 whitespace-pre-wrap border border-slate-800/80 leading-relaxed">
                      {skill.instructions}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
