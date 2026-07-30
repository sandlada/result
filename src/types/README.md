# Types (類型定義)

`types` 模組集中存放了項目內使用的核心 TypeScript 介面與類型定義，確保各模組間的類型一致性與嚴格檢測。

## API 列表

*(本模組為類型匯出，主要用於 TypeScript 型別系統)*

- `IResult`, `IResultSuccess`, `IResultFailure` (源自 [`IResult.ts`](./IResult.ts)): 定義了不帶返回值的無類型結果介面。
- `IResultOfT`, `IResultOfTSuccess`, `IResultOfTFailure` (源自 [`IResultOfT.ts`](./IResultOfT.ts)): 定義了帶有成功值與錯誤值的判別聯合（Discriminated Union）類型。
- `IOption`, `IOptionSome`, `IOptionNone` (源自 [`Option.ts`](./Option.ts)): 定義了表示可能缺失值的可選類型。
- `AsyncResult` (源自 [`AsyncResult.ts`](./AsyncResult.ts)): 定義了惰性異步結果的介面。
- `AsyncOption` (源自 [`AsyncOption.ts`](./AsyncOption.ts)): 定義了惰性異步可選值的介面。
