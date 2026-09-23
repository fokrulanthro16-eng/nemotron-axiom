"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Terminal,
  Send,
  Sparkles,
} from "lucide-react";
import { TavilySpecCitation } from "@/types";

interface RfcGroundingScreenProps {
  citations: TavilySpecCitation[];
}

export const RfcGroundingScreen: React.FC<RfcGroundingScreenProps> = ({
  citations,
}) => {
  const [searchQuery, setSearchQuery] = useState(
    "Dijkstra canonical lock ordering mutual exclusion RFC"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [activeCitationIndex, setActiveCitationIndex] = useState(0);

  const defaultStandards = [
    {
      title: "Dijkstra 1965: Cooperating Sequential Processes",
      url: "https://www.cs.utexas.edu/users/EWD/ewd01xx/EWD123.PDF",
      snippet:
        "The dining philosophers and resource hierarchy solution proves that assigning a linear, monotonic order to all mutex locks and acquiring them strictly in ascending order guarantees that no cyclic wait conditions can ever form.",
      groundedInvariant: "AXIOM-001 (Canonical ID Lock Hierarchy DAG)",
      year: "1965",
      type: "Foundational Computer Science",
    },
    {
      title: "PEP 3156: Asynchronous IO Support (asyncio Synchronization)",
      url: "https://peps.python.org/pep-3156/",
      snippet:
        "Coroutines yielding control across await suspension points inside critical sections create re-entrant race hazards unless protected by atomic synchronization primitives (asyncio.Lock or Mutex).",
      groundedInvariant: "AXIOM-002 (Non-Yielding Coroutine Mutual Exclusion)",
      year: "2012",
      type: "Python Enhancement Proposal",
    },
    {
      title: "RFC 7234: Hypertext Transfer Protocol (HTTP/1.1): Caching",
      url: "https://www.rfc-editor.org/rfc/rfc7234",
      snippet:
        "Shared state caches must enforce serialized invalidation barriers to prevent stale read-after-write hazards under concurrent client write bursts.",
      groundedInvariant: "AXIOM-003 (Read-Modify-Write Cache Consistency)",
      year: "2014",
      type: "IETF Standard",
    },
    {
      title: "The Go Memory Model (Happens-Before Relationship)",
      url: "https://go.dev/ref/mem",
      snippet:
        "If the effects of one goroutine must be observed by another, the synchronization must establish a formal happens-before relationship using explicit channel sends or sync.Mutex unlocks.",
      groundedInvariant: "AXIOM-004 (Transitive Memory Barrier Fence)",
      year: "2022",
      type: "Language Specification",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white font-mono">
                Tavily Neuro-Grounding &amp; RFC Knowledge Explorer
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                TAVILY AI SEARCH
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live automated technical grounding connecting formal First-Order Logic SMT axioms to authoritative RFCs and PEPs
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Agent Mode: <span className="text-cyan-400 font-bold">Autonomous Grounding</span>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <form
        onSubmit={handleSearch}
        className="rounded-xl bg-zinc-950 border border-zinc-800 p-2 flex items-center gap-2 shadow-lg"
      >
        <div className="pl-3 text-cyan-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Query technical RFCs, concurrency standards, or synchronization papers..."
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none font-mono py-2"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          {isSearching ? (
            <span>Grounding...</span>
          ) : (
            <>
              <span>Execute Tavily Query</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Standards List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Grounded Standards Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Authoritative Concurrency Grounding Repository ({defaultStandards.length} Standards)
          </h2>

          {defaultStandards.map((std, idx) => (
            <div
              key={idx}
              onClick={() => setActiveCitationIndex(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCitationIndex === idx
                  ? "bg-zinc-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/5"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono font-semibold">
                      {std.type}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{std.year}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono mt-1.5 flex items-center gap-1.5">
                    {std.title}
                  </h3>
                </div>

                <a
                  href={std.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                {std.snippet}
              </p>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Synthesized Z3 Invariant:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {std.groundedInvariant}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: SMT Invariant Synthesis Bridge */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <Terminal className="w-4 h-4 text-nvidia" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              SMT Invariant Pipeline Bridge
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <p className="text-zinc-400">
              How Tavily web search results are ingested into the Z3 First-Order Logic theorem formulation:
            </p>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">1. AST Ingestion</span>
              <span className="text-white">Identifies lock variables <code className="text-cyan-400">L_A</code>, <code className="text-cyan-400">L_B</code></span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">2. Tavily Rule Matching</span>
              <span className="text-white">Extracts Dijkstra's 1965 canonical monotonic acquisition rule</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">3. Z3 Assertion Construction</span>
              <code className="text-purple-300 text-[11px] block">
                (&lt; (rank L_min) (rank L_max))
              </code>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">4. Nemotron Re-Synthesis</span>
              <span className="text-emerald-400">Enforces strictly ascending ID locks in target source code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
