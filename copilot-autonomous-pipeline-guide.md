# GitHub Copilot版 自律開発パイプライン構築手順書

> 参考元: 「ハーネスエンジニアリングを極めたら、IssueからAIエージェントが動き、人間の役割は要件定義だけになった」(2026/04/01 公開)
> 本ドキュメントは上記記事の21体AIエージェントパイプラインを **GitHub Copilot** で再現する手順を記す。

---

## 技術スタック対応表

| 記事の技術                | Copilot版の代替                                 | 備考                                                              |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Claude API                | **Copilot Cloud Agent**                         | Issue assign → PR作成まで全自動。REST/GraphQL APIで起動可能       |
| Claude Code (CLI)         | **GitHub Copilot CLI** (`gh agent-task create`) | ターミナルからタスク投入。`--follow` でリアルタイムログ           |
| Claude システムプロンプト | **Custom Agents** (`.github/agents/*.agent.md`) | YAML frontmatter + Markdownでスキル・ツール・振る舞いを定義       |
| Claude スキルファイル     | **Agent Skills** (`.github/skills/*/SKILL.md`)  | タスクに応じて自動ロード。スクリプト実行も可能                    |
| Bug Bot (Cursor)          | **Copilot Code Review（自動レビュー）**         | Rulesetで全PRに自動適用。push毎の再レビューも可                   |
| MCP サーバー接続          | **Copilot MCP拡張**                             | `.github/copilot-mcp.json` でDB・Figma・Browser等を接続           |
| Lefthook (pre-commit)     | **Copilot Hooks** (`.github/hooks/hooks.json`)  | `preToolUse` / `postToolUse` でエージェント実行中にスクリプト注入 |
| GitHub Actions            | **GitHub Actions**（そのまま）                  | エージェント起動のオーケストレーションはActionsが担う             |
| Terraform                 | **Terraform**（そのまま）                       | プレビュー環境の構築・破棄は同じ                                  |
| Sentry                    | **Sentry**（そのまま）                          | エラー監視は変わらない                                            |

---

## 構造的な違い（Claude版 vs Copilot版）

### Claude版の制御フロー

```
ラベル付与 → GitHub Actions発火 → Claude API直接呼び出し → 結果をgit push
```

Actions内でAPIを叩き、stdoutをパースし、gitコマンドで直接pushする。全てをActions内で完結させている。

### Copilot版の制御フロー

```
ラベル付与 → GitHub Actions発火 → CopilotにIssue assign (REST API) → Copilot Cloud Agentが自律動作 → PR作成
```

Copilot自体がサンドボックス環境を持ち、コード生成・テスト実行・PR作成まで自律的に行う。Actionsはオーケストレーション（トリガーとルーティング）のみ。

### 実務上の影響

| 観点               | Claude版                                       | Copilot版                                                                   |
| ------------------ | ---------------------------------------------- | --------------------------------------------------------------------------- |
| カスタマイズ粒度   | プロンプト・ツール呼び出しを完全制御           | Custom Agent + Skills + Hooks で制御。細かいAPI呼び出しの制御は不可         |
| 実行環境           | Actions runner上のClaude CLI                   | Copilot専用クラウドサンドボックス                                           |
| MCP接続            | `.github/actions/setup-mcp-servers` で自前構築 | `.github/copilot-mcp.json` で宣言的に設定                                   |
| コスト             | Claude API従量課金（トークン単位）             | Copilot Pro+/Enterprise の定額 + premium request 超過分                     |
| 壁打ち             | Issue上でコメント往復が自然に可能              | PR上での `@copilot` メンションが主。Issue上の壁打ちはassign時のワンショット |
| セルフレビュー防止 | `github.actor == "claude[bot]"` で判定         | Copilot Code Reviewは自分のPRも自動レビュー（重複回避は不要）               |

---

## Phase 0: 前提準備（Day 1）

### 0-0. まず Organization を用意する

この手順書はもともと「既に GitHub Organization が存在する」前提で書いていた。最初から構築する場合は、ここが先に必要になる。

#### Organization は必須か？

- **チームで運用するなら実質必須**。Copilot Cloud Agent の利用範囲、リポジトリアクセス、ポリシー、Custom Agents の共有を一元管理しやすい。
- **個人検証だけなら必須ではない**。ただし、記事のようなラベル駆動の自律開発パイプラインを複数リポジトリ・複数メンバーで回すなら Organization 前提で考えた方がよい。

#### 新規 Organization を作る手順

1. GitHub 右上のプロフィール画像をクリックする
2. `Your organizations` または `Organizations` を開く
3. `New organization` をクリックする
4. プランを選ぶ

- 小規模な検証ならまず無料でもよい
- Cloud Agent を組織で本格運用するなら **Copilot Business / Enterprise** の利用を前提にする

5. Organization 名を決めて作成する
6. 対象リポジトリをその Organization 配下に作る、または既存リポジトリを移管する

#### 既存 Organization がある場合

新規作成は不要。そのまま対象 Organization の `Settings` から Copilot 設定に進めばよい。

### 0-1-pre. リポジトリのセットアップ

Organization配下にリポジトリを作成し、ローカルと紐付けておく。

#### 新規リポジトリの場合

1. GitHub の対象 Organization ページから **New repository** をクリックする
2. 名前・公開設定を入力して **Create repository** をクリックする
3. ローカルで以下を実行する

```bash
git init
git remote add origin https://github.com/<org>/<repo>.git
git add .github/
git commit -m "chore: initialize copilot pipeline structure"
git push -u origin main
```

#### 既存リポジトリをOrg配下に移管する場合

1. リポジトリの **Settings** → **Danger Zone** → **Transfer** をクリックする
2. 移管先の Organization 名を入力して確定する
3. ローカルの remote URL を更新する

```bash
git remote set-url origin https://github.com/<org>/<repo>.git
```

> **Note**: `.github/` ディレクトリ（Custom Agents / Skills / workflows）をpushしておかないと Copilot がカスタマイズ内容を認識できない。Phase 0-2 でファイルを作成したら忘れずにpushする。

### 0-1. プラン確認

- **Copilot Pro+** または **Copilot Enterprise** が必要（Custom Agents、Cloud Agent利用のため）
- 対象の Organization で Copilot を管理できる権限（Owner）を持っていることを確認する
- Organization設定 → Copilot で **Copilot cloud agent** を `Enabled` にする
- その後、Organization設定 → Copilot → Cloud agent で対象リポジトリを許可する

### 0-2. リポジトリのディレクトリ構造

以下のファイル/ディレクトリを作成する。

