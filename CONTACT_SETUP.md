# Contact form activation

このサイトのCONTACTフォームは FormSubmit を利用します。

1. GitHub Pagesへ公開後、CONTACTフォームから一度テスト送信します。
2. `hiragi.hitsugi@gmail.com` にFormSubmitから確認メールが届きます。
3. メール内の有効化リンクを押します。
4. 以降のフォーム送信がメールで届くようになります。

フォームの送信先:
- hiragi.hitsugi@gmail.com

リダイレクト先:
- https://hiragihitsugi.github.io/officialsite/thanks.html


## v3.9 診断修正

- `_honey` はブラウザの自動入力による誤検知を避けるため削除しました。
- `_url` に公開サイトURLを明示しました。
- `_autoresponse` を設定し、入力されたメールアドレスへ受付確認を自動返信します。
- 自動返信はFormSubmitの仕様上、通常のPOST送信・reCAPTCHA有効の構成で動作します。
