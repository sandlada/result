# TASK1 — `result` 结构收敛计划

> **状态**：待执行（2026-11-02 审查后改写）
> **起点**：工作区必须先变干净。`3537603` 不是执行起点——该提交之上仍有未提交改动。
> **目标**：去掉重复的形状构造和运行时双形态分发，让行为矩阵从“实现的复述”变成“可对照的契约”，并在一次破坏性发布里拆开 `asyncMap` / `mapAsync` 这组名字。
> **非目标**：不把六个载体的抛出策略压成一张族表；不为了表格对称去补操作符；不把 `Result` 改成类。

---

## 审查结论

上一版不能按原文执行。下面这些判断是改写的原因。

1. **阶段顺序会把同一批操作符改三遍。** 原 Phase 1 用 `dual` 重写 `operators/`，Phase 2 再清断言，Phase 3 再把字面量换成 `shape`。断言的传染源是 `ok` / `err` 的实现签名，不在分发器里。先改分发器，清不掉断言。
2. **附录 A 没有证明“零断言”。** 探针自己仍有 `value as T`、`as IResultOfT<T, E>`、`thrown as E`，实现签名仍返回联合类型。标题与代码相反。能成立的只有一条：失败变体不含 `TValue`，错误类型参数相同的失败分支可以赋给另一个成功类型的 `IResultOfT`。
3. **`as unknown as` 被当成一种东西。** 结果对象上的双断言、`catch` 里把 `unknown` 收成 `E`、元组重载边界上的断言，来源不同。后两类不会因为换了 `ok()` 而消失。完成线不能是“≤ 20，其余写注释”。
4. **R3 会改掉已经写进 JSDoc 的契约。** `src/async-result/mapAsync.ts` 写明：同步抛出和回调返回的拒绝都传播，`errorFn` 只改拒绝原因，不转成 `Err`；要捕获用 `map`。行为矩阵同一行的备注是 `declared anti-pattern`。两处记录互相矛盾。原计划把矩阵备注当成了待修复的历史包袱。按 R3 把它改成捕获，是行为破坏，不是去重。
5. **谓词抛异常收成 `None` 是错的默认。** `src/operators/exists.ts` 没有 `try/catch`，谓词抛出就会抛出。`None` 表示缺失，不表示谓词崩了。原 R3 把这条约成目标，会扩大 `async-option/exists` 的捕获行为，而不是把它收窄。
6. **`async` 这个词做不到“只表示一件事”。** 目录 `async-result` / `async-option` 表示惰性载体，`asyncOk` 表示已经包进 Promise 的工厂。原 R1 只消除了函数名前缀 `asyncMap` 这一种用法，却写成整个库里 `async` 只剩一个意思。
7. **模块名 `lift/` 与现有公开 API 冲突。** `primitives/lift` 是把可能抛出的函数抬进 `IResultOfT`。`adapters/liftMap` 是 `operators/map` 的别名。再加一个 `lift/liftMap`，库里会有三个 `lift`。
8. **一个 `lift/` 模块同时装 Result 和 Option，等于把 P0-6 搬进新目录。** 原 R1 说模块编码载体。新模块如果两种载体都装，这条规则在新建的时候就破了。
9. **`dual.ts` 删不掉重载。** 105 个文件里真正占体积的是每个操作符自己的重载签名。运行时 `if (x === undefined)` 只是其中几行。共享分发器若让 `map(f)(ok(1))`、`unwrapOr(fn, ok(1))` 的推断变差，就不得推广。原计划把“第 N+1 个参数是不是函数”写成两种分发器的统一规则，这条规则在 `unwrapOr` 上是错的：默认值允许是函数。
10. **`combine` 的内核签名是错的。** `src/combine/combine.ts` 的产品行为是异构元组，返回类型按位置推断。收成 `IResultOfT<T[], E | E[]>` 会同时丢掉元组，并且让 fail-fast 的 `E` 和累积的 `E[]` 变成同一个类型。`promise-result/ap` 的错误类型是单个 `E`，`operators/ap` 和 `async-result/ap` 是 `E | F`。一份内核不能把这三份签名捏成一份。
11. **求值策略不在内核里。** 同步 `combine` 顺序查看已有结果。`promise-result/combine` 和 `async-result/combine` 都是 `Promise.all` 之后再取第一个失败：后面的载体会启动，JSDoc 里的 “short-circuit” 指的是结果选择，不是取消。内核若改成提前返回，行为就变了。
12. **Phase 5B 的“26 个操作符、78 个文件”没有清点依据。** P1-3 表里 `promise-result` 的 `map` 已经存在。缺的格子没有逐个写返回类型和抛出通道。对称不是需求。
13. **完成标准互相打架。** “全库搜不到 `asyncMap`” 与同阶段要写的迁移文档冲突。“矩阵里零手写 policy” 与“例外要登记”冲突。“用例数不低于 2641” 会在 Phase 0 落地新测试之后立刻过期，也会阻止删掉 `expect(true)` 这种测试。
14. **Phase 0 的文件处置有事实错误。** `tsconfig.json` 和 `tsconfig.typecheck.json` 都排除 `*.spec.ts`。`npm run typecheck` 是 `tsc --project tsconfig.json --noEmit`，不检查 spec。`tsconfig.speccheck.json` 是目前唯一把 spec 纳进检查、并把 `*.type-spec.ts` 排除的配置，只是没有接到 npm script。它不是重复文件。`src/tests/hardening/zz-direct-probe.spec.ts` 用 `expect(true).toBe(true)`，并且 `operators.ap` 的第一个参数传的是裸函数，对不上 `ap` 的签名；spec 又不在 `typecheck` 范围内，所以这个文件目前证明不了任何事。
15. **操作纪律会被原文自己打破。** `git add -A` 会把 `TASK1.md`、`tsconfig.speccheck.json` 和在途改动打进同一个提交。回滚写成 `git reset --hard`。步骤粒度写成“一次只做一个步骤”，1.5 却是重写整个 `operators/`。
16. **版本号不是 SemVer。** 当前版本是 `0.20260811.0`。没有“主版本位”可加。破坏性发布是换一个日期版本，并在发布说明里列出删除的导出。
17. **R2 被写过了。** `async-option/ofSome` 返回 `AsyncOption<T>`，不是 `option/ofSome` 的再导出。同名不同载体是模块规则允许的。要删的是 `promise-option` 把同步 `ofSome` / `ofNone` 和 `asyncOk` / `asyncErr` 再导出这一类“同一个函数、第二个入口”。
18. **P1-2 在原方案 A 里没有被修。** 方案 A 是保留 `map(f, r, errorFn?)` 的数据居中。那是接受例外，不是完成 P1-2。方案 B 仍解决不了 `unwrapOr(defaultFn, result)`。本次重构采纳方案 A，并把 P1-2 移出完成定义。