```
.github/
├── copilot-instructions.md          # 全体のカスタム指示（4,000文字以内がCode Review適用範囲）
├── instructions/
│   ├── backend.instructions.md      # パス別の詳細指示
│   ├── mobile.instructions.md
│   └── testing.instructions.md
├── agents/                          # Custom Agents
│   ├── requirements-analyst.agent.md
│   ├── system-designer.agent.md
│   ├── implementer.agent.md
│   ├── task-splitter.agent.md
│   ├── bug-investigator.agent.md
│   └── impact-analyzer.agent.md
├── skills/                          # Agent Skills
│   ├── ci-debug/SKILL.md
│   ├── e2e-test/SKILL.md
│   └── migration-check/SKILL.md
├── hooks/
│   └── hooks.json                   # Copilot Hooks
├── copilot-mcp.json                 # MCP Server設定
├── ISSUE_TEMPLATE/
│   └── feature-request.yml
└── workflows/
    ├── copilot-assign-on-label.yml
    ├── copilot-requirements.yml
    ├── auto-label-on-unblock.yml
    ├── post-merge-cleanup.yml
    ├── copilot-fix-ci.yml
    ├── copilot-fix-review.yml
    ├── check-migration.yml
    ├── preview-deploy.yml
    ├── preview-cleanup.yml
    ├── codebase-scoring.yml
    ├── detect-unused-code.yml
    ├── pipeline-stuck-monitor.yml
    └── sync-develop-to-feature.yml
```

### 0-3. `copilot-instructions.md` の作成

記事の「黄金原則」「アーキテクチャルール」をここに集約する。

```markdown
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
```

---

## Phase 1: 開発プロセスの分解とIssue駆動（Week 1）

> 記事の「2-1. 開発プロセスの分解」「2-2. Issue駆動の自動化」に対応

### 1-1. GitHub Projects のセットアップ

ステータスカラムを以下のように設定する:

```
要求 → 要件定義中 → 設計中 → 実装中 → レビュー待ち → マージ済み
```

### 1-2. Issue テンプレートの作成

`.github/ISSUE_TEMPLATE/feature-request.yml`:

```yaml
name: 機能要求
description: 新機能の要求を起票する
labels: ["要求"]
body:
  - type: textarea
    id: background
    attributes:
      label: 背景・課題
      description: なぜこの機能が必要か
    validations:
      required: true
  - type: textarea
    id: goal
    attributes:
      label: ゴール
      description: 何が実現されれば完了か
    validations:
      required: true
  - type: textarea
    id: constraints
    attributes:
      label: 制約・考慮事項
      description: 技術制約、ビジネス制約
```

### 1-3. ラベル体系の設計

リポジトリに以下のラベルを作成する。

| ラベル                    | 色        | 役割                             |
| ------------------------- | --------- | -------------------------------- |
| `要求`                    | `#0E8A16` | 起点Issue                        |
| `要件定義作成`            | `#1D76DB` | 要件定義エージェント起動トリガー |
| `設計作成`                | `#5319E7` | 設計エージェント起動             |
| `タスク分割`              | `#FBCA04` | タスク分割エージェント起動       |
| `copilot:implement`       | `#B60205` | Copilot Cloud Agentが自動実装    |
| `copilot:bug-investigate` | `#D93F0B` | バグ調査エージェント起動         |
| `実装中`                  | `#F9D0C4` | 進行中ステータス                 |
| `レビュー待ち`            | `#C2E0C6` | 人間レビュー待ち                 |
| `人間の対応が必要`        | `#E4E669` | エスカレーション                 |
| `preview`                 | `#006B75` | プレビュー環境構築               |
| `scoring`                 | `#BFD4F2` | スコアリング                     |
| `cleanup`                 | `#D4C5F9` | 不要コード検知                   |

---

## Phase 2: Custom Agents の構築（Week 1〜2）

> 記事の「2-4. AIエージェント一覧と各役割」に対応

### 2-1. 要件定義エージェント（記事 #1, #2 に対応）

`.github/agents/requirements-analyst.agent.md`:

```markdown
---
name: requirements-analyst
description: 要求Issueから要件を分析し、質問を通じて要件を詰める。要件定義サブIssueを作成する。
tools:
  ["read", "search", "github-mcp/create_issue", "github-mcp/add_issue_comment"]
---

あなたは要件定義の専門家です。

## 責務

1. 要求Issueの本文を分析する
2. 不明点を箇条書きで質問する（Issue上にコメント）
3. 回答を受けて要件を確定する
4. 確定したら [要件定義] サブIssueを作成し、要件を記載する
5. 「要件確定」がIssueのコメントに書かれたら、[詳細設計] サブIssueを自動作成する

## 質問の方針

- コードパターン・慣習・CLAUDE.md記載事項は自動回答する
- ビジネス判断が必要な質問のみ人間にエスカレーションする
- 最大15ラウンドで壁打ちを打ち切る

## 出力フォーマット

### 要件一覧

- [ ] 要件1: ...
- [ ] 要件2: ...

### 質問事項

1. ...
2. ...

## サブIssue作成ルール

- タイトル: `[要件定義] 親Issue名`
- 本文に親Issueへのリンクを含める
- `要件定義中` ラベルを付与
```

### 2-2. 設計エージェント（記事 #3 に対応）

`.github/agents/system-designer.agent.md`:

```markdown
---
name: system-designer
description: 要件定義から基本設計・詳細設計を策定し、PR分割計画を作成する。
tools: ["read", "search", "edit", "github-mcp/create_pull_request"]
---

あなたはシステム設計の専門家です。

## 責務

1. 要件定義Issueを読み取る
2. 基本設計 → 詳細設計の2フェーズで設計書を作成
3. 設計書の末尾に必ず **PR分割計画** を記載する（タスク分割エージェントの入力になるため最重要）
4. 設計PRを作成する

## 設計書に含める項目

- Entスキーマ変更（テーブル定義、リレーション）
- GraphQL定義（Query/Mutation/Type）
- テスト戦略（何をどこまでテストするか）
- PR分割計画（依存関係付き、実装順序明示）

## 壁打ちルール

- 最大15ラウンドで停止
- ビジネス判断はエスカレーション
- AI自動回答でテンポよく進めるのが効率的

## 出力先

- docs/designs/ 配下に設計書マークダウンを作成
- PRタイトル: `[設計] #{Issue番号} 概要`
```

### 2-3. タスク分割エージェント（記事 #4 に対応）

`.github/agents/task-splitter.agent.md`:

```markdown
---
name: task-splitter
description: 設計PRマージ後、設計書のPR分割計画を読み取り実装サブIssue群を作成する。依存関係をblocked_byで設定する。
tools:
  ["read", "search", "github-mcp/create_issue", "github-mcp/add_issue_comment"]
---

あなたはタスク分割の専門家です。

## 責務

1. マージされた設計PRの設計書を読み取る
2. PR分割計画から [実装] サブIssueを作成
3. 各Issueに実装指示を具体的に記載する:
   - 変更対象のファイルパス
   - 追加/変更する関数名
   - テストケースの概要
4. Issue本文に依存関係を明記: `blocked by #XX`
5. 依存関係がないIssueには `copilot:implement` ラベルを即座に付与

## サブIssue作成ルール

