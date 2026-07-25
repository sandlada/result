# reliability

`reliability` 是 `@sandlada/result` 中面向**生产环境 ROP 流水线**的可靠性算子集——`retry` / `timeout` / `race` / `any` / `allSettled` 五件套共同覆盖"瞬时故障容忍 / 时间上限 / 并发选择 / 全量观测"四类典型场景。本目录全部基于平台全局 API(`setTimeout` / `clearTimeout` / `AbortController`),**零运行时依赖**;所有失败都汇入 `Err`,不抛错。

## 设计约束

- **失败不外抛**——happy path 与 sad path 上,本目录所有算子都不通过 `throw` 暴露错误;任何回调错误、`Promise` 拒绝都被收敛为 `Err`,便于上层 ROP 链路统一处理。
- **lazy 与 eager 成对**——`timeout`(lazy,接 `AsyncResult`)与 `timeoutEager`(eager,接 `() => Promise<IResultOfT>`)形成可互替的双胞胎,调用方按上游形态选择。`retry` / `retryLazy` 同理。
- **运行时全局 API 透明**——`setTimeout` / `clearTimeout` / `AbortController` 通过 `src/types/globals.d.ts` 显式声明,无第三方依赖注入。
- **`Settled<T, E>` 是 never-err 的稳定出口**——`allSettled` 的返回类型是 `AsyncResult<Settled<T, E>[], never>`,这一 `never` 类型反映"调用方已承诺不会失败",便于消费者把 `allSettled` 的结果直接喂给不需要 Err 通道的下游。

## 文件清单与作用

**`retry.ts`**

**eager 重试**。`retry(fn, options?)` 接 `() => IResultOfT<T, E> | Promise<IResultOfT<T, E>>`,返回 `Promise<IResultOfT<T, E>>`;`RetryOptions<E>` 包含 `times`(默认 3)、`delayMs`(支持函数式退避)、`shouldRetry`、`onRetry`、`signal`。**错误身份剥离**:抛出的 `Error` 实例被映射为 `.message`(空时取 `.constructor.name`),非 Error 抛错被 `String()` 化;原对象、stack、`cause` 全部丢弃——若需保留原 Error,请在调用前用 `tryCatch` 包一层。

**`retryLazy.ts`**

`retry` 的 lazy 双胞胎。`retryLazy(ar, options?)` 接 `AsyncResult<T, E>` 返回 `AsyncResult<T, E>`,**绝不**在构造阶段触发 `ar.run()`;只有 `.run()` 时才进入循环。`attempt` 参数从 0 起计(0 表示首次失败后的第一次重试),总调用次数 = `times + 1`。错误身份剥离策略与 `retry` 对齐。

**`timeout.ts`**

**lazy 限时**。`timeout(ms, ar, onTimeout?)` 返回 `AsyncResult<T, E | TimeoutError>`;`onTimeout` 默认产出 `{ kind: 'Timeout', ms }`。**Cancellation 警示**:Promise 不可被强制取消,计时器先到时 `timeout` 立即返回 `Err`,但内层 `ar.run()` 仍在后台执行,后续结算被丢弃。对于长 I/O / 重资源任务,这是资源泄漏——需要协作式取消时,应在传入前用 `AbortSignal` 包一层。

**`timeoutEager.ts`**

`timeout` 的 eager 版。`timeoutEager(ms, fn, onTimeout?)` 接 `() => Promise<IResultOfT<T, E>>`,返回 `Promise<IResultOfT<T, E | TimeoutError>>`,内部复用了 `timeout` 的 `TimeoutError` 默认 shape。便于已经在 `Promise` 形态的下游直接接入,不必先 lift 到 `AsyncResult`。

**`race.ts`**

**首胜即出**。`race(ars)` 返回 `AsyncResult<T, E>`,第一个 `Ok` 即胜出;全部 `Err` 时返回**输入下标 0** 的错误(不论其结算顺序)。**空输入**返回 `Err(new Error('race: no inputs'))`(cast 为 `E`)。**Promise reject 策略**:若 `runs[0]` 本身 reject,首个 reject 胜出,不论输入顺序;若需要"先结算者即终局",应选其它原语。Lazy,全部 thunk 在 `.run()` 时启动。

**`any.ts`**

**`Promise.any` 风格**。`any(ars)` 返回 `AsyncResult<T[], E[]>`——至少一个 `Ok` 时产出 `Ok([...所有成功])`,全部 `Err` 时产出 `Err([...所有错误])`。**不短路,全部 thunk 保证运行**。`successes` / `errors` 的顺序按**结算顺序**(微任务调度)而非输入顺序——若需要输入顺序,用 `allSettled`。

**`allSettled.ts`**

**永不失败**的批量观测器。`allSettled(ars)` 返回 `AsyncResult<Settled<T, E>[], never>`,`Settled<T, E> = { ok: true; value: T } | { ok: false; error: E }` 逐项记录每个 thunk 的真实结果。**始终 `Ok`**:即使全部失败也返回 `Ok`,Err 通道永远不携带值——这一契约使观测层可以放心地把全部结果喂给下游聚合逻辑,而不必先判断"是不是成功"。

## 模块的设计原则

- **零运行时依赖**——`setTimeout` / `clearTimeout` / `AbortController` 全部来自平台全局,在 `src/types/globals.d.ts` 中显式声明;不引入 lodash / p-retry 等第三方包。
- **失败出口统一为 `Err`**——任何内层 throw / reject 都被收敛为 `Err`,`retry*` 还会剥离 Error 身份以避免泄漏敏感 stack 给调用方(若需保留请走 `tryCatch`)。
- **`retryLazy` 不预触发**——构造期只组合 thunk,首次 `.run()` 时才进入循环;`shouldRetry` / `onRetry` / `delayMs` 都在调用栈内出现,行为透明。
- **lazy / eager 双胞胎按上游形态选择**——上游是 `AsyncResult` 选 `timeout` / `retryLazy`,上游是 `() => Promise<IResultOfT>` 选 `timeoutEager` / `retry`;两条路径共享同一份 `TimeoutError` / `RetryOptions` 类型,接口差异最小。
- **`Settled` 的 `never` 出口**——`allSettled` 的 `Err` 通道永远是 `never`,这是对调用方的类型层承诺:你无需在下游做"是不是全成功"的判断,直接 `pipe(ar, map(r => r.map(s => s.value)))` 即可。
- **可观察性友好**——`onRetry` / `signal` / `shouldRetry` 等钩子把"何时重试 / 谁触发中止 / 哪些错误值得重试"全部参数化,使调用方可以无缝接入既有的 Sentry / OpenTelemetry / 自研监控。