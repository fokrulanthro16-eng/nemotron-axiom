export interface Invariant {
  name: string;
  formula: string;
  target_entities: string[];
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "SAT" | "UNSAT" | "VIOLATED";
}

export interface ASTSummary {
  locks: string[];
  shared_variables: string[];
  critical_sections: Array<{
    function: string;
    lock: string;
    is_async: boolean;
    lineno: number;
    parent_locks: string[];
  }>;
  functions: string[];
  classes: string[];
  has_async: boolean;
  ast_nodes_count: number;
}

export interface TavilySpecCitation {
  title: string;
  url: string;
  snippet: string;
  relevance_score: number;
}

export interface CounterexampleTraceItem {
  step?: number;
  time?: number;
  thread: string;
  action: string;
  held_locks?: string[];
  waiting_for?: string;
}

export interface Z3Counterexample {
  violating_invariant: string;
  trace: CounterexampleTraceItem[];
  explanation: string;
  mathematical_formula: string;
}

export interface Z3VerificationResult {
  passed: boolean;
  status: "SAT" | "UNSAT" | "UNKNOWN";
  checked_invariants: Invariant[];
  counterexample?: Z3Counterexample | null;
  solver_stats: Record<string, any>;
  execution_time_ms: number;
}

export interface SynthesisPatch {
  synthesis_rationale: string;
  formal_proof_sketch: string;
  synthesized_code: string;
  key_changes: string[];
  iteration: number;
}

export interface StressRunMetrics {
  status: "DEADLOCK_TIMEOUT" | "SUCCESS_ZERO_DEFECT" | "RACE_CORRUPTION" | string;
  completed_threads: number;
  total_threads: number;
  deadlock_detected: boolean;
  timeout_seconds: number;
  duration_ms: number;
  p50_latency_ms: number;
  p99_latency_ms: number;
  success_rate_percent: number;
  active_frozen_threads: number;
  thread_starvation_count: number;
  execution_log: string[];
}

export interface StressTestComparisonResponse {
  target_flawed: StressRunMetrics;
  target_verified: StressRunMetrics;
  speedup_factor: number;
  concurrency_guarantee: string;
  timestamp: number;
}

export interface StressTestResult {
  executed: boolean;
  concurrent_threads: number;
  race_detected: boolean;
  deadlock_detected: boolean;
  passed: boolean;
  output: string;
}

export interface TelemetryEvent {
  node: string;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "WARNING";
  message: string;
  data?: Record<string, any>;
  timestamp: number;
}

export interface StreamMessage {
  event: TelemetryEvent;
  state_summary?: {
    iteration: number;
    is_certified: boolean;
    current_code: string;
    invariants_count: number;
    citations_count: number;
  };
}

export interface SampleCode {
  title: string;
  description: string;
  language: string;
  code: string;
}
