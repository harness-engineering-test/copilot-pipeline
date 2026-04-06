# [改善] operator-frontend 初期セットアップ

**優先度**: 高
**関連レポート**: [週次品質レポート 2026-04-06](./operator-frontend-2026-04-06.md)
**対象観点**: アーキテクチャ（0/10）、コード品質（0/10）、運用性（0/10）

## 背景

`operator-frontend/` ディレクトリが存在しないため、オペレーター向けフロントエンドの開発が開始できない状態です。
モノレポ構成の一部として、React アプリケーションを初期セットアップする必要があります。

## 対応内容

### 1. プロジェクト初期化

```bash
cd operator-frontend
npm create vite@latest . -- --template react-ts
npm install
```

### 2. コード品質ツールの整備

- ESLint（`eslint-config-react-app` または `@typescript-eslint`）の導入
- Prettier の導入と `.prettierrc` の設定
- `package.json` への `lint` / `lint:fix` スクリプト追加

### 3. ディレクトリ構成

Feature-based アーキテクチャを採用する:

```
operator-frontend/
├── src/
│   ├── components/    # 共通UIコンポーネント
│   ├── features/      # 機能別モジュール
│   ├── hooks/         # カスタムフック
│   ├── services/      # API通信層
│   ├── store/         # 状態管理（Zustand or Redux Toolkit）
│   ├── types/         # 型定義
│   └── utils/         # ユーティリティ
├── public/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 4. 環境変数管理

- `.env.example` を作成し、必要な環境変数を文書化
- `.env` を `.gitignore` に追加

### 5. CI スクリプト整備

`package.json` に以下スクリプトを追加:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest"
  }
}
```

## 完了条件

- [ ] `operator-frontend/` ディレクトリが存在する
- [ ] `npm run build` が成功する
- [ ] `npm run lint` が成功する
- [ ] TypeScript のコンパイルエラーがゼロ
- [ ] Feature-based ディレクトリ構成が整備されている
- [ ] `.env.example` が存在する