- タイトル: `[実装] 概要 (親Issue #XX)`
- 本文の先頭に親Issueリンク
- 依存関係が間違うとタスクが永遠に開始されないので注意

## 注意事項

- PR分割計画が曖昧な場合は設計Issueにコメントして確認を求める
- 1つのIssueが巨大になりすぎないよう、変更ファイル10個以内を目安に分割する
```

### 2-4. 実装エージェント（記事 #5 に対応）

`.github/agents/implementer.agent.md`:

```markdown
---
name: implementer
description: Issue本文の指示に従いブランチ作成→コード実装→テスト→PR作成を全自動実行する。
tools: ["read", "search", "edit", "bash", "github-mcp/create_pull_request"]
mcp-servers:
  db:
    url: ${{ secrets.DB_MCP_URL }}
  browser:
    url: ${{ secrets.BROWSER_MCP_URL }}
---

あなたは実装エンジニアです。

## 実装ルール

- copilot-instructions.md の規約に必ず従う
- 新しいヘルパー関数を作る前に既存ユーティリティを確認する
- サービス層からentを直接importしない
- make ent / make ggen 等のコード生成を必要に応じて実行する
- テストを必ず書く
- 使わないメソッドを定義しない

## PR作成ルール

- PRタイトル: `[実装] #{Issue番号} 概要`
- PR本文にIssueへのリンクを含める: `closes #XX`
- 変更ファイル一覧を記載する
- developブランチに向けてPRを作成する

## タイムアウト

- 60分以内に完了することを目指す
```

### 2-5. バグ調査エージェント（記事 #17 に対応）

`.github/agents/bug-investigator.agent.md`:

```markdown
---
name: bug-investigator
description: バグIssueのコードベースを調査し原因特定。修正は行わず原因分析と修正方針の提示に特化。
tools: ["read", "search", "github-mcp/add_issue_comment"]
mcp-servers:
  browser:
    url: ${{ secrets.BROWSER_MCP_URL }}
---

あなたはバグ調査の専門家です。修正は一切行わず、原因分析に集中してください。

## 調査手順

1. Issueの再現手順を確認する
2. 関連コードを特定する
3. 根本原因を推定する
4. 修正方針を提案する（最大3案）
5. 調査結果をIssueにコメントする

## 2フェーズ構成

- ongoing: 初期調査（コード読解、ログ分析）
- confirmed: 結果まとめ（原因特定、修正方針）

## 完了後

Issueに `copilot:implement` ラベルを付与して実装エージェントに引き継ぐことを推奨する旨をコメントする。

## Browser MCP

画面操作の再現が必要な場合はBrowser MCPで確認する。
```

### 2-6. 影響分析エージェント（記事 #15 に対応）

`.github/agents/impact-analyzer.agent.md`:

```markdown
---
name: impact-analyzer
description: PR変更内容を分析し、影響を受ける機能・テスト項目をPR descriptionに自動追記する。
tools: ["read", "search", "edit"]
---

あなたは影響分析の専門家です。

## 責務

1. PRの変更差分を分析する
2. 影響を受ける機能を特定する
3. 必要なテスト項目を列挙する
4. PR descriptionに分析結果を追記する

## 出力フォーマット

### 影響分析

#### 直接影響

- ...

#### 間接影響

- ...

#### 推奨テスト項目

- [ ] ...
- [ ] ...
```

---

## Phase 3: ラベル駆動の自動化ワークフロー（Week 2〜3）

> 記事の「2-3. ラベル駆動の自律エージェント」の心臓部

### 3-1. ラベルでCopilot Cloud Agentを自動起動

`.github/workflows/copilot-assign-on-label.yml`:

```yaml
name: Label-driven Copilot Assignment

on:
  issues:
    types: [labeled]

jobs:
  assign-implement:
    if: github.event.label.name == 'copilot:implement'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    concurrency:
      group: copilot-assign-${{ github.event.issue.number }}
      cancel-in-progress: false
    steps:
      - name: Assign issue to Copilot Cloud Agent
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues/${{ github.event.issue.number }}/assignees \
            --input - <<< '{
              "assignees": ["copilot-swe-agent[bot]"],
              "agent_assignment": {
                "target_repo": "${{ github.repository }}",
                "base_branch": "develop",
                "custom_instructions": "Follow the implementation instructions in the issue body. Reference copilot-instructions.md for coding standards.",
                "custom_agent": "implementer"
              }
            }'

      - name: Update labels
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue edit ${{ github.event.issue.number }} \
            --remove-label "copilot:implement" \
            --add-label "実装中" \
            --repo ${{ github.repository }}

  assign-requirements:
    if: github.event.label.name == '要件定義作成'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Assign to Requirements Agent
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues/${{ github.event.issue.number }}/assignees \
            --input - <<< '{
              "assignees": ["copilot-swe-agent[bot]"],
              "agent_assignment": {
                "target_repo": "${{ github.repository }}",
                "base_branch": "develop",
                "custom_agent": "requirements-analyst"
              }
            }'

  assign-design:
    if: github.event.label.name == '設計作成'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Assign to Design Agent
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues/${{ github.event.issue.number }}/assignees \
            --input - <<< '{
              "assignees": ["copilot-swe-agent[bot]"],
              "agent_assignment": {
                "target_repo": "${{ github.repository }}",
                "base_branch": "develop",
                "custom_agent": "system-designer"
              }
            }'

  assign-task-split:
    if: github.event.label.name == 'タスク分割'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Assign to Task Splitter Agent
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues/${{ github.event.issue.number }}/assignees \
            --input - <<< '{
              "assignees": ["copilot-swe-agent[bot]"],
              "agent_assignment": {
                "target_repo": "${{ github.repository }}",
                "base_branch": "develop",
                "custom_agent": "task-splitter"
              }
            }'

  assign-bug-investigation:
    if: github.event.label.name == 'copilot:bug-investigate'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Assign to Bug Investigator
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues/${{ github.event.issue.number }}/assignees \
            --input - <<< '{
              "assignees": ["copilot-swe-agent[bot]"],
              "agent_assignment": {
                "target_repo": "${{ github.repository }}",
                "base_branch": "develop",
                "custom_agent": "bug-investigator"
              }
            }'
```

### 3-2. バトンリレー（ブロッカー解消 → 後続Issue自動起動）

> 記事の #6 `auto-label-on-unblock.yml` に対応

`.github/workflows/auto-label-on-unblock.yml`:

```yaml
name: Auto-label on Unblock

on:
  issues:
    types: [closed]

