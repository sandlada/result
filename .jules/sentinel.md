## 2025-05-14 - Resource Leak in fromSafeTry
**Vulnerability:** Generators used in `fromSafeTry` were not explicitly closed when a failure was encountered (short-circuiting).
**Learning:** In TypeScript/JavaScript, if a generator is not exhausted, it may hold onto resources (e.g., file handles, network connections) defined in `finally` blocks or other cleanup logic that only runs when the generator completes or is explicitly closed.
**Prevention:** Always call `iterator.return()` when stopping a generator iteration prematurely to ensure `finally` blocks are executed.

## 2025-05-14 - Robustness in Async Operators
**Vulnerability:** Potential `TypeError` in `AsyncResult` and `AsyncOption` operators when checking for the existence of a `run` method using the `in` operator on non-object types.
**Learning:** The `in` operator throws a `TypeError` if the right-hand side is not an object (e.g., `null`, `undefined`, or primitive).
**Prevention:** Use defensive checks (`next !== null && typeof next === 'object'`) before using the `in` operator on potentially dynamic values.
