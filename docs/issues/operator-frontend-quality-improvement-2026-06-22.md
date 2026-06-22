# [改善] operator-frontend 品質基盤整備（週次品質レポート 2026-06-22 対応）

closes #96

## 背景

週次品質レポート（2026-06-22）で `operator-frontend/` の各観点が5点未満となったため、改善Issueを起票する。

## 対象

`operator-frontend/`

## 対応タスク

- [ ] Reactベースの `operator-frontend/` 初期構成を追加
- [ ] Lint・Test・Build を実行可能な npm scripts を定義
- [ ] CIに `operator-frontend` 向けチェックを追加
- [ ] セキュリティチェック（依存脆弱性、主要入力のサニタイズ方針）を定義

## 完了条件

- `operator-frontend/` の最小機能が開発・検証可能な状態であること
- PRでLint/Test結果を確認できること
- 次回週次スコアリングで全観点5点以上を目標に再評価できること
