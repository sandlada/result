# async-option

`async-option` 模块承载 `AsyncOption<T>` 这一惰性 async thunk 形态的**全部算子与工厂**。`AsyncOption<T>` 与 `Promise<IOption<T>>` 的关键区别在于**惰性**——所有工厂和算子都不立刻执行,而是返回一个 `{ run: () => Promise<IOption<T>> }` 字面量,把"何时求值"完全交给调用方。这一设计使组合中间不需要 `await`,让"管道像同步管道一样组合,但仍在异步点落定"成为可能。

## 文件清单与作用

**`from.ts`**

**核心工厂**。给定一个 thunk `() => Promise<IOption<T>>` 包成 `AsyncOption<T>`。Thunk 不在调用时刻执行,而是绑在 `.run` 上,直至 `ao.run()` 被显式 await 才求值——lazy 合约由 `called` 标志测试固化。

**`fromOption.ts`**

`IOption<T>` 的同步值**升格**为 `AsyncOption<T>`。返回 `{ run: () => Promise.resolve(option) }`,不引入新的内存分配,identity 透明——同一对象既可作为 sync 也可作为 async 使用。

**`fromPromise.ts`**

`Promise<T>` 的失败安全**包装**。Thunk 在 `.run()` 时被 `await`,resolve 时返回 `Some(value)`,reject(或同步抛错)被 `try / catch` 捕获后归约为 `None`——错误对象被有意丢弃,Contract 中没有传 errorFn 的位置,因此本函数适合"我不在乎为何失败,只关心成功或失败"的场景。

**`ofSome.ts` / `ofNone.ts`**

直接构造器。`ofSome(value)` 返回 `AsyncOption<T>` 解到 `Some(value)`;`ofNone()` 返回永远解到 `None` 的 thunk。与 `fromOption(ofSome(...))` 等价,但跳过 sync 中间一步的装箱。

**`bind.ts`**

`AsyncOption` 上的 monadic bind(`>>=`)。内部 thunk 既可以返回 `AsyncOption<U>` 也可以返回 `Promise<IOption<U>>`(互操作),惰性地返回一个新的 `AsyncOption<U>`;在 `.run()` 阶段先 `await` 当前 ao,再在 Some 上调用 thunk。**对 thunk 同步抛错和 reject 双路径都收敛到 `None`,合约与 `map` 一致。** 此函数中**显式防御**了 `.jules/sentinel.md` 中记录的"`in` 操作符在非对象上抛 `TypeError`"问题——执行 `next.run()` 前先做 `next !== null && typeof next === 'object'` 的双判别。

**`map.ts` / `mapAsync.ts`**

`map` 接收同步 `fn(v)`;`mapAsync` 接收 `(v) => Promise<U>`。两者都是 data-last + 柯里化形态,在 Some 轨道上调用 fn,在 None 上直接输出 `None`。同步 throw 与 reject 一并归约为 `None`(JSDoc 与测试均固化)。`vi.fn()` 断言保证 fn 在 None 路径上不被多余调用。

**`mapOr.ts` / `mapOrElse.ts`**

带默认值的一站式变换。`mapOr(default, fn, ao)` 在 Some 上映射,在 None 上返回 default;`mapOrElse(onNone, fn, ao)` 的 None 路径走 `onNone()` thunk(lazy)。两者均接受同步 / 异步 fn,callback throw / reject 归约 default,合约与 `map` 对齐。

**`filter.ts`**

`AsyncOption<T>` 上的谓词过滤。同步 / 异步 predicate 都接受;在 Some 上计算,返回 `true` 时透传,`false` 时归约 `None`;在 None 上直接透传。predicate throw / reject 一律归约为 `None`,与 option/`filter` 的 catch-and-convert 政策对称。

**`flatten.ts`**

`AsyncOption<AsyncOption<T>>` 解嵌套到 `AsyncOption<T>`。外层 Some 时直接 `await opt.value.run()`;外层 None 时返回 `ofNone()`。这是 functor-monad 链中与 `bind` 配合的"形式化绑定"算子。

**`tap.ts` / `tapAsync.ts`**

`tap` 接收同步 side-effect,`tapAsync` 接受 `void | Promise<void>`。两者在 Some 路径上调用回调,在 None 上跳过,原样返回原 AsyncOption。**显式合约:** side-effect 同步 throw 或 reject 归约为 `None`——与 `pipe/tap` 同步版策略保持一致,可在日志/度量钩子中放心使用。

**`orElse.ts`**

None 轨道兜底。`fn()` 既可以返回 `AsyncOption<T>` 也可以返回 `Promise<IOption<T>>`,在 None 路径上调用。fn 同步抛错或 reject 一律归约为 `None`。`vi.fn()` 断言保证 fn 在 Some 路径不被调用——这是该算子的核心"懒性 + 安全"语义。

**`zipWith.ts`**

二元组合。给定 `fn(a, b)` 与两个 AsyncOption,在两端都是 Some 时调用 fn,任一为 None 时返回 None。fn 同步 / 异步皆可。

**`all.ts`**