本审查没有复跑全库的 `277` / `105` / `50` / `20`。这些数字只作为原作者在脏工作区上的计数。执行时以附录 B 的脚本为准，现数现用。

---

## 0. 执行纪律

1. 一个提交只做一件事，并且可以单独回退。禁止“重写某目录全部文件”作为一个提交。
2. 公开名字、抛出语义、求值顺序，三者分开提交。前一个阶段没有做完，不提前做后一个。
3. 改抛出语义或求值顺序之前，先改 `docs/behavior-modes.md`，再改实现，再改矩阵。
4. 不使用 `git add -A`。不使用 `git reset --hard` 当回滚。回滚是丢掉该阶段分支上尚未合并的提交，或对单个提交 `git revert`。
5. 阶段 tag 打在重构分支上，不打在未合并的 `main` 上。全部合并并发布之前，这些 tag 不是发布版本。
6. 行号会漂移。正文里的文件路径是锚点，执行时重新打开文件确认。
7. `src/internal/` 禁止出现 `index.ts`。`scripts/verify-readme.mjs` 把“含 `index.ts` 的 `src` 子目录”当成公开模块。
8. 代码注释不引用本文、`bugs.md` 或任何外部编号。

### 范围外

- 不引入运行时依赖。
- 不改 `IResult` / `IResultOfT` / `IOption` 的判别字段。
- 不把结果对象改成类，不加原型方法。
- 不改 `site/scripts/new-version.mjs` 的归档机制。`site/src/content/docs/0.20260811/` 只读。
- 不在本次把 `async-result/mapAsync` 改成捕获。
- 不补齐 P1-3 的空格子。
- 不处理 `reliability/` 的计时器抽取、`composition/safeTry*` 的归属、载体 `run()` 契约。那些是在途工作，不是本计划的 Phase 0。

---

## 1. 开工门槛

重构分支从干净的 `main` 拉出。在途改动由它们自己的提交落地，不写进本计划的提交说明里。

开工前逐项确认：

- [x] `tsconfig.speccheck.json` 仍在。要不要把它接到 npm script，另作决定；本计划不删除它。
- [x] `zz-direct-probe.spec.ts` 不改名、不纳入正式套件。要留它，先改成真实断言，并通过 `tsc --project tsconfig.speccheck.json --noEmit`。那不是本计划的步骤。
- [x] 用附录 B 重算基线，把结果写进 §8 台账，覆盖原文留下的计数。
- [x] `npm test`、`npm run test:type`、`npm run build` 通过。`npm run typecheck` 通过只说明生产代码和类型测试的配置通过；它不检查 `*.spec.ts`。
- [x] 修正 `AGENTS.md` 第 74 行。那里仍写 observability 100% 门禁、reliability 分支 84。`vitest.config.ts` 里这些 glob 的 statements / branches / functions / lines 都是 90。这一处单独提交。

门槛提交只含 `AGENTS.md` 的这一处校正（与 `TASK1.md` 计划书同批入库）。tag：`refactor/task1-baseline`。

---

## 2. 要解决的问题

### 必须解决

**M1. `ok` / `err` 的实现签名把双断言传染出去。**

`src/factories/ok.ts` 的实现返回 `IResult<never> | IResultOfT<T, E>`，成功对象要 `as unknown as IResultOfT<T, E>` 才回得去。`src/factories/err.ts` 的公开重载是 `<T, E>`，实现签名是 `<E, T = never>`。调用点的类型参数顺序以重载为准。

失败分支在错误类型一致时不必断言，见附录 A。回调抛出的值是 `unknown`，收成 `E` 仍然必须经过断言或收窄函数。这不是工厂签名能消去的。

**M2. 结果字面量散落在工厂之外。**

`async-result` 等目录直接写 `{ isSuccess, isFailure, value }`。`ofNone` 使用冻结单例，`ok` / `err` / `ofSome` 每次新建。这是两种策略，保留这个差别：`None` 没有载荷，单例成立；带载荷的变体不做成单例。空成功 `ok()` 是否改成单例，本次不做。

**M3. 柯里化与直传的运行时分支被各写各的。**

`operators/map.ts` 用 `=== undefined || typeof === 'function'`，因为第二个参数可能是 `errorFn`。`operators/bind.ts` 一类用 `=== undefined`。`option/map.ts` 用 `!== undefined`。`async-result/mapAsync.ts` 把整段 `run` 在柯里化分支和直传分支各写一遍。

共享的是运行时分支，不是类型重载。推广前必须过 §6 Phase 3 的停止条件。

**M4. `asyncMap` 与 `mapAsync` 不是词序变体。**

| 导出 | 模块 | 输入 | 回调抛出 |
| --- | --- | --- | --- |
| `mapAsync` | `promise-result` | `Promise<IResultOfT>` | 捕获为 `Err` |
| `asyncMap` | `promise-result` | 同步 `IResultOfT` | 以该文件 JSDoc 为准，执行时核对 |
| `mapAsync` | `async-result` | `AsyncResult` | 传播为 `run()` 的拒绝 |

