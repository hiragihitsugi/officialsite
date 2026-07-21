/*==================================================
    HIIRAGI HITSUGI Official Website

    loading.js
    Version 0.3.1
==================================================*/

"use strict";

const MIN_LOADING_TIME = 1200;
const LOADER_HIDE_DURATION = 1100;
const LOADER_SELECTOR = "#loader";

const loader = document.querySelector(LOADER_SELECTOR);
const loadingStartedAt = performance.now();
let loaderFinished = false;

function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

function finishLoader() {
    if (loaderFinished) return;

    loaderFinished = true;

    if (loader?.isConnected) {
        loader.remove();
    }

    document.body.classList.add("site-loaded");
    window.dispatchEvent(new CustomEvent("siteLoaded"));
}

async function hideLoader() {
    if (!loader) {
        finishLoader();
        return;
    }

    const elapsed = performance.now() - loadingStartedAt;
    await wait(Math.max(MIN_LOADING_TIME - elapsed, 0));

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        finishLoader();
        return;
    }

    loader.classList.add("hide");

    const handleAnimationEnd = event => {
        // 子要素の animationend のバブリングでは終了させない
        if (event.target !== loader) return;
        if (event.animationName !== "loaderHide") return;

        loader.removeEventListener("animationend", handleAnimationEnd);
        finishLoader();
    };

    loader.addEventListener("animationend", handleAnimationEnd);

    // CSSの変更・読み込み失敗・animation無効化時にも必ず終了させる
    window.setTimeout(() => {
        loader.removeEventListener("animationend", handleAnimationEnd);
        finishLoader();
    }, LOADER_HIDE_DURATION + 300);
}

if (document.readyState === "complete") {
    hideLoader();
} else {
    window.addEventListener("load", hideLoader, { once: true });
}

// 画像や外部CDNが長時間応答しない場合の最終安全装置
window.setTimeout(finishLoader, 6000);

console.info(
    "%cLoading Module Ready",
    "color:#00CFFF;font-weight:bold;"
);
