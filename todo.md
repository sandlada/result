# todo.md — Open Decisions (2026-07-21)

This file tracks the **4 items still awaiting a design decision**.
The rest of the 2026-07-21 audit cycle (46 items) is in git history.

> **Previously resolved (2026-07-21)**: 46 items verified `@note Ready for Product`. See `ARCH.md` for the resolved-item notes.

---

## ⏸ Cat 4.2 — `src/async/asyncTapOption.ts`

- **Issue**: No `try/catch`, no `.catch()` rejection handler. Rejection propagates as unhandled.
- **Already tagged** `@note Ready for Product` at line 14 — but the implementation does not back the claim.
- **Plan**: Phase B1 (`/memories/session/plan.md`) — mirror `src/async/asyncBindOption.ts`. Wrap `fn(opt.value)` in `try/catch`; both the `.then(_, onRejected)` and sync-catch paths return `ofNone()`.

---

## ⏸ Cat 5 — `src/adapters/switchFn.ts` & `src/adapters/switchFnAsync.ts`

- **Issue**: Return type `IResultOfT<B, never>` is a type-lie — the catch branch produces `err(e as never)` but the caught `e` is `unknown`. Consumers and tests currently cast `result.error as Error` to inspect the error.
- **Already tagged** `@note Ready for Product` — but the type-honesty is missing.
- **Plan**: Phase B2/B3 — mirror `src/factories/tryCatch.ts` exactly. Optional `errorFn: (e: unknown) => E` parameter; `E = Error` default. Same body shape. Removes the `never` lie.

---

## ⏸ Cat 9.2 — `src/operators/unwrapOrElse.ts`

- **Issue**: JSDoc claims "Never throws"; implementation does not protect the user-supplied `onErr` callback. A throwing `onErr` propagates unchanged.
- **Status**: Already correctly self-consistent (no `@note Ready for Product` tag, no false claim).
- **Plan**: Phase B4 — JSDoc-only fix. Replace "Never throws" with explicit propagate policy (like `src/operators/match.ts` and `src/adapters/tee.ts`). Add `@note Ready for Product` to lock in the now-explicit contract. Add 1 propagation test.

---

## Resolution Status (2026-07-21, after Phase B)

| Stage                                                 | Status                           |
| ----------------------------------------------------- | -------------------------------- |
| Phase A — `todo.md` rewrite                           | ✅ Slimmed to 4 open items        |
| Phase B — B1 `asyncTapOption`                         | ✅ Patched (Cat 4.2 resolved)     |
| Phase B — B2 `switchFn`                               | ✅ Patched (Cat 5 sync resolved)  |
| Phase B — B3 `switchFnAsync`                          | ✅ Patched (Cat 5 async resolved) |
| Phase B — B4 `unwrapOrElse`                           | ✅ Doc updated (Cat 9.2 resolved) |
| Phase C — `npm run build` clean                       | ✅                                |
| Phase C — `npx vitest run` clean                      | ✅                                |
| All 4 files honestly tagged `@note Ready for Product` | ✅                                |
