# [改善] operator-frontend テスト基盤の整備

**優先度**: 高（P1）  
**関連レポート**: `docs/operator-frontend-quality-report-2026-05-25.md`  
**対象スコア**: テスト 0/10

---

## 背景・課題

週次品質レポート（2026-05-25）にて `operator-frontend/` のテストが 0 点（5 点未満）を記録した。
テストが存在しないため、リグレッション検知・品質担保が不可能な状態にある。

## ゴール

以下が実現されれば完了とする：

- [ ] Jest + React Testing Library のセットアップ
- [ ] 主要コンポーネントのユニットテスト作成（カバレッジ 80% 以上を目標）
- [ ] GitHub Actions でのテスト自動実行設定
- [ ] カバレッジレポートの CI 統合

## 制約・考慮事項

- テストファイルは `*.test.ts` / `*.spec.ts` の命名規則に従う（`.github/instructions/testing.instructions.md` 参照）
- モックは最小限にとどめ、統合テストを優先する
- `operator-frontend/` プロジェクト作成（Issue: operator-frontend-improvement-1）が前提
