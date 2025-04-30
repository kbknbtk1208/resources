# コード規約

## 概要

- この Document はプロジェクトのコード規約を定義したものである。
- コード実装時にはこの規約に従うこと。
- Merge Request を作成する際には、必ずこの規約に従っていることを確認すること。
- Merge Request のレビューの承認には内容がこの規約に従っていることが求められる。

## 共通

### 変数名

- 変数名はキャメルケースを使用すること
  - 例外: 型定義はパスカルケースを使用すること
  - 例外: コンポーネント名はパスカルケースを使用すること
  - 例外: 定数はスネークケースを使用すること
- boolean の命名には is または has を使用すること

### 条件分岐

- 条件によっては全て実行する必要がない場合、早期リターンを使用すること
- 3 段階以上の条件分岐は switch 文を使用すること
- Nested if 文の使用は禁止されている

### コメント

- コメントは why,why not のみ許可される。what/how のコメントは禁止される。
- 日本語で記載すること

### その他

- type assertion の仕様は避けること

## React Component 実装時

- useEffect の過剰な使用をさけること
  - 使用する際は callback 関数を定義すること
- Props の要素数は 5 個以内にすること
- API Call には@clientUtils\apiClient.ts の共通ロジックを使用すること
- `map`メソッド内で Component を render する場合は、key を指定すること
- HTML 要素のイベントハンドラ内に詳細なロジックの記載は禁止。`handleClick`などの関数を定義して、そこにロジックを記載すること

## Next.js app router api

- すべての path parameter, query parameter, body parameter の validation を router 層で行うこと
- validation は zod を使用すること
- validation に失敗した場合は 400 エラーを返すこと
