# customer-mobile

React Native / Expo モバイルアプリ（顧客向け）

## セットアップ

```bash
cd customer-mobile
npm install
npm start
```

## ディレクトリ構成

```
customer-mobile/
├── app/                  # expo-router によるファイルベースルーティング
├── src/
│   ├── api/              # API クライアント
│   ├── components/       # 共通コンポーネント
│   ├── constants/        # 定数・設定
│   ├── hooks/            # カスタムフック
│   ├── navigation/       # ナビゲーション設定
│   ├── screens/          # 画面コンポーネント
│   ├── types/            # 型定義
│   └── utils/            # ユーティリティ関数
└── assets/               # 静的アセット
```

## 開発コマンド

```bash
npm start        # 開発サーバー起動
npm test         # テスト実行
npm run lint     # ESLint 実行
npm run type-check  # TypeScript 型チェック
```

## 環境変数

`.env.local` ファイルを作成し以下を設定：

```
EXPO_PUBLIC_API_URL=https://api.example.com
APP_ENV=development
```