`promise-result/index.ts` 同时导出这两类。`promise-option` 同样把 `mapAsyncOption` 和 `asyncMapOption` 放在一个 barrel。模块名回答不了“吃进什么”。

**M5. 行为矩阵只保证实现和矩阵一致。**

`behavior-policy.spec.ts` 比较的是实现与 `behavior-matrix.ts`。矩阵备注可以和源文件 JSDoc 相反，测试仍然是绿的。本次要加的是“每个公开运行时导出都有一条显式通道记录”。不是“所有 `map` 必须同一策略”。

**M6. 同一函数从第二个 barrel 再导出。**

`promise-result/index.ts` 再导出 `asyncOk` / `asyncErr`。`promise-option/index.ts` 再导出 `asyncOk` / `asyncErr` / `ofSome` / `ofNone`。入口应分别是 `factories` 和 `option`。

`async-option/ofSome` 留在原地。它构造的是惰性载体。

### 接受为例外，不在完成定义里

**A1. `errorFn` 不是最后一个参数。** 数据居中的写法只出现在带可选 `errorFn` 的直传形态：`op(f, r, errorFn?)`。柯里化形态 `op(f, errorFn?)` 与直传 `op(f, r)` 的消歧，只允许用在“该槽位要么是 Result / Option / Promise / Async 载体，要么是函数”的操作符上。载体不是函数。`unwrapOr` / `unwrapOrElse` / `mapOr` 的默认值可以是函数，只能靠参数个数消歧，禁止用 `typeof === 'function'`。

**A2. 载体之间的能力表不对称。** 缺的操作符没有逐个契约之前不补。

**A3. `async-result/mapAsync` 传播、`promise-result/mapAsync` 捕获。** 这是文档化的分叉，留到单独的行为变更里再决定。本计划的发布说明要把它写成已知差异，避免读者以为改名已经统一语义。

**A4. 测试文件从 `index.js` 导入。** 生产代码改为直接源文件。测试是否受同一条约定约束，本次不扩大范围。

---

## 3. 规则

### R1. 载体看模块，回调能力看后缀

| 载体 | 模块 |
| --- | --- |
| `IResultOfT` | `operators/` |
| `IOption` | `option/` |
| `Promise<IResultOfT>` | `promise-result/` |
| `Promise<IOption>` | `promise-option/` |
| `AsyncResult` | `async-result/` |
| `AsyncOption` | `async-option/` |
| 同步 `IResultOfT`，回调可以返回 Promise，输出 `Promise<IResultOfT>` | `bridge-result/` |
| 同步 `IOption`，回调可以返回 Promise，输出 `Promise<IOption>` | `bridge-option/` |

无 `Async` 后缀：回调是同步的。`Async` 后缀：回调可以同步返回，也可以返回 Promise。后缀不表示抛出策略。

目录名 `async-*` 继续表示惰性载体。`factories` 的 `asyncOk` / `asyncErr` 继续表示“值已经包进 Promise”。不要在新代码里用函数前缀 `asyncX` 表示“同步载体上的异步回调”。

`errorFn` 的位置按 §2 A1，不用本条把现有签名改成完全 data-last。

### R2. barrel 不转出别的模块的函数

一个运行时函数只有一个实现文件，只从一个 barrel 导出。同名函数若类型不同（`option/ofSome` 与 `async-option/ofSome`），可以并存。

### R3. 通道分开记，禁止用族表覆盖已有 JSDoc

每条策略记录四个通道，用不到的通道写 `n/a`：

| 通道 | 含义 |
| --- | --- |
| `throw` | 回调同步抛出 |
| `reject` | 回调返回的 Promise 拒绝 |
| `carrier` | 内部载体 `run()` 拒绝，或外层 Promise 拒绝 |
| `errorFn` | `errorFn` 自己抛出 |

取值只有 `capture-err`、`capture-none`、`propagate`、`n/a`。禁止“传播或 panic”这种两可值。

新操作符的默认值，仅用于填空，不用于改旧实现：

- Result 的 `map` / `tap`：`throw` = `capture-err`
- Option 的 `map`：`throw` = `capture-none`（`src/option/map.ts` 现有行为）
- 谓词（`exists` / `contains`）：`throw` = `propagate`
- `unwrap` / `expect` / `orThrow`：按各函数现有 JSDoc，不收成 `Err` 或 `None`

`async-result/mapAsync` 的 `throw` 和 `reject` 保持 `propagate`。矩阵里的 anti-pattern 备注在 Phase 4 改成指向这条契约的陈述，不作为改行为的依据。`errorFn` 通道与 JSDoc 对齐：改拒绝原因，不捕获。

### R4. 形状只在 `src/internal/shape.ts` 构造

公开工厂是这组函数的薄封装。生产代码其他文件不写结果或选项对象字面量。

```ts
successShape(): IResultSuccess
okShape<T>(value: T): IResultOfTSuccess<T>
errShape<E>(error: E): IResultOfTFailure<E>
someShape<T>(value: T): IOptionSome<T>
noneShape: IOptionNone          // 冻结单例，从 ofNone.ts 移入
```

`noneShape` 保持 `ofNone()` 的引用相等。其余函数每次返回新对象。

`src/internal/` 不建 `index.ts`，不进 `package.json` `exports`，不写模块 README，不进 `site/lib/site.mjs` 的 `moduleRegistry`。`rolldown` 仍会把它打进 `build/`，`package.json` 的 `files` 含整个 `build/`。外部隐私只靠 `exports` 没有这条路径，不是靠 tarball 里没有这些文件。Phase 1 增加检查：公开 `exports` 的目标路径都不落在 `build/internal/`。

### R5. 运行时双形态分发可以共享，重载不共享

