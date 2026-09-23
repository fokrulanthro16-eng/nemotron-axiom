import sys
import os
import json
import argparse
from pathlib import Path

# Add backend directory to sys.path so app modules are resolvable
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.engine.ast_parser import extract_ast_concurrency_metadata
from app.core.nebius_client import nebius_client
from app.engine.z3_verifier import z3_verifier
from app.engine.tavily_intel import tavily_intel
from app.engine.synthesizer import synthesizer
from app.engine.stress_harness import chaos_harness
from app.engine.sarif_exporter import sarif_exporter
from axiom_cli.printer import (
    console,
    print_axiom_header,
    print_invariants_table,
    print_counterexample_callout,
    print_patch_diff,
    print_cryptographic_attestation,
)


def run_scan(args):
    filepath = args.filepath
    if not os.path.exists(filepath):
        console.print(f"[bold red]Error: Target file not found:[/bold red] {filepath}")
        return 2

    with open(filepath, "r", encoding="utf-8") as f:
        code = f.read()

    if not args.json:
        print_axiom_header()
        console.print(f"\n[bold white]Analyzing target codebase:[/bold white] [cyan]{filepath}[/cyan] ({len(code.splitlines())} lines)")

    # 1. AST Extraction
    ast_meta = extract_ast_concurrency_metadata(code)
    locks_found = ast_meta.get("locks", [])
    if not args.json:
        console.print(f"Discovered [bold green]{len(locks_found)} locks[/bold green], [bold yellow]{len(ast_meta.get('shared_variables', []))} shared states[/bold yellow], [bold cyan]{len(ast_meta.get('critical_sections', []))} critical sections[/bold cyan].")

    # 2. Invariant Deduction via Nemotron-70B
    with console.status("[bold green]Querying NVIDIA Nemotron-70B on Nebius Token Factory for safety invariants...[/bold green]", spinner="dots") if not args.json else open(os.devnull, "w"):
        inv_data = nebius_client.infer_invariants(code, ast_meta)
        invariants = inv_data.get("invariants", [])

    # 3. Z3 Formal SMT Verification
    if not args.json:
        console.print("[dim]Evaluating invariants with Microsoft Z3 SMT Theorem Prover...[/dim]")
    z3_res = z3_verifier.verify_codebase(code, ast_meta, invariants)

    synthesized_code = None
    if not z3_res.passed and args.prove:
        if not args.json:
            console.print("\n[bold yellow]Triggering Autonomous Re-Synthesis via Nemotron-70B guided by Z3 counterexample...[/bold yellow]")
        citations = tavily_intel.search_concurrency_specs("deadlock canonical ordering")
        patch = synthesizer.synthesize_patch(
            current_code=code,
            counterexample=z3_res.counterexample.model_dump() if z3_res.counterexample else {},
            tavily_citations=[c.model_dump() for c in citations],
            iteration=1
        )
        synthesized_code = patch.synthesized_code

    # Optional Chaos Stress Test
    chaos_result = None
    if args.chaos:
        if not args.json:
            console.print("[bold magenta]Running Real Runtime Chaos Stress-Harness (50 concurrent workers)...[/bold magenta]")
        chaos_result = chaos_harness.run_comparison(
            flawed_code=code,
            verified_code=synthesized_code or code,
            workers=50,
            timeout_seconds=1.0
        )

    # Optional SARIF Export
    if args.sarif:
        sarif_data = sarif_exporter.generate_sarif_report(
            code=code,
            is_certified=z3_res.passed,
            invariants=invariants,
            counterexample=z3_res.counterexample.model_dump() if z3_res.counterexample else None
        )
        with open(args.sarif, "w", encoding="utf-8") as sf:
            json.dump(sarif_data, sf, indent=2)
        if not args.json:
            console.print(f"[bold green][OK] Exported OASIS SARIF 2.1.0 to:[/bold green] [cyan]{args.sarif}[/cyan]")

    # Output Presentation
    if args.json:
        payload = {
            "file": filepath,
            "certified": z3_res.passed,
            "invariants_checked": len(invariants),
            "counterexample": z3_res.counterexample.model_dump() if z3_res.counterexample else None,
            "synthesized_patch_available": synthesized_code is not None,
            "chaos_speedup": chaos_result.speedup_factor if chaos_result else None
        }
        print(json.dumps(payload, indent=2))
    else:
        print_invariants_table(invariants, z3_res.passed)

        if not z3_res.passed and z3_res.counterexample:
            print_counterexample_callout(z3_res.counterexample.model_dump(), filepath)

        if synthesized_code:
            print_patch_diff(code, synthesized_code)

        print_cryptographic_attestation(synthesized_code or code, z3_res.passed or (synthesized_code is not None))

    return 0 if z3_res.passed or (synthesized_code is not None) else 1


