# [改善] operator-frontend セキュリティ・パフォーマンス・運用性の基盤構築

**優先度**: 中（P2）  
**関連レポート**: `docs/operator-frontend-quality-report-2026-05-25.md`  
**対象スコア**: セキュリティ 0/10、パフォーマンス 0/10、運用性 0/10

---

## 背景・課題

週次品質レポート（2026-05-25）にて セキュリティ・パフォーマンス・運用性の全観点が 0 点（5 点未満）を記録した。
プロジェクトが存在しないことが直接原因だが、作成後に基盤を後付けで組み込むとコストが高くなるため、
プロジェクト立ち上げ時点から組み込む必要がある。

## ゴール

### セキュリティ
- [ ] `npm audit` + Dependabot による依存脆弱性スキャンの設定
- [ ] CSP（Content Security Policy）ヘッダーの設定
- [ ] 認証トークン管理方針の策定（セキュアストレージ、有効期限）
- [ ] XSS 対策の実装確認

### パフォーマンス
- [ ] コード分割（Dynamic Import）の適用
- [ ] 画像最適化設定
- [ ] Core Web Vitals の計測と目標値設定（LCP < 2.5s、FID < 100ms、CLS < 0.1）

### 運用性
- [ ] GitHub Actions CI パイプライン（lint, test, build）の整備
- [ ] エラー監視ツール（Sentry 等）の導入
- [ ] 環境変数管理（`.env.example` の整備）
- [ ] ログ設計の策定

## 制約・考慮事項

- `operator-frontend/` プロジェクト作成（Issue: operator-frontend-improvement-1）が前提
- 既存の `.github/workflows/` に合わせた CI 構成を採用する
- セキュリティ要件は `backend/` の設計と整合性を保つ
