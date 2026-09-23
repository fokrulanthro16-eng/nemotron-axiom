"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Shield,
  Zap,
  Building,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "free" | "pro" | "enterprise";
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = "pro",
}) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlan);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setCheckoutNotice(
      `Redirecting to Enterprise Stripe Sandbox for ${planName.toUpperCase()} Plan (${isAnnual ? "Annual" : "Monthly"})...`
    );
    setTimeout(() => {
      setCheckoutNotice(null);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-nvidia/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -z-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-nvidia/10 border border-nvidia/30 text-nvidia text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMERCIAL TIER SELECTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Autonomous Neuro-Symbolic Verification for Scale
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            From solo systems engineers to Fortune 500 infrastructure teams.
            Guarantee deadlock-free concurrency with mathematical certainty.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-6 inline-flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                !isAnnual
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                isAnnual
                  ? "bg-nvidia text-black font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-black/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {checkoutNotice && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono text-center animate-pulse">
            {checkoutNotice}
          </div>
        )}

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Developer Free */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Developer Free
                </span>
                <Zap className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                <span className="text-xs text-zinc-500 ml-1.5">/forever</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Ideal for individual researchers, open-source contributors, and concurrency hobbyists.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">100 formal verifications / month</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Public GitHub repositories only</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Z3 SMT Solver &amp; Nemotron-70B</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Community Discord support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan("free")}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-medium transition-all"
            >
              Current Active Plan
            </button>
          </div>

          {/* Tier 2: Team Pro (Featured) */}
          <div className="relative rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-nvidia/80 p-6 flex flex-col justify-between shadow-xl shadow-nvidia/5 hover:border-nvidia transition-all scale-[1.02]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-nvidia text-black text-[10px] font-mono font-bold tracking-wider uppercase">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-nvidia font-bold">
                  Team Pro
                </span>
                <Shield className="w-4 h-4 text-nvidia" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {isAnnual ? "$39" : "$49"}
                </span>
                <span className="text-xs text-zinc-400 ml-1.5">/seat/month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Engineered for high-velocity software engineering teams deploying distributed microservices.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-nvidia shrink-0 mt-0.5" />
                  <span className="text-white font-medium">Unlimited formal verifications</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-nvidia shrink-0 mt-0.5" />
                  <span className="text-white">Private GitHub / GitLab PR Gatekeeper</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-nvidia shrink-0 mt-0.5" />
                  <span className="text-white">Real 50-thread Chaos Concurrency Harness</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-nvidia shrink-0 mt-0.5" />
                  <span className="text-white">OASIS SARIF 2.1.0 &amp; SLSA L3 exports</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-nvidia shrink-0 mt-0.5" />
                  <span className="text-white">CLI distribution (`pip install axiom-sh`)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan("pro")}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-nvidia hover:bg-nvidia/90 text-black font-mono text-xs font-bold transition-all shadow-md shadow-nvidia/20 flex items-center justify-center space-x-1.5"
            >
              <span>Get Started with Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tier 3: Enterprise VPC */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  Enterprise VPC
                </span>
                <Building className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {isAnnual ? "$2,000" : "$2,500"}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5">/cluster/month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Dedicated on-prem or air-gapped Nebius/NVIDIA H100 sovereign deployment for zero telemetry leaks.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Dedicated Sovereign VPC / On-Premise</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Custom Domain SMT Axioms &amp; Invariants</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">SOC-2 Type II, ISO 27001, HIPAA attestation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">99.99% SLA &amp; 24/7 Named SRE Architect</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan("enterprise")}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-purple-900/40 hover:text-purple-300 border border-zinc-700 hover:border-purple-500/50 text-zinc-200 font-mono text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Contact Architecture Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
