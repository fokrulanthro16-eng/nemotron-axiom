import { SampleCode, StreamMessage } from "@/types";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/`);
    if (!res.ok) throw new Error("Failed to fetch server metadata");
    return await res.json();
  } catch (err) {
    console.warn("Backend status ping error:", err);
    return null;
  }
}

export async function fetchSamples(): Promise<Record<string, SampleCode>> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/samples`);
    if (!res.ok) throw new Error("Failed to fetch samples");
    return await res.json();
  } catch (err) {
    console.warn("Falling back to client-side embedded samples:", err);
    return {
      deadlock_transfer: {
        title: "Deadlock in Concurrent Bank Transfer",
        description:
          "Cyclic wait hazard (Coffman Condition #4) caused by unsorted lock acquisition.",
        language: "python",
        code: `import threading
import time

class Account:
    def __init__(self, account_id: int, balance: float):
        self.id = account_id
        self.balance = balance
        self.lock = threading.Lock()

def transfer(from_acc: Account, to_acc: Account, amount: float):
    # Concurrency Bug: Inconsistent lock acquisition order causes circular wait!
    with from_acc.lock:
        time.sleep(0.01)  # Context switch window
        with to_acc.lock:
            if from_acc.balance >= amount:
                from_acc.balance -= amount
                to_acc.balance += amount`,
      },
      race_condition_cache: {
        title: "Async Worker Cache Race Condition",
        description:
          "Unsynchronized check-then-act cache update with yield point causing data corruption.",
        language: "python",
        code: `import asyncio
from typing import Any, Dict

class AsyncWorkerCache:
    def __init__(self):
        self.cache: Dict[str, Any] = {}

    async def get_or_compute(self, key: str, compute_coro) -> Any:
        # Concurrency Bug: Read-modify-write race condition across await yield!
        if key in self.cache:
            return self.cache[key]
        
        # Cooperative yield exposes state window without atomic lock
        data = await compute_coro()
        self.cache[key] = data
        return data`,
      },
    };
  }
}

export async function startStreamVerification(
  code: string,
  callbacks: {
    onEvent: (msg: StreamMessage) => void;
    onDone: () => void;
    onError: (err: string) => void;
  },
  options: { maxIterations?: number; enableTavily?: boolean } = {}
): Promise<() => void> {
  const controller = new AbortController();

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/stream-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        language: "python",
        max_iterations: options.maxIterations ?? 3,
        enable_tavily: options.enableTavily ?? true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No readable stream response received.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let eventName = "message";
            let dataStr = "";

            const eventMatch = trimmed.match(/^event:\s*(.+)$/m);
            if (eventMatch) eventName = eventMatch[1].trim();

            const dataMatch = trimmed.match(/^data:\s*(.+)$/m);
            if (dataMatch) dataStr = dataMatch[1].trim();

            if (eventName === "done") {
              callbacks.onDone();
              return;
            } else if (eventName === "error") {
              callbacks.onError(dataStr);
              return;
            } else if (eventName === "telemetry" && dataStr) {
              try {
                const parsed: StreamMessage = JSON.parse(dataStr);
                callbacks.onEvent(parsed);
              } catch (e) {
                console.error("Failed to parse telemetry JSON:", e);
              }
            }
          }
        }
        callbacks.onDone();
      } catch (streamErr: any) {
        if (streamErr.name !== "AbortError") {
          callbacks.onError(streamErr.message || "Stream interrupted");
        }
      }
    };

    processStream();
  } catch (err: any) {
    if (err.name !== "AbortError") {
      callbacks.onError(err.message || "Failed to initiate verification stream");
    }
  }

  // Return cancel function
  return () => {
    controller.abort();
  };
}

export async function runChaosStressTest(
  flawedCode: string,
  verifiedCode: string,
  workers: number = 50,
  timeoutSeconds: number = 1.5
): Promise<import("@/types").StressTestComparisonResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/stress-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      flawed_code: flawedCode,
      verified_code: verifiedCode,
      concurrent_workers: workers,
      timeout_seconds: timeoutSeconds,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stress test failed with status: ${response.status}`);
  }

  return await response.json();
}