每个操作符保留自己的重载。`src/internal/dual.ts` 只替换运行时的柯里化分支。

分发器分两支，禁止合成一个“看是不是函数”的总函数：

- `dualByArity`：缺参即柯里化。用于数据不是函数、且没有“函数型配置占同一槽位”的操作符，包括默认值可以是函数的 `unwrapOr`。
- `dualCarrierOrFn`：仅当该槽位的两个合法类型是“载体”和“函数”。`map` 的第二个参数属于这一支。`bimap` 要按它自己的参数个数单独写清槽位，不能沿用“第二个参数”。

`filterOrElse` 的谓词和 `errorFn` 都是函数，直传与柯里化靠参数个数区分。

若代表操作符的推断变差，删除 `dual.ts`，M3 只保留“禁止再复制整段 `run` 函数体”这条局部规则。见 Phase 3 停止条件。

---

## 4. 破坏性发布的映射

Phase 5 之前不做这些改名。一次日期版本里硬切换，不留旧名转出。留着 `asyncMap` 等于把 M4 再保留一个版本。旧说明留在 `site/src/content/docs/0.20260811/`，不留在新 barrel 里。

### 4.1 搬出 `promise-result` / `promise-option`

| 旧 | 新 |
| --- | --- |
| `promise-result` `asyncMap` | `bridge-result` `map` |
| `promise-result` `asyncBind` | `bridge-result` `bind` |
| `promise-result` `asyncBindThrough` | `bridge-result` `bindThrough` |
| `promise-result` `asyncMatch` | `bridge-result` `match` |
| `promise-result` `asyncOrElse` | `bridge-result` `orElse` |
| `promise-result` `asyncTap` | `bridge-result` `tap` |
| `promise-result` `asyncTapErr` | `bridge-result` `tapErr` |
| `promise-option` `asyncMapOption` | `bridge-option` `map` |
| `promise-option` `asyncBindOption` | `bridge-option` `bind` |
| `promise-option` `asyncMatchOption` | `bridge-option` `match` |
| `promise-option` `asyncOrElseOption` | `bridge-option` `orElse` |
| `promise-option` `asyncTapOption` | `bridge-option` `tap` |

逻辑原样搬迁。抛出语义在 Phase 4 已经冻结的，搬迁时不许再改。

`bridge-*` 的 `map` 与 `operators/map`、`promise-result/map` 同名，子路径不同。模块 README 首段必须写明输入类型和输出类型。

### 4.2 `promise-option` 去掉 `Option` 后缀

模块已经是 Option。下列导出改名，文件用 `git mv`：

`mapAsyncOption` `bindAsyncOption` `matchAsyncOption` `orElseAsyncOption` `tapAsyncOption` `tapErrAsyncOption` `containsAsyncOption` `existsAsyncOption` `filterAsyncOption` `flattenAsyncOption` `mapOrAsyncOption` `mapOrElseAsyncOption` `unwrapOrAsyncOption` `unwrapOrElseAsyncOption`

改名后的 `mapAsync` 与 `promise-result` / `async-result` 的 `mapAsync` 同名。抛出语义仍然按模块分开，不因为同名而在 Phase 5 里改掉。

### 4.3 删除

| 目标 | 原因 |
| --- | --- |
| `adapters/liftMap` 及其 spec、type-spec | 公开别名，实现就是 `operators/map`。与新的 bridge 词汇冲突。迁移行：改用 `operators/map`。 |
| `promise-result` barrel 的 `asyncOk` / `asyncErr` | 第二个入口。改从 `factories` 导入。 |
| `promise-option` barrel 的 `ofSome` / `ofNone` / `asyncOk` / `asyncErr` | 同上。同步构造器改从 `option` 导入。 |

### 4.4 新模块接线

`bridge-result` 和 `bridge-option` 各自做完下面全部项，`verify:readme` 才会过：

1. `src/<module>/index.ts`，只转出本模块实现
2. `src/<module>/README.md`，`## API` 与 barrel 逐名一致，并链接 `docs/behavior-modes.md`
3. `package.json` `exports`
4. `AGENTS.md` 模块表
5. 根 `README.md` 的子路径列表
6. `docs/behavior-modes.md` 总览一行加一节
7. `src/tests/hardening/behavior-policy.spec.ts` 的 barrel 列表
8. `behavior-matrix.ts` 的通道记录
9. `site/lib/site.mjs` 的 `moduleRegistry`
10. 覆盖率：`src/**` 已是 90%。新代码随模块补测试，不下调门槛

完成后 `verify:readme` 的模块数是 16（现有 14 个含 `index.ts` 的目录，再加上这两个）。`src/internal/` 不计入。

---

## 5. 阶段依赖

```text
门槛 → Phase 1 工厂与 shape
     → Phase 2 字面量收口
     → Phase 3 运行时分发（可在停止条件处终止）
     → Phase 4 矩阵与文档对齐（默认不改语义）
     → Phase 5 破坏性改名
     → Phase 6 combine/ap 内核（可跳过）
     → Phase 7 发布
```

Phase 6 不依赖 Phase 5 的新名字，但放在改名之后，避免同一文件两边同时改。P1-3 不进入这条链。

---

## 6. 阶段

### Phase 1. 工厂签名和 shape

**目标**：M1 的结果对象双断言从工厂消失；R4 的构造器落地。不改操作符文件，除非某操作符只是为了编译而跟着工厂改类型、行为不变。

**步骤**

- [x] **1.1** 新增 `src/internal/shape.ts` 与 `shape.spec.ts`。`noneShape` 从 `src/option/ofNone.ts` 移入，`ofNone` 改为引用它。测试钉住 `ofNone() === ofNone()`，以及 `Object.isFrozen`。
- [x] **1.2** 重写 `ok` / `err`。实现签名返回窄变体，不返回联合类型：

