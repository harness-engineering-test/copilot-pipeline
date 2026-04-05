---
name: migration-check
description: DBマイグレーションの安全性チェックスキル
---

マイグレーションファイルを作成・変更する際は以下を確認してください:

1. DROP COLUMN は原則禁止。必要な場合はIssueで人間の承認を得る
2. NOT NULL 制約の追加にはデフォルト値を設定する
3. インデックス追加は CONCURRENTLY を使用する（PostgreSQLの場合）
4. テーブル名・カラム名はスネークケース
5. 外部キー制約は明示的に名前を付ける
