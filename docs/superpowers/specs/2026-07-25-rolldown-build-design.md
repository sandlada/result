# Rolldown 双通道构建设计

**日期：** 2026-07-25
**状态：** 已批准

## 背景

当前项目使用 TypeScript 编译器直接将 `src/**` 输出到 `build/**`，同时生成 JavaScript、声明文件及其 sourcemap。公共 API 包含大量 JSDoc；这些注释应保留在 `.d.ts` 中供编辑器和文档工具使用，但运行时 `.js` 应压缩并移除注释。

现有 `scripts/strip-js-comments.cjs` 通过正则后处理 `.js`，但它只删除 JSDoc，不执行完整 minify，并且硬编码了本机绝对路径。因此改用 Rolldown 直接负责 JavaScript 输出。

## 目标

1. `.d.ts` 保留公共 API 的 JSDoc 和其他声明注释。
2. `.js` 使用 Rolldown 完整压缩，并通过 `comments: false` 移除输出注释。
3. 同时生成 `.js.map` 和 `.d.ts.map`。
4. 保持当前 `src/**` 到 `build/**` 的模块目录映射。
5. 不改变 `package.json` 中现有根入口和 15 个子路径导出。
6. 构建失败时返回非零状态，不发布混合了新旧文件的产物。

## 非目标

- 不将声明文件改由 Rolldown/Oxc isolated declarations 生成。
- 不打包为单文件，也不引入带 hash 的共享 chunk。
- 不改变 ESM-only 发布模式。
- 不修改公共 API、运行时行为或子路径导出设计。

## 方案选择

采用 Rolldown 与 TypeScript 的双通道构建：

- TypeScript 只生成声明文件。
- Rolldown 只生成运行时 JavaScript。

不采用 Rolldown/Oxc 声明输出，因为该方式要求源码满足 `isolatedDeclarations`，且当前项目是类型密集型库。继续使用 TypeScript 官方编译器生成声明可降低复杂泛型和声明兼容性风险。

不采用 tsdown，因为直接使用 Rolldown 配置更透明，且不需要额外封装层即可满足当前需求。

## 构建架构

完整构建分为三个串行阶段。

### 1. 清理

在完整构建开始前删除整个 `build/`，避免旧 `.js`、`.d.ts` 或 sourcemap 残留。清理方式使用跨平台 Node 能力，不使用操作系统专属 shell 命令。

### 2. 声明文件构建

新增 `tsconfig.build.json` 并继承现有 `tsconfig.json`，设置：

- `declaration: true`
- `declarationMap: true`
- `emitDeclarationOnly: true`
- `removeComments: false`
- `rootDir: "./src"`
- `outDir: "./build"`

沿用现有测试与基准文件排除规则。该阶段输出：

- `build/**/*.d.ts`
- `build/**/*.d.ts.map`

现有 `tsconfig.json` 继续服务于编辑器、开发和类型检查，不混入构建专用的 declaration-only 行为。

### 3. JavaScript 构建

新增 `rolldown.config.ts`。以所有非测试 TypeScript 源模块作为输入，而不只使用公共入口；这样可完整保持当前逐模块输出结构，并确保内部相对导入总有对应的 `.js` 文件。

核心输出设置：

- `platform: "neutral"`
- `format: "esm"`
- `dir: "build"`
- `preserveModules: true`
- `preserveModulesRoot: "src"`
- `minify: true`
- `comments: false`
- `sourcemap: true`

输入排除：

- `src/**/*.spec.ts`
- 任何 `.d.ts` 源文件

该阶段输出：

- `build/**/*.js`
- `build/**/*.js.map`

示例映射：

```text
src/index.ts        -> build/index.js
                    -> build/index.js.map
                    -> build/index.d.ts
                    -> build/index.d.ts.map

src/option/index.ts -> build/option/index.js
                    -> build/option/index.js.map
                    -> build/option/index.d.ts
                    -> build/option/index.d.ts.map
```

## 配置与命令职责

`package.json` 提供可独立执行的命令：

- `build`：清理后依次执行声明构建和 JavaScript 构建。
- `build:types`：只生成 `.d.ts` 和 `.d.ts.map`。
- `build:js`：只运行 Rolldown。
- `typecheck`：执行不产生产物的 TypeScript 类型检查。

新增开发依赖 `rolldown`。设计时 npm 当前稳定版本为 `1.2.0`，要求 Node `^20.19.0 || >=22.12.0`；当前开发环境 Node 版本满足要求。

删除 `scripts/strip-js-comments.cjs`，因为其职责由 Rolldown 的 minifier 和 `comments: false` 完整替代。

## 错误处理

- `build` 串行执行各阶段。
- 声明生成失败时不继续生成 JavaScript。
- Rolldown 失败时整个构建返回非零状态。
- 不捕获或吞掉 TypeScript/Rolldown 错误与警告。
- 完整构建总是在空 `build/` 上开始，避免半新半旧的发布产物。

## 验证方案

### 静态验证

- 运行 TypeScript `noEmit` 类型检查。
- 确认 Rolldown 配置可加载并成功构建。
- 运行现有 Vitest 测试套件。

所有命令必须返回零状态。

### 产物验证

完整构建后确认：

- `.js`、`.js.map`、`.d.ts`、`.d.ts.map` 均存在。
- 不存在测试文件产物。
- 输出目录结构与 `src/**` 对应。
- `package.json` 中所有导出目标均存在。

### 注释策略验证

选择包含公开 JSDoc 的 API（例如 `ok`、`map` 或 `safeTry`）：

- 对应 `.d.ts` 必须包含 API JSDoc。
- 对应 `.js` 不得包含 JSDoc、普通块注释或源码行注释。
- 如 Rolldown 使用 `sourceMappingURL` 注释关联外部 sourcemap，则该构建元数据注释是唯一可接受的例外；不再进行正则后处理。

### 运行时与导出验证

- 使用 Node ESM 动态导入包根入口。
- 导入典型子路径，例如 `option`、`operators`、`promise-result`。
- 至少调用一个导出函数并确认行为正确。
- 验证全部 15 个公开导出入口均可解析。

### 发布包验证

运行 `npm pack --dry-run`，确认：

- 包含完整 `build/`。
- 不包含 `src/`、测试文件或构建脚本。
- 所有导出路径指向包内真实文件。
- 不包含旧构建产物。

## 验收标准

实施完成必须同时满足：

1. `.d.ts` 保留公共 API 注释。
2. `.js` 已 minify 且移除输出注释。
3. `.js.map` 与 `.d.ts.map` 均存在。
4. 现有测试全部通过。
5. 15 个 package exports 均可解析。
6. `npm pack --dry-run` 内容正确。
