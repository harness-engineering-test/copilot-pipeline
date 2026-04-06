# [改善] operator-frontend テスト基盤の構築

**優先度**: 高
**関連レポート**: [週次品質レポート 2026-04-06](./operator-frontend-2026-04-06.md)
**対象観点**: テスト（0/10）

## 背景

`operator-frontend/` にテストコードが存在しません。プロジェクト規約では新規コードに対して必ず単体テストを書くことが求められており、テスト設定の整備が急務です。

## 対応内容

### 1. テストフレームワークの導入

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. Vitest 設定

`vite.config.ts` に追記:
```ts
/// <reference types="vitest" />
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/setupTests.ts'],
    },
  },
})
```

### 3. セットアップファイルの作成

`src/setupTests.ts`:
```ts
import '@testing-library/jest-dom'
```

### 4. テスト作成方針

- 各コンポーネントに対応する `*.test.tsx` / `*.spec.tsx` を同一ディレクトリに配置
- カスタムフックは `*.test.ts` でテスト
- API サービス層はモックを使用してテスト
- カバレッジ目標: 60% 以上

### 5. package.json スクリプト

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 完了条件

- [ ] `npm run test` が成功する
- [ ] 主要コンポーネントに最低1件のテストが存在する
- [ ] テストカバレッジが 60% 以上
- [ ] CI でテストが自動実行される
