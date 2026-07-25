# promise-option

`promise-option` 模块是 `Promise<IOption<T>>` 上的**全部 eager async 算子**。与 `promise-result/`(同形态但操作 `Promise<IResultOfT>`)是镜像双胞胎——`promise-result/` 处理 Result 的两个变体,本目录处理 Option 的两个变体。本目录是项目里专攻 `Promise<IOption>` 的一层,**此前曾与 `promise-result/` 合并存放**,现已拆出以让包名与内容对齐。

## 文件清单与作用

### `*AsyncOption` 系列 — 操作 `Promise<IOption<T>>`,回调可同步或异步(13 个)

- `mapAsyncOption` 把 `Promise<IOption>` 的 value 通过同步 / 异步回调映射——显式支持 `B | Promise<B>` 双形态。
- `bindAsyncOption` / `orElseAsyncOption` 链式 / None 兜底,回调可返回同步 `IOption<U>` 或 `Promise<IOption<U>>`。
- `matchAsyncOption` 模式匹配,handler 接受 `U | Promise<U>`,**handler throw 沿 Promise reject 路径传播**(与 `option/match` 对齐)。
- `mapOrAsyncOption` / `mapOrElseAsyncOption` "value 映射或 None default" 一站式算子。
- `tapAsyncOption` / `tapErrAsyncOption` Some / None 侧 side-effect,throw / reject 归约 `None`。
- `unwrapOrAsyncOption` / `unwrapOrElseAsyncOption` 终态提取,default 接受 `T | Promise<T>`,**必须 await** 后再返回(`setTimeout` 测试固化 lazy await 合约)。
- `containsAsyncOption` / `existsAsyncOption` / `filterAsyncOption` 谓词族——predicate throw / reject 一律归约 `false` / `None`,**避免异常上浮**。
- `flattenAsyncOption` 解嵌套 `Promise<IOption<IOption>>`,None 短路。

### `async*Option` 系列 — 把同步 `IOption<T>` 升格到 async(5 个)

- `asyncBindOption` / `asyncTapOption` 桥接 sync Option → async。
- `asyncMapOption` / `asyncOrElseOption` / `asyncMatchOption` async 端的 lift 算子。

## 模块的设计原则

- **eager vs lazy 的清晰界线**:本目录是 eager,所有算子接受并返回 `Promise`;不要与 `async-option/`(惰性 thunk)混淆。当"何时求值"必须由调用方控制时,用 `async-option/`。
- **catch+convert 在错误位置**:每个会在回调中 throw / reject 的算子,都用 `try / catch` + `Promise.then(_, onRejected)` 双向收敛,把错误归约为 `None` / `false` / `default`。谓词族 / 过滤族作为**始终吞下异常**的终态工具,与 `match` 的"让异常上浮"形成对照。
- **callback 同时接受 sync / async**:在 `mapAsyncOption` / `mapOrAsyncOption` / `mapOrElseAsyncOption` / `unwrapOrAsyncOption` / `unwrapOrElseAsyncOption` 等算子上,callback 形参声明为 `B | Promise<B>` / `T | Promise<T>`,调用方写同步或异步函数都行——TS 在类型层吸收 sync / async 形态差异。
- **`unwrapOrAsyncOption` 的 lazy await 合约**:default 是 `T | Promise<T>`,**必须 await** 后再返回,不能把 Promise 引用直接 return。这条合约由 `setTimeout` 测试固化,任何"忘了 await"的实现回归都会被这条测试抓到。
- **同步入口 / 异步出 = 同步入口有可观察性**:sync 入参的算子(`asyncBindOption` / `asyncMapOption` / `asyncTapOption` / `asyncOrElseOption` / `asyncMatchOption`)保留原 option 的**身份**(测试用 `expect(o).toBe(original)` 验证),让上层能做引用比较。
- **`Promise.resolve` 做零分配失败透传**:对短路路径(None),直接 `Promise.resolve(o)` 不构造新对象,符合项目的"plain object 不装箱"原则。

## 算子分类总览

- **`*AsyncOption` 系列(14)**:`mapAsyncOption` / `bindAsyncOption` / `orElseAsyncOption` / `matchAsyncOption` / `mapOrAsyncOption` / `mapOrElseAsyncOption` / `tapAsyncOption` / `tapErrAsyncOption` / `unwrapOrAsyncOption` / `unwrapOrElseAsyncOption` / `containsAsyncOption` / `existsAsyncOption` / `filterAsyncOption` / `flattenAsyncOption`
- **`async*Option` 系列(5)**:`asyncBindOption` / `asyncTapOption` / `asyncMapOption` / `asyncOrElseOption` / `asyncMatchOption`