# Copilot カスタム指示

## プロジェクト概要

モノレポ構成。backend/ (Go), customer-mobile/ (React Native/Expo), operator-frontend/ (React)

## コーディング規約

- 共有ユーティリティ優先（backend/utils/ の既存関数を必ず確認）
- ポインタ変換は必ず backend/utils/ptr.go を使う。新規作成禁止
- サービス層から ent パッケージを直接importしない
- 同一レイヤー内のパブリックメソッド呼び出し禁止（service→service、repo→repo）
- インフラストラクチャ層は必ずリポジトリで抽象化する
- 使わないメソッドを定義しない
- 取得系メソッドをWhere句ごとに増やさない。引数を拡張して対応する
- リゾルバの責務: 認証情報取得、サービス呼び出し、型変換（convert/経由）のみ

## ブランチ戦略

- develop ← feature/\* ← 実装PR
- main は本番リリース用

## テスト

- 新規コードには必ず単体テストを書く
- テストファイルは _\_test.go / _.test.ts / \*.spec.ts

## ドキュメント

- 設計ドキュメントは docs/ にバージョン管理
- リポジトリに入ってない業務プロセスを根絶する
