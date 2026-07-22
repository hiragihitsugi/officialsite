# セキュリティ上の重要事項

このパッケージには Twitch Client Secret を含めていません。

チャット等に貼り付けた Client Secret は漏洩済みとして扱い、Twitch Developer Console で無効化・再発行してください。新しく発行した Secret は Cloudflare Worker の `TWITCH_CLIENT_SECRET`（Type: Secret）へだけ登録してください。

- GitHubへコミットしない
- HTML / JavaScript / media-config.jsへ記載しない
- チャットやメールで共有しない
