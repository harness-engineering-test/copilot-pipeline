# [改善] operator-frontend プロジェクトの新規作成

**優先度**: 高（P0）  
**関連レポート**: `docs/operator-frontend-quality-report-2026-05-25.md`  
**対象スコア**: アーキテクチャ 0/10、コード品質 0/10

---

## 背景・課題

週次品質レポート（2026-05-25）にて `operator-frontend/` ディレクトリが存在しないことが確認された。
オペレーター向け管理 UI が完全に欠如しており、サービス運用に必要な管理機能を提供できていない状態にある。

アーキテクチャおよびコード品質観点でスコア 0 点（5 点未満）を記録したため、本 Issue を起票する。

## ゴール

`operator-frontend/` ディレクトリを作成し、以下が実現されれば完了とする：

- [ ] React / Next.js + TypeScript によるプロジェクト骨格の作成
  - `package.json`, `tsconfig.json` の設定
  - フレームワーク初期設定
- [ ] 基本コンポーネントの実装
  - レイアウト・ナビゲーション
  - 認証ページ（ログイン）
- [ ] ルーティング設計の実装
- [ ] ESLint + Prettier の設定
- [ ] README（セットアップ手順・開発フロー）の作成

## 制約・考慮事項

- `backend/`、`customer-mobile/` との一貫性を保ったモノレポ構成を維持する
- TypeScript strict mode (`"strict": true`) を有効化する
- `.github/copilot-instructions.md` のコーディング規約に準拠する
- コンポーネント粒度は feature-based 構成を推奨