```ts
export function ok(): IResultSuccess;
export function ok<T>(value: T): IResultOfTSuccess<T>;
export function ok<T, E>(value: T): IResultOfT<T, E>;
export function ok<T>(...args: [] | [T]): IResultSuccess | IResultOfTSuccess<T> {
    if (args.length === 0) return successShape();
    return okShape(args[0] as T);
}

export function err<E>(error: E): IResultOfTFailure<E>;
export function err<T, E>(error: E): IResultOfT<T, E>;
export function err<E>(error: E): IResultOfTFailure<E> {
    return errShape(error);
}
```

`args[0] as T` 来自 `noUncheckedIndexedAccess` 对可变长参数的收窄缺口。这一处算 Class I，留在 `ok` 内部，不记入 Class S。若实现时能写成不用断言的重载实现，删掉它。

第三个 `ok` 重载和第二个 `err` 重载只在调用点放宽 `E` / `T`。实现体不需要返回带 `E` 的联合类型。这是附录 A 的可用结论。

- [x] **1.3** `ofSome` 改为调用 `someShape`。
- [x] **1.4** 跑 `npm run test:type`。推断变窄就算失败，先恢复重载的调用点行为，再继续。
- [x] **1.5** 在 `scripts/verify-build.mjs` 增加：`package.json` `exports` 的每一项目标路径都不包含 `/internal/`。

**验收**：`npm run test:type`、`npm test`、`npm run build`。`ok.ts` / `err.ts` 不再出现 `as unknown as`。

**回滚**：revert 该阶段提交。

---

### Phase 2. 字面量收口

**目标**：生产代码里的结果 / 选项字面量只出现在 `shape.ts`。

**步骤**

按目录提交，顺序：`async-result`、`async-option`、`promise-result`、`promise-option`、`reliability`、`composition`、其余。每个目录一个提交。

`async-result/map.ts` 和 `async-result/mapAsync.ts` 若仍有两份 `run` 函数体，本阶段只替换其中的字面量，不去重。去重属于 Phase 3。

**验收**：附录 B 的字面量计数，除 `shape.ts` 外为 0。`npm test` 与 `npm run build` 通过。`ofNone` 单例测试仍在。

不要用“`isSuccess: true as const` 的出现次数”当唯一计数。没有 `as const` 的字面量同样算。

---

### Phase 3. 运行时分发

**目标**：在推断不变的前提下，去掉重复的运行时分支和重复的 `run` 函数体。

**步骤**

- [x] **3.0** 按附录 B 列出生产文件里的分发形态，分成：`dualByArity`、`dualCarrierOrFn`、仅直传、其他。把清单写进台账。不按“105”这个旧数字排期。
- [x] **3.1** 做三个标本，各自一个提交，各自带现有 type-spec 的推断快照：
  - `operators/map`（`dualCarrierOrFn`，含 `errorFn`）
  - `operators/bimap`（配置参数多于一个）
  - `operators/unwrapOr`（默认值可以是函数，必须走 `dualByArity`）
- [x] **3.2 停止条件。** 下面任一发生就停止推广，删除未达推断的 helper，台账写明 M3 降级为“禁止复制整段 `run`”：
  - `map(f)(ok(1))` 的值类型或错误类型变宽、变 `unknown`、或需要调用方补类型参数
  - `unwrapOr((n: number) => n, ok(1))` 被判成柯里化
  - `exactOptionalPropertyTypes` 下可选 `errorFn` 的调用从合法变非法
- [x] **3.3** 停止条件未触发时，按模块提交其余操作符。一个模块一个提交。不在这个阶段清 barrel 导入。
- [x] **3.4** `async-result` 的 `map` / `mapAsync` / `bind`：两段 `run` 合成一个内部函数。行为以现有 spec 和 JSDoc 为准，`mapAsync` 继续传播。
- [x] **3.5** 生产代码里 `from '../<module>/index.js'` 改为具体文件。一个模块一个提交。测试文件不动。
- [x] **3.6** `applyErrorFn` 从 `src/operators/errorMapper.ts` 移到 `src/internal/errorFn.ts`。该函数带 `@internal`，不在 `operators` barrel。移完后删除旧文件。这不是公开 API 变更。

**验收**：标本 type-spec 与迁移前一致。`npm test`、`npm run test:type`、`npm run build` 通过。台账写明分发器是推广了还是按 3.2 停了。

---

### Phase 4. 矩阵对齐，默认不改行为

**目标**：M5。每个公开运行时导出在四个通道上都有记录。记录来自当前 JSDoc 和当前实现。两者冲突时，以“先改文档还是先改代码”的单独提交解决，禁止在矩阵备注里留下 anti-pattern 这种无法测试的句子。

**步骤**

- [x] **4.1** 给 `behavior-matrix.ts` 加影子对照：用一张默认表填空，与现有 `policy` 比较，只打印差异，不失败。
- [x] **4.2** 把差异分成三类并写进台账：
  - 文档与实现一致，矩阵备注用词过时。只改备注。`async-result/mapAsync` 归此类，除非重新读 JSDoc 后发现实现与 JSDoc 不符。
  - 文档与实现不一致。一个导出一个提交：先改 `docs/behavior-modes.md`，再改实现或改文档，使二者一致。
  - 谓词通道是 `capture-none` 或 `capture-err`。默认改成 `propagate`，并在发布说明里点名。若某个谓词的 JSDoc 明确写了捕获，保持捕获，台账写明文件路径。不得把 `operators/exists` 改成捕获。
- [x] **4.3** 影子对照改为失败：导出既不在默认表、也不在例外表，测试失败。例外表允许手写取值，但必须有 `reason` 字段，内容是契约本身，不是外部编号。
- [x] **4.4** 完成标准改成：每个导出都能查到唯一通道记录。不是“文件里零字面量”。

**验收**：`npm test` 通过。`async-result/mapAsync` 的 spec 仍然断言传播。

本阶段不改公开名字。

---

### Phase 5. 公开 API 硬切换

