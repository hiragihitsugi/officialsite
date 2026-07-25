/*==================================================
    HIIRAGI HITSUGI Official Website

    hero-intro.js
    Version 4.13.8

    The final character image is a permanently static raster. The reveal is
    produced by clipping away a duplicate Hero-background cover above it, so
    no character property or compositor layer changes when the intro ends.
==================================================*/

"use strict";

(() => {
    const root = document.documentElement;
    const hero = document.querySelector("#hero.hero-vspo-inspired");

    if (!hero) return;

    const SELECTORS = Object.freeze({
        outline: ".hero-intro-type-outline",
        fill: ".hero-intro-type-fill",
        characterCover: ".hero-character-cover",
        characterVeil: ".hero-character-soft-veil",
        flash: ".hero-character-flash",
        impact: ".hero-impact-lines i",
        content: ".hero-main-content",
        edgeLeft: ".hero-edge-copy-left",
        edgeRight: ".hero-edge-copy-right",
        scrollCue: ".hero-scroll-cue",
        temporary: ".hero-intro-type, .hero-character-flash, .hero-impact-lines i"
    });

    let started = false;
    let startScheduled = false;
    let startFallbackTimer = 0;
    let nativeScrollFrame = 0;
    const activeAnimations = [];
    let sequenceSettled = false;

    const select = selector => hero.querySelector(selector);
    const selectAll = selector => Array.from(hero.querySelectorAll(selector));

    function applyFinalState() {
        root.classList.remove("hero-intro-pending");
        root.classList.add("hero-intro-running");
        hero.classList.add("hero-intro-final-state");

        selectAll(SELECTORS.temporary).forEach(element => {
            element.style.opacity = "0";
        });
    }

    function settleFinalState() {
        if (sequenceSettled) return;
        sequenceSettled = true;

        applyFinalState();
        activeAnimations.splice(0).forEach(animation => {
            try {
                animation.cancel();
            } catch (error) {
                console.warn("Hero animation cleanup skipped:", error);
            }
        });
    }

    function play(element, keyframes, options) {
        if (!element) return null;

        const animation = element.animate(keyframes, {
            fill: "both",
            ...options
        });

        activeAnimations.push(animation);
        return animation;
    }

    function smoothNativeScroll(target, duration = 1400) {
        if (nativeScrollFrame) {
            window.cancelAnimationFrame(nativeScrollFrame);
        }

        const startY = window.scrollY;
        const targetY = target.getBoundingClientRect().top + startY;
        const distance = targetY - startY;
        const startedAt = performance.now();
        const easeOutQuint = value => 1 - Math.pow(1 - value, 5);

        const step = now => {
            const progress = Math.min((now - startedAt) / duration, 1);
            window.scrollTo(0, startY + distance * easeOutQuint(progress));

            if (progress < 1) {
                nativeScrollFrame = window.requestAnimationFrame(step);
            } else {
                nativeScrollFrame = 0;
            }
        };

        nativeScrollFrame = window.requestAnimationFrame(step);
    }

    function initializeScrollCue() {
        const scrollCue = select(SELECTORS.scrollCue);
        if (!scrollCue) return;

        scrollCue.addEventListener("click", () => {
            const selector = scrollCue.dataset.scrollTarget || "#about";
            const target = document.querySelector(selector);
            if (!target) return;

            if (window.ScrollManager?.scrollTo) {
                window.ScrollManager.scrollTo(target, {
                    duration: 1.45,
                    forceSmooth: true
                });
                return;
            }

            smoothNativeScroll(target, 1450);
        });
    }

    function runSequence() {
        if (started) return;
        started = true;

        root.classList.remove("hero-intro-pending");
        root.classList.add("hero-intro-running");

        if (typeof Element.prototype.animate !== "function") {
            window.setTimeout(applyFinalState, 250);
            return;
        }

        const outline = select(SELECTORS.outline);
        const fill = select(SELECTORS.fill);
        const characterCover = select(SELECTORS.characterCover);
        const characterVeil = select(SELECTORS.characterVeil);
        const flash = select(SELECTORS.flash);
        const content = select(SELECTORS.content);
        const edgeLeft = select(SELECTORS.edgeLeft);
        const edgeRight = select(SELECTORS.edgeRight);
        const scrollCue = select(SELECTORS.scrollCue);
        const impactLines = selectAll(SELECTORS.impact);

        /*
         * Typography is intentionally split into independent phases.
         * The outline has NO fade-out in its entrance animation. It reaches
         * its final position and stays fully opaque while the fill wipes in.
         * Only after the fill is 100% revealed do both layers fade together.
         */
        play(outline, [
            { opacity: 0, transform: "translate3d(-7%, -58%, 0)", letterSpacing: "-.01em" },
            { offset: .24, opacity: 1 },
            { opacity: 1, transform: "translate3d(0, -58%, 0)", letterSpacing: "-.055em" }
        ], {
            duration: 980,
            delay: 140,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        /*
         * Keep the filled pass on the EXACT same geometry timeline as the
         * outline. Only its clip/opacity reveal is independent. This prevents
         * the two copies from drifting while the outline is still tightening
         * its letter spacing and finishing its horizontal entrance.
         */
        play(fill, [
            { transform: "translate3d(-7%, -58%, 0)", letterSpacing: "-.01em" },
            { transform: "translate3d(0, -58%, 0)", letterSpacing: "-.055em" }
        ], {
            duration: 980,
            delay: 140,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        play(fill, [
            { opacity: 0, clipPath: "inset(0 100% 0 0)" },
            { offset: .08, opacity: 1 },
            { opacity: 1, clipPath: "inset(0 -48px 0 0)" }
        ], {
            duration: 820,
            delay: 820,
            easing: "cubic-bezier(.77, 0, .18, 1)"
        });

        /* Hold the completed outline + fill for a beat, then fade together. */
        play(outline, [
            { opacity: 1, transform: "translate3d(0, -58%, 0)", letterSpacing: "-.055em" },
            { opacity: 0, transform: "translate3d(3%, -58%, 0)", letterSpacing: "-.055em" }
        ], {
            duration: 260,
            delay: 1780,
            easing: "cubic-bezier(.4, 0, 1, 1)",
            fill: "forwards"
        });

        play(fill, [
            { opacity: 1, clipPath: "inset(0 -48px 0 0)", transform: "translate3d(0, -58%, 0)" },
            { opacity: 0, clipPath: "inset(0 -48px 0 0)", transform: "translate3d(3%, -58%, 0)" }
        ], {
            duration: 260,
            delay: 1780,
            easing: "cubic-bezier(.4, 0, 1, 1)",
            fill: "forwards"
        });

        impactLines.forEach((line, index) => {
            const rotation = ["-13deg", "8deg", "-2deg"][index] || "-4deg";
            play(line, [
                { opacity: 0, transform: `rotate(${rotation}) scaleX(.05)` },
                { offset: .35, opacity: .85 },
                { opacity: 0, transform: `rotate(${rotation}) scaleX(1)` }
            ], {
                duration: 650,
                delay: 1660 + index * 70,
                easing: "ease-out"
            });
        });

        play(flash, [
            { opacity: 0, transform: "rotate(18deg) translate3d(-460%, 0, 0)" },
            { offset: .22, opacity: .9 },
            { opacity: 0, transform: "rotate(18deg) translate3d(640%, 0, 0)" }
        ], {
            duration: 820,
            delay: 1700,
            easing: "cubic-bezier(.4, 0, .2, 1)"
        });

        /*
         * The character image is already in its exact final state underneath.
         * Only this duplicate-background cover is clipped away. Its CSS base
         * state is armed to the same final clip before the browser can paint,
         * so even an animation-layer release cannot change the visible image.
         */
        play(characterCover, [
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
            { offset: .42, clipPath: "polygon(42% 0, 100% 0, 100% 100%, 20% 100%)" },
            { clipPath: "polygon(101% 0, 101% 0, 101% 100%, 101% 100%)" }
        ], {
            duration: 1150,
            delay: 2100,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        /*
         * A translucent veil, not the character raster, creates the gentle
         * fade-in. The character image stays in its final painted state for
         * the entire sequence, so there is no end-frame compositor handoff.
         */
        play(characterVeil, [
            { opacity: .72 },
            { offset: .28, opacity: .58 },
            { offset: .72, opacity: .14 },
            { opacity: 0 }
        ], {
            duration: 1100,
            delay: 2100,
            easing: "cubic-bezier(.22, .72, .2, 1)"
        });

        play(content, [
            { opacity: 0, transform: "translate3d(34px, 18px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" }
        ], {
            duration: 650,
            delay: 3420,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        play(edgeLeft, [
            { opacity: 0, clipPath: "inset(0 100% 0 0)" },
            { offset: .24, opacity: .28 },
            { opacity: 1, clipPath: "inset(0 0 0 0)" }
        ], {
            duration: 600,
            delay: 3460,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        play(edgeRight, [
            { opacity: 0, clipPath: "inset(100% 0 0 0)" },
            { offset: .24, opacity: .28 },
            { opacity: 1, clipPath: "inset(0 0 0 0)" }
        ], {
            duration: 600,
            delay: 3520,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        play(scrollCue, [
            { opacity: 0, transform: "translate3d(0, 8px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" }
        ], {
            duration: 520,
            delay: 3580,
            easing: "cubic-bezier(.16, 1, .3, 1)"
        });

        // WAAPI fill:"both" owns each phase from its initial frame through its
        // final frame. Do not arm the CSS final-state class during playback;
        // doing so can bypass the intended phase separation.
        Promise.allSettled(
            activeAnimations.map(animation => animation.finished)
        ).then(settleFinalState);
    }

    async function prepareHeroImages() {
        const images = Array.from(hero.querySelectorAll(
            ".hero-back-image, .hero-character-image, .hero-character-cover-image"
        ));

        await Promise.all(images.map(async image => {
            if (image.complete) {
                if (image.naturalWidth > 0) {
                    try {
                        await image.decode?.();
                    } catch (error) {
                        // A complete image is already safe to paint.
                    }
                }
                return;
            }

            await new Promise(resolve => {
                const finish = () => resolve();
                image.addEventListener("load", finish, { once: true });
                image.addEventListener("error", finish, { once: true });
            });

            try {
                await image.decode?.();
            } catch (error) {
                // Continue with the browser-decoded fallback.
            }
        }));
    }

    async function scheduleStart() {
        if (startScheduled || started) return;
        startScheduled = true;

        await prepareHeroImages();

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(runSequence);
        });
    }

    initializeScrollCue();
    window.addEventListener("siteLoaded", scheduleStart, { once: true });

    if (document.body.classList.contains("site-loaded")) {
        scheduleStart();
    } else {
        const observer = new MutationObserver(() => {
            if (!document.body.classList.contains("site-loaded")) return;
            observer.disconnect();
            scheduleStart();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"]
        });

        startFallbackTimer = window.setTimeout(() => {
            observer.disconnect();
            scheduleStart();
        }, 6500);
    }

    window.addEventListener("pagehide", () => {
        if (startFallbackTimer) window.clearTimeout(startFallbackTimer);
        if (nativeScrollFrame) window.cancelAnimationFrame(nativeScrollFrame);
        settleFinalState();
    }, { once: true });
})();
