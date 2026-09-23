"use client";

import React from "react";
import { VisualGraph } from "@/components/VisualGraph";
import { CodeEditor } from "@/components/CodeEditor";
import { InvariantCard } from "@/components/InvariantCard";
import { ExecutionTerminal } from "@/components/ExecutionTerminal";
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Terminal, ArrowRight } from "lucide-react";
import {
  SampleCode,
  TelemetryEvent,
  Invariant,
  Z3Counterexample,
  TavilySpecCitation,
  SynthesisPatch,
} from "@/types";

interface VerificationStudioScreenProps {
  currentNode: string;
  isCertified: boolean;
  status: "IDLE" | "RUNNING" | "CERTIFIED" | "FAILED";
  inputCode: string;
  setInputCode: (val: string) => void;
  synthesizedCode: string;
  onExecute: () => void;
  onReset: () => void;
  samples: Record<string, SampleCode>;
  onSelectSample: (key: string) => void;
  selectedSampleKey: string;
  invariants: Invariant[];
  logs: TelemetryEvent[];
  counterexample: Z3Counterexample | null;
  citations: TavilySpecCitation[];
  patches: SynthesisPatch[];
}

export const VerificationStudioScreen: React.FC<VerificationStudioScreenProps> = ({
  currentNode,
  isCertified,
  status,
  inputCode,
  setInputCode,
  synthesizedCode,
  onExecute,
  onReset,
  samples,
  onSelectSample,
  selectedSampleKey,
  invariants,
  logs,
  counterexample,
  citations,
  patches,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Z3 SMT Prover Live Status Banner */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Microsoft Z3 SMT Theorem Prover (v4.13)
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isCertified
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              }`}>
                {isCertified ? "SATISFIABLE (PROVEN)" : "FIRST-ORDER LOGIC ACTIVE"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Invariant: &forall; t1, t2 &isin; Threads : (Holds(t1, L_A) &and; WaitsFor(t1, L_B)) &rArr; &not;WaitsFor(t2, L_A)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-zinc-500">Logic:</span> <span className="text-purple-400 font-bold">QF_LIA</span> (Linear Integer Arithmetic)
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-zinc-500">Order:</span> <span className="text-emerald-400 font-bold">Acyclic DAG</span>
          </div>
        </div>
      </div>

      {/* State Machine Visualization */}
      <VisualGraph
        currentNode={currentNode}
        isCertified={isCertified}
        status={status}
      />

      {/* Dual Pane Code Workspace */}
      <CodeEditor
        inputCode={inputCode}
        setInputCode={setInputCode}
        synthesizedCode={synthesizedCode}
        isCertified={isCertified}
        status={status}
        onExecute={onExecute}
        onReset={onReset}
        samples={samples}
        onSelectSample={onSelectSample}
        selectedSampleKey={selectedSampleKey}
      />

      {/* Formal Mathematical Invariants Grid */}
      <InvariantCard invariants={invariants} isCertified={isCertified} />

      {/* Live Execution & Proof Terminal */}
      <ExecutionTerminal
        logs={logs}
        counterexample={counterexample}
        citations={citations}
        patches={patches}
        isCertified={isCertified}
      />
    </div>
  );
};
