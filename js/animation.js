/*==================================================
    HIIRAGI HITSUGI Official Website
    animation.js
    Version : 4.11.0
==================================================*/

"use strict";

(() => {
    const hasGSAP = typeof window.gsap !== "undefined";
    const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (hasGSAP && hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    window.addEventListener("siteLoaded", initializeAnimations, { once: true });

    function initializeAnimations() {
        if (!hasGSAP || reduceMotion) {
            document.documentElement.classList.add("motion-reduced");
            return;
        }

        // Hero intro and post-intro pointer depth are owned by their dedicated
        // modules. No competing Hero transform animation is registered here.

        if (hasScrollTrigger) {
            initSectionEffects();
            initSectionTransitions();
            initAbout();
            initSkills();
            initMedia();
            initContact();
            requestAnimationFrame(() => ScrollTrigger.refresh());
        }
    }

    /**
     * セクション同士を視覚的につなぐスクロール演出。
     * 追従処理はPCの精密ポインター環境だけに限定する。
     */
    function initSectionEffects() {
        const sections = gsap.utils.toArray("main > section:not(#hero)");

        sections.forEach((section) => {
            const divider = section.querySelector(".section-divider");
            if (!divider) return;

            gsap.fromTo(divider, { scaleX: 0, opacity: 0 }, {
                scaleX: 1,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 88%", once: true }
            });
        });

        if (!finePointer || !window.matchMedia("(min-width: 769px)").matches) return;

        document.documentElement.classList.add("scroll-effects-active");

        sections.forEach((section, index) => {
            const atmosphere = section.querySelector(".section-atmosphere");
            if (!atmosphere) return;

            const direction = index % 2 === 0 ? 1 : -1;

            gsap.fromTo(atmosphere, {
                yPercent: -14,
                xPercent: direction * -3,
                scale: 0.86,
                opacity: 0.08
            }, {
                yPercent: 16,
                xPercent: direction * 3,
                scale: 1.08,
                opacity: 0.3,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.1,
                    invalidateOnRefresh: true
                }
            });
        });
    }


    function initSectionTransitions() {
        const sections = gsap.utils.toArray("main > section:not(#hero):not(#showcase)");

        sections.forEach(section => {
            const container = section.querySelector(":scope > .section-container");
            if (!container) return;

            gsap.fromTo(container,
                { y: 54, opacity: 0.72 },
                {
                    y: 0,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 92%",
                        end: "top 58%",
                        scrub: 0.55,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
    }

    function initAbout() {
        const timeline = gsap.timeline({
            scrollTrigger: { trigger: "#about", start: "top 72%", once: true }
        });

        timeline
            .from("#about .section-title", { opacity: 0, x: -70, duration: 0.7 })
            .from(".about-statement > *", { opacity: 0, y: 44, stagger: 0.1, duration: 0.7 }, "-=0.4")
            .from(".about-lead", { opacity: 0, y: 28, duration: 0.6 }, "-=0.45")
            .from(".about-principles > div", { opacity: 0, y: 22, stagger: 0.1, duration: 0.5 }, "-=0.3");
    }

    function initSkills() {
        const timeline = gsap.timeline({
            scrollTrigger: { trigger: "#skills", start: "top 78%", once: true }
        });

        timeline
            .from("#skills .section-title", {
                opacity: 0, y: 28, duration: 0.65, ease: "power3.out"
            })
            .from(".capabilities-heading > *", {
                opacity: 0, y: 32, stagger: 0.08, duration: 0.7, ease: "power3.out"
            }, "-=0.38")
            .from(".skill-card", {
                opacity: 0, y: 54, stagger: 0.1, duration: 0.75, ease: "power3.out"
            }, "-=0.34");
    }


    function initMedia() {
        const cards = gsap.utils.toArray("#media .media-card");
        if (!cards.length) return;

        const timeline = gsap.timeline({
            scrollTrigger: { trigger: "#media", start: "top 76%", once: true }
        });

        timeline
            .from("#media .section-title", {
                opacity: 0, x: -52, duration: 0.65, ease: "power3.out"
            })
            .from("#media .media-heading-row h2, #media .media-intro", {
                opacity: 0, y: 34, stagger: 0.1, duration: 0.72, ease: "power3.out"
            }, "-=0.36")
            .from(cards, {
                opacity: 0, y: 56, scale: 0.975, stagger: 0.13, duration: 0.82, ease: "power3.out"
            }, "-=0.34");
    }

    function initContact() {
        const timeline = gsap.timeline({
            scrollTrigger: { trigger: "#contact", start: "top 76%", once: true }
        });

        timeline
            .from("#contact .section-title", {
                opacity: 0, y: 28, duration: 0.65, ease: "power3.out"
            })
            .from("#contact h2, #contact p", {
                opacity: 0, y: 34, stagger: 0.1, duration: 0.7, ease: "power3.out"
            }, "-=0.38")
            .from(".contact-button", {
                opacity: 0, y: 26, duration: 0.6, ease: "power3.out"
            }, "-=0.32");
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        if (!hasScrollTrigger) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
    }, { passive: true });

    console.info("%cAnimation Module v1.5 Ready", "color:#00CFFF;font-weight:bold;");
})();