**前置**：Phase 4 完成，抛出语义已冻结。

**步骤**

每个步骤一个提交，顺序固定：

- [x] **5.1** 新增 `bridge-result`，搬 §4.1 前七行。旧文件改为从新模块转出，测试先改导入，保证中间提交可编译。
- [x] **5.2** 新增 `bridge-option`，搬 §4.1 后五行。同样先转出。
- [x] **5.3** 按 §4.4 接两个模块的 README、exports、AGENTS、行为文档、矩阵、`site.mjs`。
- [ ] **5.4** 从 `promise-result` 与 `promise-option` 删除已经搬走的导出和 §4.3 的再导出。
- [ ] **5.5** `git mv` 完成 §4.2 的去后缀。先改名，再改引用。
- [ ] **5.6** 删除 `adapters/liftMap` 三件套，更新 `adapters` README 和 barrel。
- [ ] **5.7** 写迁移页 `site/src/content/docs/` 下的一篇文章，内容就是 §4.1、§4.2、§4.3。不要改 `0.20260811` 目录。
- [ ] **5.8** 更新 JSDoc 示例里的导入路径。`npm run verify:examples` 会检查。

搜索旧名时用完整导出名，不用一个会命中迁移页的正则当完成条件。完成条件是：除迁移页、`bugs.md`、`site/src/content/docs/0.20260811/`、以及本文件之外，生产 barrel 不再导出旧名。

**验收**：`npm run typecheck`、`npm test`、`npm run test:type`、`npm run build`。站点 `npm --prefix site run verify` 在 Phase 7 跑。本阶段至少 `npm --prefix site run check:snippets`，避免示例已经和源码脱节。

---

### Phase 6. `combine` / `ap` 的聚合内核

可跳过。跳过不影响 Phase 7。

**只共享“结果已经算出来之后怎么折叠”。** 不共享公开签名，不共享何时启动载体。

内核形态：

```ts
export function foldResults(
    results: readonly IResultOfT<unknown, unknown>[],
    mode: 'first' | 'all',
): { ok: true; values: unknown[] } | { ok: false; error: unknown | unknown[] }
```

- 元组重载留在 `src/combine/combine.ts` 的公开签名上。实现签名继续可以用一处断言把折叠结果送回元组类型。这一处进入 Class S 允许清单，文件 `src/internal/cast-allowlist.txt`，一行一个 `文件:原因`。
- `promise-result/combine` 保持先 `Promise.all` 再折叠。不改成第一个失败就停止启动。补测试：前面的 Promise 已是失败时，后面的工厂函数仍然被调用。当前实现若已经如此，测试是锁行为；若不是，先停下来改台账，不要为了内核改调度。
- `async-result/combine` 同样锁定“每个载体的 `run` 都会被调用”。
- `ap` 只共享“两侧都已是 Result 之后如何应用函数”。`operators/ap` 与 `async-result/ap` 继续返回 `E | F`。`promise-result/ap` 继续是单个 `E`。拒绝仍然是拒绝，不在内核里转成 `Err`（`promise-result/ap.ts` 的 JSDoc 已区分这两件事）。

**验收**：现有 `combine` / `ap` spec 全过。调度测试过。`npm run bench` 只作参考：先确认 `src/combine/all.bench.ts` 打到的是不是这次改的路径。没有打到就不要把 bench 写成门禁。

---

### Phase 7. 发布

**步骤**

- [ ] **7.1** 对照 §9 逐条重跑，把命令输出摘要写进台账。
- [ ] **7.2** 读 `site/README.md` 和 `site/scripts` 里 `version:new` 的参数。结果必须是：旧 API 文档仍在 `0.20260811`，新版本路径描述新 API。不要手改归档目录。
- [ ] **7.3** 版本号换成发布当日的 `0.YYYYMMDD.0`。发布说明列出 §4 的三张表，并列出 Phase 4 里真正改了语义的导出。若 Phase 4 没有改语义，写“抛出语义未改”，并写明 `async-result/mapAsync` 与 `promise-result/mapAsync` 仍然不同。
- [ ] **7.4** `AGENTS.md` 补上 R1–R5 的短版本，覆盖率句子与 `vitest.config.ts` 再对一次。

Phase 7 不再次“同步所有 README”。README 在改导出的那个阶段已经改完。这里只修理验收失败项。

---

## 7. 分支与恢复

一条分支：`refactor/task1`，从干净的 `main` 拉出。

```text
main
└─ refactor/task1
    ├─ tag refactor/task1-baseline
    ├─ tag refactor/task1-p1
    ├─ tag refactor/task1-p2
    ├─ tag refactor/task1-p3
    ├─ tag refactor/task1-p4
    ├─ tag refactor/task1-p5
    ├─ tag refactor/task1-p6     （跳过 Phase 6 则没有）
    └─ tag refactor/task1-p7
```

提交前缀：`refactor(<area>):`。说明里不写 TASK1 或外部编号。

中断后：

```bash
git status --short
git log --oneline refactor/task1 -20
npm test
```

从台账里第一个未完成步骤继续。台账和 git 冲突时改台账。

不要在一个步骤的一半停。半截改动不提交，用 `git restore -- <文件>` 退回该步骤开始前。未跟踪的新文件手动删除，不使用 `git clean`。

---

## 8. 台账

执行时填写。计数以附录 B 为准。

