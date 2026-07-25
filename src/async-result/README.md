# async-result

`async-result` 模块是 `AsyncResult<T, E>` 惰性 thunk 形态的**全部算子与工厂**集合。`AsyncResult<T, E>` 是一个 `{ run: () => Promise<IResultOfT<T, E>> }` 的纯字面量,而本目录的所有算子都返回一个**新的 thunk**,不立刻执行——直到调用方显式 `await ar.run()` 或经终态算子(`match` / `unwrapOr`)求值。本目录与 `promise-result/`(eager `Promise<IResultOfT>`)的差别在于:**把"何时执行"的控制权完全交还给调用方**。

## 文件清单与作用

### 工厂族

`from` 接收 `() => Promise<IResultOfT<T, E>>` thunk 并绑到 `.run`,惰性绑定。`fromPromise` 接收 `() => Promise<T>`,在 `.run()` 阶段用 `try / catch` 把 reject 映射为 `err`,并支持 `errorFn` 自定义错误形状。`fromResult` 把同步 `IResultOfT` 升格为 `AsyncResult`——`run: () => Promise.resolve(result)` 不引入新分配,同一对象既可同步也可异步消费。

**映射族**

`map` / `mapAsync` 在成功轨道上调用同步或异步 fn,失败路径透传。`mapErr` / `mapErrAsync` 在失败轨道上对偶。`bimap` 同时映射两条轨道。`mapOr` / `mapOrElse` 是"成功映射或失败 default"的一站式算子,callback 同步 / 异步均可,throw / reject 归约 default。所有映射族都对回调的同步 throw 与异步 reject 统一归约为 `err(caughtError)`,由测试断言固化。

**链式族**

`bind` 在成功路径上调用 `fn(value)`,`fn` 既可返回 `AsyncResult<U, E>` 也可返回 `Promise<IResultOfT<U, E>>`——这是与外部 Promise-based 代码互操作的入口。`orElse` 是对偶,在失败路径上调用 `fn(error)`,错误类型扩到 `E | F`。`bind` 与 `orElse` **都使用显式 sentinel-safe 防御**(`next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function'`)——固化 `.jules/sentinel.md` 中记录的"`in` 操作符对非对象抛 `TypeError`"风险。

**短路组合族**

`and` / `or` 对偶——`and(res1, res2)` 在 res1 Ok 时返回 res2(否则返回 res1 的 Err);`or(res1, res2)` 在 res1 Ok 时直接返回 res1,否则返回 res2。两边均**惰性求值**:res2 仅在需要时才 `run()`,由测试用 `evaluated` flag 断言固化。

**Side-effect 族**

`tap` / `tapAsync` 在成功轨道上调用回调,`tapErr` / `tapErrAsync` 在失败轨道对偶。**同族四件套共享合约:回调同步 throw 或 reject 一律归约为 `err(caughtError)`,原 result 形态丢失**——这是项目明确的"tap/tee policy"。`andTee` / `andThrough` / `orTee` 是更细分的变种:`andTee` 忽略回调返回值,只在成功侧触发;`andThrough` 把回调失败**传播**回原 result,允许错误类型扩展;`orTee` 镜像 `andTee` 在失败侧。`andTee` / `orTee` 的回调签名已支持同步 + 异步(返回 `void | unknown | Promise<void | unknown>`),所以**无需单独的 `andTeeAsync` / `orTeeAsync`**——这点与 `tap`/`tapAsync` 的拆分不同。

**聚合族**

`combine` 用 `Promise.all` 并发收集所有 `ar.run()` 结果,然后在首个失败处短路返回;`combineWithAllErrors` 不短路,把全部错误累积为 `E[]` 返回。`ap` 接收 `AsyncResult<(a: A) => B, E>` 与 `AsyncResult<A, E>`,两者都成功时把 fn 应用于 value,任一失败则传播。这三者一起覆盖了 ROP 的"短路 vs 全量 vs applicative"三元语义。

### 独立谓词族

`isOk` / `isErr` 是对 `IResultOfT.isSuccess` / `isFailure` 字段的函数式封装,返回 `Promise<boolean>`。封装 `.run().then(r => r.isSuccess)` 的常见样板。`containsErr` 与 `contains` 对偶,在 Err 轨道上做 `===` 比较,用于"这个错误是不是某个具体原因"判定。

**终态族**

