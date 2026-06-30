# @sandlada/jss

一個簡單的 CSS-in-JS 函式庫，提供兩類工具來管理 CSS 自訂屬性（變數）：

- **define 系列** — 產生 CSS 宣告（`--name: value`），用於輸出到樣式表
- **use 系列** — 產生 `var()` 引用（`var(--name, fallback)`），用於組合進其他宣告中

完整文件請參閱 [docs/README.md](./docs/README.md)。

## 安裝

```bash
npm install @sandlada/jss
```

專案使用 TypeScript 6 + ESM，匯入即可獲得完整的型別推斷。

---

## define 系列 — 產生 CSS 宣告

| 函式                                                   | 說明                                                                                                           | 文件                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `defineVars(name, value)`                              | 基本變數定義，回傳字串陣列                                                                                     | [docs/define-vars.md](./docs/define-vars.md)                                                           |
| `defineLogicalBorderRadiusVars(base, value, options?)` | 展開為四個邏輯角（`start-start` / `start-end` / `end-start` / `end-end`），回傳陣列，支援 `{ semi?, prefix? }` | [docs/define-logical-border-radius-vars.md](./docs/define-logical-border-radius-vars.md)               |
| `defineLogicalBorderRadiusVarsRecord(base, value)`     | 同上，但回傳 Record 物件                                                                                       | [docs/define-logical-border-radius-vars-record.md](./docs/define-logical-border-radius-vars-record.md) |
| `defineTokenRefsRecord(tokens, options?)`              | 將設計 Token 綁定為內部變數（`--_key: var(--key, value)`），支援形狀屬性展開與 `{ prefix? }`                   | [docs/define-token-refs-record.md](./docs/define-token-refs-record.md)                                 |
| `defineOverrides(source, overrides)(prefix?)`          | 型別安全的樣式覆蓋輔助，Curried API，可傳入 `null` 跳過型別約束                                                | [docs/define-overrides.md](./docs/define-overrides.md)                                                 |

```ts
import { defineVars } from '@sandlada/jss'

// ['--color: red']
defineVars('color', 'red')

// ['--color: red', '--bg-color: blue']
defineVars({ color: 'red', 'bg-color': 'blue' })

// 第三個參數 true 加上分號尾綴
defineVars('color', 'red', true) // ['--color: red;']
```

```ts
import { defineTokenRefsRecord } from '@sandlada/jss'

const AppTokens = {
  'button-text-color': 'red',
  'button-bg-color': 'white',
  'button-shape': 'var(--md-sys-shape-corner-full, 9999px)',
} as const

// 將設計 Token 綁定為內部變數：
// { '--_button-text-color': 'var(--button-text-color, red)', ... }
defineTokenRefsRecord(AppTokens)

// 使用 prefix 為所有 token 加上前綴：
defineTokenRefsRecord(AppTokens, { prefix: '--md-badge' })
// { '--_button-text-color': 'var(--md-badge-button-text-color, red)', ... }

// 展開形狀屬性為四個邏輯角：
defineTokenRefsRecord(AppTokens, { expandShapes: ['button-shape'] })
// {
//   '--_button-text-color': 'var(--button-text-color, red)',
//   '--_button-shape-start-start': 'var(--button-shape-start-start, var(--md-sys-shape-corner-full, 9999px))',
//   '--_button-shape-start-end': 'var(--button-shape-start-end, ...)',
//   '--_button-shape-end-start': 'var(--button-shape-end-start, ...)',
//   '--_button-shape-end-end': 'var(--button-shape-end-end, ...)',
// }

// 加入基底變數作為中繼備援（兩層 var() 遞迴）：
defineTokenRefsRecord(AppTokens, { expandShapes: ['button-shape'], useBaseFallback: true })
// {
//   '--_button-shape-start-start': 'var(--button-shape-start-start, var(--button-shape, var(--md-sys-shape-corner-full, 9999px)))',
//   ...
// }
```

---

## defineOverrides — 型別安全的樣式覆蓋

