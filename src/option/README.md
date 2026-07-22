# option

`option` 模块承担 `IOption<T>` 类型的全部**函数式算子**——把 `ofSome(value)` / `ofNone()` 这两个最朴素的判别对象映射为可组合的算子世界。本目录刻意保持与 `Result` 解耦:不引入 `IResultOfT` / `IResult` 也不依赖 Result 的工厂,通过 `src/adapters/fromOption` 与 `src/adapters/toOption` 在两个域之间互转。这一隔离与 ARCH.md ADR 5 "Independent Option Module" 严格对齐。

## 文件清单与作用

**`ofSome.ts`**

`Some` 构造器。接收任意类型 `T`,产出 `{ isSome: true as const; isNone: false as const; value: T }`。判别字段都使用字面量 `as const`,保留 TypeScript 在 `if (opt.isSome)` 之后的 narrowing 能力。

**`ofNone.ts`**

`None` 构造器。产出 `{ isSome: false as const; isNone: true as const }`,类型层面返回 `IOption<never>`——`never` 让 `None` 在赋值给任何 `IOption<T>` 时都是合法的。`value` 字段在这种下不存在,访问会得到编译错误。

**`map.ts`**

`T → U` 的值映射算子。`Some(v)` 路径上调用 `fn(v)`,产出 `Some(fn(v))`;`None` 路径直接透传。同步 throw 经 `try / catch` 归约为 `None`,与 `tap` / `bind` 等算子的错误策略一致。柯里化形态 `map<T, U>(fn): (opt) => IOption<U>` 配合 `pipe` 写出从左到右的链。

**`bind.ts`**

`IOption` 上的 monadic bind。`bind(fn)(opt)` 在 Some 上调用 `fn(v)` 并把它的返回值作为最终结果;在 None 上原样透传,且从不调用 `fn`。`fn` 同步 throw 同样归约为 `None`。这是 IO 范畴中的 `>>=` 操作。

**`flatten.ts`**

`IOption<IOption<T>>` 解嵌套到 `IOption<T>`。外层是 None 时透传 None;外层是 Some 时直接返回内层——这意味着 `Some(None)` 自然压平为 `None`,无须额外判断。

**`filter.ts`**

谓词过滤。`Some(v)` 上跑 `predicate(v)`,返回 true 时透传,返回 false 时转为 `None`。`None` 路径直接透传。`predicate` 同步 throw 同样归约为 `None`。

**`tap.ts`**

`Some` 轨道 side-effect。`tap(fn)(opt)` 在 `opt.isSome` 上调用 `fn(value)`,然后原样返回 `opt`。**显式合约:** 若 `fn` 抛错,产出 `None`(在 JSDoc 与测试中均有声明)。

**`orElse.ts`**

None 兜底。`orElse(fn)(opt)` 在 Some 上原样透传;在 None 上调用 `fn()` 获取新的 `IOption<T>` 作为替代品。`fn` 同步 throw 归约为 `None`。`fn` 在 Some 路径上**不**被调用——这一懒执行属性由测试中 `called` 标志固化为合约。

**`contains.ts`**

相等性判定。`contains(target)(opt)` 在 `opt.isSome && opt.value === target` 时为 `true`,否则为 `false`。比较语义固定为 `===`,不引入 `Object.is`,因此 `NaN` / `-0` 沿用 JS 引擎语义。

**`unwrapOr.ts`**

值提取。`unwrapOr(default)(opt)` 在 Some 上返回 value,在 None 上返回 default。**永不抛错**——给定 default 必须是良构的展示值。

**`match.ts`**

终态消费。`match(onSome, onNone)(opt)` 视 `opt.isSome` 选一边调用;返回 `onSome(value)` 或 `onNone()` 的统一类型 `U`。同步 throw 由调用方函数承担。

**`okOr.ts`**

把 Option 提升为 Result。`Some(v)` → `Ok(v)`;`None` → `Err(error)`,其中 `error` 是调用方预先提供的固定值。不需要求值时使用这一形式,避免额外的函数调用开销。

**`okOrElse.ts`**

`okOr` 的懒执行版本。`Some` 路径同 `okOr`;`None` 路径调用 `errorFn()` 同步取出错误值。**测试显式断言 `called` 标志在 Some 路径为 `false`**——这是 lazy 合约的硬约束。

**`all.ts`**

异构元组全成功聚合。`all([optA, optB, optC])` 在所有元素都是 Some 时返回 `Some(values)`;任一为 None 时短路返回 None。形参是 `readonly [IOption<unknown>, ...]`,通过 mapped-type 保留每个位置上 value 的真实类型。

**`transpose.ts`**

互换 `IOption<IResultOfT<T, E>>` 与 `IResultOfT<IOption<T>, E>`。`Some(Ok(v))` → `Ok(Some(v))`;`Some(Err(e))` → `Err(e)`;`None` → `Ok(None)`。这是双层判别联合 narrow 的唯一路径,测试覆盖所有三个分支。

**`zipWith.ts`**

二元聚合。`zipWith(fn)(optA, optB)` 当两侧都是 Some 时返回 `Some(fn(a, b))`;任一是 None 时返回 `None`。`fn` 同步 throw 归约为 `None`。柯里化第一参数后,函数重用性高,可作为"任意两侧融合"的通用算子。

## 模块的设计原则

- **完全独立**:`option/` 不导入 `operators/`、`combine/`、`factories/` 中的 Result-side 工厂。`ofSome` / `ofNone` 是字面量,`okOr` / `okOrElse` / `transpose` 是该模块允许引入的少数跨域工厂,均位于 `factories/` 内的安全面。`tap` / `bind` 等算子的实现也都只调用本目录内的 `ofNone` / `ofSome`,不形成跨目录依赖环。
- **错误归约一致**:`bind` / `map` / `filter` / `tap` / `orElse` / `zipWith` 都把回调同步 throw 归约到 `None`(配合 Result 的 `Err` 归约形成对称)。这不是疏忽,而是 contract——JSDoc 写明,测试断言固化。
- **Lazy 合约**:`orElse` 与 `okOrElse` 测试都验证"回调不会被多余调用"——提供给上游一个干净的、可观测的"何时求值"边界。
- **Most narrow return type**:构造器返回 `IOption<T>`,各算子返回 `IOption<U>` / `IOption<T>` / `T` / `boolean` / `U`,**永不**返回 `IOption<T> | undefined` 这类被加宽的类型。
- **`readonly` 一致性**:`IOption<T>` 由 `IResult` 同源接口保证;所有算子接收 `IOption<T>` 而非可变变体,跨函数不会改变入参字面量。
