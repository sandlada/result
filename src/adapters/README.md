# adapters

`adapters` 模块在**单轨(普通值 / 普通函数)** 与**双轨(`IResultOfT` / `Promise<IResultOfT>`)** 之间架设桥梁,同时承担 Wlaschin 三种函数形态之间互转的教学责任。本目录中的所有函数都不修改 Result 的字面量结构,而是建立从"原始输入形状"到"判别联合形状"的同构映射。

## 文件清单与作用

**`fromOption.ts`**

把 `IOption<A>` 升格为 `IResultOfT<A, E>`。`Some(value)` 直接转化为 `Ok(value)`,`None` 转化为调用方提供的 `errorOnNone`。同时支持双重形态:直接调用三参版或柯里化形态只绑错误占位,把 Option 推迟到调用点再喂入。失败路径上的 error 是**同一引用**——多次从 None 转 Err 时日志聚合与相等比较不会混淆。

**`liftMap.ts`**

`map` 的教学别名。形参与行为完全等同于 `map`,存在的唯一目的是映射 Wlaschin 把函数从一种形状"succeed ∘ f"提升到另一种形状的术语表,使阅读源码时能直接对应教材词汇。实现层直接走 `map`,不引入额外的逻辑或运行时代价。

**`switchFn.ts`**

把"普通同步函数"包装为"返回 Result 的开关函数"——即 Wlaschin 所说的 `succeed ∘ f`。调用时若原函数正常返回,被包装版本返回 `Ok`;若原函数抛错,经可选 `errorFn` 映射后返回 `Err`。错误侧沿用 `tryCatch` / `fromPromise` 的缺省约定:无 `errorFn` 时,`errorFn ? errorFn(e) : (e as E)`,默认 `E = Error`。

**`switchFnAsync.ts`**

`switchFn` 的异步版本。形参 `f: (a: A) => B | Promise<B>` 同时接受同步与异步回函数;`await f(a)` 把同步抛错和异步拒绝统一收敛到同一个 `try / catch`,返回 `Promise<IResultOfT<B, E>>`。这是一个高频使用的桥梁——用来把"丢 Promise 的回调"封装到 Result 链路中。

**`tee.ts`**

**单轨** side-effect。`tee(f)(a)` 调用 `f(a)` 然后**原样**返回 `a`。与 `tap`(双轨中的成功轨道 side-effect)不同,`tee` 完全没有失败状态:若 `f` 抛错,异常会直接冒泡,不会被任何 Result 通道收纳。JSDoc 注释明确写出"Throw policy: ... propagates",通过测试断言这条契约。

**`teeAsync.ts`**

`tee` 的异步版本,签名 `f: (a: A) => void | Promise<void>`,把 `await f(a)` 后原样返回 `a`。同 `tee`,没有失败重定向:回调同步抛错或异步 reject 都会向上传播,而非进入 `Err` 通道。这是"我只需要日志/度量钩子,不需要参与决策"的轻量工具。

**`toOption.ts`**

把 `IResultOfT<A, E>` 降格为 `IOption<A>`。`Ok(value)` 转 `Some(value)`,`Err(_)` 转 `None`,**显式丢弃 error**——这一行为在 JSDoc 中被标注为"Discards the error information",并通过测试"preserves object references on success + custom TError → None"固定下来。设计目的是给"我只关心有没有值"的下游使用方提供最干净的 Option 视图。

## 模块的设计原则

- **三形态对齐**:每个函数都对应 Wlaschin 模型中"plain / switch / tee"函数形状的一种转换,使本目录可被当作 FP 教材与本库实现之间的索引层。
- **错误映射一致**:`switchFn` / `switchFnAsync` / `fromOption` 的 `errorFn` 缺位语义与 `factories/` 中 `tryCatch` / `tryCatchAsync` / `fromPromise` 完全一致,降低学习成本。
- **副作用可见**:单轨 `tee` / `teeAsync` 因没有失败状态,副作用异常不会被静默吞——这是故意的可观察性,而不是疏漏。
- **from/to 严格互逆**:`fromOption` 与 `toOption` 形成互逆桥,但**只在 Success 路径上严格可逆**;失败路径下 `toOption` 显式丢失 error,这是项目契约,不是 bug。
- **from 与 to 路径不共享状态**:三次签名都使用字面量对象返回,没有跨调用缓存,经 `JSON.stringify` / `structuredClone` 不会因为隐式引用而出现意外观察值。
