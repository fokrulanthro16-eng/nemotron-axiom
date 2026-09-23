"""
DEMO SAMPLE 2: ASYNC WORKER CACHE RACE CONDITION
Target for Nemotron AXIOM Formal SMT Verification & Synthesis

Vulnerability:
Check-then-act vulnerability across async cooperative yield boundaries.
Without atomic locking (asyncio.Lock), concurrent coroutines reading the same key
simultaneously miss the cache, duplicate resource-heavy compute jobs, and cause
stale cache state corruption.
"""

import asyncio
from typing import Any, Dict


class AsyncWorkerCache:
    def __init__(self):
        self.cache: Dict[str, Any] = {}

    async def get_or_compute(self, key: str, compute_coro) -> Any:
        """
        CRITICAL DEFECT:
        Non-atomic check-then-act across cooperative yield (await).
        Violates Mutual Exclusion and Single-Compute Invariants.
        """
        if key in self.cache:
            return self.cache[key]

        # Cooperative yield exposes unprotected state gap!
        result = await compute_coro()

        # Stale overwrite race hazard
        self.cache[key] = result
        return result


async def mock_compute():
    await asyncio.sleep(0.01)
    return "computed_data"


async def main():
    cache = AsyncWorkerCache()
    # Multiple concurrent coroutines querying the same key concurrently
    results = await asyncio.gather(
        cache.get_or_compute("key1", mock_compute),
        cache.get_or_compute("key1", mock_compute),
        cache.get_or_compute("key1", mock_compute)
    )
    print(f"Results: {results}")


if __name__ == "__main__":
    asyncio.run(main())
