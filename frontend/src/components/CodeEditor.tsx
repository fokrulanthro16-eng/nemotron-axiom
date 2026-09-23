"use client";

import React, { useState } from "react";
import {
  Code,
  ShieldCheck,
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { SampleCode } from "@/types";

interface CodeEditorProps {
  inputCode: string;
  setInputCode: (val: string) => void;
  synthesizedCode: string;
  isCertified: boolean;
  status: "IDLE" | "RUNNING" | "CERTIFIED" | "FAILED";
  onExecute: () => void;
  onReset: () => void;
  samples?: Record<string, SampleCode>;
  onSelectSample?: (sampleKey: string) => void;
  selectedSampleKey?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  inputCode = "",
  setInputCode,
  synthesizedCode = "",
  isCertified = false,
  status = "IDLE",
  onExecute,
  onReset,
  samples = {},
  onSelectSample,
  selectedSampleKey = "",
}) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSynthesized, setCopiedSynthesized] = useState(false);

  const copyToClipboard = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedSynthesized(true);
      setTimeout(() => setCopiedSynthesized(false), 2000);
    }
  };

  const lineCountInput = (inputCode || "").split("\n").length;
  const lineCountOutput = (synthesizedCode || inputCode || "").split("\n").length;

  return (
    <div className="flex flex-col space-y-3">
      {/* Sample Selector & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-950/90 border border-axiom-border rounded-xl">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-nvidia" />
          <span className="text-xs font-semibold text-zinc-300 font-mono">
            BENCHMARK PRESETS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(samples || {}).map(([key, sample]) => (
              <button
                key={key}
                onClick={() => onSelectSample?.(key)}
                disabled={status === "RUNNING"}
                className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${
                  selectedSampleKey === key
                    ? "bg-nvidia/20 border border-nvidia/50 text-nvidia font-bold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {(sample?.title?.split(" ")?.[0] || key)} ({key === "deadlock_transfer" ? "Deadlock" : "Race"})
              </button>
            ))}
          </div>
        </div>

        {/* Execution Triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            disabled={status === "RUNNING"}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-mono transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onExecute}
            disabled={status === "RUNNING"}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-nvidia text-black font-semibold hover:bg-nvidia-glow text-xs font-mono shadow-[0_0_15px_rgba(118,185,0,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "RUNNING" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Proving Invariants...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Verify & Synthesize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dual Pane Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Target Input Code */}
        <div className="flex flex-col bg-zinc-950 border border-axiom-border rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/70 border-b border-axiom-border">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-mono text-zinc-200">
                1. Target Codebase (Suspected Concurrency Flaws)
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
              <span>{lineCountInput} lines</span>
              <button
                onClick={() => copyToClipboard(inputCode, true)}
                className="p-1 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedOriginal ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px] font-mono text-xs p-3 bg-axiom-dark overflow-auto">
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              disabled={status === "RUNNING"}
              placeholder="Paste Python concurrency code here..."
              className="w-full h-full min-h-[340px] bg-transparent text-zinc-200 outline-none resize-none font-mono text-xs leading-relaxed selection:bg-zinc-800"
              spellCheck={false}
            />
          </div>

          <div className="px-4 py-1.5 bg-zinc-900/40 border-t border-axiom-border text-[11px] font-mono text-zinc-500 flex items-center justify-between">
            <span>Language: Python 3.10+ (Threading / AsyncIO)</span>
            <span className="text-rose-400/80">Input unverified</span>
          </div>
        </div>

        {/* Right Pane: Formally Verified & Synthesized Output */}
        <div className="flex flex-col bg-zinc-950 border border-axiom-border rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/70 border-b border-axiom-border">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-nvidia" />
              <span className="text-xs font-bold font-mono text-zinc-200">
                2. Formally Synthesized & Certified Code (Nemotron 70B)
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
              {isCertified && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                  Z3 SAT CERTIFIED
                </span>
              )}
              <button
                onClick={() =>
                  copyToClipboard(synthesizedCode || inputCode, false)
                }
                disabled={!synthesizedCode}
                className="p-1 hover:text-white transition-colors disabled:opacity-40"
                title="Copy synthesized code"
              >
                {copiedSynthesized ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px] font-mono text-xs p-3 bg-axiom-dark overflow-auto">
            {synthesizedCode ? (
              <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                <code>{synthesizedCode}</code>
              </pre>
            ) : (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                <Sparkles className="w-8 h-8 text-zinc-700 animate-pulse" />
                <div>
                  <p className="text-xs font-mono text-zinc-400">
                    Awaiting Formal Verification Loop...
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1 max-w-sm">
                    Click &quot;Verify & Synthesize&quot; to invoke Nemotron-70B, Z3 SMT solver,
                    and Tavily spec grounding to produce provably correct code.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-1.5 bg-zinc-900/40 border-t border-axiom-border text-[11px] font-mono text-zinc-500 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <FileCheck className="w-3 h-3 text-nvidia" />
              <span>Provable Correctness Certificate</span>
            </span>
            <span
              className={
                isCertified ? "text-emerald-400 font-bold" : "text-zinc-500"
              }
            >
              {isCertified ? "Invariant Status: SATISFIED" : "Not yet certified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
