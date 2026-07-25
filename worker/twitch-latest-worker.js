/**
 * Cloudflare Worker: latest Twitch archive API
 * Required secrets:
 *   TWITCH_CLIENT_ID
 *   TWITCH_CLIENT_SECRET
 * Optional variable:
 *   TWITCH_CHANNEL=hiragi_hitsugi
 */

let tokenCache = {
    value: "",
    expiresAt: 0
};

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_API_URL = "https://api.twitch.tv/helix";
const DEFAULT_CHANNEL = "hiragi_hitsugi";
const CONFIGURED_TWITCH_CLIENT_ID = "y1xa5t8h43ygyd6ygmi4fgsg0i162q";

function responseHeaders(cacheSeconds = 0) {
    const headers = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Accept, Content-Type",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": cacheSeconds > 0
            ? `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`
            : "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
    });
    return headers;
}

function json(body, status = 200, cacheSeconds = 0) {
    return new Response(JSON.stringify(body), {
        status,
        headers: responseHeaders(cacheSeconds)
    });
}

async function getAppAccessToken(env) {
    const now = Date.now();
    if (tokenCache.value && tokenCache.expiresAt > now + 60_000) {
        return tokenCache.value;
    }

    const clientId = String(env.TWITCH_CLIENT_ID || CONFIGURED_TWITCH_CLIENT_ID).trim();

    if (!clientId || !env.TWITCH_CLIENT_SECRET) {
        throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are required");
    }

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials"
    });

    const response = await fetch(TWITCH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });

    if (!response.ok) {
        throw new Error(`Twitch token request failed with ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.access_token) throw new Error("Twitch token response did not include access_token");

    tokenCache = {
        value: payload.access_token,
        expiresAt: now + Math.max(300, Number(payload.expires_in || 3600)) * 1000
    };

    return tokenCache.value;
}

async function twitchGet(path, params, env, token) {
    const url = new URL(`${TWITCH_API_URL}/${path}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Client-Id": String(env.TWITCH_CLIENT_ID || CONFIGURED_TWITCH_CLIENT_ID).trim()
        }
    });

    if (!response.ok) {
        throw new Error(`Twitch API ${path} failed with ${response.status}`);
    }

    return response.json();
}

function normalizeThumbnail(value) {
    if (!value) return "";
    return value
        .replace(/%?\{width\}/gi, "1280")
        .replace(/%?\{height\}/gi, "720");
}

async function fetchLatestArchive(channel, env) {
    const token = await getAppAccessToken(env);
    const userPayload = await twitchGet("users", { login: channel }, env, token);
    const user = userPayload.data?.[0];

    if (!user) {
        return {
            channel: { login: channel, displayName: channel, url: `https://www.twitch.tv/${channel}` },
            archive: null
        };
    }

    const videosPayload = await twitchGet("videos", {
        user_id: user.id,
        type: "archive",
        sort: "time",
        first: "1"
    }, env, token);

    const video = videosPayload.data?.[0] || null;

    return {
        channel: {
            id: user.id,
            login: user.login,
            displayName: user.display_name,
            profileImageUrl: user.profile_image_url,
            url: `https://www.twitch.tv/${user.login}`
        },
        archive: video ? {
            id: video.id,
            title: video.title,
            description: video.description,
            url: video.url,
            thumbnailUrl: normalizeThumbnail(video.thumbnail_url),
            createdAt: video.created_at,
            publishedAt: video.published_at,
            duration: video.duration,
            viewCount: video.view_count,
            language: video.language
        } : null
    };
}

export default {
    async fetch(request, env, context) {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: responseHeaders()
            });
        }

        if (request.method !== "GET") {
            return json({ ok: false, error: "Method not allowed" }, 405);
        }

        const requestUrl = new URL(request.url);
        if (requestUrl.pathname !== "/latest" && requestUrl.pathname !== "/") {
            return json({ ok: false, error: "Not found" }, 404);
        }

        const channel = String(env.TWITCH_CHANNEL || DEFAULT_CHANNEL).trim().toLowerCase();
        const requestedChannel = (requestUrl.searchParams.get("channel") || channel)
            .trim().toLowerCase();

        if (!/^[a-z0-9_]{3,25}$/.test(channel) || requestedChannel !== channel) {
            return json({ ok: false, error: "Invalid channel" }, 400);
        }

        const cacheUrl = new URL(request.url);
        cacheUrl.search = "";
        cacheUrl.searchParams.set("channel", channel);
        const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
        const cache = caches.default;
        const cached = await cache.match(cacheKey);
        if (cached) return cached;

        try {
            const result = await fetchLatestArchive(channel, env);
            const response = json({
                ok: true,
                ...result,
                fetchedAt: new Date().toISOString()
            }, 200, 300);

            context.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        } catch (error) {
            console.error("Twitch latest archive worker error:", error);
            return json({
                ok: false,
                error: "Twitch archive information is temporarily unavailable"
            }, 502);
        }
    }
};