jobs:
  unblock-dependents:
    runs-on: ubuntu-latest
    steps:
      - name: Find and unblock dependent issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO: ${{ github.repository }}
          CLOSED_ISSUE: ${{ github.event.issue.number }}
        run: |
          # このIssueをblockerとしている他のIssueを検索
          OPEN_ISSUES=$(gh issue list --repo "$REPO" --state open \
            --json number,body --jq '.[].number' --limit 200)

          for ISSUE_NUM in $OPEN_ISSUES; do
            BODY=$(gh issue view "$ISSUE_NUM" --repo "$REPO" --json body -q '.body')

            # このIssueがblockerとして記載されているか
            if echo "$BODY" | grep -qi "blocked by #$CLOSED_ISSUE"; then
              # 他にオープンなblockerがないか確認
              ALL_BLOCKERS=$(echo "$BODY" | grep -oP 'blocked by #\K\d+' || true)
              REMAINING=0

              for BLOCKER_NUM in $ALL_BLOCKERS; do
                if [ "$BLOCKER_NUM" != "$CLOSED_ISSUE" ]; then
                  STATE=$(gh issue view "$BLOCKER_NUM" --repo "$REPO" \
                    --json state -q '.state' 2>/dev/null || echo "OPEN")
                  if [ "$STATE" = "OPEN" ]; then
                    REMAINING=$((REMAINING + 1))
                  fi
                fi
              done

              if [ "$REMAINING" -eq 0 ]; then
                echo "All blockers resolved for #$ISSUE_NUM — adding copilot:implement label"
                gh issue edit "$ISSUE_NUM" --add-label "copilot:implement" --repo "$REPO"
              else
                echo "#$ISSUE_NUM still has $REMAINING open blockers"
              fi
            fi
          done
```

### 3-3. Feature PR自動作成（記事 #7 に対応）

全 [実装] サブIssueが完了した時点で、feature → develop のPRを自動作成する。

`.github/workflows/create-feature-pr.yml`:

```yaml
name: Create Feature PR

on:
  issues:
    types: [closed]

jobs:
  check-all-subtasks:
    runs-on: ubuntu-latest
    steps:
      - name: Check if all subtasks are closed
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO: ${{ github.repository }}
        run: |
          ISSUE_BODY=$(gh issue view ${{ github.event.issue.number }} \
            --repo "$REPO" --json body -q '.body')

          # 親Issueを特定
          PARENT_NUM=$(echo "$ISSUE_BODY" | grep -oP '親Issue #\K\d+' | head -1)
          [ -z "$PARENT_NUM" ] && exit 0

          # 同じ親を持つ全サブIssueを確認
          ALL_ISSUES=$(gh issue list --repo "$REPO" --state all \
            --json number,body,state --limit 500)

          TOTAL=0
          CLOSED=0
          echo "$ALL_ISSUES" | jq -r '.[] | "\(.number) \(.state) \(.body)"' | while read -r line; do
            NUM=$(echo "$line" | awk '{print $1}')
            STATE=$(echo "$line" | awk '{print $2}')
            if echo "$line" | grep -q "親Issue #$PARENT_NUM"; then
              TOTAL=$((TOTAL + 1))
              if [ "$STATE" = "CLOSED" ]; then
                CLOSED=$((CLOSED + 1))
              fi
            fi
          done

          if [ "$TOTAL" -gt 0 ] && [ "$TOTAL" -eq "$CLOSED" ]; then
            echo "All $TOTAL subtasks closed. Creating feature PR."
            # feature PRを作成
            gh pr create \
              --repo "$REPO" \
              --base develop \
              --head "feature/$PARENT_NUM" \
              --title "[Feature] #$PARENT_NUM 全実装完了" \
              --body "親Issue: #$PARENT_NUM\n\n全サブタスクがマージ済みです。レビューをお願いします。" \
              --label "レビュー待ち" || true
          fi
```

### 3-4. PRマージ後のIssueクローズ

`.github/workflows/post-merge-cleanup.yml`:

```yaml
name: Post-merge Cleanup

on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Close linked issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_BODY="${{ github.event.pull_request.body }}"
          # PRに紐づくIssue番号を抽出（closes, fixes, resolves）
          ISSUE_NUMS=$(echo "$PR_BODY" | grep -oiP '(?:closes|fixes|resolves) #\K\d+' || true)

          for NUM in $ISSUE_NUMS; do
            gh issue close "$NUM" --repo "${{ github.repository }}" || true
          done
```

---

## Phase 4: 自動レビューとCI/CD（Week 2〜3）

> 記事の「2-5. CI/CDの拡充」と #10, #11, #12, #13 に対応

### 4-1. Copilot Code Review の自動化設定

**GUI操作が必要（Rulesetで設定）:**

1. Repository → **Settings** → **Rules** → **Rulesets** → **New branch ruleset**
2. 名前: `auto-copilot-review`
3. Enforcement: **Active**
4. Target branches: **Include all branches**
5. Branch rules: **Automatically request Copilot code review** を有効化
   - ☑ **Review new pushes** （push毎に再レビュー）
   - ☑ **Review draft pull requests**
6. **Create** をクリック

これで記事の `claude-auto-review.yml` 相当がコード不要で動く。

### 4-2. レビュー指摘の自動修正（記事 #11 に対応）

`.github/workflows/copilot-fix-review.yml`:

```yaml
name: Auto-fix Review Comments

on:
  pull_request_review:
    types: [submitted]

jobs:
  fix-review:
    # Copilot自身のレビューでcritical/highがある場合に自動修正を依頼
    if: >-
      github.event.review.user.login == 'copilot[bot]' &&
      github.event.review.state == 'commented'
    runs-on: ubuntu-latest
    steps:
      - name: Check for critical issues and request fix
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          COMMENTS=$(gh api \
            repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/reviews/${{ github.event.review.id }}/comments \
            --jq '.[].body')

          if echo "$COMMENTS" | grep -qi "critical\|high\|security\|bug"; then
            gh pr comment ${{ github.event.pull_request.number }} \
              --repo ${{ github.repository }} \
              --body "@copilot Please fix the critical and high severity issues identified in the code review. Only modify files that are part of this PR."
          fi
```

### 4-3. CI失敗の自動修正（記事 #13 に対応）

`.github/workflows/copilot-fix-ci.yml`:

```yaml
name: Fix CI Failures

on:
  check_suite:
    types: [completed]

jobs:
  fix-ci:
    if: >-
      github.event.check_suite.conclusion == 'failure' &&
      github.event.check_suite.head_branch != 'main' &&
      github.event.check_suite.head_branch != 'develop'
    runs-on: ubuntu-latest
    steps:
      - name: Get PR for this branch
        id: get-pr
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          BRANCH="${{ github.event.check_suite.head_branch }}"
          PR_NUM=$(gh pr list --repo ${{ github.repository }} \
            --head "$BRANCH" --json number -q '.[0].number')
          echo "pr_number=$PR_NUM" >> $GITHUB_OUTPUT

      - name: Ask Copilot to fix CI
        if: steps.get-pr.outputs.pr_number != ''
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # 修正リトライ回数を確認（最大3回）
          EXISTING=$(gh pr view ${{ steps.get-pr.outputs.pr_number }} \
            --repo ${{ github.repository }} \
            --json comments --jq '[.comments[] | select(.body | contains("CI is failing"))] | length')

          if [ "$EXISTING" -lt 3 ]; then
            gh pr comment ${{ steps.get-pr.outputs.pr_number }} \
              --repo ${{ github.repository }} \
              --body "@copilot CI is failing. Please analyze the failure logs and fix the issues. Focus on: lint errors first, then type errors, then test failures. If it's a transient failure, just re-run the workflow."
          else
            # 3回失敗 → 人間にエスカレーション
            gh pr edit ${{ steps.get-pr.outputs.pr_number }} \
              --repo ${{ github.repository }} \
              --add-label "人間の対応が必要"
          fi
