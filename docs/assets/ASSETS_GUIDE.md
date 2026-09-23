# 📸 NEMOTRON AXIOM: VISUAL ASSETS GUIDE

This directory (`docs/assets/`) stores the visual media, architectural schematics, and UI screenshots used in the root `README.md` and Devpost hackathon submission.

---

## 🖼️ Required Screenshot Assets

To complete the visual showcase on GitHub, capture and save the following screenshots from the live web application (`http://localhost:3000`):

### 1. `dashboard-overview.png`
- **Location**: `docs/assets/dashboard-overview.png`
- **What to Capture**: Full view of the Nemotron AXIOM Mission Control dashboard showing:
  - The top commercial header and Nebius H100 benchmark bar (194.2 tps).
  - The React Flow interactive state graph (`AST_EXTRACT` -> `NEMOTRON_INVARIANTS` -> `Z3_VERIFY` -> `RE_SYNTHESIZE`).
  - The dual-pane code editor comparing flawed code vs. the formally synthesized patch.

### 2. `chaos-harness-50-workers.png`
- **Location**: `docs/assets/chaos-harness-50-workers.png`
- **What to Capture**: The **Concurrency Stress Harness (Chaos Engine)** after execution:
  - Flawed Target card (Red): 50 deadlocks detected, 2000ms freeze, 0% success rate.
  - Verified Target card (Green): 0 deadlocks, sub-100ms latency, 100% success rate.

### 3. `z3-smt-proof-tree.png`
- **Location**: `docs/assets/z3-smt-proof-tree.png`
- **What to Capture**: The **Z3 SMT Proof Tree** tab inside the terminal dock showing:
  - The formal First-Order Logic formula: $\forall t_1, t_2 \implies \neg\text{WaitsFor}(t_2, L_A)$.
  - The SMT-LIB 2.0 script with `check-sat` and satisfiability proof.

### 4. `pr-gatekeeper.png`
- **Location**: `docs/assets/pr-gatekeeper.png`
- **What to Capture**: The **GitHub PR Gatekeeper Modal**:
  - Pull Request #142 (`feat/concurrency-transfers`).
  - Automated `axiom-enterprise[bot]` comment with counterexample trace.
  - "Commit Fix & Auto-Merge PR" interactive trigger.

---

## 📐 Recommended Asset Specifications
- **Format**: PNG or WebP
- **Resolution**: 1920x1080 (16:9) or 2560x1440
- **Theme**: Dark Mode (Default AXIOM theme with Nvidia emerald `#76B900` and Nebius cyan accents)
