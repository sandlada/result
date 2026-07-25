# observability

`observability` 模块为 Result 流水线提供**结构化日志 / 面包屑 / 进程级观察者**这三件套,目标是让上层 ROP 链路在保持 plain-object 不可变的前提下,仍然能接入既有的日志 / 监控 / Sentry 类工具。本目录的所有算子都是**同步 + 无副作用默认值**(默认不挂任何 observer),便于测试中直接用,且不会污染纯函数管道。

## 设计约束

- **不使用 `AsyncLocalStorage`**——`ctx` 是一个全局栈,`ctx.run(fn)` 在进入时压栈、退出时 `finally` 弹栈;当 `fn` 返回 thenable 时,清理被 `then`-chain 挂到 promise 上,这样 `await` 边界两侧的栈仍然干净。
- **同步求值,跨 await 语义明确**——`withPath(seg)` 调用即同步压栈,无须等到 `pipe` 末尾;若 `fn` 返回 thenable,scope 会延伸到 await 之后。
- **观察者默认关闭**——`installObserver(h)` 是可选的进程级副作用,所有 `observe(r)` 调用在没有安装 observer 时为完全透传。
- **错误策略与项目对齐**——`tapErrContext` 的 callback throw **不**被 catch;与 `unwrapOrElse` 的文档 throw policy 一致,异常沿调用栈向上传播。

## 文件清单与作用

**`ctx.ts`**

**栈式作用域**。导出 `ctx.run(fn)`、`getPath()`、类型 `PathSegment` / `PathStack`。`ctx.run(fn)` 把当前栈深保存,运行 `fn` 后在 `finally` 中还原;若 `fn` 返回 thenable,清理被 chain 到 promise 末尾,确保 `await` 两侧栈深度不会泄漏。**并发提示**:本目录不基于 `AsyncLocalStorage`,因此并发场景下(例如 `Promise.all([ctx.run(...), ctx.run(...)])`)栈会被互相覆盖。文档与源码注释均要求使用方在并发路径上各自独立 `ctx.run` 或干脆串行化。这是与 Node `AsyncLocalStorage` 不同的取舍点——后者在 V8 中实现复杂且有性能成本,本项目选择简单可读的同步栈 + 串行约束。

**`withPath.ts`**

**标签当前 result 的路径片段**。`withPath(segment, r)` 立即把 `segment` 压入当前 ctx 帧并把 `r` 原样返回;不传 `r` 时返回 `void`,用于"标记一段作用域"的场景。**显式泄漏警告**:脱离 `ctx.run` 调用 `withPath` 会让该 segment 永久驻留进程全局栈,因此长生命周期服务必须把 `withPath` 放进 `ctx.run(fn)` 内。

**`tapErrContext.ts`**

带面包屑的失败侧 side-effect。`tapErrContext(fn)(r)` 在 `r.isFailure` 上调用 `fn(error, { path })`,path 是当前栈的快照;`fn` 可以返回同步值或 Promise,**fn throw / reject 沿 promise reject 路径传播**——这是与项目 `tap` 家族策略对齐的契约。

**`format.ts`**

**人类可读**渲染。`format(r, options?)` 把 result 渲染为字符串:成功侧为 `Ok(<value>)`,失败侧为 `Err(<error>)`(`Error` 子类展示 `Error: msg`,非字符串默认 `String(error)`)。可选项 `quoteStrings`(默认 true)、`includeStack`(默认 false,展示 `Error.stack`)、`maxDepth`(默认 3,对象递归深度上限)。

**`inspect.ts`**

**结构化**视图。`inspect(r)` 把 `IResultOfT` 折成 `{ kind: 'ok'; value }` 或 `{ kind: 'err'; error }`,放弃 `isSuccess`/`isFailure` 双判别而使用单一 `kind` 字段;适合日志框架的 destructure 与 `JSON.stringify`。`Inspected<T, E>` 是导出类型。

**`observe.ts`**

**进程级 observer 接入点**。`observe(r)` 透传 `r` 并触发当前 `Observer`(若有);`installObserver(h)` 注入 `Observer` 并返回 disposer;`getActiveObserver()` 是测试钩子。`ObserveEvent<T, E>` 包含 `kind` / `result` / `path` 三个字段。**observer throw 被吞掉**——故意的设计,使一个 misbehaving 报告器不会破坏调用链路。

## 模块的设计原则

- **Plain-object 兼容**:`format` / `inspect` 的输出都是新字面量,与 `IResultOfT` 共享同一序列化约定(无 class、无 getter)。
- **零运行时副作用默认**:`installObserver` 不被调用时,`observe` / `tapErrContext` 都是纯透传;不安装 observer 就跟没引入本模块一样。
- **scope 纪律文档化**:`withPath` 的泄漏警告写在源码 JSDoc 与本 README 两处,任何"裸调"用法都在审查中暴露。
- **并发语义明示**:本模块不是 `AsyncLocalStorage` 实现——并发路径必须在调用方自行处理,这与 ADR 7 中"observability 是同步栈 + 串行约束"的取向一致。
- **类型先行**:`PathSegment` / `PathStack` / `ErrContext` / `Inspected` / `Observer` / `ObserveEvent` / `FormatOptions` 都是纯类型导出,模块对外 API 形状在类型层就锁死。