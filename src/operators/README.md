# Operators (同步操作符)

`operators` 模組提供了所有針對同步 `IResultOfT` 結構的操作符，支援以 Point-free 或函數式風格進行資料轉換與流程控制。

## API 列表

- [`and`](./and.ts): 若當前為 `Ok`，則返回另一個 Result。
- [`andTee`](./andTee.ts): 若為 `Ok`，執行副作用並返回原值。
- [`andThrough`](./andThrough.ts): 鏈式傳遞 `Ok` 值，忽略中間步驟的返回值。
- [`ap`](./ap.ts): 將 Result 內部的函數應用於另一個 Result 內部的值。
- [`bimap`](./bimap.ts): 同時轉換 `Ok` 與 `Err` 狀態。
- [`bind`](./bind.ts): 若為 `Ok` 則執行回調返回新 Result（平坦化映射）。
- [`contains`](./contains.ts): 檢查 `Ok` 是否包含指定值。
- [`exists`](./exists.ts): 檢查 `Ok` 中的值是否滿足特定條件。
- [`expect`](./expect.ts): 解包 `Ok`，若為 `Err` 則拋出帶自定義訊息的異常。
- [`expectErr`](./expectErr.ts): 解包 `Err`，若為 `Ok` 則拋出帶自定義訊息的異常。
- [`filterOrElse`](./filterOrElse.ts): 根據條件過濾 `Ok` 值，失敗則轉為 `Err`。
- [`flatten`](./flatten.ts): 拍平嵌套的 `IResultOfT<IResultOfT<T, E>, E>`。
- [`map`](./map.ts): 映射 `Ok` 中的值。
- [`mapErr`](./mapErr.ts): 映射 `Err` 中的值。
- [`mapOr`](./mapOr.ts): 映射 `Ok` 中的值，若為 `Err` 返回預設值。
- [`mapOrElse`](./mapOrElse.ts): 對 `Ok` 與 `Err` 分別進行映射。
- [`match`](./match.ts): 對 `Ok` 與 `Err` 分別執行回調並返回統一類型。
- [`or`](./or.ts): 若當前為 `Err`，則返回另一個 Result。
- [`orElse`](./orElse.ts): 若為 `Err`，則執行回調回退到新 Result。
- [`orTee`](./orTee.ts): 若為 `Err` 執行副作用，成功則保持原錯誤。
- [`orThrow`](./orThrow.ts) / `orThrowWith`: 解包 `Ok`，若為 `Err` 則拋出異常（支援自定義錯誤工廠）。
- [`separate`](./separate.ts): 將包含 Result 的集合分離為成功與失敗兩組。
- [`swap`](./swap.ts): 翻轉 `Ok` 與 `Err` 狀態。
- [`tap`](./tap.ts): 對 `Ok` 狀態執行同步副作用。
- [`tapErr`](./tapErr.ts): 對 `Err` 狀態執行同步副作用。
- [`traverseArray`](./traverseArray.ts): 遍歷陣列並組合多個 Result，支援短路。
- [`unsafeUnwrap`](./unsafeUnwrap.ts): 不安全地解包 `Ok`。
- [`unsafeUnwrapErr`](./unsafeUnwrapErr.ts): 不安全地解包 `Err`。
- [`unwrap`](./unwrap.ts): 解包 `Ok`，若為 `Err` 則拋出異常。
- [`unwrapErr`](./unwrapErr.ts): 解包 `Err`，若為 `Ok` 則拋出異常。
- [`unwrapOr`](./unwrapOr.ts): 解包 `Ok`，若為 `Err` 則返回預設值。
- [`unwrapOrElse`](./unwrapOrElse.ts): 解包 `Ok`，若為 `Err` 則執行回調生成預設值。
