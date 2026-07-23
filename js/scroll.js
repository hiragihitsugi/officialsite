/*==================================================
    HIIRAGI HITSUGI Official Website

    scroll.js
    Version 1.0.0
==================================================*/

"use strict";

const ScrollManager = (() => {
    const CONFIG = Object.freeze({
        headerThreshold: 80,
        backToTopThreshold: 600,
        defaultDuration: 1.3,
        navigationDuration: 1.5,
        resizeDelay: 180
    });

    const state = {
        initialized: false,
        started: false,
        lenis: null,
        scrollY: window.scrollY,
        progress: 0,
        activeSection: "",
        rafPending: false
    };

    const elements = {
        header: null,
        progressBar: null,
        backToTop: null,
        navigationLinks: [],
        sections: []
    };

    let sectionObserver = null;
    let resizeTimer = 0;

    function supportsReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function hasLenis() {
        return typeof window.Lenis === "function";
    }

    function hasGSAP() {
        return Boolean(window.gsap?.ticker);
    }

    function hasScrollTrigger() {
        return Boolean(window.ScrollTrigger?.update);
    }

    function cacheElements() {
        elements.header = document.querySelector("header");
        elements.progressBar = document.getElementById("scroll-progress");
        elements.backToTop = document.getElementById("back-to-top");
        elements.navigationLinks = Array.from(
            document.querySelectorAll('header a[href^="#"], .secondary-button[href^="#"]')
        );
        elements.sections = Array.from(document.querySelectorAll("section[id]"));
    }

    function getMaxScroll() {
        return Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            0
        );
    }

    function calculateProgress(scrollPosition) {
        const maxScroll = getMaxScroll();
        return maxScroll > 0
            ? Math.min(Math.max(scrollPosition / maxScroll, 0), 1)
            : 0;
    }

    function scheduleRender(scrollPosition = getScrollY()) {
        state.scrollY = Number.isFinite(scrollPosition)
            ? scrollPosition
            : window.scrollY;

        if (state.rafPending) return;

        state.rafPending = true;
        window.requestAnimationFrame(render);
    }

    function render() {
        state.rafPending = false;
        state.progress = calculateProgress(state.scrollY);

        elements.header?.classList.toggle(
            "scrolled",
            state.scrollY > CONFIG.headerThreshold
        );

        elements.backToTop?.classList.toggle(
            "show",
            state.scrollY > CONFIG.backToTopThreshold
        );

        if (elements.progressBar) {
            elements.progressBar.style.transform = `scaleX(${state.progress})`;
        }
    }

    function handleNativeScroll() {
        scheduleRender(window.scrollY);

        if (hasScrollTrigger()) {
            window.ScrollTrigger.update();
        }
    }

    function initializeLenis() {
        if (supportsReducedMotion() || !hasLenis()) {
            window.addEventListener("scroll", handleNativeScroll, { passive: true });
            return;
        }

        state.lenis = new window.Lenis({
            duration: 1.2,
            easing: value => 1 - Math.pow(1 - value, 4),
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            infinite: false,
            autoResize: true
        });

        state.lenis.on("scroll", event => {
            scheduleRender(event.scroll);

            if (hasScrollTrigger()) {
                window.ScrollTrigger.update();
            }
        });

        if (hasGSAP()) {
            window.gsap.ticker.add(time => {
                state.lenis?.raf(time * 1000);
            });
            window.gsap.ticker.lagSmoothing(0);
        } else {
            const raf = time => {
                state.lenis?.raf(time);
                window.requestAnimationFrame(raf);
            };
            window.requestAnimationFrame(raf);
        }
    }

    function resolveTarget(target) {
        if (typeof target === "number") return target;
        if (target instanceof Element) return target;
        if (typeof target !== "string" || target === "#") return null;

        try {
            return document.querySelector(target);
        } catch (error) {
            console.warn("Invalid scroll target:", target, error);
            return null;
        }
    }

    function scrollTo(target, options = {}) {
        const resolvedTarget = resolveTarget(target);
        if (resolvedTarget === null) return;

        const offset = options.offset ?? 0;
        const duration = options.duration ?? CONFIG.defaultDuration;
        const immediate = options.immediate ?? false;

        if (state.lenis) {
            state.lenis.scrollTo(resolvedTarget, {
                offset,
                duration,
                immediate
            });
            return;
        }

        const top = typeof resolvedTarget === "number"
            ? resolvedTarget
            : resolvedTarget.getBoundingClientRect().top + window.scrollY + offset;

        window.scrollTo({
            top,
            behavior: immediate || supportsReducedMotion() ? "auto" : "smooth"
        });
    }

    function handleAnchorClick(event) {
        const link = event.currentTarget;
        const selector = link.getAttribute("href");
        if (!selector || selector === "#") return;

        const target = resolveTarget(selector);
        if (!target) return;

        event.preventDefault();
        scrollTo(target, { duration: CONFIG.navigationDuration });

        if (window.history?.replaceState) {
            window.history.replaceState(null, "", selector);
        }
    }

    function initializeNavigation() {
        elements.navigationLinks.forEach(link => {
            link.addEventListener("click", handleAnchorClick);
        });

        const exploreButton = document.getElementById("explore");
        const exploreHref = exploreButton?.getAttribute?.("href") || "";

        if (exploreButton && (!exploreHref || exploreHref.startsWith("#"))) {
            exploreButton.addEventListener("click", () => {
                scrollTo("#about", { duration: 1.6 });
            });
        }
    }

    function setActiveSection(sectionId) {
        if (!sectionId || state.activeSection === sectionId) return;

        state.activeSection = sectionId;
        elements.navigationLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function initializeSectionObserver() {
        if (!("IntersectionObserver" in window)) return;

        sectionObserver = new IntersectionObserver(entries => {
            const visibleEntries = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visibleEntries[0]) {
                setActiveSection(visibleEntries[0].target.id);
            }
        }, {
            rootMargin: "-30% 0px -55% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        });

        elements.sections.forEach(section => sectionObserver.observe(section));
    }

    function initializeBackToTop() {
        elements.backToTop?.addEventListener("click", () => {
            scrollTo(0, { duration: 1.6 });
        });
    }

    function refresh() {
        state.lenis?.resize?.();

        if (window.ScrollTrigger?.refresh) {
            window.ScrollTrigger.refresh();
        }

        scheduleRender();
    }

    function handleResize() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refresh, CONFIG.resizeDelay);
    }

    function start() {
        state.started = true;
        state.lenis?.start();
    }

    function stop() {
        state.started = false;
        state.lenis?.stop();
    }

    function getScrollY() {
        return state.lenis?.scroll ?? window.scrollY;
    }

    function getProgress() {
        return state.progress;
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;

        cacheElements();
        initializeLenis();
        initializeNavigation();
        initializeSectionObserver();
        initializeBackToTop();

        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("orientationchange", refresh, { passive: true });

        start();
        scheduleRender();

        console.info(
            "%cScroll Module Ready — Version 1.0.0",
            "color:#00CFFF;font-weight:bold;"
        );
    }

    return Object.freeze({
        init,
        start,
        stop,
        refresh,
        scrollTo,
        scrollY: getScrollY,
        progress: getProgress,
        height: getMaxScroll
    });
})();

window.ScrollManager = ScrollManager;

window.addEventListener("siteLoaded", ScrollManager.init, { once: true });

// loading.jsより後から読み込まれた場合にも初期化できる安全策
if (document.body.classList.contains("site-loaded")) {
    ScrollManager.init();
}
