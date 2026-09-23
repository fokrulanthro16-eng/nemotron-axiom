"use client";

import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  Search,
  Activity,
  Sparkles,
  GitPullRequest,
  Download,
  FileText,
  Shield,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  status: "IDLE" | "RUNNING" | "CERTIFIED" | "FAILED";
  iteration: number;
  isLiveNebius?: boolean;
  onOpenPRModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  iteration,
  isLiveNebius = true,
  onOpenPRModal,
}) => {
  const [showExport, setShowExport] = useState(false);

  const downloadReport = async (type: "sarif" | "provenance") => {
    setShowExport(false);
    try {
      const endpoint = type === "sarif" ? "/api/export-sarif" : "/api/export-provenance";
      const filename = type === "sarif" ? "axiom-compliance.sarif" : "axiom-slsa-provenance.json";
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`);
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };
  return (
    <header className="border-b border-axiom-border bg-axiom-dark/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 shadow-inner">
            <Cpu className="w-6 h-6 text-nvidia" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nvidia opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nvidia"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
                NEMOTRON <span className="text-nvidia ml-1">AXIOM</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-nvidia/10 border border-nvidia/30 text-nvidia font-mono font-medium">
                v1.0-SMT
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans tracking-wide">
              Autonomous Neuro-Symbolic Verification & Provably Correct Code Synthesizer
            </p>
          </div>
        </div>

        {/* Hackathon Badges & Model Telemetry */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Track Indicator */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nebius x NVIDIA Track</span>
          </div>

          {/* Nebius Nemotron-70B Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-nvidia/40 text-nvidia">
            <div className="w-2 h-2 rounded-full bg-nvidia animate-pulse"></div>
            <span className="font-semibold">NVIDIA Nemotron-70B</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-300">Nebius Token Factory</span>
          </div>

          {/* Tavily Bonus Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-cyan-500/40 text-cyan-400">
            <Search className="w-3.5 h-3.5" />
            <span>Tavily Grounding</span>
          </div>

          {/* Z3 SMT Prover Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-purple-500/40 text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Z3 SMT Solver</span>
          </div>

          {/* Dynamic Execution Status */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded border font-semibold ${
              status === "RUNNING"
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 animate-pulse"
                : status === "CERTIFIED"
                ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                : status === "FAILED"
                ? "bg-rose-950/60 border-rose-500 text-rose-400"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>
              {status === "IDLE" && "SYSTEM READY"}
              {status === "RUNNING" && `SOLVING (PASS ${iteration})`}
              {status === "CERTIFIED" && "FORMALLY CERTIFIED"}
              {status === "FAILED" && "UNSAT VIOLATION"}
            </span>
          </div>

          {/* GitHub PR Gatekeeper Button */}
          <button
            onClick={onOpenPRModal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#21262d] border border-[#30363d] text-white hover:bg-[#30363d] transition-all font-semibold shadow-sm"
          >
            <GitPullRequest className="w-3.5 h-3.5 text-[#8957e5]" />
            <span>🐙 View GitHub PR Gatekeeper</span>
          </button>

          {/* Export Compliance Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>📄 Export Compliance</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 z-50 text-xs font-sans">
                <button
                  onClick={() => downloadReport("sarif")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-zinc-900 text-zinc-200 hover:text-white flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold block">OASIS SARIF 2.1.0</span>
                    <span className="text-[10px] text-zinc-500">GitHub Advanced Security &amp; SonarQube</span>
                  </div>
                </button>

                <button
                  onClick={() => downloadReport("provenance")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-zinc-900 text-zinc-200 hover:text-white flex items-center space-x-2 mt-1"
                >
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">SLSA Provenance (Level 3)</span>
                    <span className="text-[10px] text-zinc-500">Cryptographic Attestation &amp; SOC-2</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
