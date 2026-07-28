/*==================================================
    HIIRAGI HITSUGI Official Website
    GUIDELINE Page Reveal / Version 1.0.1
==================================================*/

"use strict";

(() => {
    const root = document.documentElement;
    const hero = document.querySelector('[data-guideline-reveal="hero"]');
    const targets = Array.from(
        document.querySelectorAll(
            '[data-guideline-reveal]:not([data-guideline-reveal="hero"])'
        )
    );

    function reveal(element) {
        if (!element || element.classList.contains("is-guideline-visible")) return;
        element.classList.add("is-guideline-visible");
    }

    function revealHero() {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => reveal(hero));
        });
        window.setTimeout(() => reveal(hero), 160);
    }

    function initializeObserver() {
        if (!("IntersectionObserver" in window)) {
            targets.forEach(reveal);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.1
        });

        targets.forEach(target => observer.observe(target));
    }

    function init() {
        window.clearTimeout(window.__guidelineRevealFallback);
        root.classList.add("guideline-motion-ready");
        initializeObserver();

        if (document.body.classList.contains("site-loaded")) {
            revealHero();
        } else {
            window.addEventListener("siteLoaded", revealHero, { once: true });
            window.setTimeout(revealHero, 2200);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    console.info(
        "%cGUIDELINE Reveal Ready — Version 1.0.1",
        "color:#66F1FF;font-weight:bold;"
    );
})();
