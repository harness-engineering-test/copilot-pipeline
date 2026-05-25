# 週次品質レポート: customer-mobile

**対象**: `customer-mobile/` ディレクトリ  
**レポート日**: 2026-05-25  
**評価者**: Copilot Agent

---

## スコアサマリー

| 観点           | スコア | 判定 |
|--------------|:----:|:----:|
| アーキテクチャ     |  7   |  ✅  |
| コード品質       |  6   |  ✅  |
| テスト         |  4   |  ⚠️  |
| セキュリティ      |  6   |  ✅  |
| パフォーマンス     |  5   |  ✅  |
| 運用性         |  4   |  ⚠️  |
| **合計**       | **32/60** |    |

**総合ランク: C**

---

## 詳細評価

### 1. アーキテクチャ: 7/10

**根拠**:
- ✅ 関心の分離が明確: `screens/`, `components/`, `hooks/`, `api/`, `store/`, `types/` と責務別にディレクトリを分離している
- ✅ `NavigationContainer` を `App.tsx` でラップし、ルートナビゲーター (`RootNavigator`) が認証状態によって Auth/Main を切り替える構成は適切
- ✅ API クライアントは `src/api/client.ts` に集約し、認証ヘッダーの付与を Interceptor で一元管理している
- ✅ 状態管理は Zustand で軽量に構成。React Query でサーバー状態とクライアント状態を分離
- ⚠️ `HomeScreen` がプレースホルダーのみで実際のビジネスロジックが未実装
- ⚠️ エラーハンドリング専用レイヤー（ErrorBoundary など）が不在
- ⚠️ モノレポ内の共有型・定数が不在（backend と型を共有する仕組みがない）

**改善余地**:
- エラーバウンダリの導入
- 型の共有化（OpenAPI 等によるコード生成）

---

### 2. コード品質: 6/10

**根拠**:
- ✅ TypeScript strict モードを有効化している (`tsconfig.json` で `strict: true`)
- ✅ ESLint 設定が整備されており、`@typescript-eslint`, `react-hooks`, `react-native` プラグインを使用
- ✅ コンポーネントは関数コンポーネント + StyleSheet で一貫している
- ✅ `formatCurrency` / `formatDate` のようなユーティリティ関数を切り出している
- ⚠️ `LoginScreen` でバリデーションが `if (!email || !password)` のみ（メールアドレス形式チェックなし）
- ⚠️ `ProfileScreen` でユーザー情報の表示が未実装（ハードコード状態）
- ⚠️ `HomeScreen` が実質スタブ
- ⚠️ エラーメッセージの国際化（i18n）が未対応（日本語ハードコード）

**改善余地**:
- バリデーションライブラリ (zod / yup) の導入
- i18n 対応 (expo-localization + i18next)

---

### 3. テスト: 4/10

**根拠**:
- ✅ Jest + jest-expo + @testing-library/react-native の構成が設定されている
- ✅ `format.ts` のユーティリティに unit test あり
- ✅ `OrderCard`, `LoginScreen` に基本的なコンポーネントテストあり
- ❌ テストカバレッジが低い（主要スクリーン・フックの大半が未テスト）
- ❌ `useOrders`, `useAuth` フックのテストが存在しない
- ❌ API クライアントの interceptor テストが存在しない
- ❌ Zustand ストア (`authStore`) のテストが存在しない
- ❌ E2E テスト（Detox 等）が未整備
- ❌ CI パイプラインでのテスト自動実行設定が未整備

**改善余地**:
- カスタムフックのテスト追加
- ストアのテスト追加
- CI でのカバレッジ測定と閾値設定

---

### 4. セキュリティ: 6/10

**根拠**:
- ✅ トークンを `expo-secure-store` (iOS Keychain / Android Keystore) に保存しており、AsyncStorage 等の平文ストレージを避けている
- ✅ API リクエストに `Authorization: Bearer` ヘッダーを付与する仕組みが実装されている
- ✅ 401 レスポンス時にトークンを削除し、認証無効化する処理がある
- ✅ `secureTextEntry` でパスワードの入力が非表示になっている
- ⚠️ 環境変数 `EXPO_PUBLIC_API_URL` がクライアントバンドルに含まれるため、公開情報として扱う必要がある（ドキュメント・README が不足）
- ⚠️ バックエンドへのリクエストで Certificate Pinning が未実装
- ⚠️ ログイン試行回数制限がクライアント側に存在しない
- ⚠️ `EXPO_PUBLIC_` プレフィックスにより API URL がバンドルに露出する（意図的だが明示的な記載なし）

