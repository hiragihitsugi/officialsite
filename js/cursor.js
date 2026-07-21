/*==================================================
    HIIRAGI HITSUGI Official Website
    cursor.js / Version 1.3.0
==================================================*/

"use strict";

(() => {
    const cursorLight = document.getElementById("cursor-light");
    const cursorRing = document.getElementById("cursor-ring");
    const cursorDot = document.getElementById("cursor-dot");

    if (!cursorLight || !cursorRing || !cursorDot) {
        console.warn("Cursor module skipped.");
        return;
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
        cursorLight.remove();
        cursorRing.remove();
        cursorDot.remove();
        return;
    }

    const REFERENCE_FRAME_MS = 1000 / 60;
    const MAX_FRAME_DELTA_MS = 64;
    const RING_FOLLOW_RATE = 0.16;
    const LIGHT_FOLLOW_RATE = 0.08;

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    const light = { x: mouse.x, y: mouse.y };
    let previousFrameTime = 0;

    window.addEventListener("pointermove", event => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }, { passive: true });

    function getFrameRateIndependentRate(baseRate, frameDeltaMs) {
        return 1 - Math.pow(1 - baseRate, frameDeltaMs / REFERENCE_FRAME_MS);
    }

    function setCursorPosition(element, position) {
        element.style.setProperty(
            "--cursor-position",
            `translate3d(${position.x}px, ${position.y}px, 0)`
        );
    }

    function render(frameTime) {
        const elapsedMs = previousFrameTime
            ? Math.min(frameTime - previousFrameTime, MAX_FRAME_DELTA_MS)
            : REFERENCE_FRAME_MS;
        previousFrameTime = frameTime;

        // Time-based interpolation keeps the perceived speed stable on heavier sections.
        const ringRate = getFrameRateIndependentRate(RING_FOLLOW_RATE, elapsedMs);
        const lightRate = getFrameRateIndependentRate(LIGHT_FOLLOW_RATE, elapsedMs);

        ring.x += (mouse.x - ring.x) * ringRate;
        ring.y += (mouse.y - ring.y) * ringRate;
        light.x += (mouse.x - light.x) * lightRate;
        light.y += (mouse.y - light.y) * lightRate;

        setCursorPosition(cursorDot, mouse);
        setCursorPosition(cursorRing, ring);
        setCursorPosition(cursorLight, light);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    document.addEventListener("pointerover", event => {
        if (event.target.closest("a, button, .work-card, .skill-card")) {
            document.body.classList.add("cursor-hover");
        }
    });

    document.addEventListener("pointerout", event => {
        const fromTarget = event.target.closest?.("a, button, .work-card, .skill-card");
        const toTarget = event.relatedTarget?.closest?.("a, button, .work-card, .skill-card");
        if (fromTarget && !toTarget) {
            document.body.classList.remove("cursor-hover");
        }
    });

    window.addEventListener("pointerdown", () => document.body.classList.add("cursor-click"));
    window.addEventListener("pointerup", () => document.body.classList.remove("cursor-click"));
    window.addEventListener("blur", hideCursor);
    window.addEventListener("focus", showCursor);
    document.addEventListener("visibilitychange", resetFrameTime);
    document.addEventListener("mouseleave", hideCursor);
    document.addEventListener("mouseenter", showCursor);

    function hideCursor() {
        document.body.classList.add("cursor-hidden");
    }

    function showCursor() {
        document.body.classList.remove("cursor-hidden");
    }

    function resetFrameTime() {
        previousFrameTime = 0;
    }

    console.info("%cCursor Module v1.3 Ready", "color:#00CFFF;font-weight:bold;");
})();
