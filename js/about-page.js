/*==================================================
    HIIRAGI HITSUGI Official Website
    ABOUT Page Reveal / Version 4.5.0
==================================================*/

"use strict";

(() => {
    const root = document.documentElement;
    const hero = document.querySelector('[data-about-reveal="hero"]');
    const targets = Array.from(
        document.querySelectorAll('[data-about-reveal]:not([data-about-reveal="hero"])')
    );

    function reveal(element) {
        if (!element || element.classList.contains("is-about-visible")) return;
        element.classList.add("is-about-visible");
    }

    function revealHero() {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => reveal(hero));
        });
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
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.12
        });

        targets.forEach(target => observer.observe(target));
    }

    function init() {
        window.clearTimeout(window.__aboutRevealFallback);
        root.classList.add("about-motion-ready");

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
        "%cABOUT Reveal Ready — Version 4.5.0",
        "color:#66F1FF;font-weight:bold;"
    );
})();