```

### 4-4. DBスキーマ破壊的変更チェック（記事 2-5）

`.github/workflows/check-migration.yml`:

```yaml
name: Check Migration

on:
  pull_request:
    paths:
      - "backend/ent/migrate/migrations/**"

jobs:
  check-drop-column:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for DROP COLUMN in new migrations
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          BASE_SHA="${{ github.event.pull_request.base.sha }}"
          HEAD_SHA="${{ github.event.pull_request.head.sha }}"
          FILES=$(git diff --name-only --diff-filter=A \
            "$BASE_SHA" "$HEAD_SHA" -- "backend/ent/migrate/migrations/*.sql")

          WARNING=0
          DETAILS=""
          while IFS= read -r file; do
            [ -z "$file" ] && continue
            if grep -qi "DROP COLUMN" "$file"; then
              WARNING=$((WARNING + 1))
              DETAILS="$DETAILS\n- \`$file\`"
            fi
          done <<< "$FILES"

          if [ "$WARNING" -gt 0 ]; then
            gh pr comment ${{ github.event.pull_request.number }} \
              --repo ${{ github.repository }} \
              --body "⚠️ **破壊的変更検出**: $WARNING 件の DROP COLUMN がマイグレーションに含まれています。$DETAILS\n\n既存データとの互換性を確認してください。"
          fi
```

### 4-5. Auto-merge 設定（記事 #14 に対応）

GitHub の GUI で設定:

1. Repository → **Settings** → **General** → **Pull Requests**
2. ☑ **Allow auto-merge** を有効化
3. **Branch protection rules** で `develop` ブランチに以下を設定:
   - ☑ Require a pull request before merging
   - ☑ Require status checks to pass before merging
   - ☑ Require review from Code Owners (または最低1人)

Copilot が作成した PR は、全 CI 通過 + レビュー承認後に auto-merge される。

---

## Phase 5: Copilot Hooks の設定（Week 2〜3）

> 記事の Lefthook に対応

`.github/hooks/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "echo \"Copilot session started: $(date)\" >> /tmp/copilot-session.log",
        "timeoutSec": 5
      }
    ],
    "postToolUse": [
      {
        "type": "command",
        "bash": "./scripts/post-tool-lint.sh",
        "cwd": ".",
        "timeoutSec": 30,
        "description": "Run linter after file edits"
      }
    ],
    "sessionEnd": [
      {
        "type": "command",
        "bash": "echo \"Copilot session ended: $(date)\" >> /tmp/copilot-session.log",
        "timeoutSec": 5
      }
    ]
  }
}
```

---

## Phase 6: Agent Skills の設定（Week 3）

### 6-1. CI デバッグスキル

`.github/skills/ci-debug/SKILL.md`:

```markdown
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
```

### 6-2. マイグレーションチェックスキル

`.github/skills/migration-check/SKILL.md`:

```markdown
---
name: migration-check
description: DBマイグレーションファイルの安全性をチェックする。マイグレーション作成時に使用する。
---

マイグレーションファイルを作成・変更する際は以下を確認してください:

1. DROP COLUMN は原則禁止。必要な場合はIssueで人間の承認を得る
2. NOT NULL 制約の追加にはデフォルト値を設定する
3. インデックス追加は CONCURRENTLY を使用する（PostgreSQLの場合）
4. テーブル名・カラム名はスネークケース
5. 外部キー制約は明示的に名前を付ける
```

---

## Phase 7: プレビュー環境（Week 3）

> 記事の「2-6. プレビュー環境」そのまま

### 7-1. プレビューデプロイ

`.github/workflows/preview-deploy.yml`:

```yaml
name: Preview Deploy

on:
  pull_request:
    types: [labeled, synchronize]

jobs:
  deploy:
    if: contains(github.event.pull_request.labels.*.name, 'preview')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - name: Deploy preview environment
        run: |
          cd terraform/preview
          terraform init \
            -backend-config="key=preview/pr-${{ github.event.pull_request.number }}/terraform.tfstate"
          terraform apply -auto-approve \
            -var="pr_number=${{ github.event.pull_request.number }}"

      - name: Comment PR with preview URL
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_NUM=${{ github.event.pull_request.number }}
          gh pr comment "$PR_NUM" --repo ${{ github.repository }} \
            --body "🚀 **プレビュー環境が起動しました**
          - オペレーター画面: https://pr-${PR_NUM}.operator.example.com
          - API: https://pr-${PR_NUM}.api.example.com"
```

### 7-2. プレビュークリーンアップ

`.github/workflows/preview-cleanup.yml`:

```yaml
name: Preview Cleanup

on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    if: contains(github.event.pull_request.labels.*.name, 'preview')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - name: Destroy preview environment
        run: |
          cd terraform/preview
          terraform init \
            -backend-config="key=preview/pr-${{ github.event.pull_request.number }}/terraform.tfstate"
          terraform destroy -auto-approve \
            -var="pr_number=${{ github.event.pull_request.number }}"
```

---

## Phase 8: 定期スコアリング＆自動リファクタ（Week 4）

> 記事の「2-7. 定期スコアリング＆自動リファクタ」に対応

### 8-1. 週次品質スコアリング

`.github/workflows/codebase-scoring.yml`:

```yaml
name: Codebase Scoring

on:
  schedule:
    - cron: "0 3 * * 1" # 毎週月曜 03:00 UTC
  workflow_dispatch:

jobs:
  score:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [backend, customer-mobile, operator-frontend]
    steps:
      - uses: actions/checkout@v4

      - name: Create scoring issue for Copilot
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues \
            --input - <<< "{
              \"title\": \"[スコアリング] ${{ matrix.project }} - 週次品質レポート $(date +%Y-%m-%d)\",
              \"body\": \"## 対象\n\\\`${{ matrix.project }}/\\\` ディレクトリ\n\n## 評価観点（各10点満点）\n1. アーキテクチャ\n2. コード品質\n3. テスト\n4. セキュリティ\n5. パフォーマンス\n6. 運用性\n\n## 指示\n- 各観点でスコアを算出し、根拠を示してください\n- 総合ランク（S/A/B/C/D）を判定してください\n- 改善提案を優先度順に3つまで挙げてください\n- スコアが5点未満の観点があれば、改善Issueを別途起票してください\",
              \"labels\": [\"scoring\"],
              \"assignees\": [\"copilot-swe-agent[bot]\"],
              \"agent_assignment\": {
                \"target_repo\": \"${{ github.repository }}\",
                \"base_branch\": \"develop\",
                \"custom_agent\": \"implementer\"
              }
            }"
