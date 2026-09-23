"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitCommit,
  GitMerge,
  ShieldAlert,
  ShieldCheck,
  Bot,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  Cpu,
} from "lucide-react";
import { Z3Counterexample } from "@/types";

interface GitHubPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCertified: boolean;
  synthesizedCode?: string;
  counterexample?: Z3Counterexample | null;
}

export const GitHubPRModal: React.FC<GitHubPRModalProps> = ({
  isOpen,
  onClose,
  isCertified,
  synthesizedCode,
  counterexample,
}) => {
  const [isMerged, setIsMerged] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);

  if (!isOpen) return null;

  const handleAutoMerge = () => {
    setIsApplyingFix(true);
    setTimeout(() => {
      setIsApplyingFix(false);
      setIsMerged(true);
    }, 1200);
  };

  const commitSha = isMerged ? "a8f9c1e" : "4d82b09";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl text-[#c9d1d9] font-sans overflow-hidden">
        {/* Top GitHub Modal Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <GitPullRequest className="w-4 h-4 text-[#8957e5]" />
            <span>GitHub PR Gatekeeper • enterprise-monorepo / #142</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable PR Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* PR Title & Status */}
          <div className="space-y-2 border-b border-[#30363d] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                feat(banking): concurrent fund transfer routine across multi-accounts
              </h2>
              <span className="text-xs font-mono text-[#8b949e]">#142</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 ${
                  isMerged
                    ? "bg-[#8957e5]/20 text-[#a371f7] border border-[#8957e5]/50"
                    : isCertified
                    ? "bg-[#238636] text-white"
                    : "bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/50"
                }`}
              >
                {isMerged ? (
                  <>
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merged</span>
                  </>
                ) : isCertified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Open (Checks Passing)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Blocked (Checks Failing)</span>
                  </>
                )}
              </span>

              <span className="text-[#8b949e]">
                <strong className="text-white">walton-ai-dev</strong> wants to merge into{" "}
                <code className="bg-[#161b22] px-1.5 py-0.5 rounded text-white font-mono">
                  main
                </code>{" "}
                from{" "}
                <code className="bg-[#161b22] px-1.5 py-0.5 rounded text-white font-mono">
                  feat/concurrency-transfers
                </code>
              </span>
            </div>
          </div>

          {/* GitHub PR Checks Section */}
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                CI/CD Required Checks (1/1 completed)
              </span>
              <span className="text-[11px] text-[#8b949e] font-mono">
                Gatekeeper: AXIOM Formal SMT
              </span>
            </div>

            <div className="p-3 divide-y divide-[#30363d]/60 font-mono text-xs">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2.5">
                  {isMerged || isCertified ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#f85149]" />
                  )}
                  <div>
                    <span className="font-bold text-white">
                      AXIOM / Neuro-Symbolic Concurrency Verification
                    </span>
                    <span className="text-[#8b949e] block text-[11px]">
                      {isMerged || isCertified
                        ? "Z3 SMT Invariants Satisfied: Acyclic Lock Ordering Certified"
                        : "FAIL: Circular-Wait Deadlock Invariant Violated (Coffman #4)"}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                    isMerged || isCertified
                      ? "bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40"
                      : "bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40"
                  }`}
                >
                  {isMerged || isCertified ? "PASS (Z3 SAT)" : "FAILED (UNSAT)"}
                </span>
              </div>
            </div>
          </div>

          {/* Automated Bot Review Comment */}
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
            {/* Bot Header */}
            <div className="px-4 py-2.5 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-nvidia/20 border border-nvidia/40 text-nvidia">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs">
                  axiom-enterprise<span className="text-[#8b949e] font-normal">[bot]</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  Bot
                </span>
              </div>
              <span className="text-[11px] text-[#8b949e]">
                Powered by NVIDIA Nemotron-70B on Nebius
              </span>
            </div>

            {/* Bot Comment Body */}
            <div className="p-4 space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex items-start space-x-2 text-[#f85149] font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Critical Concurrency Vulnerability Detected by Z3 SMT Solver:
                </span>
              </div>

              <p className="text-[#c9d1d9] leading-relaxed text-xs">
                In routine <code className="bg-[#21262d] px-1 py-0.5 rounded text-white font-mono">transfer()</code>,
                acquiring locks <code className="bg-[#21262d] px-1 py-0.5 rounded text-white font-mono">from_acc.lock</code> then{" "}
                <code className="bg-[#21262d] px-1 py-0.5 rounded text-white font-mono">to_acc.lock</code> without canonical sorting allows concurrent threads to invoke opposing transfers, triggering a circular wait deadlock.
              </p>

              {/* SMT Counterexample Interleaving */}
              <div className="p-3 rounded bg-[#0d1117] border border-[#30363d] font-mono text-xs space-y-1">
                <span className="text-[#8b949e] font-bold block text-[10px] uppercase">
                  SMT Formal Counterexample Schedule:
                </span>
                <div className="text-[#f85149] text-[11px]">
                  • Thread 1: Acquires Account(1).lock ➔ Blocked waiting for Account(2).lock<br />
                  • Thread 2: Acquires Account(2).lock ➔ Blocked waiting for Account(1).lock<br />
                  • Result: Cyclic Resource Allocation DAG (UNSAT)
                </div>
              </div>

              {/* Suggested Patch Preview */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[#8b949e] font-bold block text-[10px] uppercase">
                  Suggested Surgical Patch (Formally Certified by Nemotron-70B):
                </span>
                <pre className="p-3 rounded bg-[#0d1117] border border-[#30363d] text-[#3fb950] overflow-x-auto leading-relaxed text-[11px]">
                  <code>{`# Enforce canonical total ordering to eliminate circular wait
first_lock, second_lock = (
    (from_acc.lock, to_acc.lock) if from_acc.id < to_acc.id
    else (to_acc.lock, from_acc.lock)
)
with first_lock:
    with second_lock:
        if from_acc.balance >= amount:
            from_acc.balance -= amount
            to_acc.balance += amount`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Merge Box & Actions */}
          <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
            {isMerged ? (
              <div className="flex items-center space-x-3 text-[#3fb950] font-mono text-xs">
                <GitMerge className="w-5 h-5" />
                <div>
                  <span className="font-bold text-sm block">
                    Pull request successfully merged and closed
                  </span>
                  <span className="text-[#8b949e] text-[11px]">
                    Commit <code className="text-white">{commitSha}</code> merged into <code className="text-white">main</code> with verified cryptographic attestation.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#8b949e]">
                  <span className="font-bold text-white block text-sm mb-0.5">
                    {isCertified ? "Ready for Automated Merge" : "Gatekeeper Blocked"}
                  </span>
                  {isCertified
                    ? "All SMT invariants proven SAT. Ready to commit Nemotron-synthesized patch directly to main."
                    : "Merge is blocked until formal invariant verification succeeds or fix is committed."}
                </div>

                <button
                  onClick={handleAutoMerge}
                  disabled={isApplyingFix}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-md ${
                    isApplyingFix
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-[#238636] hover:bg-[#2ea043] text-white"
                  }`}
                >
                  {isApplyingFix ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Merging Fix...</span>
                    </>
                  ) : (
                    <>
                      <GitCommit className="w-4 h-4" />
                      <span>Commit Fix &amp; Auto-Merge PR</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
          <span>Security Gatekeeper Policy: SOC-2 / ISO-27001 SMT Invariant Enforcement</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#21262d] text-white hover:bg-[#30363d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
