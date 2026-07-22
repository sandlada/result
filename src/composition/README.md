# composition

`composition` 提供把若干小函数**串成一条管道**的语法层。与 `operators/` 给每一个函数单独增加一个算子不同,本目录关心的是**"如何把这些算子按顺序摆在一起"**——左到右的串联、Kleisli 复合,以及在嵌套 `match` 中不可读的复杂错误流中以 flat 形式写出来的语法糖。本目录全部基于纯函数实现,不引入任何运行时缓存或全局状态。

## 文件清单与作用

**`composeK.ts`**

`f1 >=> f2 >=> ...` 的同步版本。接受若干个"返回 Result 的函数",把它们串成一个"返回 Result 的函数"。完整保留 F# / Haskell 的 Kleisli 范畴语义:每一步短路上游失败,失败引用整体透传。提供 1-6 个参数的重载以便 TypeScript 在浅层调用时给出可读的签名推断;实际实现接受任意长度 fns,并在 0 参数时抛 `TypeError("composeK requires at least one function")` 作为前置合约。整个组合体被一个外层 `try / catch` 包住,所以任意一步的同步抛错都会归约为最终的 `Err`,**不会**逃出 Result 链。

**`composeKAsync.ts`**

`composeK` 的异步版本,允许每个内部函数返回 `IResultOfT` 或 `Promise<IResultOfT>` 二者之一并在同一链中混用。同步抛错与异步拒绝在外层 `try / catch` + `await` 处统一收敛,产出 `Promise<IResultOfT>`。0 参数时,组合体返回一个被 `Promise.reject(TypeError)` 的 Promise——也就是说,**不会**在同步阶段 throw,而是落到异步 reject 上,这与整体"一切皆 Promise"的契约一致。

**`pipe.ts`**

左到右串联管道 `value |> f1 |> f2 |> f3`。通过 1-10 个参数的重载,保留对浅层链路的可读签名;实现使用 `Array.prototype.reduce` 让数据穿过所有步骤。常用于把 `ok(...) / err(...)` 与 `map` / `bind` / `match` / `orElse` 自然串联起来,得到一条从"构造 → 变换 → 终态"的可读铁路。重载的回退形态 `pipe(value): value` 单独支撑 identity 场景——`pipe(42)` 直接返回 `42`,无副作用。

**`pipeAsync.ts`**

`pipe` 的异步版本。1-10 重载,与 `pipe` 对称;实现不是 `reduce`,而是用 `for...of` 显式按顺序执行,同时整个外层 `async` 函数把每次调用产生的 Promise 透传到下一步。需要强调的是:本函数**不**在步骤之间显式 `await`——它依赖链中每个算子(`mapAsync` / `bindAsync` / `matchAsync`)**自身**在被调用前 `await` 输入 Promise。当链中所有算子都遵守这条契约时,显式 `await` 是不必要的,反而能避免不必要的事件循环跳跃。

**`safeTry.ts`**

把"嵌套 `match` 一层一层解包"改写成"用 `yield* safeTry(...)` 扁平化"的语法糖。`safeTry(result)` 接收一个 `IResultOfT<T, E>` 并把它包进一个生成器:成功时 `return` 出值(`yield*` 求值得到该值),失败时 `yield` 出错误,被外层 `fromSafeTry` 拦截。`fromSafeTry(gen)` 运行生成器,捕获第一次 yield 后**立即调用 `iterator.return(undefined!)`**——这是关键的一步,目的是触发用户生成器体内 `finally` 块的执行。这一行为直接对应 `.jules/sentinel.md` 中记录的同类项目曾因未调用 `iterator.return()` 而泄漏资源的事故,在本库中通过测试 `"closes the generator on short-circuit failure"` 固化下来。

## 模块的设计原则

- **重载优先于实现签名**:`pipe` / `pipeAsync` / `composeK` / `composeKAsync` 都以 1-N 重载暴露浅层精确签名,实现版本退化为 `any` 重载,避免深层调用时签名爆炸。
- **错误出口唯一**:每个组合体的"失败出口"都是最终返回值的 `IResultOfT.error` 通道,而非同步抛错。`composeK` 的 0 参数 guard 是唯一的同步 throw 例外,且 throw 信息明文写在 spec 测试里。
- **`safeTry` 的资源纪律**:`fromSafeTry` 内部对生成器调用 `iterator.return()`,即使在 `try / catch` 捕获路径中也嵌套二次关闭,杜绝 `finally` 跳过。
- **不缓存状态**:本目录所有函数都不维护 `let` 状态或闭包外的可变引用,任何调用顺序与并发都得到一致结果。
- **不引入新的判别联合类型**:本模块只操作 `IResultOfT` / `Promise<IResultOfT>` / Generator 这三种宿主类型,不创造任何新的判别结构,避免与 `types/` 协议冲突。
