# factories

`factories` 是 `@sandlada/result` 中用于**构造结果值**的模块。与 `operators/` 通过链式变换结果不同,这一层只关心一件事:把外部世界的输入(原始值、同步计算、抛错函数、Promise)转化为 `IResult` / `IResultOfT` 形式的判别联合对象。所有工厂函数都返回项目最窄的判别类型,不引入类、构造器或闭包缓存。

## 文件清单与作用

**`ok.ts`**

唯一用于构造成功结果的工厂。支持无参与带值两种形态,前者产出 `IResult<never>`(void 成功),后者产出 `IResultOfT<T, never>`(带值成功)。成功结果的 `error` 类型被钉死为 `never`,在类型层杜绝"成功又带错"的不合法状态。`value` 在用户传入 `undefined` 时与无参情形通过 `arguments.length` 严格区分,以保留"显式 undefined 值"与"void 成功"两种语义。

**`err.ts`**

唯一用于构造失败结果的工厂。产出 `IResultOfT<never, E>`,其中 `value` 类型被钉死为 `never`。错误对象 `error` 完全由调用方提供,可以是字符串、对象、Error 子类或判别联合——本工厂不做语义包装,只负责把它放入 `IResultFailure` 的字面量形状中。

**`fromPredicate.ts`**

谓词式的工厂。给定一个布尔谓词、一个错误占位与一个待检值,返回 `Ok(value)` 或 `Err(errorOnFalse)`。同时提供柯里化形态,只绑定谓词与错误占位返回一个校验函数,适合在流水线中提前定义、在调用点再喂值。错误占位在柯里化闭包中被复用,这意味着每次谓词失败实际抛出的是同一引用——这对日志聚合与相等比较是有意的设计选择,不是疏漏。

**`fromThrowable.ts`**

把一个**会抛错的同步函数**装进一个不会抛错的同步函数。返回一个新函数:调用它时若原函数正常返回,包成 `Ok`;若抛错,经可选的 `errorFn` 映射后包成 `Err`。与 `tryCatch` 的区别在于"`fromThrowable` 在定义时包装、`tryCatch` 在调用时执行"——前者适合在模块顶层绑定一次,反复使用。

**`fromPromise.ts`**

把一个 `Promise<T>` 包成 `Promise<IResultOfT<T, E>>`。在异步等待完成后,成功路径固定走 `Ok`,失败(rejected)路径经可选的 `errorFn` 映射后走 `Err`。`errorFn` 缺位时直接把拒绝值原样作为错误透传,因此默认 `E = Error` 在调用方未指定时是合理默认值。

**`fromSafePromise.ts`**

`fromPromise` 的更严格版本,承诺被包装的 Promise 不会 reject。实际实现仍然兜底了 reject 路径,并对非 `Error` 类型的拒绝值显式归一化为 `new Error(String(reason))`,保证错误侧始终是 `Error` 实例。它把"我作为调用方保证这条 Promise 不会失败"这一契约变成类型化的 `Promise<IResultOfT<T, Error>>`。

**`tryCatch.ts`**

立即执行版的 `fromThrowable`。给定一个同步函数(及其可选的错误映射),立刻调用,把结果(或抛错)当场包成 `IResultOfT<T, E>`。区别于 `fromThrowable`:`tryCatch` 不返回新函数,直接返回结果对象,适合一次性使用或在迭代器内联调用。

**`tryCatchAsync.ts`**

立即执行版的异步包装。给定一个返回 `Promise` 的函数,`await` 它并把 resolve 值包成 `Ok`、把 reject 值(或同步抛错)经 `errorFn` 映射后包成 `Err`。`await` 关键字把同步抛错和异步拒绝两种路径收敛到同一个 `try / catch`,因此调用方不需要区分两种失败来源。

**`asyncOk.ts`**

预完成的异步成功结果工厂。返回一个已经 `resolve` 成 `Ok(value)` 的 `Promise<IResultOfT<T, never>>`,用于在测试桩、Sequence 起点、或需要把同步结果"Promisify"进 `Promise<IResultOfT>` 链路的场景。

**`asyncErr.ts`**

`asyncOk` 的对偶。返回一个已经 `resolve` 成 `Err(error)` 的 `Promise<IResultOfT<never, E>>`,常用于提前短路异步管道、或在错误注入测试中模拟一个已经失败的异步入口。

## 模块的设计原则

- **最窄返回类型**:每个工厂都直接返回 `IResultSuccess` / `IResultFailure` / `IResultOfTSuccess` / `IResultOfTFailure` 这一层的具体字面量,不向上引用宽泛的联合类型,让消费方在 `match` 中可以立即 exhaustive narrow。
- **纯数据、无副作用缓存**:`ok` / `err` 不引入类、不引入原型方法,完全是字面量对象,经 `JSON.stringify` / `structuredClone` 行为可预测。
- **`errorFn` 一致缺位语义**:对带 `errorFn?` 的工厂(`fromThrowable` / `fromPromise` / `tryCatch` / `tryCatchAsync`),缺位时错误对象原样透传,不擅自包装。这是与 F# `Result.mapError` 不同的取舍:本库把"如何表达错误"的决定权留给调用方。
- **同步 / 异步并行结构**:同名同步版与异步版一一对应(`tryCatch` ⇄ `tryCatchAsync`、`asyncOk` ⇄ `asyncErr`),通过 TS 重载与命名空间清晰区分,使消费方在阅读调用点时一眼分辨失败源。
