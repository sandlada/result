# Reliability (可靠性與彈性)

`reliability` 模組提供了增強異步操作健壯性的工具，例如重試機制、超時控制與並發競爭，協助處理不穩定的網絡請求或外部依賴。

## API 列表

- [`allSettled`](./allSettled.ts): 並行執行多個任務，等待全部完成（無論成功或失敗）並收集結果。
- [`any`](./any.ts): 並行執行多個任務，返回第一個成功的 Result，若全失敗則匯總錯誤。
- [`race`](./race.ts): 競速執行多個任務，返回最先成功的結果；若全部失敗，則返回輸入順序最前的錯誤（空輸入時返回 `EmptyInputsError`，可由 `onEmpty` 覆寫）。
- [`retry`](./retry.ts): 針對異步任務提供可配置的重試機制（支援退避策略與最大次數）。
- [`retryLazy`](./retryLazy.ts): 針對 `AsyncResult` 的惰性重試機制。
- [`timeout`](./timeout.ts): 為異步任務添加超時限制，超時後返回特定的錯誤 Result。
- [`timeoutEager`](./timeoutEager.ts): 主動型超時控制，專注於取消未完成的底層任務（依賴具體實現支援）。
