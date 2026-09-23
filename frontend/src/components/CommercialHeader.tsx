"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Sparkles, Building, Code2, Server } from "lucide-react";

interface CommercialHeaderProps {
  onOpenPricing: () => void;
  onOpenApiDocs: () => void;
  onOpenVpc?: () => void;
}

export const CommercialHeader: React.FC<CommercialHeaderProps> = ({
  onOpenPricing,
  onOpenApiDocs,
  onOpenVpc,
}) => {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("pip install axiom-sh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Cluster & SRE Health Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-zinc-400">
          <Server className="w-3.5 h-3.5 text-nvidia" />
          <span className="font-mono font-medium text-zinc-300">
            Nebius H100 GPU Cluster
          </span>
          <span className="text-zinc-600">|</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            99.99% Uptime (Zero Deadlocks)
          </span>
        </div>
      </div>

      {/* CLI Quick-Install Chip & Commercial CTAs */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* CLI Install Chip */}
        <div
          onClick={copyInstallCommand}
          title="Click to copy CLI command"
          className="group flex items-center space-x-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-nvidia/50 rounded-lg px-2.5 py-1 cursor-pointer transition-all duration-150 shadow-sm"
        >
          <Terminal className="w-3.5 h-3.5 text-nvidia" />
          <code className="font-mono text-zinc-200 text-[11px]">pip install axiom-sh</code>
          <button className="text-zinc-400 group-hover:text-nvidia transition-colors ml-1 p-0.5">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {copied && (
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Copied!</span>
          )}
        </div>

        {/* API Docs Button */}
        <button
          onClick={onOpenApiDocs}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/70 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors font-medium text-[11px]"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>API Reference</span>
        </button>

        {/* Enterprise VPC Link */}
        <button
          onClick={onOpenVpc || onOpenPricing}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/60 border border-purple-500/30 text-purple-300 hover:text-purple-200 hover:border-purple-500/60 transition-colors font-medium text-[11px]"
        >
          <Building className="w-3.5 h-3.5 text-purple-400" />
          <span>Enterprise VPC</span>
        </button>

        {/* Upgrade to Pro CTA */}
        <button
          onClick={onOpenPricing}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-nvidia/90 to-emerald-600 hover:from-nvidia hover:to-emerald-500 text-black font-semibold text-[11px] shadow-sm shadow-nvidia/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Upgrade to Pro</span>
        </button>
      </div>
    </div>
  );
};
