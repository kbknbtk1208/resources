# Project Conventions MCP Server

複数人チームで開発するプロジェクトにおいて、コーディング規約やドメイン知識をコーディングエージェントに提供するための MCP (Model Context Protocol) サーバーです。

## 概要

このMCPサーバーは、プロジェクトのコーディング規約やドメイン知識をまとめたmarkdownファイルを管理し、コーディングエージェントが必要な情報を必要なタイミングで取得できるようにします。

## 機能

- リソースディレクトリ内のすべてのmarkdownファイルのリスト表示
- 指定されたmarkdownファイルの内容取得
- TypeScriptで実装された型安全なMCPサーバー
- クロスプラットフォーム対応

## インストール方法

### 1. NPMパッケージとして使用する場合

```bash
# グローバルインストール（推奨）
npm install -g project-conventions-mcp

# または npx で直接実行
npx project-conventions-mcp
```

### 2. ローカル開発での使用

```bash
# リポジトリのクローン
git clone <repository-url>
cd project-conventions-mcp

# 依存関係のインストール
npm install

# ビルド
npm run build

# 実行
npm start
# または直接実行
node build/index.js
```

## 開発

### 開発環境での実行

```bash
# TypeScriptファイルを直接実行（開発用）
npm run dev
```

### ビルドプロセス

```bash
# TypeScriptのコンパイルとリソースのコピーを実行
npm run build
```

ビルドプロセスでは以下が実行されます：
1. TypeScriptファイルのJavaScriptへのコンパイル
2. `resources/` ディレクトリ内のmarkdownファイルを `build/` ディレクトリにコピー

### プロジェクト構成

```
project-conventions-mcp/
├── src/
│   └── index.ts                    # MCPサーバーのメイン実装
├── resources/                      # markdownファイルが格納されるディレクトリ
│   ├── coding_rules/              # コーディング規約カテゴリ
│   │   ├── react_conventions.md        # Reactコーディング規約
│   │   └── express_conventions.md      # Express.jsコーディング規約
│   └── domain_knowledge/          # ドメイン知識カテゴリ
│       ├── ecommerce_domain.md         # Eコマースドメイン知識
│       └── user_management.md          # ユーザー管理ドメイン知識
├── build/                         # ビルド成果物
│   ├── index.js                   # コンパイルされたサーバー
│   └── resources/                 # コピーされたリソース
│       ├── coding_rules/
│       │   ├── react_conventions.md
│       │   └── express_conventions.md
│       └── domain_knowledge/
│           ├── ecommerce_domain.md
│           └── user_management.md
├── package.json
├── tsconfig.json
└── README.md
```

## 使用方法

### MCP設定

#### Claude Desktop での設定

Claude Desktop で使用する場合は、設定ファイルに以下を追加してください：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "project-conventions": {
      "command": "npx",
      "args": ["project-conventions-mcp"]
    }
  }
}
```

#### ローカル開発での設定

プロジェクトルートに `.mcp.json` ファイルを作成：

```json
{
  "mcpServers": {
    "project-conventions": {
      "command": "node",
      "args": ["./build/index.js"],
      "cwd": ".",
      "env": {}
    }
  }
}
```

#### その他のMCPクライアントでの設定

各種MCPクライアントでの設定例：

```json
{
  "mcpServers": {
    "project-conventions": {
      "command": "node",
      "args": ["/path/to/project-conventions-mcp/build/index.js"],
      "cwd": "/path/to/project-conventions-mcp",
      "env": {}
    }
  }
}
```

**パラメーター説明:**
- `command`: 実行するコマンド（`node`, `npx` など）
- `args`: コマンドの引数（実行ファイルのパスなど）
- `cwd`: 作業ディレクトリ（省略可能）
- `env`: 環境変数（省略可能）

### MCPクライアント（コーディングエージェント）との連携

1. **利用可能なリソースの一覧取得**
   - MCPクライアントは `list_resources` リクエストを送信
   - サーバーはカテゴリ別に分類された全markdownファイルのリストを返却

2. **特定のリソースの取得**
   - MCPクライアントは `read_resource` リクエストでカテゴリ別URIを指定
   - サーバーは指定されたmarkdownファイルの内容を返却

### カテゴリ別リソースURI形式

#### コーディング規約カテゴリ
```
coding-rules://react_conventions.md
coding-rules://express_conventions.md
```

#### ドメイン知識カテゴリ
```
domain-knowledge://ecommerce_domain.md
domain-knowledge://user_management.md
```

### コーディングエージェントでの使用例

```typescript
// リソース一覧の取得（カテゴリ別に分類される）
const resources = await mcpClient.listResources();
// → [
//     { uri: "coding-rules://react_conventions.md", name: "react_conventions.md", category: "coding-rules", ... },
//     { uri: "domain-knowledge://ecommerce_domain.md", name: "ecommerce_domain.md", category: "domain-knowledge", ... },
//     ...
//   ]

