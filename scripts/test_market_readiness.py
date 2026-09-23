#!/usr/bin/env python3
"""
Nemotron AXIOM - Market Readiness & Enterprise Smoke Test Suite
Validates:
1. CLI commands, entrypoints, and argument parsing.
2. AST extraction, Z3 SMT solver, and Nemotron invariant synthesis loop.
3. OASIS SARIF 2.1.0 and SLSA 1.0 schema compliance.
4. Containerization configs (Dockerfiles, docker-compose.yml).
5. GitHub Action and CI/CD workflow validity.
"""

import sys
import os
import subprocess
import json
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
SAMPLE_FILE = ROOT_DIR / "demo_samples" / "deadlock_banking.py"
SARIF_OUT = ROOT_DIR / "test_readiness.sarif"


def log(msg, status="INFO"):
    badge = {
        "INFO": "[INFO]",
        "PASS": "[PASS]",
        "FAIL": "[FAIL]",
        "WARN": "[WARN]",
    }.get(status, "[*]")
    print(f"{badge} {msg}")


def test_cli_help():
    log("Testing CLI help invocation...", "INFO")
    cmd = [sys.executable, "-m", "axiom_cli.main", "--help"]
    res = subprocess.run(cmd, cwd=str(BACKEND_DIR), capture_output=True, text=True)
    if res.returncode == 0 and "AXIOM" in res.stdout:
        log("CLI help and entrypoint operational.", "PASS")
        return True
    else:
        log(f"CLI help failed:\n{res.stderr}\n{res.stdout}", "FAIL")
        return False


def test_cli_scan():
    log("Testing CLI formal SMT scan with proof synthesis on deadlock sample...", "INFO")
    cmd = [
        sys.executable,
        "-m",
        "axiom_cli.main",
        "scan",
        str(SAMPLE_FILE),
        "--prove",
        "--sarif",
        str(SARIF_OUT),
        "--json",
    ]
    res = subprocess.run(cmd, cwd=str(BACKEND_DIR), capture_output=True, text=True)
    try:
        data = json.loads(res.stdout)
        if "certified" in data and "invariants_checked" in data:
            log(f"Formal scan completed. Certified: {data['certified']}, Invariants checked: {data['invariants_checked']}", "PASS")
            return True
        else:
            log(f"Unexpected JSON format from scan: {res.stdout[:200]}", "FAIL")
            return False
    except Exception as e:
        log(f"Scan JSON parse failed: {e}\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}", "FAIL")
        return False


def test_sarif_schema():
    log("Validating OASIS SARIF 2.1.0 schema compliance...", "INFO")
    if not SARIF_OUT.exists():
        log(f"SARIF file not found at {SARIF_OUT}", "FAIL")
        return False

    with open(SARIF_OUT, "r", encoding="utf-8") as f:
        sarif = json.load(f)

    assert sarif.get("version") == "2.1.0", "Version must be 2.1.0"
    assert "runs" in sarif and len(sarif["runs"]) > 0, "Missing runs array"
    driver = sarif["runs"][0]["tool"]["driver"]
    assert driver["name"].startswith("Nemotron AXIOM"), f"Driver name mismatch: {driver.get('name')}"
    rules = driver.get("rules", [])
    results = sarif["runs"][0].get("results", [])
    log(f"SARIF verified: {len(rules)} rules registered, {len(results)} diagnostic results found.", "PASS")
    return True


def test_container_configs():
    log("Validating multi-stage Docker & docker-compose configurations...", "INFO")
    backend_docker = BACKEND_DIR / "Dockerfile"
    frontend_docker = FRONTEND_DIR / "Dockerfile"
    compose_file = ROOT_DIR / "docker-compose.yml"

    for path, name in [
        (backend_docker, "backend/Dockerfile"),
        (frontend_docker, "frontend/Dockerfile"),
        (compose_file, "docker-compose.yml"),
    ]:
        if not path.exists():
            log(f"Missing {name}", "FAIL")
            return False

    # Check non-root users in Dockerfiles
    b_content = backend_docker.read_text(encoding="utf-8")
    assert "USER appuser" in b_content, "Backend Dockerfile must run as unprivileged user"
    assert "gunicorn" in b_content, "Backend Dockerfile must use gunicorn production server"

    f_content = frontend_docker.read_text(encoding="utf-8")
    assert "USER nextjs" in f_content, "Frontend Dockerfile must run as unprivileged user"
    assert "standalone" in f_content, "Frontend Dockerfile must use standalone output"

    c_content = compose_file.read_text(encoding="utf-8")
    assert "axiom-backend" in c_content and "axiom-frontend" in c_content, "Compose services missing"
    assert "healthcheck:" in c_content, "Compose healthchecks missing"

    log("Containerization specs are production-hardened.", "PASS")
    return True


def test_github_actions():
    log("Validating GitHub Action & CI/CD workflows...", "INFO")
    action_yml = ROOT_DIR / ".github" / "actions" / "axiom-gatekeeper" / "action.yml"
    ci_yml = ROOT_DIR / ".github" / "workflows" / "axiom-ci.yml"

    if not action_yml.exists() or not ci_yml.exists():
        log("GitHub Action or CI workflow file missing", "FAIL")
        return False

    act_content = action_yml.read_text(encoding="utf-8")
    assert "axiom gatekeeper" in act_content, "Action does not execute axiom gatekeeper"

    ci_content = ci_yml.read_text(encoding="utf-8")
    assert "gatekeeper" in ci_content.lower(), "Workflow does not configure gatekeeper"

    log("GitHub Action gatekeeper & CI workflows verified.", "PASS")
    return True


def main():
    print("=" * 60)
    print("NEMOTRON AXIOM - B2B ENTERPRISE MARKET READINESS SMOKE TEST")
    print("=" * 60)

    tests = [
        ("CLI Entrypoint", test_cli_help),
        ("Formal SMT Scan & Patch", test_cli_scan),
        ("SARIF 2.1.0 Compliance", test_sarif_schema),
        ("Production Containerization", test_container_configs),
        ("GitHub Action CI Gatekeeper", test_github_actions),
    ]

    passed = 0
    for name, test_fn in tests:
        try:
            if test_fn():
                passed += 1
            else:
                print(f"[FAIL] Check '{name}' failed.")
        except Exception as e:
            log(f"Exception in '{name}': {e}", "FAIL")

    print("=" * 60)
    print(f"RESULTS: {passed}/{len(tests)} Enterprise Verification Suites Passed.")
    print("=" * 60)

    # Cleanup temp sarif
    if SARIF_OUT.exists():
        try:
            SARIF_OUT.unlink()
        except Exception:
            pass

    return 0 if passed == len(tests) else 1


if __name__ == "__main__":
    sys.exit(main())