`Promise.all` 的 Option 版。把 `AsyncOption<T>[]` 收成 `AsyncOption<T[]>`,任一为 None 时整体归约 None,等价于 Rust 的 `Option<Vec<T>>::transpose`。

**`okOr.ts` / `okOrElse.ts`**

桥接到 `AsyncResult<T, E>`。`okOr(error, ao)` 在 None 时直接给 `Err(error)`;`okOrElse(onNone, ao)` 在 None 时 lazy 调用 `onNone()` 产生错误。同步 / 异步 `onNone` 都接受,throw 路径归约 `err(caughtError)`。

**`transpose.ts`**

`AsyncOption<AsyncResult<T, E>>` ↔ `AsyncResult<AsyncOption<T>, E>` 的形式化转置。`Some(Ok(v))` → `Ok(Some(v))`,`Some(Err(e))` → `Err(e)`,`None` → `Ok(None)`。直接构造结果字面量以避免与工厂函数的类型转换交互出现兼容性问题。

**`contains.ts`**

终端判定。返回 `Promise<boolean>`,在 Some 且 value 严格 `===` target 时为 `true`,否则 `false`。判定语义沿用 `===`,不引入 `Object.is`,意味着 `NaN` / `0` 沿用 JS 引擎行为。`Promise.resolve` 透传 ao 错误。

**`exists.ts`**

与 `contains` 对偶,但接 predicate。同步 / 异步 predicate 都接受,返回 `Promise<boolean>`。throw / reject 路径都向上抛出,不会被静默吞——这是终端算子的可观察性合约。

**`isSome.ts` / `isNone.ts`**

独立谓词。把 `IOption.isSome` / `IOption.isNone` 字段提取为 `Promise<boolean>` 函数。给上层"在没有 await `ao.run()` 之前就要先判定"的场景用,封装 `.run().then(opt => opt.isSome)` 这种常见样板。

**`match.ts`**

终态模式匹配。`match({some, none}, ao)` 返回 `Promise<U>`。Handler 既可以是同步也可以是异步。**显式合约:** handler 同步 throw / reject 沿 Promise reject 路径传播,不归约为 None——这是与 `pipe/match` 对应的"let-it-crash"风格终端算子。测试用 `await expect(...).rejects.toThrow(...)` 双向断言覆盖所有 throw 与 reject 路径。

**`unwrap.ts`**

Some 上返回值,None 上抛 `Error("Called 'unwrap' on a None value")`。仅用于"我有信心一定有值"的内部断言场景——大多数业务代码请用 `unwrapOr` / `unwrapOrElse` / `match`。

**`unwrapOr.ts` / `unwrapOrElse.ts`**

终态提取。给定 `defaultValue: T | Promise<T>`,在 Some 上返回 value,在 None 上返回 default(`unwrapOrElse` 的 default 由 `onNone()` thunk 延迟计算,适合昂贵默认)。若 default 自身是 Promise,会被 then 解包(语义与 Result `unwrapOr` 一致)。`Promise<T>` 默认值的四种组合(Sync/Async + direct/curried)在测试中都已验证。

## 模块的设计原则

- **惰性 vs 立即求值的语法分离**:所有算子都返回新的 `AsyncOption` thunk,调用方只在调用 `match` / `unwrapOr` / `.run()` 等终态算子时才真正求值。这是与 `promise-result/`(eager `Promise<IResultOfT>`)的关键区分。
- **interop 防御采用 sentinel-safe 模式**:`bind` / `orElse` 等需要动态判别回调形态的算子,在使用 `in` 操作符之前**先**做 `next !== null && typeof next === 'object'` 的双重守卫,固化 `.jules/sentinel.md` 第二条提到的 `TypeError` 风险。
- **错误归约方向与 Option / Result 保持一致**:`try / catch` 的 catch 兜底一律把 throw / reject 转成 `None`,与 `option/` 模块的 tap/bind/map 策略统一,使跨类型组合时心智模型一致。
- **`vi.fn()` 不被调用的合约**:`map` / `bind` / `filter` / `tap` / `orElse` 都用 `vi.fn()` 在 None 路径上断言"不应被调用",固化"短路 + 懒"的双合约。
- **终态算子不吞错误**:`match` / `exists` / `unwrapOr` / `unwrapOrElse` / `unwrap` / `okOr` / `okOrElse` 是管道出口,任何 throw / reject 都允许沿 reject 路径传播,让上层 try/catch 或上游调度器接管。
- **`readonly` 与纯字面量**:所有 `run` 都是 `readonly`,返回的对象都是字面量,不引入类或闭包缓存。

## 算子分类总览

- **构造函数**:`from` / `fromPromise` / `fromOption` / `ofSome` / `ofNone`
- **变换**:`map` / `mapAsync` / `mapOr` / `mapOrElse` / `bind` / `flatten`
- **过滤 / 细化**:`filter`
- **桥接**:`okOr` / `okOrElse` / `transpose`
- **组合**:`zipWith` / `all`
- **Side-effect**:`tap` / `tapAsync`
- **兜底**:`orElse`
- **谓词**:`contains` / `exists` / `isSome` / `isNone`
- **终态**:`match` / `unwrap` / `unwrapOr` / `unwrapOrElse`