**改善余地**:
- Certificate Pinning の検討
- セキュリティポリシー文書の整備

---

### 5. パフォーマンス: 5/10

**根拠**:
- ✅ React Query によるキャッシュ戦略が基本設定されている (`staleTime: 5分`)
- ✅ `FlatList` で仮想スクロールを使用している
- ⚠️ `useAuthStore` のセレクターが適切に分割されていない箇所がある（不要な再レンダリングリスク）
- ⚠️ 画像のレイジーロード・キャッシュ戦略が未整備（assets は現状アイコンのみ）
- ⚠️ `React.memo` / `useCallback` / `useMemo` の活用が不足
- ⚠️ バンドルサイズの最適化 (tree-shaking, code-splitting) の明示的な設定が未整備
- ❌ パフォーマンス計測・モニタリングの仕組みがない (Flipper, Sentry Performance 等)

**改善余地**:
- React.memo によるメモ化の適用
- パフォーマンスプロファイリング基盤の整備

---

### 6. 運用性: 4/10

**根拠**:
- ⚠️ `app.json` に基本的な Expo 設定はあるが、OTA 更新 (expo-updates) の設定がない
- ❌ エラートラッキング（Sentry, Bugsnag 等）が未整備
- ❌ クラッシュレポートが未設定
- ❌ アプリバージョン管理・チャネル戦略（production/staging）が未定義
- ❌ ログ出力の仕組みがない（`console.log` もなし）
- ❌ CI/CD パイプライン（EAS Build / EAS Submit）が未設定
- ❌ 環境設定ファイル (`.env.example`) が存在しない

**改善余地**:
- Sentry 等によるエラートラッキングの導入
- EAS Build/Submit による CI/CD 整備
- `.env.example` の整備

---

## 総合ランク判定

| ランク | 基準 |
|------|------|
| **S** | 50–60点 |
| **A** | 42–49点 |
| **B** | 36–41点 |
| **C** | 26–35点 ← **該当** |
| **D** | 0–25点 |

**総合スコア: 32/60 → ランク C**

---

## 改善提案（優先度順）

### 🔴 優先度1: テストカバレッジの拡充（テスト観点: 4点）

現状、カスタムフック・ストア・API クライアントのテストが存在せず、リグレッション検出が困難。

**推奨アクション**:
1. `useOrders`, `useAuth` のフックテストを追加（`@testing-library/react-hooks` または `renderHook` を使用）
2. `authStore` の Zustand ストアテストを追加
3. Jest カバレッジ閾値を設定（`coverageThreshold: { global: { lines: 70 } }` 等）
4. CI（GitHub Actions）でのテスト自動実行と失敗時ブロック設定

---

### 🔴 優先度2: 運用基盤の整備（運用性観点: 4点）

エラートラッキング・CI/CD が未整備で、本番運用上のリスクが高い。

**推奨アクション**:
1. `sentry-expo` の導入と設定（クラッシュレポート・エラートラッキング）
2. EAS Build の設定（`eas.json`）と GitHub Actions への統合
3. `.env.example` の作成と環境変数ドキュメントの整備
4. `expo-updates` の設定（OTA アップデート戦略の確立）

---

### 🟡 優先度3: コード品質・バリデーションの強化（コード品質観点: 6点）

入力バリデーションが最低限であり、ユーザー体験・セキュリティの両面で改善余地がある。

**推奨アクション**:
1. `zod` または `react-hook-form + yup` の導入によるフォームバリデーション強化
2. `HomeScreen` の実装（主要機能の追加）
3. `expo-localization` + `i18next` による i18n 対応の検討

---

## 関連 Issue

- [ ] [改善] customer-mobile - テストカバレッジ拡充 #テスト観点4点
- [ ] [改善] customer-mobile - 運用基盤整備（Sentry / EAS Build） #運用性観点4点
