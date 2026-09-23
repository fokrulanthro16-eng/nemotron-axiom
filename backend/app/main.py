import json
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from typing import Dict, Any
from app.core.config import settings
from app.core.nebius_client import nebius_client
from app.engine.tavily_intel import tavily_intel
from app.engine.state_graph import workflow
from app.engine.stress_harness import chaos_harness
from app.engine.sarif_exporter import sarif_exporter
from app.models.schemas import (
    VerificationRequest,
    VerificationResponse,
    StressTestComparisonRequest,
    StressTestComparisonResponse,
)

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_SUBTITLE,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "version": settings.VERSION,
        "status": "ONLINE",
        "nebius_token_factory": {
            "model": settings.NEMOTRON_MODEL,
            "base_url": settings.NEBIUS_BASE_URL,
            "connected": nebius_client.is_live,
            "mode": "LIVE_API" if nebius_client.is_live else "DETERMINISTIC_EMULATION"
        },
        "tavily_intel": {
            "connected": tavily_intel.is_live,
            "mode": "LIVE_API" if tavily_intel.is_live else "CURATED_STANDARDS"
        },
        "formal_solver": "Microsoft Z3 SMT Theorem Prover v4.13"
    }


@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health check endpoint for Docker container orchestration and load balancers."""
    return {
        "status": "healthy",
        "service": "axiom-backend",
        "solver": "Z3-SMT-4.13",
        "nebius_connected": nebius_client.is_live,
    }


@app.post("/api/verify", response_model=VerificationResponse)
def verify_code(request: VerificationRequest):
    """
    Synchronous verification endpoint.
    Executes AST parsing, Invariant deduction, Tavily spec query, Z3 solver,
    and Nemotron re-synthesis loop.
    """
    try:
        response = workflow.run_sync(
            code=request.code,
            max_iterations=request.max_iterations,
            enable_tavily=request.enable_tavily
        )
        return response
    except Exception as e:
        logger.error(f"Verification pipeline failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stress-test", response_model=StressTestComparisonResponse)
def execute_chaos_stress_test(request: StressTestComparisonRequest):
    """
    Executes the Real Runtime Chaos Stress-Harness on both flawed and verified code targets.
    Simulates concurrent worker threads (e.g. 50 workers), records deadlock freezes,
    latency percentiles (p50, p99), and success rates.
    """
    try:
        result = chaos_harness.run_comparison(
            flawed_code=request.flawed_code,
            verified_code=request.verified_code,
            workers=request.concurrent_workers,
            timeout_seconds=request.timeout_seconds,
        )
        return result
    except Exception as e:
        logger.error(f"Chaos stress test failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/export-sarif")
def export_sarif_get():
    """Generates standard OASIS SARIF 2.1.0 output for GitHub Advanced Security & SonarQube."""
    samples = get_sample_codes()
    deadlock_code = samples["deadlock_transfer"]["code"]
    report = sarif_exporter.generate_sarif_report(
        code=deadlock_code,
        is_certified=False,
        invariants=[],
        counterexample={
            "violating_invariant": "Circular Lock Dependency Deadlock",
            "mathematical_formula": "UNSAT: ∃ t1, t2 : WaitsFor(t1, t2) ∧ WaitsFor(t2, t1)",
            "trace": [
                {"thread": "Worker-1", "action": "Acquires lock Account_1.lock"},
                {"thread": "Worker-2", "action": "Acquires lock Account_2.lock"},
                {"thread": "Worker-1", "action": "Blocked waiting for Account_2.lock"},
                {"thread": "Worker-2", "action": "Blocked waiting for Account_1.lock"}
            ]
        }
    )
    return report


@app.post("/api/export-sarif")
def export_sarif_post(request: Dict[str, Any]):
    """Generates SARIF 2.1.0 from custom code and counterexample state."""
    code = request.get("code", "")
    is_certified = request.get("is_certified", False)
    counterexample = request.get("counterexample")
    invariants = request.get("invariants", [])
    return sarif_exporter.generate_sarif_report(
        code=code,
        is_certified=is_certified,
        invariants=invariants,
        counterexample=counterexample
    )


@app.get("/api/export-provenance")
def export_provenance_get():
    """Generates SLSA Provenance Level 3 Cryptographic Attestation with SHA-256 signatures."""
    samples = get_sample_codes()
    return sarif_exporter.generate_cryptographic_attestation(
        code=samples["deadlock_transfer"]["code"],
        is_certified=True,
        synthesized_code="# Certified by Nemotron-70B\nmin(id1, id2).acquire()\n"
    )


@app.post("/api/export-provenance")
def export_provenance_post(request: Dict[str, Any]):
    return sarif_exporter.generate_cryptographic_attestation(
        code=request.get("code", ""),
        is_certified=request.get("is_certified", True),
        synthesized_code=request.get("synthesized_code")
    )


@app.post("/api/stream-verify")
async def stream_verify_code(request: VerificationRequest):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint.
    Emits live telemetry steps, AST extractions, Z3 counterexamples,
    Tavily search citations, and Nemotron code synthesis diffs.
    """
    async def event_publisher():
        try:
            # Run generator in non-blocking async manner with slight pacing for UI realism
            for event, state in workflow.run_generator(
                code=request.code,
                max_iterations=request.max_iterations,
                enable_tavily=request.enable_tavily
            ):
                payload = {
                    "event": event.model_dump(),
                    "state_summary": {
                        "iteration": state["iteration"],
                        "is_certified": state["is_certified"],
                        "current_code": state["current_code"],
                        "invariants_count": len(state["invariants"]),
                        "citations_count": len(state["tavily_citations"])
                    }
                }
                yield {
                    "event": "telemetry",
                    "data": json.dumps(payload)
                }
                # Pacing between steps so frontend animation transitions smoothly
                await asyncio.sleep(0.4)

            yield {
                "event": "done",
                "data": json.dumps({"status": "FINISHED"})
            }
        except Exception as e:
            logger.error(f"SSE stream failed: {e}", exc_info=True)
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_publisher())


