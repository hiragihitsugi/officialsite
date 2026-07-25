/*==================================================
    HIIRAGI HITSUGI Official Website
    First-paint state bootstrap
==================================================*/

"use strict";

(() => {
    const page = document.currentScript?.dataset.page;
    const root = document.documentElement;

    if (page === "home") {
        root.classList.add("cinematic-js", "hero-intro-pending");
        return;
    }

    if (page === "about") {
        root.classList.add("about-motion");
        window.__aboutRevealFallback = window.setTimeout(() => {
            root.classList.remove("about-motion");
        }, 3500);
    }
})();
