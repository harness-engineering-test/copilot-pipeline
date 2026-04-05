---
name: ci-debug
description: CI/CDの失敗ログを分析し修正方針を提示する。GitHub Actionsの失敗デバッグに使用する。
allowed-tools: shell
---

GitHub Actions の失敗をデバッグする際は以下の手順に従ってください:

1. `list_workflow_runs` ツールで最近のワークフロー実行とステータスを確認する
2. `summarize_job_log_failures` ツールで失敗ジョブのAIサマリーを取得する
3. 詳細が必要なら `get_job_logs` で完全なログを取得する
4. 失敗原因を以下に分類する:
   - Lint エラー → 該当ファイルを修正
   - 型エラー → 型定義を修正
   - テスト失敗 → テストコードまたは実装を修正
   - コード生成の差分 → `make ent` / `make ggen` を再実行
   - 一時的障害 → `gh run rerun` で再実行のみ
5. 修正はPR変更ファイルのスコープ内のみに限定する
