# operators

`operators` 是本项目**最厚**的一层——`IResultOfT<A, E>` 上的全部纯函数式变换与终态算子。本目录与 `async/`(eager `Promise<IResultOfT>`)、`async-result/`(lazy `AsyncResult`)、`option/`(`IOption` 上的同名算子)是平行结构,共同遵守"data-last currying + plain-object 字面量"的家族公约。本目录不引入任何新类型——所有函数都在 `IResultOfT` 上操作。

## 文件清单与作用

**逻辑族**(`and` / `or`)

两者都是短路二元算子,接收两个 result 引用,各自独立。`and(other, r)` 在 `r` 失败时返回 `r` 的同一引用,在 `r` 成功时返回 `other`——保留 Rust `result.and(other)` 的语义。`or(other, r)` 是对偶:成功时返回 `r`,失败时返回 `other`。两者都对错误类型做并集(`E | F`)并通过引用透传。

**链式族**(`bind` / `orElse`)

`bind(fn)` 是 monadic bind,在成功轨道上调用 `fn(value)`,错误类型扩到 `E | F`;回调同步抛错被 `try / catch` 归约为 `err(e as E | F)`。`orElse(fn)` 是错误轨道的对偶,`fn` 返回 `IResultOfT<B, F>` 时结果值类型拓宽为 `A | B`,供从失败侧把布尔/默认恢复类型补回主轨。

**映射族**(`map` / `mapErr` / `mapOr` / `mapOrElse` / `bimap`)

`map` 与 `mapErr` 各自只在一条轨道上映射;`mapOr(default, fn)` 是终态版本,在成功侧直接调用 fn 抽取值,失败侧直接返回 default——避免构造中间 Result;`mapOrElse(onErr, fn)` 是它的"从错误侧求 default"版本。`bimap(onOk, onErr)` 同时映射两条轨道,典型用例是把成功侧的 `T` 转字符串、错误侧的 `E` 转错误码。**这一族所有函数都对回调同步 throw 做 catch+convert**。

**谓词族**(`contains` / `exists` / `filterOrElse`)

`contains(target)` 与 `exists(predicate)` 都是只读 boolean 算子,`===` 与 `predicate(value)` 语义简单。`filterOrElse(predicate, errorFn)` 在成功路径上检查 predicate,失败时用 `errorFn(value)` 映射为新错误。该函数是本目录错误映射**最完整测试覆盖**的一处:11 个测试包含 discriminated union、pipe 组合、custom TError 等场景,并对 predicate / errorFn 的同步 throw 同样做 catch+convert。

**Side-effect 族**(`tap` / `tapErr` / `andTee` / `andThrough` / `orTee`)

`tap` 成功侧 side-effect;`tapErr` 失败侧对偶;**回调同步 throw 一律归约 `err(caughtError)`,原 result 形态丢失**——这是项目核心的"tap/tee policy",在 JSDoc 与每个测试中都有独立断言。`andTee` / `andThrough` / `orTee` 是更细分的变种:`andTee` 忽略回调返回值;`andThrough` 把回调失败**扩**到原错误通道,允许错误类型 `E | F`;`orTee` 镜像 `andTee` 在失败侧。

**Applicative 族**(`ap`)

`ap(fnResult, valueResult)` 应用算子:`fnResult` 必须是 `IResultOfT<(a:A)=>B, E>`,`valueResult` 必须是 `IResultOfT<A, E>`。两个 result 中**任一**失败则返回该失败(且函数失败先于值失败被检查,顺序在测试中固化)。

**终态 panic 族**(`unwrap` / `unwrapErr` / `expect` / `expectErr` / `unsafeUnwrap` / `unsafeUnwrapErr` / `orThrow` / `orThrowWith`)

八个 panic 类算子,语意按"成功侧 / 失败侧 × 直接 throw / 文案 throw / 原始 throw"三维划分:
- `unwrap` 失败抛 `TypeError('Called unwrap() on a failure result. Error: ...')`。
- `expect(msg)` 同上但用调用方的 msg。
- `unsafeUnwrap` 直接 throw 原 error,**不做任何包装**——是测试 / escape-hatch 工具,JSDoc 明示"Use with care"。
- `unwrapErr` / `expectErr` / `unsafeUnwrapErr` / `orThrow` / `orThrowWith` 是对应的失败侧版本。`orThrow` 特别要求 `E extends Error`;`orThrowWith` 不约束 `E`,允许调用方通过 `errorFn` 自定义 throw 的 Error 实例。

**结构族**(`flatten` / `swap` / `separate` / `traverseArray`)

`flatten` 把 `IResultOfT<IResultOfT<A, E>, E>` 展平为 `IResultOfT<A, E>`,外层失败短路。`swap` 是 Ok/Err 字面量直接交换。`separate(results)` 把数组划分为 `{ ok: T[]; err: E[] }`,两数组各自保持原顺序。`traverseArray(fn, items)` 顺序应用 fn 到每项,任一失败短路,回调签名接受 `(item, index)`,index 由测试显式断言。

## 模块的设计原则

- **窄化返回类型优先**:所有工厂与算子返回最窄的字面量类型(`IResultOfTSuccess<T, E>` / `IResultOfTFailure<T, E>` 或并集),不向上返回宽类型,让消费方在 `match` 中立即 exhaustive narrow。
- **catch+convert 政策**:所有可能在回调里 throw 的算子(`map` / `mapErr` / `bind` / `orElse` / `bimap` / `ap` / `filterOrElse` / `andTee` / `andThrough` / `orTee` / `tap` / `tapErr` / `traverseArray`)都用 `try / catch` 把 throw 归约为 `err(caughtError)`——这是与 `pipe/tap` 一致的家族合约。**终态 panic 算子(`unwrap` / `expect` / `unwrapOrElse` / `match`)则不捕获 throw**,沿调用栈向上传播,JSDoc 与测试都固化。
- **`uwrappedEr` v2(`unsafeUnwrap*`)作为 escape hatch**:`unsafeUnwrap` / `unsafeUnwrapErr` 直接 throw 原值,不做包装。这是测试场景与边角互操作场景的应急工具;正常路径请使用 `unwrap` / `unwrapErr`,后者语义明确且 panic 文案带可观察信息。
- **`readonly` 全覆盖**:`IResultOfT<A, E>` 的所有实例属性都是 readonly,本目录里的算子不引入任何可变中间态。
- **Data-last + 双 overload**:几乎所有算子都有 curried + direct 两形态,数据在最后一个参数,支持 `pipe`。
- **lazy-by-default**:`operators/` 的算子在**同步**路径上运行,不引入 `await`——这一点与 `async/` 的 eager `Promise<IResultOfT>` 与 `async-result/` 的 lazy `AsyncResult` 形成清晰界限。
