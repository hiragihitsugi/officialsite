/*==================================================
    HIIRAGI HITSUGI Official Website
    cursor.js / Version 4.10.0

    Compositor-only custom cursor.
    The original visual timing is preserved while avoiding layout work.
==================================================*/

"use strict";

(() => {
    const cursorLight = document.getElementById("cursor-light");
    const cursorRing = document.getElementById("cursor-ring");
    const cursorDot = document.getElementById("cursor-dot");

    if (!cursorLight || !cursorRing || !cursorDot) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) {
        cursorLight.remove();
        cursorRing.remove();
        cursorDot.remove();
        return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    const INTERACTIVE_SELECTOR =
        "a, button, input, textarea, select, [role='button'], .work-card, .skill-card";
    const REFERENCE_FRAME_MS = 1000 / 60;
    const MAX_FRAME_DELTA_MS = 50;
    const RING_RATE = 0.16;
    const LIGHT_RATE = 0.08;

    // Cursor state is intentionally private. Hero effects must not subscribe to
    // or mutate this state, so cursor behavior stays identical on every section.
    const pointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        inside: false
    };

    const ring = { x: pointer.x, y: pointer.y };
    const light = { x: pointer.x, y: pointer.y };

    let rafId = 0;
    let previousTime = 0;
    let hoverTarget = null;
    let pointerInitialized = false;

    function latestEvent(event) {
        const events = event.getCoalescedEvents?.();
        return events?.length ? events[events.length - 1] : event;
    }

    function interpolationRate(baseRate, elapsedMs) {
        return 1 - Math.pow(1 - baseRate, elapsedMs / REFERENCE_FRAME_MS);
    }

    function setPosition(element, x, y) {
        element.style.transform =
            `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0) scale(var(--cursor-scale, 1))`;
    }

    function render(time) {
        if (document.hidden || !pointer.inside) {
            rafId = 0;
            previousTime = 0;
            return;
        }

        const elapsed = previousTime
            ? Math.min(time - previousTime, MAX_FRAME_DELTA_MS)
            : REFERENCE_FRAME_MS;
        previousTime = time;

        const ringRate = interpolationRate(RING_RATE, elapsed);
        const lightRate = interpolationRate(LIGHT_RATE, elapsed);

        ring.x += (pointer.x - ring.x) * ringRate;
        ring.y += (pointer.y - ring.y) * ringRate;
        light.x += (pointer.x - light.x) * lightRate;
        light.y += (pointer.y - light.y) * lightRate;

        setPosition(cursorDot, pointer.x, pointer.y);
        setPosition(cursorRing, ring.x, ring.y);
        setPosition(cursorLight, light.x, light.y);

        rafId = window.requestAnimationFrame(render);
    }

    function ensureLoop() {
        if (rafId || document.hidden || !pointer.inside) return;
        previousTime = 0;
        rafId = window.requestAnimationFrame(render);
    }

    function stopLoop() {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
        previousTime = 0;
    }

    function handlePointerMove(event) {
        const point = latestEvent(event);
        pointer.x = point.clientX;
        pointer.y = point.clientY;
        pointer.inside = true;

        if (!pointerInitialized) {
            pointerInitialized = true;
            ring.x = light.x = pointer.x;
            ring.y = light.y = pointer.y;
            setPosition(cursorDot, pointer.x, pointer.y);
            setPosition(cursorRing, ring.x, ring.y);
            setPosition(cursorLight, light.x, light.y);
        }

        document.body.classList.remove("cursor-hidden");
        ensureLoop();
    }

    function updateHover(target) {
        const next = target instanceof Element
            ? target.closest(INTERACTIVE_SELECTOR)
            : null;
        if (next === hoverTarget) return;
        hoverTarget = next;
        document.body.classList.toggle("cursor-hover", Boolean(next));
    }

    function hide() {
        pointer.inside = false;
        hoverTarget = null;
        document.body.classList.remove("cursor-hover", "cursor-click");
        document.body.classList.add("cursor-hidden");
        stopLoop();
    }

    function show() {
        pointer.inside = true;
        document.body.classList.remove("cursor-hidden");
        ensureLoop();
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerover", event => updateHover(event.target), { passive: true });
    document.addEventListener("pointerout", event => updateHover(event.relatedTarget), { passive: true });
    window.addEventListener("pointerdown", () => document.body.classList.add("cursor-click"), { passive: true });
    window.addEventListener("pointerup", () => document.body.classList.remove("cursor-click"), { passive: true });
    window.addEventListener("pointercancel", () => document.body.classList.remove("cursor-click"), { passive: true });
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopLoop();
        else ensureLoop();
    });
})();
