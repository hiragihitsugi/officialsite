/*==================================================
    HIIRAGI HITSUGI Official Website
    works.js / Version 1.2.0
==================================================*/

"use strict";

(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hasGSAP = typeof window.gsap !== "undefined";
    const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

    window.addEventListener("siteLoaded", initWorksStudio, { once: true });

    function initWorksStudio() {
        const section = document.querySelector("#works");
        if (!section) return;

        const cards = [...section.querySelectorAll(".work-card")];
        const buttons = [...section.querySelectorAll(".works-filter-button")];
        const count = section.querySelector("#works-visible-count");

        initEntrance(section, cards);
        initFilters(cards, buttons, count);

        if (finePointer && !reduceMotion) {
            cards.forEach(initCardTilt);
        }
    }

    function initEntrance(section, cards) {
        if (!hasGSAP || !hasScrollTrigger || reduceMotion) return;

        gsap.registerPlugin(ScrollTrigger);

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true
            }
        });

        timeline
            .from("#works .section-title", { opacity: 0, x: -55, duration: 0.65, ease: "power3.out" })
            .from(".works-heading", { opacity: 0, y: 48, duration: 0.8, ease: "power3.out" }, "-=0.4")
            .from(".works-intro", { opacity: 0, y: 28, duration: 0.6, ease: "power3.out" }, "-=0.48")
            .from(".works-filter-button", { opacity: 0, y: 18, stagger: 0.06, duration: 0.4 }, "-=0.3")
            .from(cards, {
                opacity: 0,
                y: 90,
                rotateX: 13,
                scale: 0.965,
                transformOrigin: "50% 100%",
                stagger: 0.12,
                duration: 0.9,
                ease: "power3.out"
            }, "-=0.12");
    }

    function initFilters(cards, buttons, count) {
        buttons.forEach(button => {
            button.addEventListener("click", () => {
                const filter = button.dataset.filter || "all";

                buttons.forEach(item => {
                    const active = item === button;
                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-pressed", String(active));
                });

                const visibleCards = cards.filter(card => {
                    const categories = (card.dataset.category || "").split(/\s+/);
                    return filter === "all" || categories.includes(filter);
                });

                if (hasGSAP && !reduceMotion) {
                    cards.forEach(card => {
                        const show = visibleCards.includes(card);

                        if (show) {
                            card.classList.remove("is-hidden");
                            gsap.fromTo(card,
                                { opacity: 0, y: 24, scale: 0.975 },
                                { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out", overwrite: true }
                            );
                        } else {
                            gsap.to(card, {
                                opacity: 0,
                                y: 16,
                                scale: 0.98,
                                duration: 0.22,
                                ease: "power2.in",
                                overwrite: true,
                                onComplete: () => card.classList.add("is-hidden")
                            });
                        }
                    });
                } else {
                    cards.forEach(card => card.classList.toggle("is-hidden", !visibleCards.includes(card)));
                }

                if (count) count.textContent = String(visibleCards.length);

                window.setTimeout(() => {
                    if (hasScrollTrigger) ScrollTrigger.refresh();
                    if (window.ScrollManager && typeof window.ScrollManager.refresh === "function") {
                        window.ScrollManager.refresh();
                    }
                }, 460);
            });
        });
    }

    function initCardTilt(card) {
        const surface = card.querySelector(".work-card-link");
        const glow = card.querySelector(".work-pointer-glow");
        if (!surface) return;

        let pointerX = 0;
        let pointerY = 0;
        let pointerFrame = 0;

        surface.addEventListener("pointermove", event => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (pointerFrame) return;

            pointerFrame = requestAnimationFrame(() => {
                pointerFrame = 0;
                const rect = surface.getBoundingClientRect();
                const x = (pointerX - rect.left) / rect.width;
                const y = (pointerY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 8;
                const rotateX = (0.5 - y) * 7;

                surface.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
                surface.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);

                if (glow) {
                    glow.style.translate = `${pointerX - rect.left}px ${pointerY - rect.top}px`;
                }
            });
        }, { passive: true });

        surface.addEventListener("pointerleave", resetTilt);
        surface.addEventListener("blur", resetTilt, true);

        function resetTilt() {
            surface.style.setProperty("--rx", "0deg");
            surface.style.setProperty("--ry", "0deg");
        }
    }

    console.info("%cWorks Studio v1.2 Ready", "color:#66F1FF;font-weight:bold;");
})();
