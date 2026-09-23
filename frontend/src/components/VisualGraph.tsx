"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FileCode2,
  BrainCircuit,
  Search,
  ShieldCheck,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface VisualGraphProps {
  currentNode: string;
  isCertified: boolean;
  status: "IDLE" | "RUNNING" | "CERTIFIED" | "FAILED";
}

const nodeDescriptions: Record<string, { title: string; subtitle: string; icon: any }> = {
  AST_EXTRACT: {
    title: "1. AST & State Extractor",
    subtitle: "Parses locks & critical sections",
    icon: FileCode2,
  },
  NEMOTRON_INVARIANTS: {
    title: "2. Nemotron Invariant Engine",
    subtitle: "Infers safety invariants (70B)",
    icon: BrainCircuit,
  },
  TAVILY_SPEC_QUERY: {
    title: "3. Tavily Spec Grounding",
    subtitle: "Retrieves live RFC / PEP specs",
    icon: Search,
  },
  Z3_VERIFY: {
    title: "4. Z3 SMT Solver",
    subtitle: "SMT mathematical logic proof",
    icon: ShieldCheck,
  },
  RE_SYNTHESIZE: {
    title: "5. Nemotron Synthesizer",
    subtitle: "Surgically patches code",
    icon: RefreshCw,
  },
  STRESS_VALIDATE: {
    title: "6. Stress Sandbox",
    subtitle: "50-worker concurrent load test",
    icon: Zap,
  },
  COMPLETED: {
    title: "7. Provably Certified",
    subtitle: "Formal SAT correctness guarantee",
    icon: CheckCircle2,
  },
};

