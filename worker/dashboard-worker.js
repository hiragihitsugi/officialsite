/**
 * Cloudflare Worker: latest Twitch archive API
 * Required secrets:
 *   TWITCH_CLIENT_ID
 *   TWITCH_CLIENT_SECRET
 * Optional variable:
 *   ALLOWED_ORIGINS=https://hiragihitsugi.github.io,http://localhost:5500
 */

let tokenCache = {
    value: "",
    expiresAt: 0
};

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_API_URL = "https://api.twitch.tv/helix";
const DEFAULT_CHANNEL = "hiragi_hitsugi";
const DEFAULT_SITE_ORIGIN = "https://hiragihitsugi.github.io";
const CONFIGURED_TWITCH_CLIENT_ID = "y1xa5t8h43ygyd6ygmi4fgsg0i162q";

function allowedOrigins(env) {
    const configured = String(env.ALLOWED_ORIGINS || DEFAULT_SITE_ORIGIN)
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);

    return new Set(configured);
}

function isLocalOrigin(origin) {
    return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || "");
}

function corsOrigin(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (allowedOrigins(env).has(origin) || isLocalOrigin(origin)) return origin;
    return DEFAULT_SITE_ORIGIN;
}

function responseHeaders(request, env, cacheSeconds = 0) {
    return {
        "Access-Control-Allow-Origin": corsOrigin(request, env),
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": cacheSeconds > 0
            ? `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`
            : "no-store",
        "Vary": "Origin"
    };
}

function json(request, env, body, status = 200, cacheSeconds = 0) {
    return new Response(JSON.stringify(body), {
        status,
        headers: responseHeaders(request, env, cacheSeconds)
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
                headers: responseHeaders(request, env)
            });
        }

        if (request.method !== "GET") {
            return json(request, env, { ok: false, error: "Method not allowed" }, 405);
        }

        const requestUrl = new URL(request.url);
        if (requestUrl.pathname !== "/latest" && requestUrl.pathname !== "/") {
            return json(request, env, { ok: false, error: "Not found" }, 404);
        }

        const channel = (requestUrl.searchParams.get("channel") || DEFAULT_CHANNEL)
            .trim()
            .toLowerCase();

        if (!/^[a-z0-9_]{3,25}$/.test(channel)) {
            return json(request, env, { ok: false, error: "Invalid channel" }, 400);
        }

        const cacheUrl = new URL(request.url);
        cacheUrl.search = `?channel=${encodeURIComponent(channel)}`;
        const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
        const cache = caches.default;
        const cached = await cache.match(cacheKey);
        if (cached) return cached;

        try {
            const result = await fetchLatestArchive(channel, env);
            const response = json(request, env, {
                ok: true,
                ...result,
                fetchedAt: new Date().toISOString()
            }, 200, 300);

            context.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        } catch (error) {
            console.error("Twitch latest archive worker error:", error);
            return json(request, env, {
                ok: false,
                error: "Twitch archive information is temporarily unavailable"
            }, 502);
        }
    }
};
