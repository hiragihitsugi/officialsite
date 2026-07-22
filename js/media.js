/*==================================================
    HIIRAGI HITSUGI Official Website
    media.js / Version 1.0.0
==================================================*/

"use strict";

(() => {
    const card = document.querySelector("#twitch-latest-card");
    if (!card) return;

    const title = card.querySelector("#twitch-archive-title");
    const description = card.querySelector("#twitch-archive-description");
    const published = card.querySelector("#twitch-archive-published");
    const duration = card.querySelector("#twitch-archive-duration");
    const image = card.querySelector("#twitch-archive-image");
    const visualLink = card.querySelector("#twitch-archive-link");
    const actionLink = card.querySelector("#twitch-archive-action");
    const status = card.querySelector("#twitch-archive-status");
    const channelUrl = "https://www.twitch.tv/hiragi_hitsugi";

    const setLinks = (url) => {
        [visualLink, actionLink].forEach(link => {
            if (link) link.href = url || channelUrl;
        });
    };

    const setState = (state, statusText) => {
        card.classList.remove("is-loading", "is-loaded", "is-empty", "is-error", "is-unconfigured");
        card.classList.add(state);
        if (status) status.textContent = statusText;
    };

    const formatDate = (value) => {
        if (!value) return "DATE UNAVAILABLE";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "DATE UNAVAILABLE";
        return new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    };

    const formatDuration = (value) => {
        if (!value) return "DURATION UNAVAILABLE";
        const match = String(value).match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
        if (!match) return String(value).toUpperCase();
        const [, hours, minutes, seconds] = match;
        const parts = [];
        if (hours) parts.push(`${Number(hours)}時間`);
        if (minutes) parts.push(`${Number(minutes)}分`);
        if (!hours && !minutes && seconds) parts.push(`${Number(seconds)}秒`);
        return parts.length ? parts.join(" ") : String(value).toUpperCase();
    };

    const renderArchive = (archive) => {
        if (!archive) {
            setState("is-empty", "NO ARCHIVE");
            title.textContent = "公開アーカイブはまだありません";
            description.textContent = "最新の配信情報はTwitchチャンネルで確認できます。";
            published.textContent = "TWITCH CHANNEL";
            duration.textContent = "";
            setLinks(channelUrl);
            actionLink.textContent = "TWITCH CHANNEL ↗";
            return;
        }

        setState("is-loaded", "LATEST ARCHIVE");
        title.textContent = archive.title || "Latest Twitch Archive";
        description.textContent = "最新の公開配信アーカイブです。Twitchで続きを視聴できます。";
        published.textContent = formatDate(archive.publishedAt || archive.createdAt);
        duration.textContent = formatDuration(archive.duration);
        setLinks(archive.url || channelUrl);
        actionLink.textContent = "WATCH ON TWITCH ↗";

        if (archive.thumbnailUrl && image) {
            image.addEventListener("error", () => {
                card.classList.remove("is-loaded");
            }, { once: true });
            image.src = archive.thumbnailUrl;
            image.alt = archive.title ? `${archive.title}のサムネイル` : "最新Twitchアーカイブのサムネイル";
        }
    };

    const renderUnconfigured = () => {
        setState("is-unconfigured", "TWITCH");
        title.textContent = "Latest Twitch Archive";
        description.textContent = "API接続後、最新の公開アーカイブがここへ自動表示されます。";
        published.textContent = "HIRAGI_HITSUGI";
        duration.textContent = "CHANNEL LINK READY";
        setLinks(channelUrl);
        actionLink.textContent = "VISIT TWITCH ↗";
    };

    const renderError = () => {
        setState("is-error", "TWITCH");
        title.textContent = "アーカイブ情報を取得できませんでした";
        description.textContent = "Twitchチャンネルへのリンクは利用できます。時間を置いて再度お試しください。";
        published.textContent = "API UNAVAILABLE";
        duration.textContent = "";
        setLinks(channelUrl);
        actionLink.textContent = "VISIT TWITCH ↗";
    };

    const loadLatestArchive = async () => {
        const endpoint = window.MEDIA_CONFIG?.twitchLatestEndpoint?.trim();
        if (!endpoint || !/^https:\/\//i.test(endpoint)) {
            renderUnconfigured();
            return;
        }

        setState("is-loading", "LOADING");
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 9000);

        try {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal
            });

            if (!response.ok) throw new Error(`Twitch endpoint returned ${response.status}`);
            const payload = await response.json();
            if (!payload || payload.ok !== true) throw new Error("Invalid Twitch endpoint response");
            renderArchive(payload.archive || null);
        } catch (error) {
            console.warn("Twitch latest archive could not be loaded:", error);
            renderError();
        } finally {
            window.clearTimeout(timeoutId);
        }
    };

    setLinks(channelUrl);
    loadLatestArchive();
})();