```ts
import { defineOverrides } from '@sandlada/jss'

const FocusRing = {
  'outline-color': 'red',
  'outline-width': '2px',
} as const

// 型別安全模式：從 source 推導鍵值約束，所有鍵皆為可選
// { 'outline-color': 'blue' }
defineOverrides(FocusRing, { 'outline-color': 'blue' })()

// 套用 CSS 變數前綴
// { '--my-comp-outline-color': 'blue' }
defineOverrides(FocusRing, { 'outline-color': 'blue' })('--my-comp')

// 部分覆蓋或空物件皆可
defineOverrides(FocusRing, {})()

// 無型別約束模式：source 傳入 null
defineOverrides(null, { 'outline-color': 'blue' })()

// 實際使用：覆蓋共享元件樣式
const CompB = {
  'bg-color': 'blue',
  ...defineOverrides(FocusRing, { 'outline-color': 'blue' })('--my-comp'),
} as const
// { 'bg-color': 'blue', '--my-comp-outline-color': 'blue' }
```

---

## 通用選項

部分函式支援第二個（或第三個）參數傳入 `JSSOptions` 物件來控制行為：

```ts
interface JSSOptions {
  semi?: boolean   // 是否在結尾加上分號（;）
  prefix?: string  // CSS 變數名稱前綴（例如 '--md-badge'）
}
```

**`semi`** — 加上分號尾綴，適用於需要 inline style 語句的場景。

**`prefix`** — 為產生的 CSS 變數名稱加上自訂前綴。例如使用 `{ prefix: '--md-badge' }` 時，
`useVars('color-primary', 'blue', { prefix: '--md-badge' })` 會輸出 `var(--md-badge-color-primary, blue)`，
取代預設的 `var(--color-primary, blue)`。

> **注意：** `prefix` 僅影響 CSS 變數的**名稱部分**，不影響 Record 的 JavaScript 鍵名。
> 支援 prefix 的函式：`useVars`、`useVarsRecord`、`useInternalVarsRecord`、`useLogicalBorderRadiusVars`、
> `useLogicalBorderRadiusVarsRecord`、`defineLogicalBorderRadiusVars`、`defineTokenRefsRecord`。

---

## use 系列 — 產生 `var()` 引用

| 函式                                                           | 說明                                                                 | 文件                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `useVars(name, fallback, options?)`                            | 基本變數引用，回傳陣列，支援 `{ semi?, prefix? }`                    | [docs/use-vars.md](./docs/use-vars.md)                                                           |
| `useVarsRecord(name, fallback, options?)`                      | 基本變數引用，回傳 Record，支援 `{ semi?, prefix? }`                 | [docs/use-vars-record.md](./docs/use-vars-record.md)                                             |
| `useInternalVars(name, fallback)`                              | 內部變數（`--_` 前綴）引用，回傳陣列                                 | [docs/use-internal-vars.md](./docs/use-internal-vars.md)                                         |
| `useInternalVarsRecord(name, fallback, options?)`              | 內部變數引用，回傳 Record，支援 `{ semi?, prefix? }`                 | [docs/use-internal-vars-record.md](./docs/use-internal-vars-record.md)                           |
| `useLogicalBorderRadiusVars(corner, fallback, options?)`       | 邏輯角變數（兩層 `var()` 遞迴），回傳陣列，支援 `{ semi?, prefix? }` | [docs/use-logical-border-radius-vars.md](./docs/use-logical-border-radius-vars.md)               |
| `useLogicalBorderRadiusVarsRecord(corner, fallback, options?)` | 邏輯角變數，回傳 Record，支援 `{ semi?, prefix? }`                   | [docs/use-logical-border-radius-vars-record.md](./docs/use-logical-border-radius-vars-record.md) |

```ts
import { useVars } from '@sandlada/jss'

// ['var(--color-primary, blue)']
useVars('color-primary', 'blue')

// 支援 `var()` 遞迴鏈：
// ['var(--a, var(--b, var(--c, default-value)))']
useVars(['a', 'b', 'c'], 'default-value')

// Record 模式自動剝除 -- 前綴作為鍵名：
// { 'color-primary': 'var(--color-primary, blue)' }
useVarsRecord('--color-primary', 'blue')

// 使用 prefix 選項為所有變數名稱加上前綴：
// ['var(--md-badge-color-primary, blue)']
useVars('color-primary', 'blue', { prefix: '--md-badge' })

// ['var(--md-badge-a, var(--md-badge-b, var(--md-badge-c, default-value)))']
useVars(['a', 'b', 'c'], 'default-value', { prefix: '--md-badge' })
```

---

## 開發

```bash
# 安裝依賴
npm install

# 執行測試
npx vitest

# 型別檢查
npx tsc --noEmit
```
