# combine

`combine` 模块承担 `IResultOfT` 集合语义的全部职责:把零个或多个结果聚合成一个,在"短路取首个失败"与"累积所有错误"两种聚合策略之间提供互相对偶的入口,并提供对异构元组的类型保留合并。本目录只做"读出侧的求值",不修改任何传入结果,也从未引入可变状态泄漏到模块外。

## 文件清单与作用

**`combine.ts`**

聚合模块的**短路聚合**入口。给定一组同质 `IResultOfT<A, E>`(数组或 `readonly` 数组),依次遍历:任一项处于失败态时立即返回**首个失败的同一引用**(既不复制也不包新的 `Error`);若全部成功,则把所有成功值按顺序收集为一个 `A[]`,产出 `Ok(values)`。这是 Rust `Iterator::collect::<Result<Vec<_>, _>>` 的 TS 对应物——线性、求值顺序确定、对错误端引用透明。

**`all.ts`**

`combine` 的**异构元组**版本。形参受 `readonly [IResultOfT<unknown, unknown>, ...]` 的可变长度元组约束,通过映射类型保留每个位置的 `value` 与 `error` 类型,产出 `{ [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never }` 与 `T[number] extends IResultOfT<unknown, infer E> ? E : never`,即对成功侧得到一个一一对应的元组,失败侧得到首个失败的真实错误类型(同 `combine`,引用透传)。适合 `Promise.all` 风格的"必须全部成功否则失败"流水线。

**`combineWithAllErrors.ts`**

与 `combine` 对偶的**全量累积**策略。遍历结束后,既不短路也不丢弃:成功值进 `values`,失败值进 `errors`,最终根据 `errors.length > 0` 决定产 `Err(errors)` 还是 `Ok(values)`。失败结果是 `E[]` 的同型数组,顺序与输入顺序一致。这种"看完整张名单再下结论"的语义对应 Wlaschin 铁路模型里的 `&&&`(并行 AND),专用于表单批量校验等"全部错误一次性报"场景。

## 模块的设计原则

- **聚合而非变换**:本目录所有函数都不会改变元素本身——既不复制错误对象,也不重写值对象。这一定律使得消费者可以对返回的 `Err` 直接做引用比较(例如 `if (e === myExpectedError)`),无需重建。
- **短路与累积对称**:`combine` 与 `combineWithAllErrors` 形成完整的策略二元组,无第三种语义空白。`all` 在异构场景下沿用 `combine` 的短路行为,因为元组类型一旦失协变就难以保留累积时的位置信息。
- **结果只读、引用稳定**:`values.push` 与 `errors.push` 是内部 `const` 数组的局部副作用,不构成对外部状态的污染。返回的对象是字面量,与本项目其它结果保持结构同形。
- **`readonly` 入参**:三个函数都接收 `readonly` 数组/元组,杜绝输入侧意外突变。
