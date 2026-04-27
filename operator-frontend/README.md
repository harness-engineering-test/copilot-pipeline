# operator-frontend

オペレーター向け管理フロントエンドアプリケーション。

**技術スタック:** React 19 / TypeScript / Vite

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して環境に合わせた値を設定

# 開発サーバーの起動
npm run dev
```

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (http://localhost:5173) |
| `npm run build` | 本番ビルド |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm run lint` | ESLint 実行 |
| `npm test` | ユニットテスト実行 |
| `npm run test:watch` | テストウォッチモード |
| `npm run test:coverage` | カバレッジレポート生成 |

## ディレクトリ構成

```
src/
├── components/        # 再利用可能なコンポーネント
│   └── Counter/       # コンポーネント例
├── pages/             # ページコンポーネント
├── test/              # テスト設定
│   └── setup.ts       # Vitest セットアップ
├── assets/            # 静的アセット
├── App.tsx            # ルートコンポーネント
└── main.tsx           # エントリポイント
```

## 環境変数

`.env.example` を参照してください。

## テスト

[Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) を使用。

```bash
npm test                # 全テスト実行
npm run test:coverage   # カバレッジレポート付きで実行
```

