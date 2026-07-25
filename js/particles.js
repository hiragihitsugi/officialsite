/*==================================================
    HIIRAGI HITSUGI Official Website
    particles.js / Version 4.10.0

    Hero geometry animation is retained but disabled by configuration.
    Set GEOMETRY_ANIMATION_ENABLED to true to restore it.
==================================================*/

"use strict";

(() => {
    // Feature switches: implementation is retained for later reuse.
    // Restore the geometry itself by changing the first value to true.
    // Pointer interaction stays disabled unless explicitly enabled separately.
    const GEOMETRY_ANIMATION_ENABLED = false;
    const GEOMETRY_POINTER_INTERACTION_ENABLED = false;

    const particleLayer = document.getElementById("particles");
    if (!particleLayer) return;

    if (!GEOMETRY_ANIMATION_ENABLED) {
        particleLayer.hidden = true;
        particleLayer.setAttribute("data-animation-enabled", "false");
        return;
    }

    particleLayer.hidden = false;
    particleLayer.setAttribute("data-animation-enabled", "true");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;
    particleLayer.appendChild(canvas);

    const CONFIG = Object.freeze({
        maxSpeed: 0.35,
        minRadius: 1,
        maxRadius: 3,
        interactionRadius: 150,
        interactionStrength: 3,
        connectionDistance: 140,
        connectionOpacity: 0.35,
        maxDevicePixelRatio: 2,
        glowRadius: 12,
        lineBuckets: 12
    });

    const BASE_FRAME_MS = 1000 / 60;
    const state = {
        width: 1,
        height: 1,
        dpr: 1,
        particles: [],
        spriteCache: new Map(),
        rafId: 0,
        resizeRafId: 0,
        previousTime: 0,
        visible: true
    };

    // Geometry uses its own optional pointer state and never shares the custom
    // cursor's coordinates. This keeps Hero cursor behavior equal to other pages.
    const pointer = {
        x: -9999,
        y: -9999,
        inside: false,
        active: false
    };

    if (GEOMETRY_POINTER_INTERACTION_ENABLED) {
        window.addEventListener("pointermove", event => {
            const events = event.getCoalescedEvents?.();
            const point = events?.length ? events[events.length - 1] : event;
            pointer.x = point.clientX;
            pointer.y = point.clientY;
            pointer.inside = true;
            pointer.active = true;
        }, { passive: true });
        document.documentElement.addEventListener("mouseleave", () => {
            pointer.inside = false;
            pointer.active = false;
        });
    }

    class Particle {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.radius = 1;
            this.opacity = 1;
            this.spriteKey = "";
            this.reset(true);
        }

        reset(randomPosition = false) {
            this.radius = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
            this.spriteKey = this.radius.toFixed(1);
            this.opacity = 0.3 + Math.random() * 0.7;

            if (randomPosition) {
                this.x = Math.random() * state.width;
                this.y = Math.random() * state.height;
            } else {
                this.x = Math.random() > 0.5 ? -20 : state.width + 20;
                this.y = Math.random() * state.height;
            }

            this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed;
            this.vy = (Math.random() - 0.5) * CONFIG.maxSpeed;
        }

        update(step) {
            // The former source advanced particles in two simultaneous loops.
            // Multiplying velocity by two preserves that exact perceived speed,
            // while rendering only once per display frame.
            this.x += this.vx * step * 2;
            this.y += this.vy * step * 2;

            if (
                this.x < -30 || this.x > state.width + 30 ||
                this.y < -30 || this.y > state.height + 30
            ) {
                this.reset(false);
            }
        }
    }

    function particleCount() {
        if (state.width < 600) return 30;
        if (state.width < 900) return 45;
        if (state.width < 1200) return 60;
        if (state.width < 1600) return 70;
        return 80;
    }

    function syncParticles() {
        const target = particleCount();
        while (state.particles.length < target) state.particles.push(new Particle());
        if (state.particles.length > target) state.particles.length = target;
    }

    function createSprite(radius) {
        const glow = CONFIG.glowRadius;
        const size = Math.ceil((radius + glow) * 2);
        const sprite = document.createElement("canvas");
        const spriteCtx = sprite.getContext("2d", { alpha: true });
        const scale = Math.min(state.dpr, 2);

        sprite.width = Math.ceil(size * scale);
        sprite.height = Math.ceil(size * scale);
        spriteCtx.scale(scale, scale);

        const center = size / 2;
        const gradient = spriteCtx.createRadialGradient(
            center, center, 0,
            center, center, radius + glow
        );
        const coreStop = Math.min(radius / (radius + glow), 0.28);
        gradient.addColorStop(0, "rgba(102,241,255,1)");
        gradient.addColorStop(coreStop, "rgba(102,241,255,.98)");
        gradient.addColorStop(.48, "rgba(102,241,255,.24)");
        gradient.addColorStop(1, "rgba(102,241,255,0)");
        spriteCtx.fillStyle = gradient;
        spriteCtx.fillRect(0, 0, size, size);
        return { canvas: sprite, size };
    }

    function spriteFor(key) {
        let sprite = state.spriteCache.get(key);
        if (!sprite) {
            sprite = createSprite(Number(key));
            state.spriteCache.set(key, sprite);
        }
        return sprite;
    }

    function resize() {
        state.resizeRafId = 0;
        const bounds = particleLayer.getBoundingClientRect();
        state.width = Math.max(1, Math.round(bounds.width || window.innerWidth));
        state.height = Math.max(1, Math.round(bounds.height || window.innerHeight));
        state.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);

        canvas.width = Math.round(state.width * state.dpr);
        canvas.height = Math.round(state.height * state.dpr);
        canvas.style.width = `${state.width}px`;
        canvas.style.height = `${state.height}px`;
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

        state.spriteCache.clear();
        syncParticles();
    }

    function scheduleResize() {
        if (state.resizeRafId) return;
        state.resizeRafId = window.requestAnimationFrame(resize);
    }

    function interact(particle, step) {
        if (!GEOMETRY_POINTER_INTERACTION_ENABLED || !pointer.active || !pointer.inside) return;
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distanceSq = dx * dx + dy * dy;
        const radiusSq = CONFIG.interactionRadius * CONFIG.interactionRadius;
        if (distanceSq <= 0 || distanceSq >= radiusSq) return;

        const distance = Math.sqrt(distanceSq);
        const force = (CONFIG.interactionRadius - distance) / CONFIG.interactionRadius;
        const amount = force * CONFIG.interactionStrength * step / distance;
        particle.x += dx * amount;
        particle.y += dy * amount;
    }

    function update(step) {
        for (const particle of state.particles) {
            particle.update(step);
            interact(particle, step);
        }
    }

    function drawParticles() {
        for (const particle of state.particles) {
            const sprite = spriteFor(particle.spriteKey);
            const half = sprite.size / 2;
            ctx.globalAlpha = particle.opacity;
            ctx.drawImage(
                sprite.canvas,
                particle.x - half,
                particle.y - half,
                sprite.size,
                sprite.size
            );
        }
        ctx.globalAlpha = 1;
    }

    function drawConnections() {
        const buckets = Array.from({ length: CONFIG.lineBuckets }, () => new Path2D());
        const used = new Uint8Array(CONFIG.lineBuckets);
        const maxDistanceSq = CONFIG.connectionDistance * CONFIG.connectionDistance;
        const particles = state.particles;

        for (let i = 0; i < particles.length - 1; i += 1) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j += 1) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distanceSq = dx * dx + dy * dy;
                if (distanceSq >= maxDistanceSq) continue;

                const normalized = 1 - Math.sqrt(distanceSq) / CONFIG.connectionDistance;
                const bucket = Math.min(
                    CONFIG.lineBuckets - 1,
                    Math.floor(normalized * CONFIG.lineBuckets)
                );
                buckets[bucket].moveTo(a.x, a.y);
                buckets[bucket].lineTo(b.x, b.y);
                used[bucket] = 1;
            }
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#66f1ff";
        for (let i = 0; i < CONFIG.lineBuckets; i += 1) {
            if (!used[i]) continue;
            ctx.globalAlpha = ((i + .5) / CONFIG.lineBuckets) * CONFIG.connectionOpacity;
            ctx.stroke(buckets[i]);
        }
        ctx.globalAlpha = 1;
    }

    function drawHighlights() {
        if (!GEOMETRY_POINTER_INTERACTION_ENABLED || !pointer.active || !pointer.inside) return;
        const radiusSq = CONFIG.interactionRadius * CONFIG.interactionRadius;
        let hasPath = false;
        ctx.beginPath();

        for (const particle of state.particles) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            if (dx * dx + dy * dy >= radiusSq) continue;
            ctx.moveTo(particle.x + particle.radius * 2, particle.y);
            ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
            hasPath = true;
        }

        if (hasPath) {
            ctx.globalAlpha = .15;
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function render(time) {
        state.rafId = 0;
        if (!state.visible || document.hidden) {
            state.previousTime = 0;
            return;
        }

        const elapsed = state.previousTime
            ? Math.min(time - state.previousTime, 50)
            : BASE_FRAME_MS;
        state.previousTime = time;
        const step = elapsed / BASE_FRAME_MS;

        ctx.clearRect(0, 0, state.width, state.height);
        update(step);
        drawParticles();
        drawConnections();
        drawHighlights();
        start();
    }

    function start() {
        if (state.rafId || !state.visible || document.hidden) return;
        state.rafId = window.requestAnimationFrame(render);
    }

    function stop() {
        if (state.rafId) window.cancelAnimationFrame(state.rafId);
        state.rafId = 0;
        state.previousTime = 0;
    }

    const observer = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            state.visible = entries[0]?.isIntersecting ?? true;
            if (state.visible) start();
            else stop();
        }, { rootMargin: "120px 0px" })
        : null;

    observer?.observe(particleLayer);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });
    window.addEventListener("resize", scheduleResize, { passive: true });

    resize();
    start();
})();
