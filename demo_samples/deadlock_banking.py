"""
DEMO SAMPLE 1: DEADLOCK IN CONCURRENT BANK TRANSFER
Target for Nemotron AXIOM Formal SMT Verification & Synthesis

Vulnerability:
Thread 1: transfer(Account 1, Account 2, 50) -> Acquires lock 1, then waits for lock 2.
Thread 2: transfer(Account 2, Account 1, 20) -> Acquires lock 2, then waits for lock 1.
Result: Circular Wait Deadlock (Coffman Condition #4).
"""

import threading
import time


class Account:
    def __init__(self, account_id: int, balance: float):
        self.id = account_id
        self.balance = balance
        self.lock = threading.Lock()


def transfer(from_acc: Account, to_acc: Account, amount: float) -> bool:
    """
    CRITICAL DEFECT:
    Unordered nested lock acquisition creates cyclic wait condition.
    """
    with from_acc.lock:
        time.sleep(0.001)  # Context switch opportunity triggering deadlock
        with to_acc.lock:
            if from_acc.balance >= amount:
                from_acc.balance -= amount
                to_acc.balance += amount
                return True
            return False


if __name__ == "__main__":
    acc1 = Account(1, 1000.0)
    acc2 = Account(2, 1000.0)

    # Concurrent transfers prone to cyclic deadlock
    t1 = threading.Thread(target=transfer, args=(acc1, acc2, 100.0))
    t2 = threading.Thread(target=transfer, args=(acc2, acc1, 50.0))

    t1.start()
    t2.start()
    t1.join()
    t2.join()
    print("Completed transfer without deadlock!")
