# async

`async` 模块是 `Promise<IResultOfT<A, E>>` 上的**全部 eager async 算子**。与 `async-result/`(惰性 thunk)不同,本目录的算子在调用时直接接收 `Promise` 并返回 `Promise`,**不**维护一个独立的 thunk 形态;与 `async-option/` 平行的双胞胎在本目录以 `*Option` 后缀命名,作用于 `Promise<IOption<T>>`。这一层是项目里最厚的一组算子(35 个函数),覆盖了从同步 → Promise 的全部桥梁与终态消费。

## 文件清单与作用

**链式 / bind 系列(6 个)**

- `asyncBind` 把同步 `IResultOfT` 接进异步世界:在 sync result 上调用 `f(value): Promise<IResultOfT<B, F>>`,失败短路。错误类型扩到 `E | F`,回调同步 throw + reject 双归约。
- `asyncBindOption` 同形,目标为 `IOption<T>`,回调 throw / reject 归约 `None`。
- `asyncBindThrough` 是 `asyncBind` 的"保留原值"变体:回调成功时**保留**原 success value,失败时把回调错误传播到 `E | F`——典型用例是"先验证,再决定是短路还是续行"。
- `bindAsync` 反向:接 `Promise<IResultOfT>`,回调可返回同步 `IResultOfT` 或 `Promise<IResultOfT>`——把同步结果混进纯异步链路。
- `bindAsyncOption` 是 Option 版。
- `bindThroughAsync` 是 `bindAsync` 的保留值变体。

**映射族(5 个)**

- `asyncMap` 把 sync result 接进 async 回调。
- `mapAsync` 把 `Promise<IResultOfT>` 的 success 值通过同步 / 异步回调映射——这里显式支持 `B | Promise<B>` 双形态。
- `mapAsyncOption` 是 `mapAsync` 的 Option 版。
- `mapErrAsync` 失败轨道对偶。
- `bimapAsync` 同时映射两条轨道,callback 同时接受 sync / Promise 回值。

**Side-effect 族(6 个)**

`asyncTap` / `asyncTapErr` / `tapAsync` / `tapErrAsync` 处理 result 侧;`asyncTapOption` / `tapAsyncOption` 处理 option 侧。这一族**完整覆盖"同步回调同步 throw / 同步回调异步 reject / 异步回调 reject"三路径**,在 JSDoc 明示 catch+convert 合约,测试用 `vi.fn()` 配合 `expect(fn).toHaveBeenCalledOnce` 与 `expect(r).toBe(original)` 验证身份保留。原 result 对象透传,绝不构造新包装。

**谓词族(4 个)**

`containsAsync` 与 `containsAsyncOption` 用 `===` 比较;`existsAsync` 与 `existsAsyncOption` 接受同步 / 异步 predicate。失败的 catch+convert 策略:predicate / fn 抛出时一律归约 `false`(BOOL 终态),与 `R.map` 风格相反——谓词族**避免抛错上浮到上层**。

**过滤族(2 个)**

- `filterAsyncOption` 单 predicate 过滤;predicate throw / reject 时归约 `None`。
- `filterOrElseAsync` 接受 `predicate` + `errorFn`,在 predicate 失败时把原值传给 `errorFn` 映射为 error,**独立三处**断言 catch+convert:
  - sync `predicate` throw 归约 `err(caughtError)`;
  - async `predicate` reject 归约 `err(caughtError)`;
  - sync `errorFn` throw 归约 `err(caughtError)`。

**结构族(3 个)**

- `flattenAsync` 把 `Promise<IResultOfT<IResultOfT<A, E>, E>>` 展平到 `Promise<IResultOfT<A, E>>`,外层 Err 短路。
- `flattenAsyncOption` 是 Option 版。
- `swapAsync` 是 Ok/Err 字面量交换。

**终态族(9 个)**

- `matchAsync` / `matchAsyncOption` 模式匹配,handler 接受 `C | Promise<C>`,**handler throw 沿 Promise reject 路径传播**(与 `operators/match` 对齐)。
- `mapOrAsync` / `mapOrElseAsync` 是异步版的"success 映射或失败 default"——失败侧的 default 取自给定值,后者在错误上计算。
- `unwrapOrAsync` / `unwrapOrAsyncOption` 终态提取,default 接受 `A | Promise<A>`。
- `unwrapOrElseAsync` 在错误侧计算 default,支持 async 错误处理器。
- `orElseAsync` / `orElseAsyncOption` 在失败 / None 侧走 recovery 路径。

特别地 `unwrapOrAsyncOption` 的 [lazy await 测试](</abs/path/E:/projects/sandlada/result/src/async/unwrapOrAsyncOption.ts:35>) 用 `setTimeout(10)` 验证了 `await defaultValue` 真的会 await,而非 `return defaultValue` 漏了 await——这是防回归的高质量测试。

## 模块的设计原则

- **eager vs lazy 的清晰界线**:本目录是 eager,所有算子接受并返回 `Promise`;不要与 `async-result/`(惰性 thunk)混淆。当"何时求值"必须由调用方控制时,用 `async-result/`。
- **catch+convert 在错误位置**:每个会在回调中 throw / reject 的算子,都用 `try / catch` + `Promise.then(_, onRejected)` 双向收敛,把错误归约为 `err(caughtError)` / `None` / `false` / `default` 等"已恢复"的状态。谓词族 / 过滤族作为**始终吞下异常**的终态工具,与 `match` 的"让异常上浮"形成对照。
- **callback 同时接受 sync / async**:在 `mapAsync` / `mapOrAsync` / `mapOrElseAsync` / `unwrapOrAsyncOption` / `unwrapOrElseAsync` 等算子上,callback 形参声明为 `B | Promise<B>` / `A | Promise<A>`,调用方写同步或异步函数都行——这是 TS 在类型层吸收 sync / async 形态差异。
- **`unwrapOrAsyncOption` 的 lazy await 合约**:default 是 `T | Promise<T>`,**必须 await** 后再返回,不能把 Promise 引用直接 return。这条合约由 `setTimeout` 测试固化,任何"忘了 await"的实现回归都会被这条测试抓到。
- **同步入口 / 异步出 = 同步入口有可观察性**:sync 入参的算子(`asyncBind` / `asyncBindThrough` / `asyncMap` / `asyncTap`)保留原 result / option 的**身份**(测试用 `expect(r).toBe(original)` 验证),让上层能做引用比较。
- **`Promise.resolve` 做零分配失败透传**:对短路路径(失败 / None),直接 `Promise.resolve(r)` 不构造新对象,符合项目的"plain object 不装箱"原则。