```

### 8-2. 不要コード検知（記事 #21 に対応）

`.github/workflows/detect-unused-code.yml`:

```yaml
name: Detect Unused Code

on:
  schedule:
    - cron: "0 4 * * 1" # 毎週月曜 04:00 UTC
  workflow_dispatch:

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - name: Create detection issue
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            /repos/${{ github.repository }}/issues \
            --input - <<< "{
              \"title\": \"[不要コード検知] customer-mobile 週次チェック $(date +%Y-%m-%d)\",
              \"body\": \"## 指示\ncustomer-mobile/ 配下で以下を検出してください:\n- 未使用のexport\n- 未参照のコンポーネント\n- dead code（到達不能コード）\n- 未使用のimport\n\n検出結果をこのIssueにコメントし、削除PRを作成してください。\",
              \"labels\": [\"cleanup\"],
              \"assignees\": [\"copilot-swe-agent[bot]\"],
              \"agent_assignment\": {
                \"target_repo\": \"${{ github.repository }}\",
                \"base_branch\": \"develop\",
                \"custom_agent\": \"implementer\"
              }
            }"
```

---

## Phase 9: パイプライン監視（Week 4）

> 記事の #18 `pipeline-stuck-monitor.yml` に対応

### 9-1. 停滞検知＆自動復旧

`.github/workflows/pipeline-stuck-monitor.yml`:

```yaml
name: Pipeline Stuck Monitor

on:
  schedule:
    - cron: "*/30 * * * *" # 30分間隔
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check for stuck issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO: ${{ github.repository }}
        run: |
          echo "Checking for stuck issues..."

          # 「実装中」ラベルが付いて2時間以上更新がないIssueを検出
          STUCK=$(gh issue list --repo "$REPO" --label "実装中" \
            --json number,updatedAt \
            --jq '[.[] | select((now - (.updatedAt | fromdateiso8601)) > 7200)] | .[].number')

          for ISSUE in $STUCK; do
            echo "Issue #$ISSUE appears stuck (no update for 2+ hours)"

            # リトライ回数を確認（最大2回）
            RETRY_COUNT=$(gh issue view "$ISSUE" --repo "$REPO" --json comments \
              --jq '[.comments[] | select(.body | contains("auto-retry"))] | length')

            if [ "$RETRY_COUNT" -lt 2 ]; then
              echo "Auto-retrying #$ISSUE (attempt $((RETRY_COUNT + 1)))"
              gh issue comment "$ISSUE" --repo "$REPO" \
                --body "🔄 auto-retry: パイプライン停滞を検知しました。Copilotを再assignします。"
              gh issue edit "$ISSUE" --repo "$REPO" \
                --remove-label "実装中" \
                --add-label "copilot:implement"
            else
              echo "Max retries reached for #$ISSUE, escalating to human"
              gh issue edit "$ISSUE" --repo "$REPO" \
                --remove-label "実装中" \
                --add-label "人間の対応が必要"
              gh issue comment "$ISSUE" --repo "$REPO" \
                --body "⚠️ 自動復旧の上限（2回）に達しました。人間の対応が必要です。"
            fi
          done
```

### 9-2. develop → feature ブランチ同期（記事 #19 に対応）

`.github/workflows/sync-develop-to-feature.yml`:

```yaml
name: Sync develop to feature branches

on:
  push:
    branches: [develop]
    paths:
      - ".github/workflows/**"
      - ".github/copilot-instructions.md"
      - ".github/agents/**"

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Sync to open PRs
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          OPEN_PRS=$(gh pr list --repo ${{ github.repository }} \
            --base develop --state open --json headRefName -q '.[].headRefName')

          for BRANCH in $OPEN_PRS; do
            echo "Syncing develop into $BRANCH"
            git checkout "$BRANCH" 2>/dev/null || continue
            git merge develop --no-edit || {
              echo "Conflict in $BRANCH — skipping"
              git merge --abort
              # コンフリクトがある場合はCopilotに解消を依頼
              PR_NUM=$(gh pr list --head "$BRANCH" --json number -q '.[0].number')
              if [ -n "$PR_NUM" ]; then
                gh pr comment "$PR_NUM" --repo ${{ github.repository }} \
                  --body "@copilot There is a merge conflict with develop. Please resolve the conflicts, keeping changes from both branches where appropriate."
              fi
            }
            git push origin "$BRANCH" || true
          done
