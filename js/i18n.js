/*==================================================
    HIIRAGI HITSUGI Official Website
    JP / EN Language Switcher / Version 1.0.2
==================================================*/

"use strict";

(() => {
    const STORAGE_KEY = "hiiragi-hitsugi-language";
    const supportedLanguages = new Set(["ja", "en"]);
    const root = document.documentElement;
    const originalTexts = new WeakMap();
    const originalAttributes = new WeakMap();
    const translatedAttributes = ["aria-label", "alt", "placeholder", "title", "content"];
    let currentLanguage = readLanguage();
    let observer = null;
    const observerOptions = Object.freeze({
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: translatedAttributes
    });

    const english = Object.freeze({
        "AI学習への利用：": "Use for AI Training:",
        "AmazonのWishlistを開く": "Open the Amazon Wishlist",
        "BOOTHオフィシャルショップを開く": "Open the official BOOTH shop",
        "HIIRAGI HITSUGIのSDキャラクター": "HIIRAGI HITSUGI chibi character",
        "HIIRAGI HITSUGIのビジュアルを形づくってくださったクリエイターの皆様をご紹介します。": "Meet the creators who brought the visuals of HIIRAGI HITSUGI to life.",
        "HIIRAGI HITSUGIの公式リンク": "Official HIIRAGI HITSUGI links",
        "HIIRAGI HITSUGIの詳しいプロフィールを見る": "View the full HIIRAGI HITSUGI profile",
        "HIIRAGI HITSUGIの二次創作、配信切り抜き、SNS投稿などに関するガイドラインです。": "Guidelines for HIIRAGI HITSUGI fan works, stream clips, social media posts, and more.",
        "HIIRAGI HITSUGIを応援してくださるみなさんが、安心して創作や交流を楽しむためのお願いです。": "A few requests so everyone supporting HIIRAGI HITSUGI can create and connect with confidence.",
        "OFFICIAL SITEへ戻る": "BACK TO OFFICIAL SITE",
        "SNSでの共有": "Sharing on Social Media",
        "Twitchから最新の公開配信アーカイブを取得しています。": "Retrieving the latest public stream archive from Twitch.",
        "Twitchチャンネルを開く": "Open the Twitch channel",
        "Twitchチャンネルを見る": "View the Twitch channel",
        "Twitchの最新アーカイブを見る": "View the latest Twitch archive",
        "VTuber HIIRAGI HITSUGIのプロフィール、活動内容、配信で大切にしていることを紹介します。": "Discover VTuber HIIRAGI HITSUGI's profile, activities, and streaming philosophy.",
        "VTuber HIIRAGI HITSUGIの公式サイト。YouTube・Twitchでの配信、動画、活動情報をまとめています。": "The official website of VTuber HIIRAGI HITSUGI, featuring streams, videos, and activity updates from YouTube and Twitch.",
        "VTuber HIIRAGI HITSUGIの全身キービジュアル": "Full-body key visual of VTuber HIIRAGI HITSUGI",
        "Xのプロフィールを開く": "Open the X profile",
        "Xを開く": "Open X",
        "YouTubeチャンネルを開く": "Open the YouTube channel",
        "YouTubeチャンネルを見る": "View the YouTube channel",
        "YouTubeのおすすめ動画と、Twitchの最新公開アーカイブをここから楽しめます。": "Enjoy a featured YouTube video and the latest public Twitch archive here.",
        "あなたに癒しと楽しい時間を届けること": "Bringing you comfort and good times",
        "あなたに癒しを届ける戦闘員バーチャルストリーマー、HIIRAGI HITSUGIについて。": "Meet HIIRAGI HITSUGI, the combatant virtual streamer bringing comfort to you.",
        "あなたに癒しを届ける戦闘員バーチャルストリーマー、HIIRAGI HITSUGIのプロフィール。": "The profile of HIIRAGI HITSUGI, the combatant virtual streamer bringing comfort to you.",
        "あなたに癒しを届ける戦闘員バーチャルストリーマー。": "A combatant virtual streamer bringing comfort to you.",
        "お仕事・制作について": "Business / Production",
        "お名前": "Your name",
        "お問い合わせを": "Send an Inquiry",
        "お問い合わせ種別": "Inquiry type",
        "お問い合わせ内容": "Message",
        "ガイドラインだけでは判断できない利用や、お仕事・メディア掲載・イベント利用については事前にお問い合わせください。": "Please contact us in advance regarding uses not covered by these guidelines, business requests, media features, or event use.",
        "ゲームと雑談を中心に配信": "Game streams and free talk",
        "ゲーム配信・雑談・動画": "Game streams, free talk, and videos",
        "ゲーム配信や雑談を中心に、YouTubeとTwitchで活動する個人VTuberです。戦う日々の合間に、ふっと肩の力を抜ける時間を届けたい。そんな思いで、リスナーのみなさんと一緒に楽しめる居場所をつくっています。": "An independent VTuber active mainly on YouTube and Twitch with game streams and free talk. Between the battles of everyday life, I want to give you a moment to unwind—a place we can enjoy together.",
        "ゲーム配信を軸に、雑談や動画、企画など幅広い活動を届けていきます。": "Centered on game streaming, with free talk, videos, projects, and more.",
        "このページは現時点の活動方針に基づく仮ガイドラインです。活動内容や権利関係に応じて、予告なく更新する場合があります。": "These provisional guidelines reflect the current activity policy and may be updated without notice as activities or rights circumstances change.",
        "コラボ、出演、制作のご相談やメッセージはこちらからお送りください。内容を確認のうえ、必要に応じて返信いたします。": "Send collaboration, appearance, production inquiries, or messages here. We will review your message and reply when necessary.",
        "コラボ・出演について": "Collaborations / Appearances",
        "コラボや記念企画をはじめ、VTuberとして新しい表現や体験に挑戦していきます。": "Taking on new forms of expression and experiences as a VTuber, including collaborations and anniversary projects.",
        "サイト内でそのまま再生するか、YouTubeの動画ページから視聴できます。": "Watch directly on this site or open the video page on YouTube.",
        "すべてのご相談へ個別回答できない場合があります。": "We may not be able to respond individually to every inquiry.",
        "その他": "Other",
        "たむお": "Tamuo",
        "たむお様のXプロフィールを開く": "Open Tamuo's X profile",
        "たむお様のXプロフィール画像": "Tamuo's X profile image",
        "トップページへ戻る": "Return to the home page",
        "なりすまし、誹謗中傷、差別的または反社会的な表現": "Impersonation, defamation, discriminatory, or antisocial content",
        "はじめての方におすすめの動画": "A recommended video for first-time visitors",
        "ファンアート、漫画、動画、音楽など、個人の趣味の範囲での二次創作を歓迎します。": "Fan art, comics, videos, music, and other derivative works are welcome for personal, non-commercial enjoyment.",
        "ファンアートや切り抜きなどの活動を歓迎しています。以下の内容を確認し、作品や配信への敬意をもってお楽しみください。": "Fan art, clips, and other fan activities are welcome. Please review the following and enjoy them with respect for the original works and streams.",
        "ファン活動やコンテンツ利用に関するガイドラインをご案内します。": "Guidelines for fan activities and content use.",
        "ページ上部へ戻る": "Back to top",
        "みなさんの作品や言葉が活動の力になっています。お互いを尊重しながら、楽しいコミュニティを一緒につくっていけたら嬉しいです。": "Your creations and words give strength to these activities. Let's respect one another and build a fun community together.",
        "メールアプリから直接送る": "Send directly from your email app",
        "メニューを開く": "Open menu",
        "メニューを閉じる": "Close menu",
        "メンバー限定・非公開・削除済みコンテンツは使用しないでください。": "Do not use members-only, private, or deleted content.",
        "ライドリ": "Raidori",
        "ライドリのファンクラブを開く": "Open the Raidori fan club",
        "ロゴや公式画像の無断商品化は禁止です。": "Do not commercialize logos or official images without permission.",
        "一緒に楽しめる時間と空間": "A time and place we can enjoy together",
        "応援と創作を、いつもありがとうございます。": "Thank you, always, for your support and creativity.",
        "応援メッセージ": "Message of Support",
        "花見はる": "Haru Hanami",
        "花見はる様のXプロフィールを開く": "Open Haru Hanami's X profile",
        "花見はる様のXプロフィール画像": "Haru Hanami's X profile image",
        "活動やキャラクターの印象を著しく損なう表現はお控えください。": "Avoid content that significantly damages the image of the activities or character.",
        "企業・団体による利用はCONTACTからお問い合わせください。": "Companies and organizations should inquire through CONTACT.",
        "禁止事項": "Prohibited Uses",
        "件名": "Subject",
        "権利者から申し出があった場合は、その指示を優先してください。": "If a rights holder contacts you, follow their instructions first.",
        "元配信のURLとチャンネル名を概要欄へ記載してください。": "Include the original stream URL and channel name in the description.",
        "個人情報の特定や詮索につながる投稿はしないでください。": "Do not post content that identifies or probes into personal information.",
        "公開中の配信アーカイブを利用した切り抜き動画の投稿は、以下の範囲で歓迎します。": "Clips made from currently public stream archives are welcome under the following conditions.",
        "公式SNSリンク": "Official social links",
        "公式アカウントを装う行為は禁止です。": "Do not impersonate an official account.",
        "公式グッズと誤認される販売はできません。": "Do not sell items that could be mistaken for official merchandise.",
        "公式素材やコンテンツの無断転載・再配布": "Unauthorized reposting or redistribution of official materials or content",
        "好きなゲームをじっくり楽しみながら、リスナーのみなさんと同じ時間を共有します。": "Sharing time with listeners while thoroughly enjoying the games I love.",
        "好きの気持ちが、誰かを傷つけない形で広がるように。": "Let what you love spread without hurting anyone.",
        "最新アーカイブの自動取得にはJavaScriptが必要です。": "JavaScript is required to retrieve the latest archive automatically.",
        "最新の配信アーカイブを確認中": "Checking the latest stream archive",
        "雑談やコメントを通して、気軽に立ち寄れて落ち着ける配信空間を目指します。": "Creating a relaxed stream space where anyone can drop by through free talk and comments.",
        "次のセクションへスクロール": "Scroll to the next section",
        "次のリンクへ": "Next link",
        "次の内容に該当する利用はお断りします。": "The following uses are prohibited.",
        "受け付けました。": "Received.",
        "収益化・販売": "Monetization / Sales",
        "政治・宗教活動への利用、違法行為を助長する利用": "Use for political or religious activities, or to promote illegal acts",
        "戦闘員バーチャルストリーマー": "Combatant Virtual Streamer",
        "選択してください": "Please select",
        "前のリンクへ": "Previous link",
        "送信ありがとうございます。内容を確認のうえ、必要に応じてご連絡いたします。": "Thank you for your message. We will review it and contact you if necessary.",
        "送信完了 | HIIRAGI HITSUGI": "Message Sent | HIIRAGI HITSUGI",
        "送信後に完了画面が表示されます。メールが届かない場合は迷惑メールと「すべてのメール」もご確認ください。": "A confirmation screen will appear after sending. If you do not receive an email, check your spam and all-mail folders.",
        "他の配信者・視聴者への攻撃的な投稿はお控えください。": "Avoid hostile posts toward other streamers or viewers.",
        "他者の権利を侵害する素材は使用しないでください。": "Do not use materials that infringe on the rights of others.",
        "第三者の権利・プライバシーを侵害する内容": "Content that infringes on third-party rights or privacy",
        "津倉冴": "Sae Tsukura",
        "津倉冴様のXプロフィールを開く": "Open Sae Tsukura's X profile",
        "津倉冴様のXプロフィール画像": "Sae Tsukura's X profile image",
        "投稿時に公式作品と誤認されないようにしてください。": "Make sure your post cannot be mistaken for an official work.",
        "動画プラットフォームの標準的な広告収益は可能です。グッズ販売など継続的・商業的な利用は事前にご相談ください。": "Standard advertising revenue on video platforms is permitted. Please consult us in advance for ongoing or commercial uses such as merchandise sales.",
        "二次創作": "Derivative Works",
        "入力内容を確認し、送信することに同意します。": "I have reviewed the information and agree to submit it.",
        "配信、最新情報、ファンクラブ、オフィシャルショップへ。気になるカードから、それぞれの場所へアクセスできます。": "Find streams, updates, the fan club, and the official shop. Choose a card to visit each destination.",
        "配信の感想、スクリーンショット、応援投稿は歓迎です。ネタバレや他の方への配慮をお願いします。": "Stream impressions, screenshots, and supportive posts are welcome. Please be considerate of spoilers and other people.",
        "配信の見どころ、企画動画、ショートなど、配信外でも楽しめるコンテンツを制作します。": "Creating highlights, project videos, Shorts, and other content to enjoy beyond live streams.",
        "配信の見どころや企画動画": "Stream highlights and project videos",
        "配信の切り抜き": "Stream Clips",
        "発言の意図が変わるような編集や、誤解を招くタイトルは避けてください。": "Avoid edits that alter the intent of statements or titles that could mislead viewers.",
        "判断に迷ったとき": "When You Are Unsure",
        "柊ひつぎ": "Hiiragi Hitsugi",
        "柊ひつぎが公開するモデル・画像・イラスト・映像その他の素材を、生成AIを含むAIの学習、追加学習、データセット作成、モデル生成その他これらに準ずる目的で使用する行為は、個人・法人、営利・非営利、公開・非公開を問わず、いかなる理由でも禁止します。": "Using any models, images, illustrations, videos, or other materials published by Hiiragi Hitsugi for AI training—including generative AI—fine-tuning, dataset creation, model generation, or any equivalent purpose is prohibited for all individuals and organizations, whether commercial or non-commercial, public or private, without exception.",
        "柊ひつぎはYouTubeとTwitchを中心に活動する個人VTuber/Streamerです。 ゲームと話すことが大好きで、皆に笑顔と癒しを届け、ふと立ち寄りたくなるような居場所を作っていきます。": "Hiiragi Hitsugi is an independent VTuber and streamer active mainly on YouTube and Twitch. With a love for games and conversation, the goal is to bring smiles and comfort while creating a place you will want to visit anytime.",
        "返信先メールアドレス": "Reply email address",
        "問題が確認された場合、公開停止や削除をお願いすることがあります。": "If a problem is identified, we may request that the content be unpublished or removed.",
        "様": "",
        "公開アーカイブはまだありません": "No public archives are available yet",
        "最新の配信情報はTwitchチャンネルで確認できます。": "Check the Twitch channel for the latest stream information.",
        "最新の公開配信アーカイブです。Twitchで続きを視聴できます。": "This is the latest public stream archive. Continue watching on Twitch.",
        "API接続後、最新の公開アーカイブがここへ自動表示されます。": "Once the API is connected, the latest public archive will appear here automatically.",
        "アーカイブ情報を取得できませんでした": "Archive information could not be retrieved",
        "Twitchチャンネルへのリンクは利用できます。時間を置いて再度お試しください。": "The Twitch channel link is still available. Please try again later.",
        "最新Twitchアーカイブのサムネイル": "Latest Twitch archive thumbnail",
        "言語を選択": "Select language"
    });

    root.lang = currentLanguage;
    root.dataset.language = currentLanguage;

    function readLanguage() {
        const requested = new URLSearchParams(window.location.search).get("lang");
        if (supportedLanguages.has(requested)) return requested;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return supportedLanguages.has(stored) ? stored : "ja";
        } catch {
            return "ja";
        }
    }

    function persistLanguage(language) {
        try {
            window.localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Language switching still works for the current page.
        }
    }

    function normalize(value) {
        return String(value).replace(/\s+/g, " ").trim();
    }

    function translatedValue(value) {
        const key = normalize(value);
        if (Object.prototype.hasOwnProperty.call(english, key)) return english[key];

        let match = key.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
        if (match) {
            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        }

        match = key.match(/^(?:(\d+)時間)?\s*(?:(\d+)分)?\s*(?:(\d+)秒)?$/);
        if (match && (match[1] || match[2] || match[3])) {
            return [
                match[1] ? `${match[1]}h` : "",
                match[2] ? `${match[2]}m` : "",
                match[3] ? `${match[3]}s` : ""
            ].filter(Boolean).join(" ");
        }

        match = key.match(/^(.+)のサムネイル$/);
        if (match) return `Thumbnail for ${match[1]}`;

        return null;
    }

    function withOriginalSpacing(original, replacement) {
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";
        return `${leading}${replacement}${trailing}`;
    }

    function processTextNode(node) {
        if (!node?.nodeValue || !node.parentElement) return;
        if (node.parentElement.closest("script, style, noscript")) return;

        if (currentLanguage === "ja") {
            const original = originalTexts.get(node);
            if (original !== undefined && node.nodeValue !== original) {
                node.nodeValue = original;
            }
            return;
        }

        const replacement = translatedValue(node.nodeValue);
        if (replacement === null) return;
        originalTexts.set(node, node.nodeValue);
        node.nodeValue = withOriginalSpacing(node.nodeValue, replacement);
    }

    function processAttributes(element) {
        if (!(element instanceof Element)) return;
        let saved = originalAttributes.get(element);

        translatedAttributes.forEach(attribute => {
            if (!element.hasAttribute(attribute)) return;

            if (currentLanguage === "ja") {
                const original = saved?.get(attribute);
                if (original !== undefined && element.getAttribute(attribute) !== original) {
                    element.setAttribute(attribute, original);
                }
                return;
            }

            const current = element.getAttribute(attribute);
            const replacement = translatedValue(current);
            if (replacement === null) return;

            if (!saved) {
                saved = new Map();
                originalAttributes.set(element, saved);
            }
            if (!saved.has(attribute)) saved.set(attribute, current);
            element.setAttribute(attribute, replacement);
        });
    }

    function processTree(target) {
        if (target.nodeType === Node.TEXT_NODE) {
            processTextNode(target);
            return;
        }
        if (!(target instanceof Element) && target !== document.documentElement) return;

        if (target instanceof Element) processAttributes(target);
        const walker = document.createTreeWalker(
            target,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
        );
        let node = walker.nextNode();
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
            else processAttributes(node);
            node = walker.nextNode();
        }
    }

    function createSwitch(className = "") {
        const wrapper = document.createElement("div");
        wrapper.className = `language-switch ${className}`.trim();
        wrapper.setAttribute("role", "group");
        wrapper.setAttribute("aria-label", currentLanguage === "en" ? "Select language" : "言語を選択");
        wrapper.innerHTML = [
            '<button type="button" data-language-option="ja">JP</button>',
            '<span aria-hidden="true"></span>',
            '<button type="button" data-language-option="en">EN</button>'
        ].join("");
        wrapper.addEventListener("click", event => {
            const button = event.target.closest("[data-language-option]");
            if (!button) return;
            setLanguage(button.dataset.languageOption);
        });
        return wrapper;
    }

    function injectSwitches() {
        const navigation = document.querySelector("#primary-navigation");
        if (navigation && !navigation.querySelector(".language-switch")) {
            navigation.append(createSwitch());
            return;
        }
        if (!navigation && !document.querySelector(".standalone-language-switch")) {
            document.body.append(createSwitch("standalone-language-switch"));
        }
    }

    function updateSwitches() {
        document.querySelectorAll(".language-switch").forEach(switcher => {
            switcher.setAttribute(
                "aria-label",
                currentLanguage === "en" ? "Select language" : "言語を選択"
            );
            switcher.querySelectorAll("[data-language-option]").forEach(button => {
                const active = button.dataset.languageOption === currentLanguage;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
        });
    }

    function setLanguage(language) {
        if (!supportedLanguages.has(language)) return;
        if (language === currentLanguage) return;

        if (observer) {
            observer.disconnect();
            observer.takeRecords();
        }

        currentLanguage = language;
        root.lang = language;
        root.dataset.language = language;
        persistLanguage(language);

        processTree(document.documentElement);
        updateSwitches();

        if (observer) {
            observer.takeRecords();
            observer.observe(document.documentElement, observerOptions);
        }

        window.dispatchEvent(new CustomEvent("siteLanguageChange", {
            detail: { language }
        }));
    }

    function initialize() {
        persistLanguage(currentLanguage);
        injectSwitches();
        processTree(document.documentElement);
        updateSwitches();

        observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "characterData") {
                    processTextNode(mutation.target);
                    return;
                }
                if (mutation.type === "attributes") {
                    processAttributes(mutation.target);
                    return;
                }
                mutation.addedNodes.forEach(processTree);
            });
        });
        observer.observe(document.documentElement, observerOptions);
    }

    window.SiteI18n = Object.freeze({
        getLanguage: () => currentLanguage,
        setLanguage,
        translate: value => currentLanguage === "en"
            ? (translatedValue(value) ?? value)
            : value
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
