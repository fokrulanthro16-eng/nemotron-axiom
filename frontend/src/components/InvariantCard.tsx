"use client";

import React from "react";
import { Shield, CheckCircle, XCircle, Clock, AlertOctagon } from "lucide-react";
import { Invariant } from "@/types";

interface InvariantCardProps {
  invariants: Invariant[];
  isCertified: boolean;
}

export const InvariantCard: React.FC<InvariantCardProps> = ({
  invariants,
  isCertified,
}) => {
  if (!invariants || invariants.length === 0) {
    return (
      <div className="p-4 bg-zinc-950/80 border border-axiom-border rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-4 h-4 text-nvidia" />
          <h3 className="text-xs font-bold font-mono text-zinc-300">
            FORMAL MATHEMATICAL INVARIANTS (Z3 SMT CONSTRAINTS)
          </h3>
        </div>
        <p className="text-xs text-zinc-500 font-mono">
          No invariants inferred yet. Trigger verification to extract symbolic assertions via Nemotron-70B.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 p-3.5 bg-zinc-950/90 border border-axiom-border rounded-xl">
      <div className="flex items-center justify-between border-b border-axiom-border pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-nvidia" />
          <h3 className="text-xs font-bold font-mono text-zinc-200">
            FORMAL MATHEMATICAL INVARIANTS ({invariants.length} INFERRED)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Evaluated via Microsoft Z3 SMT Theorem Prover
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {invariants.map((inv, idx) => {
          const isSatisfied = isCertified || inv.status === "SAT";
          const isViolated = inv.status === "VIOLATED" || inv.status === "UNSAT";

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                isSatisfied
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                  : isViolated
                  ? "bg-rose-950/20 border-rose-500/40 text-rose-200"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[11px] truncate text-white" title={inv.name}>
                  {inv.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    inv.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : inv.severity === "HIGH"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {inv.severity}
                </span>
              </div>

              {/* SMT Math Formula */}
              <div className="my-1.5 p-1.5 rounded bg-black/40 border border-zinc-800/80 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                <code>{inv.formula}</code>
              </div>

              {/* Status and Targets */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60 text-[10px]">
                <span className="text-zinc-500 truncate max-w-[100px]" title={inv.target_entities?.join(", ")}>
                  {inv.target_entities?.length > 0
                    ? inv.target_entities.slice(0, 2).join(", ")
                    : "system"}
                </span>

                <div className="flex items-center space-x-1">
                  {isSatisfied ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">PROVEN SAT</span>
                    </>
                  ) : isViolated ? (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-400 font-bold">UNSAT CYCLE</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                      <span className="text-amber-400">PENDING</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
