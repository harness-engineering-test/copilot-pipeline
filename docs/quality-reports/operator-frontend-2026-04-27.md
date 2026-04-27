# 週次品質レポート: operator-frontend

**対象ディレクトリ:** `operator-frontend/`
**レポート日:** 2026-04-27
**技術スタック:** React 19 / TypeScript / Vite

---

## スコア概要

| 観点 | スコア | 判定 |
|------|--------|------|
| アーキテクチャ | 5/10 | ⚠️ |
| コード品質 | 6/10 | ✅ |
| テスト | 4/10 | ❌ |
| セキュリティ | 6/10 | ✅ |
| パフォーマンス | 5/10 | ⚠️ |
| 運用性 | 5/10 | ⚠️ |
| **合計** | **32/60** | |

**総合ランク: C**

---

## 各観点の詳細

### 1. アーキテクチャ (5/10)

#### 根拠
- ✅ Vite + React + TypeScript の構成は現代的かつ適切
- ✅ コンポーネント単位でディレクトリを分割（`components/Counter/`）
- ✅ `index.ts` による re-export パターンを採用
- ⚠️ `pages/` ディレクトリは作成されているが中身が空 — ルーティング設計が未確立
- ❌ React Router 等のルーティングライブラリが未導入
- ❌ 状態管理戦略（Context / Zustand / TanStack Query 等）が未定義
- ❌ API クライアント層の抽象化がない

### 2. コード品質 (6/10)

#### 根拠
- ✅ TypeScript strict モードに準じた設定（`noUnusedLocals`, `noUnusedParameters`）
- ✅ ESLint + `eslint-plugin-react-hooks` / `eslint-plugin-react-refresh` 導入済み
- ✅ `Counter` コンポーネントは Props 型定義・デフォルト値を適切に記述
- ✅ `useState` のコールバック更新パターンを使用（`prev => prev + 1`）
- ⚠️ Prettier / コードフォーマッタが未導入
- ⚠️ import 順序やファイル命名規則などのスタイルガイドが未整備
- ❌ barrel export が一部コンポーネントのみに適用され、統一されていない

### 3. テスト (4/10)

#### 根拠
- ✅ Vitest + React Testing Library のセットアップ完了
- ✅ `Counter` コンポーネントのユニットテスト4件が通過
- ✅ ユーザーインタラクションのテスト（`userEvent`）を実施
- ❌ `App.tsx` のテストが存在しない
- ❌ カバレッジ目標・閾値の設定がない
- ❌ 統合テスト / E2E テスト（Playwright / Cypress 等）が未導入
- ❌ `src/pages/` に実装が増えた際のテスト戦略が未定義

### 4. セキュリティ (6/10)

#### 根拠
- ✅ React の JSX は XSS を自動でエスケープする
- ✅ `dangerouslySetInnerHTML` 等の危険な API を使用していない
- ✅ `StrictMode` が有効（潜在的な副作用を早期検出）
- ✅ `rel="noopener noreferrer"` を全 `target="_blank"` リンクに設定済み
- ⚠️ Content Security Policy (CSP) ヘッダーの設定なし
- ❌ 依存ライブラリの脆弱性スキャン（`npm audit` CI 連携）が未設定
- ❌ 認証・認可の仕組みが未実装

### 5. パフォーマンス (5/10)

#### 根拠
- ✅ Vite によるコード分割・Tree Shaking が有効
- ✅ 本番ビルドで適切なバンドルサイズ（JS 60.7 KB gzip）
- ✅ React 19 の自動バッチ処理が利用可能
- ⚠️ `React.memo` / `useMemo` / `useCallback` の活用指針が未定義
- ⚠️ 画像最適化（WebP 変換・lazy loading）の考慮なし
- ❌ Lighthouse / Core Web Vitals の計測・目標値設定がない
- ❌ 遅延ロード（`React.lazy` + `Suspense`）戦略が未整備

### 6. 運用性 (5/10)

#### 根拠
- ✅ `npm run build` / `npm run dev` / `npm test` スクリプトが整備
- ✅ `.env.example` で必要な環境変数を明示済み
- ✅ `README.md` にプロジェクト固有のセットアップ手順・コマンド一覧を記載
- ❌ CI / CD パイプラインのフロントエンド固有 workflow が未設定
- ❌ エラー監視（Sentry 等）の統合がない
- ❌ ビルド成果物のデプロイ手順が未定義

---

## 改善提案（優先度順）

### 優先度1: テスト基盤の強化（テスト: 4/10）

**問題:** テストカバレッジが `Counter` コンポーネントのみに限定され、App 全体・ページ・API 連携のテストがない。

**対応策:**
1. `App.tsx` のテストを追加
2. `vitest.config.ts` にカバレッジ閾値（branches: 80, lines: 80）を設定
3. GitHub Actions に `npm test -- --coverage` ステップを追加

### 優先度2: 運用インフラの整備（運用性: 5/10 → 目標 7/10）

**問題:** CI/CD パイプライン・エラー監視・デプロイ手順が未整備で、運用フェーズで問題が顕在化するリスクが残る。

**対応策:**
1. `.github/workflows/` にフロントエンドの lint・test・build workflow を追加
2. Sentry 等のエラー監視を統合
3. デプロイ先（Vercel / Netlify 等）の設定とデプロイ手順をドキュメント化

### 優先度3: アーキテクチャの確立（アーキテクチャ: 5/10）

**問題:** ルーティング・状態管理・API クライアントの設計が未定義で、機能追加時に技術的負債が蓄積しやすい。

**対応策:**
1. React Router v7 を導入し、`src/pages/` をルート定義と接続
2. API クライアント層（`src/api/`）と型定義（`src/types/`）を整備
3. グローバル状態管理ライブラリ（例: Zustand）の採用方針を決定・文書化

---

## スコア5点未満の観点（要改善 Issue）

以下の観点はスコアが5点未満のため、別途改善 Issue を起票します。

| 観点 | スコア | Issue タイトル（案） |
|------|--------|----------------------|
| テスト | 4/10 | `[改善] operator-frontend テスト基盤強化 - カバレッジ目標と E2E 設定` |
| 運用性 | 5/10 | `[改善] operator-frontend 運用インフラ整備 - CI/CD・エラー監視・デプロイ手順` |

> **注記:** 本レポート作成時にセキュリティ修正（`rel="noopener noreferrer"` 追加）、`.env.example` 追加、`README.md` 更新を実施済みのため、テストのみスコア5点未満として改善 Issue の起票対象とします。
