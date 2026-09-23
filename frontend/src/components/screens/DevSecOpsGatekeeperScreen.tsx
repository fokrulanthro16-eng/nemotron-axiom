"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Shield,
  Download,
  FileCode,
  Lock,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Terminal,
} from "lucide-react";

interface DevSecOpsGatekeeperScreenProps {
  isCertified: boolean;
  synthesizedCode: string;
}

export const DevSecOpsGatekeeperScreen: React.FC<DevSecOpsGatekeeperScreenProps> = ({
  isCertified,
  synthesizedCode,
}) => {
  const [activeTab, setActiveTab] = useState<"pr" | "sarif" | "slsa">("pr");
  const [isMerged, setIsMerged] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const mockSarif = {
    version: "2.1.0",
    $schema: "https://docs.oasis-open.org/sarif/sarif/v2.1.0/os/schemas/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "Nemotron AXIOM Formal SMT Verifier",
            version: "1.0.0-PROD",
            informationUri: "https://github.com/fokrulanthro16-eng/nemotron-axiom",
            rules: [
              {
                id: "AXIOM-001",
                name: "CyclicLockDependency",
                shortDescription: {
                  text: "Deadlock hazard: Circular wait dependency detected across concurrent thread lock acquisition.",
                },
                defaultConfiguration: {
                  level: "error",
                },
              },
              {
                id: "AXIOM-002",
                name: "UnshieldedCoroutineYield",
                shortDescription: {
                  text: "Race condition: Shared mutable state accessed across asynchronous suspension point without barrier.",
                },
                defaultConfiguration: {
                  level: "warning",
                },
              },
            ],
          },
        },
        results: isCertified
          ? []
          : [
              {
                ruleId: "AXIOM-001",
                level: "error",
                message: {
                  text: "Z3 SMT Invariant Refuted: Thread-1 and Thread-2 form cyclic wait on Account_1.lock and Account_2.lock.",
                },
                locations: [
                  {
                    physicalLocation: {
                      artifactLocation: {
                        uri: "demo_samples/deadlock_banking.py",
                      },
                      region: {
                        startLine: 27,
                        endLine: 29,
                      },
                    },
                  },
                ],
              },
            ],
      },
    ],
  };

  const copySha = () => {
    navigator.clipboard.writeText("cf3acadbaa87c4f9feb167ecd5f2418d9aa7dfa269b19191adb58beb320aab9e");
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const downloadSarif = () => {
    const blob = new Blob([JSON.stringify(mockSarif, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "axiom-compliance.sarif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white font-mono">
                DevSecOps Formal Gatekeeper &amp; Audit Suite
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                OASIS SARIF 2.1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Automated PR checks, SLSA Level 3 cryptographic attestation receipts, and GitHub Advanced Security integration
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab("pr")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === "pr"
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            GitHub PR Widget
          </button>
          <button
            onClick={() => setActiveTab("sarif")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === "sarif"
                ? "bg-zinc-800 text-cyan-400 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            SARIF 2.1.0 Viewer
          </button>
          <button
            onClick={() => setActiveTab("slsa")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === "slsa"
                ? "bg-zinc-800 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            SLSA L3 Attestation
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "pr" && (
        <div className="rounded-xl bg-[#0d1117] border border-[#30363d] overflow-hidden shadow-2xl">
          {/* PR Header */}
          <div className="p-6 border-b border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                feat(banking): high-contention concurrent balance transfers
                <span className="text-[#8b949e] font-normal">#142</span>
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium font-sans flex items-center gap-1.5 ${
                  isMerged
                    ? "bg-[#8957e5]/20 text-[#a371f7] border border-[#8957e5]/40"
                    : "bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40"
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>{isMerged ? "Merged" : "Open"}</span>
              </span>
            </div>

            <div className="text-xs text-[#8b949e] font-sans flex items-center space-x-2">
              <span className="text-[#58a6ff] font-semibold">fokrulanthro16-eng</span>
              <span>wants to merge 3 commits into</span>
              <code className="px-1.5 py-0.5 rounded bg-[#161b22] text-[#58a6ff] font-mono text-[11px]">
                main
              </code>
              <span>from</span>
              <code className="px-1.5 py-0.5 rounded bg-[#161b22] text-[#58a6ff] font-mono text-[11px]">
                feat/concurrency-transfers
              </code>
            </div>
          </div>

          {/* CI Status Checks Card */}
          <div className="p-6 border-b border-[#30363d] bg-[#161b22]/50">
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isCertified || isMerged ? (
                  <CheckCircle2 className="w-5 h-5 text-[#3fb950]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#f85149]" />
                )}
                <div>
                  <p className="text-xs font-semibold text-white font-sans">
                    Checks / AXIOM Neuro-Symbolic Gatekeeper —{" "}
                    {isCertified || isMerged ? (
                      <span className="text-[#3fb950]">PASSED (SLSA L3 Certified)</span>
                    ) : (
                      <span className="text-[#f85149]">FAILED (Deadlock Invariant Refuted)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#8b949e]">
                    {isCertified || isMerged
                      ? "All First-Order Logic SMT invariants satisfied. Canonical lock DAG verified sound."
                      : "Z3 solver detected cyclic Coffman dependency. Deployment blocked until patch is merged."}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadSarif}
                  className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-sans transition-colors flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SARIF Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bot Comment Widget */}
          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-nvidia flex items-center justify-center text-[10px] font-bold text-black">
                    A
                  </div>
                  <span className="text-xs font-bold text-white font-mono">axiom-enterprise[bot]</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#30363d] text-[#8b949e]">bot</span>
                </div>
                <span className="text-[11px] text-[#8b949e]">commented via GitHub Actions</span>
              </div>

              <div className="p-4 space-y-3 text-xs text-[#c9d1d9]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🛡️ Formal SMT Gatekeeper Review
                </h3>
                <p>
                  The neuro-symbolic verification engine evaluated this pull request using Microsoft Z3 SMT Theorem Prover and NVIDIA Nemotron-70B on Nebius Token Factory.
                </p>

                <div className="p-3 rounded bg-[#0d1117] border border-[#30363d] font-mono text-[11px] space-y-1">
                  <div className="text-[#58a6ff]"># SMT Proof Summary:</div>
                  <div>Status: <span className="text-[#3fb950] font-bold">100% SAT (Certified Safe)</span></div>
                  <div>Invariant: <span className="text-white">Global Canonical Monotonic Lock Order</span></div>
                  <div>SLSA Signature: <span className="text-[#a371f7]">ax-sig-ed25519-1d1223eddb73d0da65eba8ebb2d84543</span></div>
                </div>

                {/* Auto-Merge Simulator Action */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setIsMerged(true)}
                    disabled={isMerged}
                    className={`px-4 py-2 rounded-md font-sans text-xs font-bold transition-all flex items-center space-x-2 ${
                      isMerged
                        ? "bg-[#21262d] text-[#8b949e] cursor-not-allowed"
                        : "bg-[#238636] hover:bg-[#2ea043] text-white shadow-sm"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{isMerged ? "✓ Pull Request Merged into main" : "Commit Fix & Auto-Merge PR"}</span>
                  </button>

                  <span className="text-[11px] text-[#8b949e]">
                    Commit: <code className="text-[#58a6ff]">bea5821</code> (verified)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SARIF Viewer Tab */}
      {activeTab === "sarif" && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                OASIS SARIF 2.1.0 Inspection Stream
              </h2>
              <p className="text-xs text-zinc-400">
                Standard format for GitHub Advanced Security, CodeQL, SonarQube, and CI gatekeepers
              </p>
            </div>
            <button
              onClick={downloadSarif}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .sarif</span>
            </button>
          </div>

          <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto max-h-[460px]">
            <pre className="text-zinc-200 whitespace-pre leading-relaxed">
              {JSON.stringify(mockSarif, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* SLSA L3 Attestation Tab */}
      {activeTab === "slsa" && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                SLSA Provenance (Level 3) Cryptographic Receipt
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  SOC-2 / ISO-27001
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Cryptographic proof linking target source code to SMT theorem verification and AI patch synthesis
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copySha}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors flex items-center space-x-1.5"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSha ? "Copied SHA!" : "Copy Digest"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-zinc-500 block text-[10px]">Artifact SHA-256 Digest</span>
              <code className="text-cyan-400 text-xs break-all block">
                cf3acadbaa87c4f9feb167ecd5f2418d9aa7dfa269b19191adb58beb320aab9e
              </code>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-zinc-500 block text-[10px]">Ed25519 Cryptographic Signature</span>
              <code className="text-purple-400 text-xs break-all block">
                ax-sig-ed25519-1d1223eddb73d0da65eba8ebb2d84543
              </code>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 block text-[10px]">Hermetic Solver Environment</span>
              <span className="text-white font-bold">Microsoft Z3 SMT v4.13 (Docker Isolated)</span>
              <span className="text-zinc-500 text-[11px] block">Non-root execution (appuser:10001)</span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 block text-[10px]">Compliance Attestation</span>
              <span className="text-emerald-400 font-bold">PROVABLY CORRECT &amp; AUDITED</span>
              <span className="text-zinc-500 text-[11px] block">Safe for automated continuous deployment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
