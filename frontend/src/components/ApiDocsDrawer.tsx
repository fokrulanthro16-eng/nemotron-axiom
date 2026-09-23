"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Code2, Send, ExternalLink } from "lucide-react";

interface ApiDocsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsDrawer: React.FC<ApiDocsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"verify" | "stress" | "sarif">("verify");
  const [codeLang, setCodeLang] = useState<"curl" | "python">("curl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeSnippets = {
    verify: {
      curl: `curl -X POST "http://127.0.0.1:8000/api/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "def transfer(from_acc, to_acc, amount):\\n    with from_acc.lock:\\n        with to_acc.lock:\\n            from_acc.bal -= amount\\n            to_acc.bal += amount",
    "max_iterations": 3,
    "enable_tavily": true
  }'`,
      python: `import requests

payload = {
    "code": """
def transfer(from_acc, to_acc, amount):
    with from_acc.lock:
        with to_acc.lock:
            from_acc.bal -= amount
            to_acc.bal += amount
""",
    "max_iterations": 3,
    "enable_tavily": True,
}

response = requests.post("http://127.0.0.1:8000/api/verify", json=payload)
data = response.json()
print("Is Certified:", data["is_certified"])
print("Synthesized Patch:\\n", data["synthesized_code"])`,
    },
    stress: {
      curl: `curl -X POST "http://127.0.0.1:8000/api/stress-test" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input_code": "...",
    "synthesized_code": "..."
  }'`,
      python: `import requests

payload = {
    "input_code": open("flawed_service.py").read(),
    "synthesized_code": open("verified_service.py").read()
}

res = requests.post("http://127.0.0.1:8000/api/stress-test", json=payload)
telemetry = res.json()
print("Flawed deadlocks detected:", telemetry["target_flawed"]["deadlocks_detected"])
print("Verified throughput:", telemetry["target_verified"]["throughput_ops_per_sec"], "ops/sec")`,
    },
    sarif: {
      curl: `curl -X GET "http://127.0.0.1:8000/api/export-sarif" \\
  -H "Accept: application/json" \\
  -o axiom-results.sarif`,
      python: `import requests

res = requests.get("http://127.0.0.1:8000/api/export-sarif")
sarif_json = res.json()
with open("axiom-results.sarif", "w") as f:
    json.dump(sarif_json, f, indent=2)
print("Saved OASIS SARIF 2.1.0 standard report.")`,
    },
  };

  const currentSnippet = codeSnippets[activeTab][codeLang];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-nvidia/10 border border-nvidia/30 text-nvidia">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                AXIOM REST API Reference
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
                  v1.0-PROD
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Direct programmatic integration for CI/CD pipelines &amp; microservices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Endpoint Selector Tabs */}
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
            <button
              onClick={() => setActiveTab("verify")}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                activeTab === "verify"
                  ? "bg-zinc-800 text-nvidia border border-nvidia/40 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              POST /api/verify
            </button>
            <button
              onClick={() => setActiveTab("stress")}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                activeTab === "stress"
                  ? "bg-zinc-800 text-cyan-400 border border-cyan-500/40 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              POST /api/stress-test
            </button>
            <button
              onClick={() => setActiveTab("sarif")}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                activeTab === "sarif"
                  ? "bg-zinc-800 text-purple-400 border border-purple-500/40 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              GET /api/export-sarif
            </button>
          </div>

          {/* Endpoint Details */}
          <div>
            {activeTab === "verify" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    POST
                  </span>
                  <span className="text-sm font-mono text-white">/api/verify</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Executes end-to-end AST parsing, SMT invariant induction with Nemotron-70B, Z3 verification, and provable patch synthesis.
                </p>
              </div>
            )}

            {activeTab === "stress" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                    POST
                  </span>
                  <span className="text-sm font-mono text-white">/api/stress-test</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Fires a real 50-worker thread chaos harness concurrently testing the flawed code vs. the synthesized code, recording deadlocks, starvation, and latency percentiles.
                </p>
              </div>
            )}

            {activeTab === "sarif" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-mono font-bold">
                    GET
                  </span>
                  <span className="text-sm font-mono text-white">/api/export-sarif</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Exports OASIS SARIF v2.1.0 JSON payload compatible with GitHub Advanced Security, CodeQL, SonarQube, and CI gatekeepers.
                </p>
              </div>
            )}
          </div>

          {/* Language Selector & Code Box */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCodeLang("curl")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    codeLang === "curl"
                      ? "bg-zinc-800 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setCodeLang("python")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    codeLang === "python"
                      ? "bg-zinc-800 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Python SDK
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(currentSnippet, `${activeTab}-${codeLang}`)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-mono"
              >
                {copiedKey === `${activeTab}-${codeLang}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-zinc-200 whitespace-pre leading-relaxed">
                {currentSnippet}
              </pre>
            </div>
          </div>

          {/* Interactive Documentation Links */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-nvidia" />
              <div className="text-xs">
                <p className="font-semibold text-white">Swagger UI &amp; OpenAPI Spec</p>
                <p className="text-zinc-400">Interactive live sandbox documentation</p>
              </div>
            </div>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono transition-colors"
            >
              <span>Explore /docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Nemotron AXIOM OpenAPI v3.1</span>
          <span>Latency SLA: &lt;100ms</span>
        </div>
      </div>
    </div>
  );
};
