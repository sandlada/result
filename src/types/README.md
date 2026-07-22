# types

`types` 模块是整个 `@sandlada/result` 的**类型契约层**——本目录不导出任何运行时函数,只导出构成项目判别联合对象的纯类型与接口。所有工厂、`operator`、适配器都基于这五个类型组合而来,因此这层发生任何破坏性变更都会直接外溢到整个库。本目录中的"测试"全部为**编译时类型测试**(`src/types/*.spec.ts` 各附 2-4 个用例)与一组专门的 `src/tests/type-tests/Result.type-tests.spec.ts`,用来在 `verbatimModuleSyntax` 严格模式下固化 narrowing 与 exhaustive match 的行为。

## 文件清单与作用

**`IResult.ts`**

**void 结果**的判别联合。导出三件套:`IResultSuccess`(仅承载 `isSuccess: true; isFailure: false`,没有 error 字段)、`IResultFailure<TError = Error>`(承载 `error: TError`)、以及它们的并集 `IResult<TError = Error>`。`TError` 默认值为 `Error`,对应"什么都不指定就用 `Error`"的零配置语义;`readonly` 保证对象是值类型,防止调用方误写。这一组类型是 `factories/ok.ts` 中 `ok()` 的产物形状。

**`IResultOfT.ts`**

**带值结果**的判别联合。把 `IResult` 的成功臂扩展为 `IResultOfTSuccess<TValue>`,新增 `value: TValue`;失败臂仍是 `IResultOfTFailure<TError = Error>`。对外提供 `IResultOfT<TValue, TError = Error>` 联合别名。两条字面量判别(`true` / `false as const`)让 TypeScript 在 `if (result.isSuccess)` 之后把 `.value` 与 `.error` 同时 available,且不会让另一边误出现——这是本项目 discriminated union 的核心规则。

**`Option.ts`**

**可选值**的判别联合。命名上与 `IResult` 平行但判别字段切换为 `isSome` / `isNone`:`IOptionSome<T>` 携带 `value: T`,`IOptionNone` 不带值。并集 `IOption<T> = IOptionSome<T> | IOptionNone`。Option 在本库是**独立模块**(`src/option/`),不依赖 Result;`Option` 与 Result 通过 `src/adapters/` 的 `fromOption` / `toOption` 互转。

**`AsyncResult.ts`**

**惰性异步结果**的契约。`AsyncResult<T, E = Error>` 只有一个方法:`readonly run: () => Promise<IResultOfT<T, E>>`。这是一个**thunk 接口**而非类——任何提供同名方法的字面量对象都视为合法的 `AsyncResult`,使得 `from` / `fromPromise` / `fromResult` 三种工厂可以无差别地构造或返回它。所有 `async-result/` 算子(`.map` / `.bind` / `.match` 等)都不在算子体内执行,而是返回一个新的 `AsyncResult` thunk,直至 `.run()` 才真正求值。

**`AsyncOption.ts`**

`AsyncResult` 的 Option 对应物。`AsyncOption<T>` 同样为 `{ readonly run: () => Promise<IOption<T>> }`。服务于 `async-option/` 子模块,提供对"我可能也没有值"的异步路径的惰性封装,使管道中间无需 `await` 就能组合。

## 模块的设计原则

- **字面量判别,不退化为宽类型**:所有 `isSuccess` / `isFailure` / `isSome` / `isNone` 都使用 `true` / `false as const` 字面量,确保 `JSON.parse(JSON.stringify(result))` 后**虽然**判别会退化为宽 `boolean` 引发 narrowing 失效(这是 `.jules/sentinel.md` 模式的风险),但**类型层依然锁死**字面量,初始构造与项目内传播全程不会丧失类型保护。
- **默认值聚焦 `Error`**:`TError` 默认 `Error`,使得"零泛型标注即可使用"对简单场景保持友好;自定义错误类型用 `IResultOfT<T, AppError>` 显式标注。
- **`readonly` 全覆盖**:所有实例属性均为 `readonly`,确保结果是不可变值对象——这是与"plain object,不装箱"原则的强制对齐。
- **Async 接口窄到 1 个方法**:`AsyncResult` / `AsyncOption` 都只有一个 `run`,不暴露 `.value` / `.error` 等中间态。这避免了"未 await 就拿到 Promise 内部数据"的诱惑。
- **类型与实现解耦**:本目录不引入任何运行时实现,任何 `import type` 即满足——`verbatimModuleSyntax` 配置保证无意外运行时副作用。
