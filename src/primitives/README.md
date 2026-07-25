# primitives

`primitives` 是 `@sandlada/result` 中**补齐高频常用**但 ROP 主体层未直接提供的工具——每个文件都是对 `factories/` / `combine/` / `async-result/` 中既有能力的薄包装或同义别名。本目录的设计意图是**让最常见的"语义命名"先在主文档里可搜到**,而不必让上游库把名字写得更长。

## 设计约束

- **零运行时开销**——大多数算子是 `ok` / `err` / `combine` 等既有原语的薄壳,实现只有一行 `return combine(results)` 这样的 forwarding,经 bundler 树摇后能被完全消除。
- **不引入新的判别联合**——只复用 `IResultOfT` / `IOption` / `AsyncResult` 三种宿主类型,与 ARCH.md ADR 7 中"primitives 不引入新抽象"的取向严格对齐。
- **命名约定保留风格**——`cond` / `lift` / `partitionOption` 等借用 Haskell / Rust 词汇,但保持本项目 camelCase 风格。
- **`sequence` / `sequenceAsyncResult` 是同名语义的两个执行模型**——前者对应 `combine`(eager),后者对应 `async-result/combine`(lazy),不混淆。

## 文件清单与作用

**`cond.ts`**

**值感知**版的 `fromPredicate`。`cond(pred, err, v)` 在 `pred(v)` 通过时返回 `Ok(v)`,否则返回 `Err(err)`——`v` 始终透传,与 `fromPredicate` 的"只校验不传值"形成对比。典型用例:`Err({ value, allowed })` 这种"失败分支也需要原值才能报错"的场景。

**`condErr.ts`**

`cond` 的对偶。`condErr(pred, ok, err)` 当 `pred(ok)` 为 false 时返回 `Err(err)`——返回 `ok` 失败时抛 `Err`;反过来等价于"`!pred(v)` 时拒绝"。适合"白名单值才放行"的语义。

**`sequence.ts`**

`combine` 的别名。`sequence([ok(1), ok(2), ok(3)])` 等价于 `combine([...])`,语义完全一致——为熟悉 Rust `Iterator::collect` 或 Haskell `sequence :: Monad m => [m a] -> m [a]` 词汇的读者提供同名入口。短路语义沿用 `combine`(首个失败)。

**`sequenceAsyncResult.ts`**

`sequence` 的 lazy 版。`sequenceAsyncResult(ars)` 把 `AsyncResult<T, E>[]` 转换为 `AsyncResult<T[], E>`,**不**触发任何内部 `ar.run()`;最终在 `.run()` 时遍历调用 `Promise.all` 风格聚合并短路。命名同步覆盖 eager / lazy 两个模型,避免调用方记混。

**`reduce.ts`**

左折叠。`reduce(reducer, init, items)` 把 `items: IResultOfT<T, E>[]` 折叠为 `IResultOfT<Acc, E>`,reducer 形参为 `(acc, value, index) => IResultOfT<Acc, E>`。任一源失败**或** reducer 自身返回 `Err` 都立即短路,既不继续 fold 也不丢弃后续项。这与 Haskell `foldM` / Rust `try_fold` 的语义一致。

**`partitionOption.ts`**

**保留 None 位置**的 Option 分桶。`partitionOption(opts)` 产出 `{ some: T[]; noneIndices: number[] }`,`some` 按出现顺序排列,`noneIndices` 是 None 位置的索引数组。`Partitioned<T>` 是导出类型。用途:校验"已知形状"的输入(请求体 / 表单),None 位置便于合成"第 N 个字段缺失"这类结构化错误信息。**与 `separate` 的差别**:`separate(results)` 把 `IResultOfT[]` 分为 `Ok` / `Err` 两组,**保留 Err 的值**;`partitionOption` 因为 None 不带值,只能保留 index——这是该算子的设计约束。

**`lift.ts`**

把**可能抛错**的同步函数提升到 Result 上下文。`lift(fn, errorFn?)` 返回一个不会抛错的版本——`fn` 正常返回时包成 `Ok`;`fn` 抛错时,经 `errorFn` 映射后包成 `Err`。无 `errorFn` 时抛错**向上传播**(沿用 `unwrapOr` 的文档 throw policy)。单参数重载 `lift(fn)` 默认 `E = never`,**类型层承诺不会产生 Err**,但运行时仍可抛错,调用方负责决定是否需要 `errorFn`。

## 模块的设计原则

- **同义即转发**:`sequence` 是 `combine` 的别名,`cond` 是 `fromPredicate` 的"值感知"变体——这一层只解决命名而非语义,源代码中可见的实现行数极少。
- **不与既有算子重复定义**:`cond` / `condErr` / `reduce` / `lift` 这类**真正新增语义**的算子也都是薄包装或一两行核心实现,不引入新的状态机、不维护跨调用缓存。
- **类型层最小承诺**:`lift` 的 `E = never` 默认值反映"零配置用户不会被错误类型烦扰",同时把"`fn` 是否抛错"这一选择权留给调用方。
- **测试即合约**:`reduce` 的 reducer 抛错短路、`partitionOption` 的 index 排序、`lift` 的 throw 透传等策略都在测试中固化,任何违反约定的实现变更都会被 spec 测试抓住。
