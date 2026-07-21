/*==================================================
    HIIRAGI HITSUGI Official Website
    animation.js
    Version : 1.4.0
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

        initHeroEntrance();
        initHeroScroll();

        // Hero pointer parallax is intentionally disabled.
        // Keeping the Hero free of pointer-driven transforms prevents
        // custom-cursor latency on GPU/CPU constrained environments.

        if (hasScrollTrigger) {
            initAbout();
            initSkills();
            initContact();
            requestAnimationFrame(() => ScrollTrigger.refresh());
        }
    }

    function initHeroEntrance() {
        const titleLetters = gsap.utils.toArray(".hero-title span");
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

        gsap.set(".hero-title", { transformPerspective: 900 });

        timeline
            .from(".hero-sub", {
                y: 28,
                opacity: 0,
                letterSpacing: "1.4em",
                duration: 0.8
            })
            .from(titleLetters, {
                opacity: 0,
                yPercent: 115,
                rotateX: -80,
                rotateZ: () => gsap.utils.random(-4, 4),
                transformOrigin: "50% 100%",
                stagger: 0.045,
                duration: 0.85
            }, "-=0.42")
            .from(".hero-text", {
                opacity: 0,
                y: 28,
                duration: 0.65
            }, "-=0.45")
            .from(".hero-buttons > *", {
                opacity: 0,
                y: 24,
                scale: 0.96,
                stagger: 0.12,
                duration: 0.55
            }, "-=0.35")
            .from(".hero-social a", {
                opacity: 0,
                x: -18,
                stagger: 0.08,
                duration: 0.45
            }, "-=0.42")
            .from(".scroll-indicator", {
                opacity: 0,
                y: 20,
                duration: 0.55
            }, "-=0.35");
    }

    function initHeroScroll() {
        if (!hasScrollTrigger) return;

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        timeline
            .to(".hero-background img", { scale: 1.2, yPercent: 7, ease: "none" }, 0)
            .to(".hero-grid", { yPercent: 18, opacity: 0.25, ease: "none" }, 0)
            .to(".hero-content", { yPercent: -28, opacity: 0, scale: 0.96, ease: "none" }, 0)
            .to(".hero-social", { y: -40, opacity: 0, ease: "none" }, 0)
            .to(".scroll-indicator", { y: 35, opacity: 0, ease: "none" }, 0)
            .to(".hero-overlay", { opacity: 0.92, ease: "none" }, 0);
    }

    function initHeroPointer() {
        const hero = document.querySelector("#hero");
        const content = document.querySelector(".hero-content");
        const image = document.querySelector(".hero-background img");
        const glow = document.querySelector(".hero-pointer-glow");
        const orbits = gsap.utils.toArray(".hero-orbit");

        if (!hero || !content || !image || !glow) return;

        const contentX = gsap.quickTo(content, "x", { duration: 0.75, ease: "power3.out" });
        const contentY = gsap.quickTo(content, "y", { duration: 0.75, ease: "power3.out" });
        const contentRotateX = gsap.quickTo(content, "rotationX", { duration: 0.75, ease: "power3.out" });
        const contentRotateY = gsap.quickTo(content, "rotationY", { duration: 0.75, ease: "power3.out" });
        const imageX = gsap.quickTo(image, "x", { duration: 1.2, ease: "power3.out" });
        const imageY = gsap.quickTo(image, "y", { duration: 1.2, ease: "power3.out" });
        const glowX = gsap.quickTo(glow, "x", { duration: 0.35, ease: "power2.out" });
        const glowY = gsap.quickTo(glow, "y", { duration: 0.35, ease: "power2.out" });

        const orbitX = orbits.map(orbit => gsap.quickTo(orbit, "x", { duration: 0.8, ease: "power3.out" }));
        const orbitY = orbits.map(orbit => gsap.quickTo(orbit, "y", { duration: 0.8, ease: "power3.out" }));
        let pointerX = 0;
        let pointerY = 0;
        let pointerFrame = 0;

        hero.addEventListener("pointermove", event => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (pointerFrame) return;

            pointerFrame = requestAnimationFrame(() => {
                pointerFrame = 0;
                const rect = hero.getBoundingClientRect();
                const x = (pointerX - rect.left) / rect.width - 0.5;
                const y = (pointerY - rect.top) / rect.height - 0.5;

                contentX(x * 18);
                contentY(y * 12);
                contentRotateX(y * -3.5);
                contentRotateY(x * 4.5);
                imageX(x * -18);
                imageY(y * -12);
                glowX(pointerX - rect.left);
                glowY(pointerY - rect.top);

                orbits.forEach((orbit, index) => {
                    orbitX[index](x * (index ? -22 : 30));
                    orbitY[index](y * (index ? -18 : 24));
                });
            });
        }, { passive: true });

        hero.addEventListener("pointerleave", () => {
            contentX(0);
            contentY(0);
            contentRotateX(0);
            contentRotateY(0);
            imageX(0);
            imageY(0);
            gsap.to(glow, { opacity: 0, duration: 0.35 });
            gsap.to(orbits, { x: 0, y: 0, duration: 0.9, ease: "power3.out" });
        });

        hero.addEventListener("pointerenter", () => {
            gsap.to(glow, { opacity: 1, duration: 0.35 });
        });
    }

    function initAbout() {
        const timeline = gsap.timeline({
            scrollTrigger: { trigger: "#about", start: "top 72%", once: true }
        });

        timeline
            .from("#about .section-title", { opacity: 0, x: -70, duration: 0.7 })
            .from(".about-image", { opacity: 0, x: 90, duration: 0.9 }, "-=0.45")
            .from(".about-text h2", { opacity: 0, y: 45, duration: 0.65 }, "-=0.65")
            .from(".about-text p", { opacity: 0, y: 24, stagger: 0.12, duration: 0.5 }, "-=0.35");
    }

    function initSkills() {
        gsap.from(".skill-card", {
            opacity: 0,
            y: 65,
            rotateY: 14,
            stagger: 0.1,
            duration: 0.75,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: "#skills", start: "top 78%", once: true }
        });
    }

    function initContact() {
        gsap.from("#contact .section-title, #contact h2, #contact p, .contact-button", {
            opacity: 0,
            y: 38,
            stagger: 0.1,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: { trigger: "#contact", start: "top 76%", once: true }
        });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        if (!hasScrollTrigger) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
    }, { passive: true });

    console.info("%cAnimation Module v1.4 Ready", "color:#00CFFF;font-weight:bold;");
})();
