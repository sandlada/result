# Adapters (配接器)

`adapters` 模組負責在**單軌（普通值 / 普通函數）**與**雙軌（`IResultOfT` / `Promise<IResultOfT>`）**之間建立橋樑。本模組中的函數不會修改 Result 的字面量結構，而是提供從原始輸入至判别聯合（Discriminated Union）的同構映射。

## API 列表

- [`fromOption`](./fromOption.ts): 將 `IOption<A>` 提升為 `IResultOfT<A, E>`。
- [`liftMap`](./liftMap.ts): `map` 的語義別名，用於將普通函數提升至雙軌環境。
- [`switchFn`](./switchFn.ts): 將同步普通函數包裝為返回 `IResultOfT` 的開關函數。
- [`switchFnAsync`](./switchFnAsync.ts): 將異步（或同步）普通函數包裝為返回 `Promise<IResultOfT>` 的開關函數。
- [`tee`](./tee.ts): 單軌副作用函數。執行回調後原樣返回輸入值，異常直接向上拋出。
- [`teeAsync`](./teeAsync.ts): 異步單軌副作用函數。等待回調執行後原樣返回輸入值，異常直接向上拋出。
- [`toOption`](./toOption.ts): 將 `IResultOfT<A, E>` 降格為 `IOption<A>`，顯式捨棄錯誤資訊。
