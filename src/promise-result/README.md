# promise-result

`promise-result` 模块是 `Promise<IResultOfT<A, E>>` 上的**全部 eager async 算子**。与 `async-result/`(惰性 thunk)不同,本目录的算子在调用时直接接收 `Promise` 并返回 `Promise`,**不**维护一个独立的 thunk 形态。本目录**只**操作 `Promise<IResultOfT>`;与本目录对应的、作用于 `Promise<IOption>` 的双胞胎已经拆分到 [`../promise-option/`](../promise-option/) 子包,作为独立 import 路径 `@sandlada/result/promise-option` 暴露。

本目录包含 35 个函数,覆盖了从同步 → Promise 的全部桥梁与终态消费。

> **⚠️ 行为变更(破坏性):** `unwrapOrAsync` 与 `unwrapOrElseAsync` 现在返回 `Promise<A>`(裸值),**不再**是 `Promise<IResultOfT<A, unknown>>`。先前的签名与 `unwrapOr` 的"提取"语义不符。默认值 / 错误处理器 reject / throw 时,异常沿 Promise reject 路径向上抛出,不再被包装为 `err(reason)`。测试已同步更新以反映新语义。

## 文件清单与作用

### 同步入口算子(operate on `Promise<IResultOfT>`,sync fn)(5 个)

- `map` / `mapErr` 严格同步版的映射——fn 必须同步,callback 同步 throw 归约 `err(caughtError)`。比 `*Async` 版效率更高(fn 不需要 await 包装)。
- `unwrapOr` / `unwrapOrElse` 终态提取,default 既可以是值也可以是 `Promise<T>`,默认值的 reject 沿 Promise reject 路径传播(与 `unwrapOrAsync` 对齐)。
- `flatten` 严格同步版的解嵌套,单步。

### 链式 / bind 系列(6 个)

- `asyncBind` 把同步 `IResultOfT` 接进异步世界:在 sync result 上调用 `f(value): Promise<IResultOfT<B, F>>`,失败短路。错误类型扩到 `E | F`,回调同步 throw + reject 双归约。
- `asyncBindThrough` 是 `asyncBind` 的"保留原值"变体:回调成功时**保留**原 success value,失败时把回调错误传播到 `E | F`——典型用例是"先验证,再决定是短路还是续行"。
- `bindAsync` 反向:接 `Promise<IResultOfT>`,回调可返回同步 `IResultOfT` 或 `Promise<IResultOfT>`——把同步结果混进纯异步链路。
- `bindThroughAsync` 是 `bindAsync` 的保留值变体。

### 映射族(8 个)

- `asyncMap` 把 sync result 接进 async 回调。
- `mapAsync` 把 `Promise<IResultOfT>` 的 success 值通过同步 / 异步回调映射——这里显式支持 `B | Promise<B>` 双形态。
- `mapErrAsync` 失败轨道对偶。
- `mapOrAsync` / `mapOrElseAsync` 是异步版的"success 映射或失败 default"——失败侧的 default 取自给定值,后者在错误上计算。
- `bimapAsync` 同时映射两条轨道,callback 同时接受 sync / Promise 回值。

### Lift 系列(operate on sync `IResultOfT`,async fn)(5 个)

- `asyncMap` / `asyncBind` / `asyncBindThrough` / `asyncTap` / `asyncTapErr` — Result 端把 sync Result 升格到 async。
- `asyncOrElse` 失败轨道 recovery 桥接(sync Result + async recovery)。
- `asyncMatch` async 分支匹配(sync Result + async handlers)。

### Side-effect 族(2 个)

`asyncTap` / `asyncTapErr` 处理 result 侧(sync Result → async 副作用)。这一族**完整覆盖"同步回调同步 throw / 同步回调异步 reject / 异步回调 reject"三路径**,在 JSDoc 明示 catch+convert 合约,测试用 `vi.fn()` 配合 `expect(fn).toHaveBeenCalledOnce` 与 `expect(r).toBe(original)` 验证身份保留。原 result 对象透传,绝不构造新包装。

> 注意:`tapAsync` / `tapErrAsync` / `matchAsync` 等在 `Promise<IResultOfT>` 上操作的 side-effect 与终态算子仍在**本目录**;作用于 `Promise<IOption>` 的同名变体在 [`../promise-option/`](../promise-option/)。

### 谓词族(3 个)

`containsAsync` 与 `existsAsync` 用 `===` 比较与同步 / 异步 predicate。失败的 catch+convert 策略:predicate / fn 抛出时一律归约 `false`(BOOL 终态),与 `R.map` 风格相反——谓词族**避免抛错上浮到上层**。`filterOrElseAsync` 接受 `predicate` + `errorFn`,在 predicate 失败时把原值传给 `errorFn` 映射为 error,**独立三处**断言 catch+convert:

