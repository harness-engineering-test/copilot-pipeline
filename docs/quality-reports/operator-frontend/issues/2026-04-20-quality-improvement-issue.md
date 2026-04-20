# [改善] operator-frontend 初期実装と品質評価基盤の整備

closes #XX

## 背景

週次品質レポート（2026-04-20）で `operator-frontend/` が未整備であり、複数観点が5点未満となった。

## 対応内容

- `operator-frontend/` の最小アプリ構成を追加
- lint/test/build をCIに追加
- セキュリティ監査と性能計測ジョブを追加

## 完了条件

- [ ] `operator-frontend/` ディレクトリが存在し、ローカル実行手順がREADMEに記載されている
- [ ] CIで `operator-frontend` の lint/test/build が成功する
- [ ] 依存関係監査と性能計測結果を週次で確認できる
