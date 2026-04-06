# [改善] operator-frontend セキュリティ・パフォーマンス基盤の整備

**優先度**: 中
**関連レポート**: [週次品質レポート 2026-04-06](./operator-frontend-2026-04-06.md)
**対象観点**: セキュリティ（0/10）、パフォーマンス（0/10）

## 背景

`operator-frontend/` が未作成のため、セキュリティおよびパフォーマンスに関する評価が不可能な状態です。
プロジェクト初期セットアップ完了後、以下のセキュリティ・パフォーマンス対策を実装します。

## セキュリティ対応内容

### 1. 依存関係セキュリティ

- `npm audit` を CI に組み込む
- Dependabot の設定（`.github/dependabot.yml`）

### 2. 認証・認可

- JWT トークンの適切な管理（`httpOnly Cookie` を推奨、`localStorage` に保存しない）
- 認証済みルートの保護（`PrivateRoute` コンポーネントの実装）
- トークンの自動リフレッシュ機能

### 3. XSS 対策

- React の JSX エスケープ機能を活用（`dangerouslySetInnerHTML` の使用禁止）
- CSP（Content Security Policy）ヘッダーの設定
- ユーザー入力の適切なバリデーション（`zod` など）

### 4. CSRF 対策

- API リクエストへの CSRF トークン付与
- SameSite Cookie の設定

## パフォーマンス対応内容

### 1. バンドル最適化

- コード分割（`React.lazy` + `Suspense`）の導入
- 動的インポートによる遅延読み込み

```tsx
const OperatorDashboard = React.lazy(() => import('./features/dashboard/OperatorDashboard'))
```

### 2. レンダリング最適化

- `React.memo` / `useMemo` / `useCallback` の適切な使用
- 不要な再レンダリングの防止

### 3. データフェッチ最適化

- React Query（`@tanstack/react-query`）の導入によるキャッシュ管理
- ローディング・エラー状態の適切なハンドリング

### 4. ビルド最適化

- Vite の `build.rollupOptions` でチャンク分割設定
- 画像の最適化（`vite-plugin-imagemin` など）

## 完了条件

- [ ] `npm audit` でHigh/Critical 脆弱性がゼロ
- [ ] 認証・認可フローが実装されている
- [ ] CSP ヘッダーが設定されている
- [ ] バンドルサイズが適切に分割されている（メインバンドル < 500KB）
- [ ] React Query によるデータフェッチキャッシュが実装されている
- [ ] Lighthouse スコア（パフォーマンス）が 80 以上