- sync `predicate` throw 归约 `err(caughtError)`;
- async `predicate` reject 归约 `err(caughtError)`;
- sync `errorFn` throw 归约 `err(caughtError)`。

### 结构族(4 个)

- `flattenAsync` 把 `Promise<IResultOfT<IResultOfT<A, E>, E>>` 展平到 `Promise<IResultOfT<A, E>>`,外层 Err 短路。
- `swapAsync` 是 Ok/Err 字面量交换。
- `ap` applicative 应用——把 `Promise<IResultOfT<(a) => B, E>>` 应用到 `Promise<IResultOfT<A, E>>`,任一失败则传播。

### 组合族(3 个)

- `combine` 用 `Promise.all` 并发收集所有结果,在首个失败处短路,返回 `Promise<IResultOfT<T[], E>>`。
- `combineWithAllErrors` 不短路,把全部错误累积为 `E[]` 返回。
- `ap` applicative。

### 终态族(7 个)

- `matchAsync` 模式匹配,handler 接受 `C | Promise<C>`,**handler throw 沿 Promise reject 路径传播**(与 `operators/match` 对齐)。
- `mapOrAsync` / `mapOrElseAsync` 见映射族。
- `unwrapOrAsync` / `unwrapOrElseAsync` 终态提取,default 接受 `A | Promise<A>`。返回 `Promise<A>`(裸值,不是 `Promise<Result>`)。
- `tapAsync` / `tapErrAsync` 见 Side-effect 节。

## 模块的设计原则

- **eager vs lazy 的清晰界线**:本目录是 eager,所有算子接受并返回 `Promise`;不要与 `async-result/`(惰性 thunk)混淆。当"何时求值"必须由调用方控制时,用 `async-result/`。
- **catch+convert 在错误位置**:每个会在回调中 throw / reject 的算子,都用 `try / catch` + `Promise.then(_, onRejected)` 双向收敛,把错误归约为 `err(caughtError)` / `false` / `default` 等"已恢复"的状态。谓词族 / 过滤族作为**始终吞下异常**的终态工具,与 `match` 的"让异常上浮"形成对照。
- **callback 同时接受 sync / async**:在 `mapAsync` / `mapOrAsync` / `mapOrElseAsync` / `unwrapOrAsync` / `unwrapOrElseAsync` 等算子上,callback 形参声明为 `B | Promise<B>` / `A | Promise<A>`,调用方写同步或异步函数都行——这是 TS 在类型层吸收 sync / async 形态差异。
- **`unwrapOrAsync` 提取裸值**:`unwrapOrAsync` / `unwrapOrElseAsync` 现在返回 `Promise<A>`,与名字 "unwrap" 的 Rust 语义对齐;先前的 `Promise<IResultOfT<A, unknown>>` 是命名 bug,已修正。
- **同步入口 / 异步出 = 同步入口有可观察性**:sync 入参的算子(`asyncBind` / `asyncBindThrough` / `asyncMap` / `asyncTap`)保留原 result 的**身份**(测试用 `expect(r).toBe(original)` 验证),让上层能做引用比较。
- **`Promise.resolve` 做零分配失败透传**:对短路路径(失败),直接 `Promise.resolve(r)` 不构造新对象,符合项目的"plain object 不装箱"原则。
- **与 `../promise-option/` 的对应关系**:本目录的 `mapAsync` 对应那里的 `mapAsyncOption`,`bindAsync` 对应 `bindAsyncOption`,以此类推。命名保持镜像,导入路径分离。

## 算子分类总览

- **同步入口(5)**:`map` / `mapErr` / `unwrapOr` / `unwrapOrElse` / `flatten`
- **链式 bind(3)**:`asyncBind` / `asyncBindThrough` / `bindAsync` / `bindThroughAsync`
- **映射(8)**:`asyncMap` / `mapAsync` / `mapErrAsync` / `mapOrAsync` / `mapOrElseAsync` / `bimapAsync`
- **Lift(5)**:`asyncOrElse` / `asyncMatch`(与链式族中的 `asyncBind` / `asyncBindThrough` / `asyncTap` / `asyncTapErr` 共 6 个)
- **Side-effect(2 + 终态)**:`asyncTap` / `asyncTapErr` / `tapAsync` / `tapErrAsync`
- **谓词 / 过滤(3)**:`containsAsync` / `existsAsync` / `filterOrElseAsync`
- **结构(3)**:`swapAsync` / `flattenAsync` / `ap`
- **组合(2)**:`combine` / `combineWithAllErrors`
- **终态(7)**:`matchAsync` / `mapOrAsync` / `mapOrElseAsync` / `unwrapOrAsync` / `unwrapOrElseAsync`