/*==================================================
    HIIRAGI HITSUGI Official Website
    Infinite LINKS Slider / Version 2.3.1
==================================================*/

"use strict";

(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasGSAP = typeof window.gsap !== "undefined";
    const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

    window.addEventListener("siteLoaded", initLinks, { once: true });

    function initLinks() {
        const section = document.querySelector("#works");
        const carousel = section?.querySelector("[data-links-carousel]");
        const track = section?.querySelector("[data-links-track]");
        if (!section || !carousel || !track) return;

        const originals = Array.from(track.children);
        const slideCount = originals.length;
        if (!slideCount) return;

        track.querySelectorAll("a").forEach(link => {
            link.draggable = false;
        });

        const before = originals.map(item => createClone(item));
        const after = originals.map(item => createClone(item));
        before.reverse().forEach(item => track.prepend(item));
        after.forEach(item => track.append(item));

        const progress = section.querySelector("[data-links-progress]");
        let currentIndex = 0;
        let segmentStart = 0;
        let cardStep = 0;
        let currentPosition = 0;
        let dragging = false;
        let dragMoved = false;
        let dragStartX = 0;
        let dragStartPosition = 0;
        let dragDelta = 0;
        let lastPointerX = 0;
        let lastPointerTime = 0;
        let pointerVelocity = 0;
        let animating = false;
        let animationTimer = 0;
        let resizeFrame = 0;
        let pauseUntil = performance.now() + 3000;

        function measure() {
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            const cardWidth = originals[0].getBoundingClientRect().width;
            const threeCardsWidth = (cardWidth * 3) + (gap * 2);
            const edgePeek = Math.max(0, (carousel.clientWidth - threeCardsWidth) / 2);

            cardStep = cardWidth + gap;
            segmentStart = originals[0].offsetLeft - edgePeek;
            applyPosition(currentIndex);
            updateProgress();
        }

        function positionFor(index) {
            return segmentStart + (index * cardStep);
        }

        function setTrackPosition(position) {
            currentPosition = position;
            track.style.transition = "none";
            track.style.transform = `translate3d(${-position}px, 0, 0)`;
        }

        function applyPosition(index) {
            setTrackPosition(positionFor(index));
        }

        function finishTransition(rawTarget) {
            animating = false;
            carousel.classList.remove("is-animating");

            if (rawTarget < 0 || rawTarget >= slideCount) {
                applyPosition(currentIndex);
            }

            updateProgress();
        }

        function cancelAnimation() {
            if (!animationTimer) return;
            window.clearInterval(animationTimer);
            animationTimer = 0;
        }

        function animatePosition(target, duration, onComplete) {
            cancelAnimation();
            const start = currentPosition;
            const distance = target - start;
            const startedAt = performance.now();

            if (Math.abs(distance) < .5) {
                setTrackPosition(target);
                onComplete?.();
                return;
            }

            animationTimer = window.setInterval(() => {
                const elapsed = performance.now() - startedAt;
                const progressValue = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progressValue, 4);
                setTrackPosition(start + (distance * eased));

                if (progressValue < 1) return;
                cancelAnimation();
                setTrackPosition(target);
                onComplete?.();
            }, 16);
        }

        function goTo(rawTarget, options = {}) {
            if (!cardStep || animating || dragging) return;
            const duration = options.duration ?? 560;

            currentIndex = positiveModulo(rawTarget, slideCount);
            animating = true;
            carousel.classList.add("is-animating");
            updateProgress();
            animatePosition(positionFor(rawTarget), duration, () => {
                finishTransition(rawTarget);
            });
        }

        function slide(direction) {
            goTo(currentIndex + direction);
        }

        function updateProgress() {
            if (!progress) return;
            progress.style.transform = `translateX(${(currentIndex / slideCount) * 355}%)`;
        }

        function pause(duration = 2600) {
            pauseUntil = Math.max(pauseUntil, performance.now() + duration);
        }

        function completeActiveTransition() {
            if (!animating) return;
            cancelAnimation();
            animating = false;
            carousel.classList.remove("is-animating");
        }

        carousel.addEventListener("dragstart", event => {
            event.preventDefault();
        });

        carousel.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;
            completeActiveTransition();
            dragging = true;
            dragMoved = false;
            dragDelta = 0;
            pointerVelocity = 0;
            dragStartX = event.clientX;
            dragStartPosition = currentPosition;
            lastPointerX = event.clientX;
            lastPointerTime = performance.now();
            carousel.classList.add("is-dragging");
            carousel.setPointerCapture(event.pointerId);
            pause(3800);
        });

        carousel.addEventListener("pointermove", event => {
            if (!dragging) return;
            const now = performance.now();
            const elapsed = Math.max(now - lastPointerTime, 1);
            const pointerDelta = event.clientX - lastPointerX;

            dragDelta = event.clientX - dragStartX;
            pointerVelocity = (pointerVelocity * .7) + ((pointerDelta / elapsed) * .3);
            lastPointerX = event.clientX;
            lastPointerTime = now;

            if (Math.abs(dragDelta) > 5) dragMoved = true;
            setTrackPosition(dragStartPosition - dragDelta);
        });

        function finishDrag(event) {
            if (!dragging) return;
            dragging = false;
            carousel.classList.remove("is-dragging");
            if (carousel.hasPointerCapture(event.pointerId)) {
                carousel.releasePointerCapture(event.pointerId);
            }

            const distanceThreshold = Math.min(cardStep * .14, 58);
            const velocityThreshold = .18;
            let direction = 0;

            if (dragDelta < -distanceThreshold || pointerVelocity < -velocityThreshold) {
                direction = 1;
            } else if (dragDelta > distanceThreshold || pointerVelocity > velocityThreshold) {
                direction = -1;
            }

            if (direction) {
                const nearestRawIndex = Math.round((currentPosition - segmentStart) / cardStep);
                goTo(nearestRawIndex + direction, { duration: 620 });
            } else {
                const nearestRawIndex = Math.round((currentPosition - segmentStart) / cardStep);
                currentIndex = positiveModulo(nearestRawIndex, slideCount);
                animating = true;
                carousel.classList.add("is-animating");
                animatePosition(positionFor(nearestRawIndex), 460, () => {
                    finishTransition(nearestRawIndex);
                });
            }
        }

        carousel.addEventListener("pointerup", finishDrag);
        carousel.addEventListener("pointercancel", finishDrag);

        carousel.addEventListener("click", event => {
            if (!dragMoved) return;
            event.preventDefault();
            event.stopPropagation();
            dragMoved = false;
        }, true);

        carousel.addEventListener("focusin", () => pause(4400));
        carousel.addEventListener("touchstart", () => pause(4000), { passive: true });

        section.querySelectorAll("[data-links-direction]").forEach(button => {
            button.addEventListener("click", () => {
                const direction = Number(button.dataset.linksDirection) || 1;
                slide(direction);
                pause(3200);
            });
        });

        window.addEventListener("resize", () => {
            window.cancelAnimationFrame(resizeFrame);
            resizeFrame = window.requestAnimationFrame(() => {
                completeActiveTransition();
                measure();
            });
        }, { passive: true });

        function autoAdvance() {
            if (!dragging && !animating && performance.now() >= pauseUntil) {
                slide(1);
            }
        }

        measure();
        window.setInterval(autoAdvance, 4200);
        initEntrance(section, originals);
    }

    function positiveModulo(value, divisor) {
        return ((value % divisor) + divisor) % divisor;
    }

    function createClone(item) {
        const clone = item.cloneNode(true);
        clone.dataset.carouselClone = "true";
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a, button, [tabindex]").forEach(element => {
            element.setAttribute("tabindex", "-1");
            if (element instanceof HTMLAnchorElement) element.draggable = false;
        });
        return clone;
    }

    function initEntrance(section, cards) {
        if (!hasGSAP || !hasScrollTrigger || reduceMotion) return;

        gsap.registerPlugin(ScrollTrigger);
        gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true
            }
        })
            .from("#works .section-title", { opacity: 0, x: -48, duration: .65, ease: "power3.out" })
            .from(".works-heading", { opacity: 0, y: 44, duration: .8, ease: "power3.out" }, "-=.4")
            .from(".works-intro", { opacity: 0, y: 24, duration: .6, ease: "power3.out" }, "-=.46")
            .from(".links-toolbar", { opacity: 0, y: 18, duration: .5, ease: "power3.out" }, "-=.32")
            .from(cards, {
                opacity: 0,
                y: 64,
                scale: .975,
                stagger: .09,
                duration: .78,
                ease: "power3.out"
            }, "-=.16");
    }

    console.info("%cInfinite LINKS Slider v2.3.1 Ready", "color:#66F1FF;font-weight:bold;");
})();
