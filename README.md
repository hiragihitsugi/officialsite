# HIIRAGI HITSUGI Official Site

GitHub Pages向けの静的Webサイトです。

- トップページ: `index.html`
- Hero演出: `js/hero-intro.js` / `css/style.css`
- Hero画像: `images/hero_back.webp` / `images/hero_character.webp`
- 問い合わせ設定: `CONTACT_SETUP.md`
- Twitch設定: `TWITCH_SETUP.md`
- 公開前の確認事項: `SECURITY_NOTICE.md`


## Hero intro 4.13.1
Hero sequence is strictly phased: background, typography, character reveal, then content/links. Total completion is approximately 3.8 seconds.


## Hero typography

Version 4.13.7 uses the rendered text width as the fill-wipe clipping area, so the white fill reaches the final glyph without being cut off by a viewport-width container.
