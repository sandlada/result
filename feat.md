# 缺失 API 分析報告 (Missing APIs Report)

在對 `@sandlada/result` 當前的 API 進行了全面盤點，並與 `F#` 標準庫、`Rust`、`fp-ts`、`neverthrow` 以及 `Effect` 的核心錯誤處理通道進行對比後，我總結了當前庫中仍然缺失或可以增強的 API。

雖然目前專案已經具備了極為完備的基礎（包含 `map`、`bind`、`match`、`traverseArray`、`sequence`、`safeTry` Do-notation 等），但仍有一些高級的函數式操作和實用工具尚未提供。

以下缺失的 API 已根據**需求度/優先級**進行排序，並遵循 F# 的風格和命名習慣：

## 1. 需求度：極高 (High Priority)
這些 API 是日常開發中非常常用的實用工具，在 Rust 和 Effect 中極為常見。

### 1.1 異步的 Do-notation (`safeTryAsync`)
- **現狀**：目前專案實現了基於 Generator 的同步 Do-notation (`safeTry` / `fromSafeTry`)。
- **缺失功能**：缺少針對異步 `AsyncResult` 的 Do-notation 支援。在 `Effect` 或 `fp-ts`（結合 yield）中，異步的 Do-notation 能夠極大地改善深層次嵌套的 `await bindAsync` 程式碼結構。
- **建議命名**：`safeTryAsync` / `fromSafeTryAsync` (基於 AsyncGenerator)。

## 2. 需求度：中等 (Medium Priority)
提供更高級的集合處理和條件過濾工具。

### 2.1 `traverseOption`
- **現狀**：專案已提供 `traverseArray` 用於處理 `Result` 的數組遍歷。
- **缺失功能**：對 `Option` 類型的數組進行短路遍歷。當映射函數返回 `Option` 時，如果中途返回 `None`，則整個結果為 `None`。
- **建議命名**：`traverseOptionArray`
- **參考**：fp-ts `Array.traverse(Option.Applicative)`。

### 2.2 `filterOption` (Result 轉換)
- **現狀**：有 `filter` 針對 `Option`，`filterOrElse` 針對 `Result`。
- **缺失功能**：在處理 `Result` 時，常常需要將 `Result<Option<T>, E>` 轉換處理，或者類似 Rust 中的 `.transpose()`，專案中有 `transpose` 但主要針對 Option 包含 Result，可以進一步補充集合級別的過濾：從 `Result<T, E>[]` 中提取所有 `Ok` 並丟棄 `Err`，這在 Effect 的 `filterMap` 中很常見。
- **建議命名**：`choose` (對齊 F# 中過濾並映射 `Option` 的操作) 或 `values`。
- **參考**：F# `List.choose`。

### 2.3 `catchErr` / `catchAll`
- **現狀**：目前有 `orElse` 用於在錯誤時返回另一個 Result。
- **缺失功能**：與 `Effect` 中的 `catchAll` 類似，有時候我們需要不僅是回退一個靜態的 Result，而是能夠根據錯誤類型，重新進入軌道。雖然 `orElse` 或 `bindErr` 可以做到，但語義上 `catchErr` 對應 Promise/Effect 範式會更直覺。
- **建議命名**：`catchErr` (作為 `orElse` 的語義別名或特定擴展)。

## 3. 需求度：低 (Low Priority / Nice to Have)
這些功能可以通過現有的 API 組合實現，但提供內置函數能減少樣板代碼。

### 3.1 `unzip`
- **現狀**：目前有 `zipWith`。
- **缺失功能**：將一個包含元組的 `Result<[A, B], E>` 拆分為兩個 `Result` 的元組 `[Result<A, E>, Result<B, E>]`。
- **建議命名**：`unzip`
- **參考**：Rust `.unzip()`

### 3.2 針對異步流的擴展 (Stream)
- **現狀**：提供 `AsyncResult` 用於單一異步值。
- **缺失功能**：沒有與流 (Stream / AsyncIterable) 結合的 API。例如 Effect 有強大的 Stream 處理，fp-ts 也有相應模塊。不過如果這是一個輕量級 ROP 庫，這可能超出了核心範圍。

---

**總結**：
`@sandlada/result` 的核心功能非常豐富且堅固。首要的增強方向應聚焦在**異步的 Do-notation (`safeTryAsync`)**，這將大幅提升處理多個依賴異步請求時的開發體驗，使其能媲美 Effect 的 yield 特性。