"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  GitPullRequest,
  Activity,
  BookOpen,
  Sparkles,
} from "lucide-react";

export type ScreenId =
  | "verification"
  | "chaos"
  | "gatekeeper"
  | "benchmarks"
  | "grounding";

interface NavigationTabsProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  isCertified: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeScreen,
  onSelectScreen,
  isCertified,
}) => {
  const tabs = [
    {
      id: "verification" as ScreenId,
      name: "Verification Studio",
      icon: ShieldCheck,
      badge: isCertified ? "PROVEN" : "SMT",
      badgeColor: isCertified ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      id: "chaos" as ScreenId,
      name: "Chaos Concurrency Lab",
      icon: Zap,
      badge: "50 WORKERS",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    {
      id: "gatekeeper" as ScreenId,
      name: "CI/CD Gatekeeper",
      icon: GitPullRequest,
      badge: "SARIF 2.1.0",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      id: "benchmarks" as ScreenId,
      name: "Benchmarks",
      icon: Activity,
      badge: "H100 SXM5",
      badgeColor: "bg-nvidia/20 text-nvidia border-nvidia/30",
    },
    {
      id: "grounding" as ScreenId,
      name: "RFC Knowledge Explorer",
      icon: BookOpen,
      badge: "TAVILY",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
  ];

  return (
    <div className="w-full bg-zinc-950/80 border-b border-zinc-800/80 px-4 sm:px-6 py-2 sticky top-[49px] z-40 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5">
        <nav className="flex items-center space-x-1.5 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectScreen(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-nvidia" : "text-zinc-500"
                  }`}
                />
                <span>{tab.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full border ${tab.badgeColor} font-semibold uppercase tracking-wider`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Global certification indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-zinc-400 pl-4 border-l border-zinc-800">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCertified ? "bg-emerald-400" : "bg-purple-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isCertified ? "bg-emerald-400" : "bg-purple-400"
              }`}
            />
          </span>
          <span className="text-zinc-300">
            {isCertified ? "Z3 SAT (Monotonic Acyclic DAG)" : "Z3 Active Theorem Prover"}
          </span>
        </div>
      </div>
    </div>
  );
};
