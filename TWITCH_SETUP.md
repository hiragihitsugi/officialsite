# Twitch最新アーカイブ連携 — Node.js不要版

Twitch Client IDはWorkerコードへ設定済みです。

```text
y1xa5t8h43ygyd6ygmi4fgsg0i162q
```

Node.jsやコマンド操作は不要です。
ルートにある `SETUP_TWITCH.bat` をダブルクリックすると、ブラウザ用のセットアップガイドが開きます。

## 必要なもの

- Cloudflareアカウント
- Twitch Developer Consoleで発行したClient Secret

Client SecretはGitHub、HTML、JavaScript、チャットへ貼らないでください。Cloudflare WorkerのSecret欄にだけ入力します。

## 手順

1. `SETUP_TWITCH.bat` を開きます。
2. Cloudflare DashboardでWorkerを新規作成します。
3. `worker/dashboard-worker.js` の内容をWorkerのコードへ貼り替えてデプロイします。
4. Workerの `Settings` → `Variables and Secrets` で次を追加します。
   - Type: `Secret`
   - Name: `TWITCH_CLIENT_SECRET`
   - Value: Twitch Developer Consoleで発行したClient Secret
5. 再デプロイします。
6. Worker URLの末尾に `/latest?channel=hiragi_hitsugi` を付けて開きます。
7. `{"ok":true}` が返ったら、Worker URLをセットアップガイドへ入力します。
8. 生成された設定を `js/media-config.js` へ貼り付けます。
9. プロジェクトをGitHubへアップロードします。

APIは公開アーカイブ情報だけを返し、取得対象チャンネルはWorker側で
`hiragi_hitsugi` に固定されています。CORSはGitHub Pagesとローカル確認で
同じキャッシュを安全に共有できるよう、すべてのOriginからの読み取りを許可します。