export const VisualGraph: React.FC<VisualGraphProps> = ({
  currentNode,
  isCertified,
  status,
}) => {
  const nodeIds = [
    "AST_EXTRACT",
    "NEMOTRON_INVARIANTS",
    "TAVILY_SPEC_QUERY",
    "Z3_VERIFY",
    "RE_SYNTHESIZE",
    "STRESS_VALIDATE",
    "COMPLETED",
  ];

  // Helper to determine node status
  const getNodeState = (id: string) => {
    if (id === currentNode && status === "RUNNING") return "ACTIVE";
    if (id === "Z3_VERIFY" && currentNode === "RE_SYNTHESIZE") return "VIOLATED";
    const currentIndex = nodeIds.indexOf(currentNode);
    const thisIndex = nodeIds.indexOf(id);

    if (isCertified) return "COMPLETED";
    if (currentIndex > thisIndex && thisIndex !== -1) return "COMPLETED";
    return "PENDING";
  };

  const nodes: Node[] = useMemo(() => {
    const layout = [
      { id: "AST_EXTRACT", x: 20, y: 30 },
      { id: "NEMOTRON_INVARIANTS", x: 250, y: 30 },
      { id: "TAVILY_SPEC_QUERY", x: 480, y: 30 },
      { id: "Z3_VERIFY", x: 710, y: 30 },
      { id: "RE_SYNTHESIZE", x: 710, y: 150 },
      { id: "STRESS_VALIDATE", x: 940, y: 30 },
      { id: "COMPLETED", x: 1170, y: 30 },
    ];

    return layout.map((item) => {
      const info = nodeDescriptions[item.id];
      const state = getNodeState(item.id);
      const Icon = info.icon;

      let borderStyle = "border-zinc-800 bg-zinc-950/90 text-zinc-400";
      let badge = null;

      if (state === "ACTIVE") {
        borderStyle =
          "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse";
        badge = (
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-300 font-mono">
            ACTIVE
          </span>
        );
      } else if (state === "COMPLETED") {
        borderStyle = "border-emerald-500/70 bg-emerald-950/30 text-emerald-300";
        badge = (
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-400 font-mono">
            PASSED
          </span>
        );
      } else if (state === "VIOLATED") {
        borderStyle =
          "border-rose-500 bg-rose-950/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
        badge = (
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-rose-500/20 text-rose-400 font-mono">
            UNSAT (CYCLE)
          </span>
        );
      }

      return {
        id: item.id,
        position: { x: item.x, y: item.y },
        data: {
          label: (
            <div className={`p-3 rounded-lg border text-left min-w-[190px] ${borderStyle}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono tracking-tight text-white">
                    {info.title}
                  </span>
                </div>
                {badge}
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                {info.subtitle}
              </p>
            </div>
          ),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [currentNode, isCertified, status]);

  const edges: Edge[] = useMemo(() => {
    const isLooping = currentNode === "RE_SYNTHESIZE" || currentNode === "Z3_VERIFY";

    return [
      {
        id: "e-ast-inv",
        source: "AST_EXTRACT",
        target: "NEMOTRON_INVARIANTS",
        animated: currentNode === "AST_EXTRACT",
        style: { stroke: "#3f3f46" },
      },
      {
        id: "e-inv-tav",
        source: "NEMOTRON_INVARIANTS",
        target: "TAVILY_SPEC_QUERY",
        animated: currentNode === "NEMOTRON_INVARIANTS",
        style: { stroke: "#3f3f46" },
      },
      {
        id: "e-tav-z3",
        source: "TAVILY_SPEC_QUERY",
        target: "Z3_VERIFY",
        animated: currentNode === "TAVILY_SPEC_QUERY",
        style: { stroke: "#3f3f46" },
      },
      {
        id: "e-z3-synth",
        source: "Z3_VERIFY",
        target: "RE_SYNTHESIZE",
        animated: isLooping,
        label: "Counterexample (UNSAT)",
        labelStyle: { fill: "#f43f5e", fontSize: 9, fontFamily: "monospace" },
        style: { stroke: "#f43f5e", strokeDasharray: "4 4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" },
      },
      {
        id: "e-synth-z3",
        source: "RE_SYNTHESIZE",
        target: "Z3_VERIFY",
        animated: isLooping,
        label: "Re-verify Patch",
        labelStyle: { fill: "#06b6d4", fontSize: 9, fontFamily: "monospace" },
        style: { stroke: "#06b6d4", strokeDasharray: "4 4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
      },
      {
        id: "e-z3-stress",
        source: "Z3_VERIFY",
        target: "STRESS_VALIDATE",
        animated: currentNode === "STRESS_VALIDATE" || isCertified,
        label: "SAT Proof",
        labelStyle: { fill: "#10b981", fontSize: 9, fontFamily: "monospace" },
        style: { stroke: isCertified ? "#10b981" : "#3f3f46" },
        markerEnd: { type: MarkerType.ArrowClosed, color: isCertified ? "#10b981" : "#3f3f46" },
      },
      {
        id: "e-stress-done",
        source: "STRESS_VALIDATE",
        target: "COMPLETED",
        animated: isCertified,
        style: { stroke: isCertified ? "#10b981" : "#3f3f46" },
        markerEnd: { type: MarkerType.ArrowClosed, color: isCertified ? "#10b981" : "#3f3f46" },
      },
    ];
  }, [currentNode, isCertified]);

  return (
    <div className="h-[210px] w-full bg-zinc-950/80 border border-axiom-border rounded-xl relative overflow-hidden">
      <div className="absolute top-2 left-3 z-10 flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
        <span className="inline-block w-2 h-2 rounded-full bg-nvidia animate-pulse"></span>
        <span className="font-semibold text-zinc-200">
          NEURO-SYMBOLIC PIPELINE GRAPH
        </span>
        <span className="text-zinc-600">|</span>
        <span>LangGraph Directed Acyclic State Machine</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        zoomOnScroll={false}
        panOnScroll={false}
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e2230" gap={16} size={1} />
        <Controls
          showInteractive={false}
          className="!bg-zinc-900 !border-zinc-800 !text-zinc-400"
        />
      </ReactFlow>
    </div>
  );
};
