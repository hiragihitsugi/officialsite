/*==================================================
    HIIRAGI HITSUGI Official Website

    hero-parallax.js
    Version 1.2.0

    Subtle pointer depth for the completed Hero. The intro remains untouched:
    parallax is enabled only after hero-intro-final-state has been applied.
==================================================*/

"use strict";

(() => {
    const hero = document.querySelector("#hero.hero-vspo-inspired");
    if (!hero) return;

    const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const REFERENCE_FRAME_MS = 1000 / 60;
    const MAX_FRAME_DELTA_MS = 50;
    const FOLLOW_RATE = 0.075;
    const REST_THRESHOLD = 0.01;

    const DEPTH = Object.freeze({
        backgroundX: -9.75,
        backgroundY: -6,
        characterX: 22.5,
        characterY: 15,
        contentX: 6,
        contentY: 4.125
    });

    let enabled = false;
    let pointerInside = false;
    let inViewport = true;
    let heroRect = null;
    let frameId = 0;
    let previousTime = 0;

    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function interpolationRate(elapsedMs) {
        return 1 - Math.pow(
            1 - FOLLOW_RATE,
            elapsedMs / REFERENCE_FRAME_MS
        );
    }

    function setLayerVariables(x, y) {
        const motionScale = motionPreference.matches ? 0.5 : 1;

        hero.style.setProperty("--hero-back-x", `${x * DEPTH.backgroundX * motionScale}px`);
        hero.style.setProperty("--hero-back-y", `${y * DEPTH.backgroundY * motionScale}px`);
        hero.style.setProperty("--hero-character-x", `${x * DEPTH.characterX * motionScale}px`);
        hero.style.setProperty("--hero-character-y", `${y * DEPTH.characterY * motionScale}px`);
        hero.style.setProperty("--hero-content-x", `${x * DEPTH.contentX * motionScale}px`);
        hero.style.setProperty("--hero-content-y", `${y * DEPTH.contentY * motionScale}px`);
    }

    function stopLoop() {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        previousTime = 0;
    }

    function reset(immediate = false) {
        target.x = 0;
        target.y = 0;

        if (!immediate && enabled && inViewport) {
            ensureLoop();
            return;
        }

        current.x = 0;
        current.y = 0;
        setLayerVariables(0, 0);
        stopLoop();
    }

    function render(time) {
        if (!enabled || document.hidden || !inViewport) {
            frameId = 0;
            previousTime = 0;
            return;
        }

        const elapsed = previousTime
            ? Math.min(time - previousTime, MAX_FRAME_DELTA_MS)
            : REFERENCE_FRAME_MS;
        previousTime = time;

        const rate = interpolationRate(elapsed);
        current.x += (target.x - current.x) * rate;
        current.y += (target.y - current.y) * rate;
        setLayerVariables(current.x, current.y);

        const settled =
            Math.abs(target.x - current.x) < REST_THRESHOLD &&
            Math.abs(target.y - current.y) < REST_THRESHOLD;

        if (settled) {
            current.x = target.x;
            current.y = target.y;
            setLayerVariables(current.x, current.y);
            stopLoop();
            return;
        }

        frameId = window.requestAnimationFrame(render);
    }

    function ensureLoop() {
        if (
            frameId ||
            !enabled ||
            document.hidden ||
            !inViewport
        ) return;

        previousTime = 0;
        frameId = window.requestAnimationFrame(render);
    }

    function refreshBounds() {
        heroRect = hero.getBoundingClientRect();
    }

    function invalidateBounds() {
        heroRect = null;
    }

    function handlePointerMove(event) {
        if (!enabled || !inViewport) return;
        if (
            event.pointerType &&
            event.pointerType !== "mouse" &&
            event.pointerType !== "pen"
        ) return;

        if (!heroRect) refreshBounds();

        const inside =
            event.clientX >= heroRect.left &&
            event.clientX <= heroRect.right &&
            event.clientY >= heroRect.top &&
            event.clientY <= heroRect.bottom;

        if (!inside) {
            if (pointerInside) handlePointerLeave();
            return;
        }

        const width = Math.max(heroRect.width, 1);
        const height = Math.max(heroRect.height, 1);
        const normalizedX = ((event.clientX - heroRect.left) / width) * 2 - 1;
        const normalizedY = ((event.clientY - heroRect.top) / height) * 2 - 1;

        target.x = Math.max(-1, Math.min(1, normalizedX));
        target.y = Math.max(-1, Math.min(1, normalizedY));
        pointerInside = true;
        ensureLoop();
    }

    function handlePointerLeave() {
        pointerInside = false;
        heroRect = null;
        reset();
    }

    function enable() {
        if (enabled) return;

        enabled = true;
        hero.classList.add("hero-parallax-enabled");
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("blur", handlePointerLeave);
        document.documentElement.addEventListener("mouseleave", handlePointerLeave);
        window.addEventListener("resize", invalidateBounds, { passive: true });
        window.addEventListener("scroll", invalidateBounds, { passive: true });
    }

    function disable() {
        if (!enabled) return;

        enabled = false;
        pointerInside = false;
        heroRect = null;
        hero.classList.remove("hero-parallax-enabled");
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("blur", handlePointerLeave);
        document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
        window.removeEventListener("resize", invalidateBounds);
        window.removeEventListener("scroll", invalidateBounds);
        reset(true);
    }

    const viewportObserver = new IntersectionObserver(entries => {
        inViewport = Boolean(entries[0]?.isIntersecting);

        if (!inViewport) {
            pointerInside = false;
            reset(true);
        }
    }, { threshold: 0 });

    viewportObserver.observe(hero);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pointerInside = false;
            reset(true);
        }
    });

    motionPreference.addEventListener?.("change", () => reset(true));

    if (hero.classList.contains("hero-intro-final-state")) {
        enable();
        return;
    }

    const introObserver = new MutationObserver(() => {
        if (!hero.classList.contains("hero-intro-final-state")) return;

        introObserver.disconnect();
        enable();
    });

    introObserver.observe(hero, {
        attributes: true,
        attributeFilter: ["class"]
    });
})();
