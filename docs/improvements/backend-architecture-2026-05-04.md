# [改善] backend/ 基盤構築

## 概要

`backend/` ディレクトリが存在しないため、Go バックエンドの基盤を構築する。

## 背景

週次品質レポート（2026-05-04）において、`backend/` ディレクトリが存在しないことが判明。
全評価観点でスコア0点（ランクD）となった。

参照: [週次品質レポート 2026-05-04](../scoring/backend-2026-05-04.md)

## 対応内容

- [ ] `backend/go.mod` の作成（Go モジュール初期化）
- [ ] 標準的なGoプロジェクト構造の構築
  - `backend/cmd/` - エントリーポイント
  - `backend/internal/` - 内部パッケージ
  - `backend/utils/` - 共有ユーティリティ（`ptr.go` 含む）
- [ ] `copilot-instructions.md` で定義されたレイヤー構造の雛形作成
  - サービス層 (`internal/service/`)
  - リポジトリ層 (`internal/repository/`)
  - リゾルバ (`internal/resolver/`)
- [ ] `.golangci.yml` の設定

## 受け入れ条件

- `backend/` ディレクトリが存在する
- `go build ./...` が成功する
- `go test ./...` が実行できる（テストがなくてもエラーにならない）
- `copilot-instructions.md` のコーディング規約に準拠した構造になっている

## 優先度

高（他の改善の前提条件）