@app.get("/api/samples")
def get_sample_codes():
    """
    Returns pre-loaded canonical concurrency bug samples for one-click evaluation.
    """
    deadlock_sample = (
        "import threading\n"
        "import time\n\n"
        "class Account:\n"
        "    def __init__(self, account_id: int, balance: float):\n"
        "        self.id = account_id\n"
        "        self.balance = balance\n"
        "        self.lock = threading.Lock()\n\n"
        "def transfer(from_acc: Account, to_acc: Account, amount: float):\n"
        "    # Concurrency Bug: Inconsistent lock acquisition order causes circular wait!\n"
        "    with from_acc.lock:\n"
        "        time.sleep(0.01)  # Context switch window\n"
        "        with to_acc.lock:\n"
        "            if from_acc.balance >= amount:\n"
        "                from_acc.balance -= amount\n"
        "                to_acc.balance += amount\n"
    )

    race_sample = (
        "import asyncio\n"
        "from typing import Any, Dict\n\n"
        "class AsyncWorkerCache:\n"
        "    def __init__(self):\n"
        "        self.cache: Dict[str, Any] = {}\n\n"
        "    async def get_or_compute(self, key: str, compute_coro) -> Any:\n"
        "        # Concurrency Bug: Read-modify-write race condition across await yield!\n"
        "        if key in self.cache:\n"
        "            return self.cache[key]\n"
        "        \n"
        "        # Cooperative yield exposes state window without atomic lock\n"
        "        data = await compute_coro()\n"
        "        self.cache[key] = data\n"
        "        return data\n"
    )

    return {
        "deadlock_transfer": {
            "title": "Deadlock in Concurrent Bank Transfer",
            "description": "Cyclic wait hazard (Coffman Condition #4) caused by unsorted lock acquisition.",
            "language": "python",
            "code": deadlock_sample
        },
        "race_condition_cache": {
            "title": "Async Worker Cache Race Condition",
            "description": "Unsynchronized check-then-act cache update with yield point causing data corruption.",
            "language": "python",
            "code": race_sample
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
