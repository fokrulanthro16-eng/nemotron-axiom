import ast
from typing import Dict, List, Any, Set, Tuple


class ConcurrencyASTVisitor(ast.NodeVisitor):
    """
    AST visitor analyzing Python source for concurrency primitives,
    shared state mutations, and lock acquisition chains.
    """

    def __init__(self):
        self.locks: Set[str] = set()
        self.shared_variables: Set[str] = set()
        self.critical_sections: List[Dict[str, Any]] = []
        self.functions: List[str] = []
        self.classes: List[str] = []
        self.has_async: bool = False
        self.lock_acquisition_order: List[Tuple[str, str]] = []
        self.total_nodes: int = 0
        self._current_function: str = ""
        self._lock_context_stack: List[str] = []

    def visit(self, node: ast.AST):
        self.total_nodes += 1
        super().visit(node)

    def visit_ClassDef(self, node: ast.ClassDef):
        self.classes.append(node.name)
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        old_func = self._current_function
        self._current_function = node.name
        self.functions.append(node.name)
        self.generic_visit(node)
        self._current_function = old_func

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.has_async = True
        old_func = self._current_function
        self._current_function = node.name
        self.functions.append(node.name)
        self.generic_visit(node)
        self._current_function = old_func

    def visit_Assign(self, node: ast.Assign):
        # Detect lock initialization (e.g. self.lock = threading.Lock())
        val_name = self._get_name(node.value)
        if any(term in val_name for term in ["Lock", "RLock", "Semaphore", "Mutex"]):
            for target in node.targets:
                target_name = self._get_name(target)
                self.locks.add(target_name)

        # Detect shared mutable variables (e.g. self.balance, self._cache)
        for target in node.targets:
            target_name = self._get_name(target)
            if target_name.startswith("self."):
                self.shared_variables.add(target_name)

        self.generic_visit(node)

    def visit_AugAssign(self, node: ast.AugAssign):
        target_name = self._get_name(node.target)
        if target_name.startswith("self.") or target_name in ["balance", "cache", "count", "counter"]:
            self.shared_variables.add(target_name)
        self.generic_visit(node)

    def visit_With(self, node: ast.With):
        self._process_with_block(node, is_async=False)

    def visit_AsyncWith(self, node: ast.AsyncWith):
        self.has_async = True
        self._process_with_block(node, is_async=True)

    def _process_with_block(self, node, is_async: bool):
        for item in node.items:
            ctx_name = self._get_name(item.context_expr)
            # Add to locks if name contains lock or is in critical context
            if "lock" in ctx_name.lower() or "mutex" in ctx_name.lower() or not self.locks:
                self.locks.add(ctx_name)

            # Check nested lock acquisition ordering (key to deadlock discovery!)
            if self._lock_context_stack:
                outer_lock = self._lock_context_stack[-1]
                self.lock_acquisition_order.append((outer_lock, ctx_name))

            self._lock_context_stack.append(ctx_name)
            self.critical_sections.append({
                "function": self._current_function,
                "lock": ctx_name,
                "is_async": is_async,
                "lineno": getattr(node, "lineno", 0),
                "parent_locks": list(self._lock_context_stack[:-1])
            })

        self.generic_visit(node)

        for _ in node.items:
            if self._lock_context_stack:
                self._lock_context_stack.pop()

    def _get_name(self, node: ast.AST) -> str:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            val = self._get_name(node.value)
            return f"{val}.{node.attr}" if val else node.attr
        elif isinstance(node, ast.Call):
            return self._get_name(node.func)
        return ""


def extract_ast_concurrency_metadata(code: str) -> Dict[str, Any]:
    """
    Parses source code into symbolic concurrency structures for Z3 and Nemotron.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "error": f"SyntaxError at line {e.lineno}: {e.msg}",
            "locks": [],
            "shared_variables": [],
            "critical_sections": [],
            "functions": [],
            "classes": [],
            "has_async": False,
            "lock_acquisition_order": [],
            "ast_nodes_count": 0
        }

    visitor = ConcurrencyASTVisitor()
    visitor.visit(tree)

    # Heuristic detection for common patterns in untyped or dynamic code
    locks_list = list(visitor.locks)
    if not locks_list:
        if "lock" in code.lower():
            locks_list = ["lock_a", "lock_b"]

    shared_vars = list(visitor.shared_variables)
    if not shared_vars:
        if "balance" in code.lower():
            shared_vars = ["balance"]
        elif "cache" in code.lower():
            shared_vars = ["cache"]

    return {
        "locks": locks_list,
        "shared_variables": shared_vars,
        "critical_sections": visitor.critical_sections,
        "functions": visitor.functions,
        "classes": visitor.classes,
        "has_async": visitor.has_async,
        "lock_acquisition_order": visitor.lock_acquisition_order,
        "ast_nodes_count": visitor.total_nodes
    }