// 特定のリソースの取得
const reactConventions = await mcpClient.readResource("coding-rules://react_conventions.md");
const ecommerceKnowledge = await mcpClient.readResource("domain-knowledge://ecommerce_domain.md");
```

## 提供される資料

### コーディング規約カテゴリ (`coding-rules://`)

#### React コーディング規約 (`react_conventions.md`)
- ファイル構成とディレクトリ構造
- コンポーネント設計のベストプラクティス
- TypeScriptでの型定義
- フック（useState, useEffect, カスタムフック）の使用方法
- スタイリング規約
- エラーハンドリング
- パフォーマンス最適化
- テスト手法

#### Express.js コーディング規約 (`express_conventions.md`)
- プロジェクト構成とファイル構造
- コントローラー、サービス、ルートの実装パターン
- ミドルウェアの作成と使用
- エラーハンドリング
- 認証・認可
- バリデーション
- 型定義
- セキュリティ対策
- テスト手法

### ドメイン知識カテゴリ (`domain-knowledge://`)

#### Eコマースドメイン知識 (`ecommerce_domain.md`)
- 主要エンティティ（ユーザー、商品、注文、支払い、配送）
- ビジネスルール（注文プロセス、在庫管理、価格計算、割引）
- ステータス管理（注文、支払い、在庫）
- データ整合性ルール
- セキュリティ要件（個人情報保護、決済セキュリティ）
- パフォーマンス要件
- 外部システム連携

#### ユーザー管理ドメイン知識 (`user_management.md`)
- ユーザーアカウント管理（登録、プロフィール、アカウント状態）
- 認証・認可（認証方式、セッション管理、パスワード管理）
- ユーザーロール・権限管理（RBAC、ABAC、権限継承）
- プライバシー・データ保護（個人情報取り扱い、GDPR対応）
- ユーザー体験（UX）フロー
- セキュリティ対策（攻撃防止、監査、ログ）
- API設計とデータモデル
- 通知システム

## カスタマイズ

### 独自の資料の追加

#### 既存カテゴリに追加する場合
1. 適切なカテゴリディレクトリに新しい `.md` ファイルを追加
   - コーディング規約: `resources/coding_rules/your_convention.md`
   - ドメイン知識: `resources/domain_knowledge/your_domain.md`
2. `npm run build` でビルドを実行
3. MCPサーバーを再起動

#### 新しいカテゴリを追加する場合
1. `resources/` 下に新しいディレクトリを作成
2. `src/index.ts` の `CATEGORIES` 定数に新しいカテゴリを追加
   ```typescript
   const CATEGORIES = {
     'coding-rules': { ... },
     'domain-knowledge': { ... },
     'your-category': {
       directory: 'your_directory',
       displayName: 'Your Category',
       description: 'Description of your category'
     }
   };
   ```
3. 新しいディレクトリに `.md` ファイルを追加
4. `npm run build` でビルドを実行
5. MCPサーバーを再起動

新しいカテゴリの資料は `your-category://filename.md` 形式のURIでアクセス可能になります。

### セキュリティ

- パストラバーサル攻撃の防止機能を内蔵
- `resources/` ディレクトリ外のファイルアクセスを制限
- ファイル存在確認による安全なファイル読み込み

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## 技術仕様

- **言語**: TypeScript 5.0+
- **Runtime**: Node.js 18+
- **MCP SDK**: @modelcontextprotocol/sdk (latest)
- **トランスポート**: STDIO
- **リソース形式**: Markdown (.md)