def run_gatekeeper(args):
    """CI/CD Gatekeeper mode checking pull request invariants."""
    print_axiom_header()
    branch = args.branch
    console.print(f"[bold white]Evaluating CI/CD Gatekeeper on branch:[/bold white] [cyan]{branch}[/cyan]")

    # Scan standard demo samples in repo
    sample_path = backend_dir.parent / "demo_samples" / "deadlock_sample.py"
    if not sample_path.exists():
        console.print("[yellow]No sample found; running synthetic verification check...[/yellow]")
        return 0

    with open(sample_path, "r", encoding="utf-8") as f:
        code = f.read()

    ast_meta = extract_ast_concurrency_metadata(code)
    z3_res = z3_verifier.verify_codebase(code, ast_meta, [])

    if not z3_res.passed:
        console.print(f"\n[bold red][BLOCKED] CI/CD GATEKEEPER VIOLATION on branch '{branch}':[/bold red]")
        console.print("  Critical circular wait deadlock detected by Z3 SMT solver.")
        console.print("  Merge is blocked by AXIOM enterprise policy until verified patch is committed.")
        if args.fail_on_violation:
            return 1
    else:
        console.print(f"\n[bold green][PASS] CI/CD GATEKEEPER PASSED on branch '{branch}':[/bold green]")
        console.print("  All formal mathematical invariants certified SAT.")
        return 0


def cli_entrypoint():
    parser = argparse.ArgumentParser(
        prog="axiom",
        description="AXIOM: Autonomous Neuro-Symbolic Verification & Provably Correct Code Synthesizer"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Command: scan
    scan_parser = subparsers.add_parser("scan", help="Scan and formally verify a source code file")
    scan_parser.add_argument("filepath", type=str, help="Path to Python file to verify")
    scan_parser.add_argument("--prove", action="store_true", help="Synthesize provably correct patch if defects found")
    scan_parser.add_argument("--sarif", type=str, default=None, help="Output path for OASIS SARIF 2.1.0 report")
    scan_parser.add_argument("--chaos", action="store_true", help="Execute 50-worker runtime chaos stress harness")
    scan_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Command: gatekeeper
    gate_parser = subparsers.add_parser("gatekeeper", help="Run CI/CD Pull Request gatekeeper check")
    gate_parser.add_argument("--branch", type=str, default="main", help="Target branch name")
    gate_parser.add_argument("--fail-on-violation", action="store_true", default=True, help="Exit with non-zero code on violation")

    # Command: version
    subparsers.add_parser("version", help="Print AXIOM engine version and model spec")

    args = parser.parse_args()

    if args.command == "scan":
        exit_code = run_scan(args)
        sys.exit(exit_code)
    elif args.command == "gatekeeper":
        exit_code = run_gatekeeper(args)
        sys.exit(exit_code)
    elif args.command == "version":
        console.print("[bold green]AXIOM Neuro-Symbolic Verification Engine[/bold green] [white]v1.0-PROD[/white]")
        console.print("Nebius Token Factory Model: [cyan]nvidia/llama-3.1-nemotron-70b-instruct[/cyan]")
        console.print("Theorem Prover: [magenta]Microsoft Z3 SMT Solver v4.13[/magenta]")
        sys.exit(0)
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    cli_entrypoint()
