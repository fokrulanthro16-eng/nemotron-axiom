from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class VerificationRequest(BaseModel):
    code: str = Field(..., description="Target source code to analyze, formally verify, and synthesize")
    language: str = Field(default="python", description="Language of source code (default python)")
    max_iterations: int = Field(default=3, description="Maximum re-synthesis loops before termination")
    enable_tavily: bool = Field(default=True, description="Enable Tavily live specification grounding")


class ASTSummary(BaseModel):
    locks: List[str] = Field(default_factory=list)
    shared_variables: List[str] = Field(default_factory=list)
    critical_sections: List[Dict[str, Any]] = Field(default_factory=list)
    functions: List[str] = Field(default_factory=list)
    classes: List[str] = Field(default_factory=list)
    has_async: bool = False
    ast_nodes_count: int = 0


class Invariant(BaseModel):
    name: str
    formula: str
    target_entities: List[str] = Field(default_factory=list)
    severity: str = "HIGH"
    status: str = "PENDING"  # PENDING, SAT, UNSAT, VIOLATED


class TavilySpecCitation(BaseModel):
    title: str
    url: str
    snippet: str
    relevance_score: float = 0.95


class Z3Counterexample(BaseModel):
    violating_invariant: str
    trace: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: str
    mathematical_formula: str


class Z3VerificationResult(BaseModel):
    passed: bool
    status: str  # "SAT" (Safe/Proof verified), "UNSAT" (Constraint violated), "UNKNOWN"
    checked_invariants: List[Invariant] = Field(default_factory=list)
    counterexample: Optional[Z3Counterexample] = None
    solver_stats: Dict[str, Any] = Field(default_factory=dict)
    execution_time_ms: float = 0.0


class SynthesisPatch(BaseModel):
    synthesis_rationale: str
    formal_proof_sketch: str
    synthesized_code: str
    key_changes: List[str] = Field(default_factory=list)
    iteration: int = 1


class StressTestResult(BaseModel):
    executed: bool = True
    concurrent_threads: int = 50
    race_detected: bool = False
    deadlock_detected: bool = False
    passed: bool = True
    output: str = "Stress execution completed without deadlock or state corruption."


class TelemetryEvent(BaseModel):
    node: str  # e.g. "AST_EXTRACT", "NEMOTRON_INVARIANTS", "TAVILY_SPEC_QUERY", "Z3_VERIFY", "RE_SYNTHESIZE", "STRESS_VALIDATE"
    status: str  # "RUNNING", "COMPLETED", "FAILED", "WARNING"
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: float = 0.0


class VerificationResponse(BaseModel):
    success: bool
    certified: bool
    iterations_used: int
    original_code: str
    final_code: str
    ast_summary: ASTSummary
    invariants: List[Invariant]
    z3_result: Z3VerificationResult
    tavily_citations: List[TavilySpecCitation] = Field(default_factory=list)
    synthesis_patches: List[SynthesisPatch] = Field(default_factory=list)
    stress_test: Optional[StressTestResult] = None
    telemetry_logs: List[TelemetryEvent] = Field(default_factory=list)


class StressRunMetrics(BaseModel):
    status: str  # "DEADLOCK_TIMEOUT" | "SUCCESS_ZERO_DEFECT" | "RACE_CORRUPTION"
    completed_threads: int
    total_threads: int = 50
    deadlock_detected: bool
    timeout_seconds: float = 2.0
    duration_ms: float
    p50_latency_ms: float
    p99_latency_ms: float
    success_rate_percent: float
    active_frozen_threads: int
    thread_starvation_count: int
    execution_log: List[str] = Field(default_factory=list)


class StressTestComparisonRequest(BaseModel):
    flawed_code: str
    verified_code: str
    concurrent_workers: int = 50
    timeout_seconds: float = 2.0


class StressTestComparisonResponse(BaseModel):
    target_flawed: StressRunMetrics
    target_verified: StressRunMetrics
    speedup_factor: float
    concurrency_guarantee: str
    timestamp: float
