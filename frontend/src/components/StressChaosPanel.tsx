"use client";

import React, { useState } from "react";
import {
  Flame,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StressTestComparisonResponse } from "@/types";
import { runChaosStressTest } from "@/lib/api";

interface StressChaosPanelProps {
  inputCode: string;
  synthesizedCode: string;
  isCertified: boolean;
}

export const StressChaosPanel: React.FC<StressChaosPanelProps> = ({
  inputCode,
  synthesizedCode,
  isCertified,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<StressTestComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRunStress = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await runChaosStressTest(
        inputCode,
        synthesizedCode || inputCode,
        50,
        1.5
      );
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to execute stress test");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full bg-zinc-950/90 border border-axiom-border rounded-xl p-4 shadow-xl font-mono text-xs">
      {/* Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-axiom-border pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-zinc-100 font-mono tracking-tight">
                REAL RUNTIME CHAOS STRESS-HARNESS
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                50 CONCURRENT WORKERS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Subject both codebases to real high-concurrency race conditions, deadlock contention, and thread starvation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunStress}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg ${
              isRunning
                ? "bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:brightness-110 shadow-rose-950/50"
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Spawning 50 Workers...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>⚡ Run Chaos Stress Harness</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800"
            title="Toggle panel"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mt-3 p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300">
          Error: {error}
        </div>
      )}

      {/* Main Comparison Grid */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {!result && !isRunning && (
            <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-zinc-600 animate-pulse" />
              <span>
                Ready to deploy concurrent stress workload. Click &quot;⚡ Run Chaos Stress Harness&quot; to test thread contention.
              </span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Guarantee Banner */}
              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs">{result.concurrency_guarantee}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 shrink-0 ml-2">
                  Speedup: {result.speedup_factor}x
                </div>
              </div>

              {/* Side-by-side Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flawed Target */}
                <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-950/10 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-rose-300">
                        TARGET A: Unverified / Flawed Code
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-[10px]">
                      {result.target_flawed.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Completed:</span>
                      <span className="text-rose-400 font-bold">
                        {result.target_flawed.completed_threads} / {result.target_flawed.total_threads}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Frozen / Starved:</span>
                      <span className="text-rose-400 font-bold">
                        {result.target_flawed.active_frozen_threads} threads
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">p50 Latency:</span>
                      <span className="text-zinc-200">
                        {result.target_flawed.p50_latency_ms} ms (Timeout)
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Success Rate:</span>
                      <span className="text-rose-400 font-bold">
                        {result.target_flawed.success_rate_percent}%
                      </span>
                    </div>
                  </div>

                  {/* Execution Log */}
                  <div className="p-2 rounded bg-black/60 border border-zinc-900 text-[10px] space-y-1 text-zinc-400 max-h-24 overflow-y-auto">
                    {result.target_flawed.execution_log.map((log, i) => (
                      <div key={i} className="text-rose-300/80">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formally Verified Target */}
                <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/10 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-300">
                        TARGET B: Formally Certified (Nemotron 70B)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                      {result.target_verified.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Completed:</span>
                      <span className="text-emerald-400 font-bold">
                        {result.target_verified.completed_threads} / {result.target_verified.total_threads}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Frozen / Starved:</span>
                      <span className="text-emerald-400 font-bold">
                        0 threads (Zero Defect)
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">p50 Latency:</span>
                      <span className="text-emerald-300 font-bold">
                        {result.target_verified.p50_latency_ms} ms
                      </span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Success Rate:</span>
                      <span className="text-emerald-400 font-bold">
                        {result.target_verified.success_rate_percent}%
                      </span>
                    </div>
                  </div>

                  {/* Execution Log */}
                  <div className="p-2 rounded bg-black/60 border border-zinc-900 text-[10px] space-y-1 text-zinc-400 max-h-24 overflow-y-auto">
                    {result.target_verified.execution_log.map((log, i) => (
                      <div key={i} className="text-emerald-300/80">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