`match` 是 `await + 分支`,返回 `Promise<U>`,handler 既同步也接受 `Promise<U>`。`unwrap` / `unwrapErr` 是 panic 风格提取:Ok 上返回 value,Err 上抛 `Error("Called 'unwrap' on an Err value: <error>")`(反向亦然);带消息的版本 `expect` / `expectErr` 用用户给定的 message 重写抛出的 Error。`unwrapOr` 在成功返回 value,失败返回给定 default;`unwrapOrElse` 的 default 由 thunk 延迟计算,适合昂贵默认——default 既可以是同步值也可以是 `Promise<T>`,由 `Promise.resolve` 隐式摊平。`contains` / `exists` 是 boolean 终态,前者用 `===`,后者支持 sync + 异步 predicate。

**结构族**

`flatten` 把 `AsyncResult<AsyncResult<T, E>, E>` 解嵌套为 `AsyncResult<T, E>`——可以看作是 `bind` 的"形式化绑定"路径。`swapAsync` 是 Ok/Err 字面量在 lazy 上下文的交换。`filterOrElse` 在成功路径上调用 predicate,不满足时把原值映射为 `err(errorFn(value))`;异步 predicate 与 async errorFn 都支持,并对 predicate / errorFn 的同步 throw 与异步 reject **三处独立断言**统一归约,是本模块错误归约策略最完整测试覆盖的一处。

## 算子分类总览

- **工厂族**:`from` / `fromPromise` / `fromResult`
- **映射族**:`map` / `mapAsync` / `mapErr` / `mapErrAsync` / `bimap` / `mapOr` / `mapOrElse`
- **链式族**:`bind` / `orElse`
- **短路组合**:`and` / `or`
- **Side-effect 族**:`tap` / `tapAsync` / `tapErr` / `tapErrAsync` / `andTee` / `andThrough` / `orTee`
- **聚合族**:`combine` / `combineWithAllErrors` / `ap`
- **独立谓词族**:`isOk` / `isErr` / `contains` / `exists` / `containsErr`
- **终态族**:`match` / `unwrap` / `unwrapErr` / `expect` / `expectErr` / `unwrapOr` / `unwrapOrElse`
- **结构族**:`flatten` / `swapAsync` / `filterOrElse`

## 模块的设计原则

- **惰性 vs 立即求值的边界明确**:每一个算子(包括 `combine*` 与 `and` / `or`)都返回一个新 AsyncResult thunk,不预先求值——调用方在 `await ar.run()`、`match` 或 `unwrapOr` 时才发生实际计算。`vi.fn()` 与 `executed` flag 在多个测试中固化"构造时不得调 `run()`"合约。
- **`run` 是一次性的 thunk 接口**:`AsyncResult<T, E>` 接口仅暴露 `readonly run`,不暴露 `value` / `error` 等中间态,杜绝调用方绕过终态算子直接取数据。
- **`bind` 与 `orElse` 的 sentinel-safe 模板**:动态判别回调形态(返回 `AsyncResult` 还是裸 `Promise<IResultOfT>`)时,**先**做 `next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function'` 的双重守卫,固化 `.jules/sentinel.md` 第二条提到的 `TypeError` 风险。这是项目级的"运行时互操作合约"。
- **错误归约方向统一**:`tap` / `bind` / `map` / `mapErr` / `bimap` / `mapOr` / `mapOrElse` / `filterOrElse` / `combine` 等所有可能抛回调或 reject 的算子,都用 `try / catch` 把回调同步 throw 或 reject 归约为 `err(caughtError)`;`match` / `unwrap` / `unwrapErr` / `expect` / `expectErr` 等纯终态算子则**不**捕获 handler throw,沿 reject 传播。
- **`combine` 与 `combineWithAllErrors` 互为对偶**:语义上的短路 vs 全量累积,与 `combine/` 模块的同步版本一一对应,行为契约同步。
- **`andTee` / `orTee` 不拆 `Async` 变体**:与 `tap`/`tapAsync` 的拆分哲学不同,`andTee` / `orTee` 在签名层同时接受同步 + 异步回调,无需单独的 `*Async` 文件。这避免了对一个内部表达统一的操作做两种重复实现。
- **`readonly` 全覆盖**:每个 thunk 的 `run` 与每次返回的对象字面量都是只读;不引入类,跨调用不共享状态。
- **`AsyncResult<unknown, F>` 接收 wide-type value**:`andThrough` 使用 `AsyncResult<unknown, F>` 作为回调返回类型,符合"我只关心侧效应,不在乎产出值"的 ROP 语义。