```

---

## 21エージェント完全対応表

| #   | 記事のエージェント                | Copilot版の実現方法                                 | 難易度 |
| --- | --------------------------------- | --------------------------------------------------- | ------ |
| 1   | `claude-requirements.yml`         | Custom Agent `requirements-analyst` + ラベル起動WF  | ★★☆    |
| 2   | `claude-auto-answer.yml`          | Agent内プロンプトで壁打ち自動回答を指示             | ★☆☆    |
| 3   | `claude-detailed-design.yml`      | Custom Agent `system-designer`                      | ★★☆    |
| 4   | `claude-task-split.yml`           | Custom Agent `task-splitter`                        | ★★☆    |
| 5   | `claude-implement-from-issue.yml` | **Copilot Cloud Agent ネイティブ**（Issue assign）  | ★☆☆    |
| 6   | `auto-label-on-unblock.yml`       | GitHub Actions WF `auto-label-on-unblock.yml`       | ★★☆    |
| 7   | `create-feature-pr.yml`           | GitHub Actions WF `create-feature-pr.yml`           | ★★☆    |
| 8   | `claude-full-auto-pipeline.yml`   | Code Review + CI fix WF + auto-merge の組合せ       | ★★★    |
| 9   | `claude-auto-review-pipeline.yml` | 同上（Bugbotフェーズ省略版）                        | ★★★    |
| 10  | `claude-auto-review.yml`          | **Copilot Code Review（Ruleset自動化）** コード不要 | ★☆☆    |
| 11  | `claude-auto-review-fix.yml`      | `@copilot` メンションで修正依頼 WF                  | ★★☆    |
| 12  | `claude-bugbot.yml`               | Copilot Code Review が代替。cursor[bot] 不要        | ★☆☆    |
| 13  | `claude-fix-ci.yml`               | `@copilot` にCI失敗修正を依頼する WF                | ★★☆    |
| 14  | `claude-auto-merge.yml`           | GitHub **auto-merge** + branch protection rules     | ★☆☆    |
| 15  | `claude-impact-analysis.yml`      | Custom Agent `impact-analyzer`                      | ★★☆    |
| 16  | `claude-fix-conflict.yml`         | `@copilot` にコンフリクト解消を依頼                 | ★☆☆    |
| 17  | `claude-bug-investigation.yml`    | Custom Agent `bug-investigator`                     | ★★☆    |
| 18  | `pipeline-stuck-monitor.yml`      | GitHub Actions cron WF                              | ★★☆    |
| 19  | `sync-develop-to-feature.yml`     | GitHub Actions WF（develop push時に全PR sync）      | ★★☆    |
| 20  | `update-workflow-readme.yml`      | `@copilot` にドキュメント更新を依頼する WF          | ★☆☆    |
| 21  | `detect-unused-code.yml`          | 週次 cron + Copilot assign                          | ★☆☆    |

---

## 推奨導入スケジュール

| 週             | やること                                                                  | 対応Phase        |
| -------------- | ------------------------------------------------------------------------- | ---------------- |
| **Week 1**     | `copilot-instructions.md` + Issue Template + ラベル体系 + GitHub Projects | Phase 0, 1       |
| **Week 1後半** | Custom Agent 3体（implementer, requirements-analyst, bug-investigator）   | Phase 2          |
| **Week 2**     | ラベル駆動WF + Copilot Code Review自動化                                  | Phase 3, 4       |
| **Week 2後半** | CI失敗自動修正 + バトンリレー + auto-merge                                | Phase 3, 4       |
| **Week 3**     | プレビュー環境 + 残りAgent（designer, task-splitter） + Hooks + Skills    | Phase 2, 5, 6, 7 |
| **Week 4**     | スコアリング + 不要コード検知 + パイプライン監視                          | Phase 8, 9       |
| **Week 4後半** | develop整備 + GUI設定 + スモークテスト                                    | Phase 10         |

---

## Phase 10: 運用開始前チェック＆スモークテスト（Week 4後半）

Phase 9 まででパイプライン本体はほぼ完成するが、実運用の前に最低限の有効化作業と動作確認を行う。

### 10-1. develop ブランチを作成する

以下の workflow は `develop` を前提に動く:

- `copilot-assign-on-label.yml` の `base_branch: develop`
- `create-feature-pr.yml` の `--base develop`
- `sync-develop-to-feature.yml` の `on.push.branches: [develop]`
- `codebase-scoring.yml` / `detect-unused-code.yml` の `base_branch: develop`

初回のみ以下を実行する:

```bash
git checkout main
git pull origin main
git branch develop
git push origin develop
```

### 10-2. GUI で有効化する設定

コードだけでは完了しない設定がある。以下は GitHub UI で有効化する:

1. **Copilot Code Review Ruleset**

- Settings → Rules → Rulesets
- `main` / `develop` を対象にする
- **Automatically request Copilot code review** を有効化する

2. **Auto-merge**

- Settings → General → Pull Requests
- **Allow auto-merge** を有効化する

加えて、Issue assign を workflow から実行する場合は **Repository secret** を 1 つ追加する:

- Secret 名: `COPILOT_ASSIGN_TOKEN`
- 値: `repo` 権限を持つ Personal Access Token

`GITHUB_TOKEN` では `agent_assignment` 付き assign API が 403 になる場合があるため、Copilot assign 系 workflow ではこの secret を優先して使う。

### 10-3. 最小スモークテスト

最初の確認は、Issue を 1 件作って `copilot:implement` ラベルを付けるだけでよい。

期待する結果:

1. `copilot-assign-on-label.yml` が起動する
2. Issue の assignee が `copilot-swe-agent[bot]` になる
3. `copilot:implement` が外れ、`実装中` ラベルに置き換わる

例:

```md
タイトル: [TEST] Phase 10 smoke test

## 背景

パイプラインの最小動作確認を行う

## やること

README に smoke test 用の 1 行を追加する

## 完了条件

- Label-driven Copilot Assignment workflow が起動する
- Copilot が Issue に assign される
```

### 10-4. PR 側のスモークテスト

Issue 起点の assign が成功したら、次は PR 側の設定が有効かを確認する。

作業ツリーに未コミット差分がある場合は、隔離した branch / worktree で試す。

最小テスト手順:

```bash
git checkout main
git pull origin main
git switch -c phase10-pr-smoke
echo "\nSmoke test line" >> README.md
git add README.md
git commit -m "test: phase 10 pr smoke"
git push -u origin phase10-pr-smoke
gh pr create \
  --base main \
  --head phase10-pr-smoke \
  --title "[TEST] Phase 10 PR smoke test" \
  --body "Copilot review と auto-merge の動作確認用 PR"
```

期待する結果:

1. PR 作成後に Copilot review が自動で request される
2. `Review new pushes` を有効化していれば、追加 push で再レビューされる
3. PR 画面で `Enable auto-merge` が選択可能になる

### 10-5. 一気に試す E2E テスト

入口から出口までをまとめて確認したい場合は、Issue 作成から PR 確認までを 1 本で通して試す。

手順:

1. テスト Issue を 1 件作成する
2. `copilot:implement` ラベルを付ける
3. `copilot-assign-on-label.yml` が起動することを確認する
4. Issue の assignee に Copilot が追加され、ラベルが `実装中` に変わることを確認する
5. Copilot が変更を作成し、branch / commit / PR を作るのを待つ
6. 作成された PR に Copilot review が自動 request されることを確認する
7. PR 画面で `Enable auto-merge` が選択可能なことを確認する

最小の Issue 例:

```md
タイトル: [TEST] Phase 10 end-to-end smoke test

## 背景

Copilot パイプラインの end-to-end 動作確認を行う

## やること

README に 1 行だけ追記する

## 完了条件