| 步骤 | 状态 | commit | 结果 |
| --- | --- | --- | --- |
| 门槛：工作区干净，基线重算，AGENTS 覆盖率句子 | `[x]` | 2a81b00 | tag `refactor/task1-baseline` |
| 1 shape + ok/err | `[x]` | 654f43c | tag `refactor/task1-p1` |
| 2 字面量，按目录 | `[x]` | 642fdb0 | tag `refactor/task1-p2` |
| 3.0 分发清单 | `[x]` | | 见下方「Phase 3 分发清单」 |
| 3.1 三个标本 | `[x]` | | `map` / `bimap` / `unwrapOr` + `internal/dual.ts` |
| 3.2 停止或继续 | `[x]` | | 停止条件未触发，继续推广 |
| 3.3–3.6 | `[x]` | 6b7ff7b | tag `refactor/task1-p3` |
| 4 矩阵影子对照与冲突清单 | `[x]` | | tag `refactor/task1-p4` |
| 5 改名与删再导出 | `[ ]` | eb1c5dc (5.1), e9fdf69 (5.2), f192dfd (5.3) | |
| 6 内核，或明确跳过 | `[ ]` | | |
| 7 版本与发布说明 | `[ ]` | | |

基线计数（开工时填写，不要沿用旧文的 277 / 50 / 105 / 20）：

| 项 | 值 |
| --- | --- |
| Class S 生产代码 | ~170（`ok`/`err` 已清零；附录 B 脚本复核） |
| Class T 生产代码 | ~100 |
| Class I | `ok.ts` 内 `value as T` |
| shape 字面量（除 `shape.ts`） | ~50 |
| 生产代码对 `*/index.js` 的跨模块导入 | ~20 |
| HEAD | 见 `refactor/task1-baseline` / `refactor/task1-p1` tag |

### Phase 3 分发清单（3.0）

生产代码中「缺参返回函数」的双形态导出，按 §3 R5 分类（不含 `*.spec.ts` / 测试树）。

**`dualCarrierOrFn`（载体槽位与 `errorFn` 争用同一参数索引）**

| 模块 | 文件 |
| --- | --- |
| operators | `map`, `bimap`, `tap`, `tapErr`, `orElse`, `andTee`, `orTee`, `andThrough` |
| operators | `filterOrElse`（谓词 + 可选 `throwErrorFn`，靠参数个数区分直传/柯里化，推广时需单独槽位） |
| async-result | `map`, `mapAsync`, `bind`, `tap`, `tapErr`, `orElse`, `bimap` |
| promise-result | `map`, `asyncTap`, `asyncTapErr`, `asyncMatch`, `asyncOrElse`, `bimapAsync`, `bindThroughAsync`, `catchErrAsync`, `containsAsync`, `existsAsync`, `filterOrElseAsync`, `mapErrAsync`, `mapAsync`, `mapOrAsync`, `mapOrElseAsync`, `orElseAsync`, `tapAsync`, `tapErrAsync`, `unwrapOrAsync`, `unwrapOrElseAsync` |
| promise-option | `bindAsyncOption`, `containsAsyncOption`, `existsAsyncOption`, `filterAsyncOption`, `mapAsyncOption`, `mapOrAsyncOption`, `mapOrElseAsyncOption`, `matchAsyncOption`, `orElseAsyncOption`, `tapAsyncOption`, `unwrapOrAsyncOption`, `unwrapOrElseAsyncOption` |

**`dualByArity`（缺数据参即柯里化；默认值可以是函数）**

| 模块 | 文件 |
| --- | --- |
| operators | `unwrapOr`, `unwrapOrElse`, `mapErr`, `mapOr`, `mapOrElse`, `bind`, `and`, `or`, `ap`, `contains`, `exists`, `choose`, `traverseArray`, `expect`, `expectErr`, `catchErr`, `orThrow` |
| promise-result | `mapErr`, `unwrapOr`, `unwrapOrElse`, …（与 operators 镜像的 unwrap/mapErr 族） |
| observability | `withPath`, `tapErrContext` |

**其他（不套用两支 helper）**

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| operators | `match` | 处理器对象 vs 分参回调 |
| async-result | （多数 lazy 包装） | 与 operators 同名时复用相同分支形态，推广顺序在 3.3 按模块提交 |

**仅直传 / 无柯里化**： factories、combine 内核、reliability 调度、observability 格式化等（无「缺参返回函数」）。

### Phase 4 影子差异分类（4.2）

影子对照初始差异 2 条，均归入**第一类**（文档/矩阵用词与 JSDoc+实现一致，只改默认表或矩阵备注）：

| 导出 | 处理 |
| --- | --- |
| `async-result/mapAsync` — callback throw | 矩阵 `note` 从 anti-pattern 改为 JSDoc 传播陈述；`defaultProbePolicy` 显式 `propagate`。 |
| `async-option/exists` — predicate throw | JSDoc 写捕获；默认表改为 `capture`（不是把 `operators/exists` 改成捕获）。 |
| `promise-option/mapAsyncOption` — mapper async rejection | JSDoc/实现为捕获；默认表在泛化 `async rejection → propagate` 规则之前单独 `capture`。 |

**第二类**（文档与实现不一致）：无。未改运行时语义。

**第三类**（谓词 capture-none / capture-err 改 propagate）：无。

Phase 4 语义变更导出：**无**。`async-result/mapAsync` 与 `promise-result/mapAsync` 仍不同。

---

## 9. 完成定义

```bash
npm run typecheck
npm test
npm run test:type
npm run build
npm --prefix site run verify
tsc --project tsconfig.speccheck.json --noEmit
```

最后一条从本计划起成为门禁。它以前没有接到 `package.json`，所以 spec 里的类型错误不会让 `npm run typecheck` 失败。

