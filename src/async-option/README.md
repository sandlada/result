# async-option

`async-option` 模块承载 `AsyncOption<T>` 这一惰性 async thunk 形态的**全部算子与工厂**。`AsyncOption<T>` 与 `Promise<IOption<T>>` 的关键区别在于**惰性**——所有工厂和算子都不立刻执行,而是返回一个 `{ run: () => Promise<IOption<T>> }` 字面量,把"何时求值"完全交给调用方。这一设计使组合中间不需要 `await`,让"管道像同步管道一样组合,但仍在异步点落定"成为可能。

## 文件清单与作用

**`from.ts`**

**核心工厂**。给定一个 thunk `() => Promise<IOption<T>>` 包成 `AsyncOption<T>`。Thunk 不在调用时刻执行,而是绑在 `.run` 上,直至 `ao.run()` 被显式 await 才求值——lazy 合约由 `called` 标志测试固化。

**`fromOption.ts`**

`IOption<T>` 的同步值**升格**为 `AsyncOption<T>`。返回 `{ run: () => Promise.resolve(option) }`,不引入新的内存分配,identity 透明——同一对象既可作为 sync 也可作为 async 使用。

**`fromPromise.ts`**

`Promise<T>` 的失败安全**包装**。Thunk 在 `.run()` 时被 `await`,resolve 时返回 `Some(value)`,reject(或同步抛错)被 `try / catch` 捕获后归约为 `None`——错误对象被有意丢弃,Contract 中没有传 errorFn 的位置,因此本函数适合"我不在乎为何失败,只关心成功或失败"的场景。

**`bind.ts`**

`AsyncOption` 上的 monadic bind(`>>=`)。内部 thunk 既可以返回 `AsyncOption<U>` 也可以返回 `Promise<IOption<U>>`(互操作),惰性地返回一个新的 `AsyncOption<U>`;在 `.run()` 阶段先 `await` 当前 ao,再在 Some 上调用 thunk。**对 thunk 同步抛错和 reject 双路径都收敛到 `None`,合约与 `map` 一致。** 此函数中**显式防御**了 `.jules/sentinel.md` 中记录的"`in` 操作符在非对象上抛 `TypeError`"问题——执行 `next.run()` 前先做 `next !== null && typeof next === 'object'` 的双判别。

**`map.ts` / `mapAsync.ts`**

`map` 接收同步 `fn(v)`;`mapAsync` 接收 `(v) => Promise<U>`。两者都是 data-last + 柯里化形态,在 Some 轨道上调用 fn,在 None 上直接输出 `None`。同步 throw 与 reject 一并归约为 `None`(JSDoc 与测试均固化)。`vi.fn()` 断言保证 fn 在 None 路径上不被多余调用。

**`filter.ts`**

`AsyncOption<T>` 上的谓词过滤。同步 / 异步 predicate 都接受;在 Some 上计算,返回 `true` 时透传,`false` 时归约 `None`;在 None 上直接透传。predicate throw / reject 一律归约为 `None`,与 option/`filter` 的 catch-and-convert 政策对称。

**`flatten.ts`**

`AsyncOption<AsyncOption<T>>` 解嵌套到 `AsyncOption<T>`。外层 Some 时直接 `await opt.value.run()`;外层 None 时返回 `ofNone()`。这是 functor-monad 链中与 `bind` 配合的"形式化绑定"算子。

**`tap.ts` / `tapAsync.ts`**

`tap` 接收同步 side-effect,`tapAsync` 接受 `void | Promise<void>`。两者在 Some 路径上调用回调,在 None 上跳过,原样返回原 AsyncOption。**显式合约:** side-effect 同步 throw 或 reject 归约为 `None`——与 `pipe/tap` 同步版策略保持一致,可在日志/度量钩子中放心使用。

**`orElse.ts`**

None 轨道兜底。`fn()` 既可以返回 `AsyncOption<T>` 也可以返回 `Promise<IOption<T>>`,在 None 路径上调用。fn 同步抛错或 reject 一律归约为 `None`。`vi.fn()` 断言保证 fn 在 Some 路径不被调用——这是该算子的核心"懒性 + 安全"语义。

**`contains.ts`**

终端判定。返回 `Promise<boolean>`,在 Some 且 value 严格 `===` target 时为 `true`,否则 `false`。判定语义沿用 `===`,不引入 `Object.is`,意味着 `NaN` / `0` 沿用 JS 引擎行为。`Promise.resolve` 透传 ao 错误。

**`exists.ts`**

与 `contains` 对偶,但接 predicate。同步 / 异步 predicate 都接受,返回 `Promise<boolean>`。throw / reject 路径都向上抛出,不会被静默吞——这是终端算子的可观察性合约。

**`match.ts`**

终态模式匹配。`match({some, none}, ao)` 返回 `Promise<U>`。Handler 既可以是同步也可以是异步。**显式合约:** handler 同步 throw / reject 沿 Promise reject 路径传播,不归约为 None——这是与 `pipe/match` 对应的"let-it-crash"风格终端算子。测试用 `await expect(...).rejects.toThrow(...)` 双向断言覆盖所有 throw 与 reject 路径。

**`unwrapOr.ts`**

终态提取。给定 `defaultValue: T | Promise<T>`,在 Some 上返回 value,在 None 上返回 default——若 default 自身是 Promise,会被 then 解包(语义与 Result `unwrapOr` 一致)。`Promise<T>` 默认值的四种组合(Sync/Async + direct/curried)在测试中都已验证。

## 模块的设计原则

- **惰性 vs 立即求值的语法分离**:所有算子都返回新的 `AsyncOption` thunk,调用方只在调用 `match` / `unwrapOr` / `.run()` 等终态算子时才真正求值。这是与 `async/`(eager `Promise<IResultOfT>`)的关键区分。
- **interop 防御采用 sentinel-safe 模式**:`bind` / `orElse` 等需要动态判别回调形态的算子,在使用 `in` 操作符之前**先**做 `next !== null && typeof next === 'object'` 的双重守卫,固化 `.jules/sentinel.md` 第二条提到的 `TypeError` 风险。
- **错误归约方向与 Option / Result 保持一致**:`try / catch` 的 catch 兜底一律把 throw / reject 转成 `None`,与 `option/` 模块的 tap/bind/map 策略统一,使跨类型组合时心智模型一致。
- **`vi.fn()` 不被调用的合约**:`map` / `bind` / `filter` / `tap` / `orElse` 都用 `vi.fn()` 在 None 路径上断言"不应被调用",固化"短路 + 懒"的双合约。
- **终态算子不吞错误**:`match` / `exists` / `unwrapOr` 是管道出口,任何 throw / reject 都允许沿 reject 路径传播,让上层 try/catch 或上游调度器接管。
- **`readonly` 与纯字面量**:所有 `run` 都是 `readonly`,返回的对象都是字面量,不引入类或闭包缓存。