- Copilot が Issue に assign される
- Copilot が PR を作成する
- Copilot review が自動 request される
- auto-merge が有効化できる
```

### 10-6. 一気に試す場合の確認事項

Issue 作成から PR までをまとめて試す場合は、以下を順番に確認する。

1. Issue に `copilot:implement` ラベルが付いているか
2. `Label-driven Copilot Assignment` workflow が success になっているか
3. Issue の assignee に Copilot が入っているか
4. Issue のラベルが `実装中` に変わっているか
5. Copilot が branch または PR を作成したか
6. PR に Copilot review が自動で request されたか
7. PR で `Enable auto-merge` が表示されるか
8. `Review new pushes` を有効化した場合、追加 push で再レビューされるか

### 10-7. できていると判断する条件

Phase 10 は、以下を満たしたら完了とみなしてよい。

- テスト Issue で Copilot assign が 1 回成功する
- テスト PR で Copilot review が自動 request される
- テスト PR で auto-merge を有効化できる
- `develop` ブランチ、Ruleset、Repository secret が揃っている

### 10-8. ここで失敗したら確認すること

1. `develop` ブランチが存在するか
2. `GITHUB_TOKEN` に必要権限があるか
3. ラベル名が workflow の条件と完全一致しているか
4. Copilot Cloud Agent が利用可能なプランか
5. `COPILOT_ASSIGN_TOKEN` secret が設定されているか
6. Ruleset が `Active` で、対象 branch に `main` / `develop` が入っているか
7. `Automatically request Copilot code review` が ON になっているか
8. Repository の `Allow auto-merge` が ON になっているか

#### 単独検証時の注意

- **1人しか write 権限ユーザーがいないリポジトリでは、`Required approvals: 1` を auto-merge 確認用に入れない方がよい**
- Copilot coding agent が作成した PR では、**変更に関与したユーザー本人の Approve は承認条件を満たさない** 場合がある
- 単独検証で auto-merge を確認したい場合は以下のどちらかにする:
  1. **別の write 権限ユーザー**に Approve してもらう
  2. `Required approvals` は追加せず、PR の Conversation に **enabled auto-merge** と **This pull request will merge automatically when all requirements are met** が出ることを確認して完了扱いにする

### 10-9. Phase 10 完了条件

- `develop` ブランチが存在する
- Ruleset と auto-merge が有効
- テスト Issue で assign workflow が 1 回成功
- テスト PR で Copilot review と auto-merge の動作が確認できる
- 失敗時の確認ポイントがチームで共有されている

---

## 注意: Copilot版の制約

1. **壁打ちの深さ**: 記事の要件定義エージェントはIssue上で何往復もする。Copilot Cloud Agent はassign時にワンショットで動く。要件定義フェーズは人間が手動で詰めるか、PRコメントで `@copilot` を繰り返す必要がある。
2. **エージェント間の直接連携**: Copilot にはエージェント同士が直接通信する仕組みはない。ラベル付与 → Actions発火 → 次のエージェントassign、というActionsベースのオーケストレーションで代替する。
3. **実行時間**: Copilot Cloud Agent のセッションには時間制限がある。巨大な変更は分割が必須。
4. **コスト**: Copilot Pro+ の premium request 枠を超えると追加課金。大量のエージェント並列実行時は枠の管理が必要。

---

## トラブルシューティング & 実際にハマったこと

Phase 10 のスモークテストを通す過程で実際に遭遇した問題と解決策をまとめる。

### 1. Custom Agent の `mcp-servers` 定義でエージェントが起動しない

**症状**: Copilot Cloud Agent に Issue を assign しても、エージェントが何も行動しない（PR もコメントも作成されない）。

**原因**: `implementer.agent.md` と `bug-investigator.agent.md` の YAML frontmatter に `mcp-servers:` セクションを記述していたが、Copilot Cloud Agent が対応していない形式だった。エージェントがファイルを読み込む段階でエラーになり、処理が開始されなかった。

```yaml
# NG — この形式は Cloud Agent で無効
mcp-servers:
  db:
    url: ${{ secrets.DB_MCP_URL }}
  browser:
    url: ${{ secrets.BROWSER_MCP_URL }}
```

**解決**: `mcp-servers:` セクションを agent ファイルから削除した。MCP 接続が必要な場合は `.github/copilot-mcp.json` で別途設定する。

---

### 2. `GITHUB_TOKEN` では `agent_assignment` 付き assign API が 403 になる

**症状**: `copilot-assign-on-label.yml` の assign ステップが `403 Forbidden` で失敗する。

**原因**: `GITHUB_TOKEN` のデフォルト権限では、`agent_assignment` ペイロードを含む assign API リクエストが拒否される場合がある。

**解決**: Repository secret に `COPILOT_ASSIGN_TOKEN`（`repo` 権限を持つ Personal Access Token）を追加し、assign 系 workflow ではこの secret を使用する。

```yaml
env:
  GH_TOKEN: ${{ secrets.COPILOT_ASSIGN_TOKEN }}
```

---

### 3. Preview Deploy workflow が preview ラベルのない PR でも run を生成する

**症状**: preview ラベルを付けていない PR でも、`Preview Deploy` workflow の run が作成され、「Approve workflows to run」の承認 UI が表示される。

**原因**: workflow の `on` トリガーに `synchronize` を含めていたため、PR への push があるたびに run が作成される。job レベルの `if: contains(... 'preview')` で実際のデプロイはスキップされるが、**workflow run 自体は作られる**。外部コントリビューター（bot 含む）からの PR では、run 作成時に承認が必要になる。

```yaml
# この設定だと synchronize のたびに run が作られる
on:
  pull_request:
    types: [labeled, synchronize]
```

**解決案**（未実施）:

- `synchronize` を除外して `labeled` のみにする（preview ラベル付与時だけ起動）
- または workflow レベルで早期に条件判定する仕組みを入れる

---

### 4. Required approvals: 1 を設定すると単独検証で auto-merge できない

**症状**: auto-merge を有効化しても、承認条件を満たせず PR がマージされない。

**原因**: 1人しか write 権限ユーザーがいないリポジトリで `Required approvals: 1` を設定すると、**自分自身の Approve では承認条件を満たさない**。Copilot coding agent が作成した PR でも、リポジトリオーナーが操作に関与しているとみなされ、セルフ承認と扱われる場合がある。

**解決**: 単独検証時は `Required approvals` を設定しない。auto-merge が有効化できること＋「This pull request will merge automatically when all requirements are met」が表示されることを確認して完了扱いにする。複数名で運用する場合は別メンバーに Approve してもらう。

---

### 5. 「Approve workflows to run」がマージをブロックする

**症状**: PR の CI チェックが pending のまま進まず、auto-merge もブロックされる。Actions タブに「Approve and run」ボタンが表示される。

**原因**: 外部コントリビューター（Copilot bot 含む）が作成した PR では、workflow に secrets アクセスがある場合、**初回は手動で workflow 実行を承認**する必要がある。これは GitHub のセキュリティ機能。

**解決**: Actions タブ → 該当 run → 「Approve and run」をクリックして手動承認する。信頼できる bot からの PR であれば、Repository settings → Actions → General → 「Fork pull request workflows from outside collaborators」の設定を調整することも検討できる。

---

### 6. main と develop の同期が取れていないとエージェントが古い設定で動く

**症状**: agent ファイルを修正したのに、Copilot Cloud Agent が修正前の挙動のまま動く。

**原因**: agent ファイルの修正を `main` にコミットしたが、`develop` にマージしていなかった。`copilot-assign-on-label.yml` の `base_branch: develop` 指定により、Copilot Cloud Agent は **develop ブランチの agent ファイル**を参照する。

**解決**: agent ファイルや `copilot-instructions.md` を修正した後は、必ず develop にもマージ/同期する。

```bash
git checkout develop
git merge main
git push origin develop
```

---

### 7. まとめ: スモークテストを1発で通すためのチェックリスト

初回セットアップ後、Phase 10 を実行する前に以下を確認する:

- [ ] agent ファイルの frontmatter に未対応の `mcp-servers` 定義が含まれていないか
- [ ] `COPILOT_ASSIGN_TOKEN` が Repository secret に設定されているか
- [ ] `develop` ブランチが存在し、最新の agent ファイル/workflow が反映されているか
- [ ] Ruleset が Active で、対象ブランチに `develop` が含まれているか
- [ ] `Allow auto-merge` が ON になっているか
- [ ] **単独検証の場合** `Required approvals` が 0 になっているか
- [ ] preview-deploy workflow が不要な run を生成していないか（`synchronize` トリガーの確認）