| 项 | 完成 |
| --- | --- |
| Class S：`as unknown as IResult…` / `IOption…` / `AsyncResult…` / `AsyncOption…` | 生产代码为 0，或每一处都在 `src/internal/cast-allowlist.txt` 列明原因。允许的原因只有“元组或重载实现签名的边界”。 |
| Class T：`catch` 的 `unknown` 收成错误通道 | 可以留下。新增时集中到一个内部函数，不要求本次把旧站点全部搬过去。 |
| 结果 / 选项字面量 | 只在 `shape.ts` |
| 运行时整段复制的 `run` | `async-result` 的 `map` / `mapAsync` / `bind` 各只剩一份 |
| 双形态 helper | 已推广，或台账写明停在 3.2 且没有半迁移的操作符 |
| 生产代码跨模块 `index.js` 导入 | 0 |
| 公开运行时导出 | 四个通道均有记录；例外有 `reason` |
| `asyncMap` 等旧前缀导出 | 不在任何公开 barrel |
| `asyncOk` / `ofSome` 的再导出 | 不在 `promise-result` / `promise-option` |
| `async-option/ofSome` | 仍在 |
| `async-result/mapAsync` | 仍然传播 |
| 模块 README 数 | 16 |
| `AGENTS.md` 覆盖率描述 | 与 `vitest.config.ts` 一致 |
| 用例总数下限 | 不设。删除的测试必须有替换断言，禁止用 `expect(true)` 充数。 |

---

## 10. 风险

| 风险 | 处理 |
| --- | --- |
| 改 `ok` / `err` 重载后，调用点的 `E` 不再被推断 | 1.4 的 `test:type` 失败就停，不进入 Phase 2 |
| `dual` 损伤推断 | 3.2 停止，不存在“先迁移再看” |
| Phase 5 漏改动态导入或示例 | `verify:examples`、`verify:readme`、站点 snippets。不要用盲替换 |
| `build/internal` 随包发出 | 1.5 检查 `exports`。不承诺文件系统上不可见 |
| 覆盖率 90% 对新文件立即生效 | 随提交补测试。不改 `vitest.config.ts` 的阈值 |
| Phase 4 被人扩大成“统一所有 map” | 完成定义要求 `async-result/mapAsync` 仍然传播。扩大范围要另写行为变更，不写进这个阶段 |
| Phase 6 改了调度 | 调度测试失败即回退该阶段，发布不依赖它 |
| 归档目录被改 | 只读 `0.20260811`。新文档写在现行站点路径，由版本脚本再归档 |

---

## 附录 A. 类型边界

### 成立的部分

`IResultOfTFailure<E>` 没有 `TValue`。因此在 `E` 相同的前提下，收窄后的失败值可以赋给 `IResultOfT<B, E>`，不需要断言。`IResultOfT<number, 'a'>` 可以赋给 `IResultOfT<number, 'a' | 'b'>`，因为 `E` 只出现在失败变体的输出位置。

`ok<T, E>(value)` 的调用点返回 `IResultOfT<T, E>`，可以由重载声明，不必由实现签名返回联合类型。实现返回 `IResultOfTSuccess<T>` 即可，成功变体可以赋给该联合。`err` 同理：实现返回 `IResultOfTFailure<E>`，重载 `err<T, E>` 在调用点放宽值类型。实现签名的类型参数顺序改成与重载一致，避免读者按 `<E, T>` 去读 `<T, E>`。

对象字面量若直接返回给 `IResultOfT<T, E>` 这种联合类型，判别字段会放宽成 `boolean`，从而需要断言。返回给已经注明 `IResultOfTSuccess<T>` 的函数则不需要。所以断言要消失，必须走 `okShape` / `errShape` 这种窄返回类型，而不是把附录旧探针里的联合返回类型再写一遍。

### 不成立的部分

- `catch (thrown: unknown)` 不能产生 `E`。`thrown as E` 仍在。这是 Class T。
- `...args: [] | [T]` 在 `noUncheckedIndexedAccess` 下，长度判断之后 `args[0]` 仍可能是 `T | undefined`。这是 Class I，只允许留在 `ok` 内部。
- 异构元组 `combine` 的实现签名返回 `unknown` 再断言回元组。这是重载边界，列入允许清单，不是工厂传染。
- 旧探针里的 `as IResultOfT<T, E>` 说明探针没有达到它声称的结论。不要把那段代码放进 `src/` 再跑一遍当验收。Phase 1 的 `npm run test:type` 才是验收。

---

## 附录 B. 基线脚本

在仓库根目录用 Node 跑。生产文件排除 `*.spec.ts`、`*.type-spec.ts`、`*.bench.ts` 和 `src/tests/**`。

统计四件事：

1. **Class S**：行内 `as unknown as` 且同一行含 `IResult`、`IOption`、`AsyncResult` 或 `AsyncOption`。
2. **Class T**：行内 `as unknown as` 且不属于 Class S。人工复核时把真正的 `unknown → E` 留下，把漏网的结果断言改记入 Class S。
3. **字面量**：生产文件中匹配 `isSuccess:`、`isFailure:`、`isSome:`、`isNone:` 的对象字面量，排除 `src/internal/shape.ts`。
4. **barrel 导入**：生产文件中匹配 `from '../` 且路径以 `/index.js'` 结尾。

分发清单不要用正则把“文件里出现 `=== undefined`”算成双形态。打开文件，看导出函数的实现是否在缺参时返回函数。只记这类文件，并按 §3 R5 的两支分类。

---

## 附录 C. 命名对照

| 意图 | 路径 |
| --- | --- |
| 同步 Result，同步回调 | `operators/map` |
| `Promise<Result>`，同步回调 | `promise-result/map` |
| `Promise<Result>`，回调可返回 Promise | `promise-result/mapAsync` |
| 惰性 `AsyncResult`，同步回调，抛出捕获为 `Err` | `async-result/map` |
| 惰性 `AsyncResult`，回调可返回 Promise，抛出传播 | `async-result/mapAsync` |
| 同步 Result，回调可返回 Promise | `bridge-result/map` |
| 同步 Option，回调可返回 Promise | `bridge-option/map` |
| `Promise<Option>`，回调可返回 Promise | `promise-option/mapAsync` |
| 构造 Result | `factories/ok`、`factories/err` |
| 构造同步 Option | `option/ofSome`、`option/ofNone` |
| 构造惰性 Option | `async-option/ofSome`、`async-option/ofNone` |
| 把可能抛出的普通函数包进 Result | `primitives/lift` |
