/* HIIRAGI HITSUGI — cinematic.js / Version 2.9.0 */
"use strict";

(() => {
    const SELECTOR = '.image-section';

    const ensureLight = (visual) => {
        let light = visual.querySelector('.section-visual-light');
        if (!light) {
            light = document.createElement('span');
            light.className = 'section-visual-light';
            light.setAttribute('aria-hidden', 'true');
            visual.appendChild(light);
        }
        return light;
    };

    const fallback = (sections) => {
        if (!("IntersectionObserver" in window)) {
            sections.forEach(section => {
                section.classList.add('cinematic-fallback-visible', 'cinematic-revealed');
            });
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(({ isIntersecting, target }) => {
                if (!isIntersecting) return;
                target.classList.add('cinematic-fallback-visible', 'cinematic-revealed');
                obs.unobserve(target);
            });
        }, { rootMargin: '0px 0px -18% 0px', threshold: 0.01 });

        sections.forEach(section => observer.observe(section));
    };

    const init = () => {
        const sections = [...document.querySelectorAll(SELECTOR)];
        if (!sections.length) return;

        if (!window.gsap || !window.ScrollTrigger) {
            fallback(sections);
            return;
        }

        const { gsap, ScrollTrigger } = window;
        gsap.registerPlugin(ScrollTrigger);

        const configs = {
            about: {
                curtainFrom: { scaleY: 1, scaleX: 1, transformOrigin: 'bottom center' },
                curtainTo: { scaleY: 0 },
                imageFrom: { xPercent: 7, yPercent: 2.5, scale: 1.10 },
                lightFrom: -180,
                lightTo: 720
            },
            skills: {
                curtainFrom: { scaleX: 1, scaleY: 1, transformOrigin: 'right center', skewX: -5 },
                curtainTo: { scaleX: 0, skewX: 0 },
                imageFrom: { xPercent: -7, yPercent: 2, scale: 1.085 },
                lightFrom: -190,
                lightTo: 760
            },
            works: {
                curtainFrom: { scaleY: 1, scaleX: 1, transformOrigin: 'center center' },
                curtainTo: { scaleY: 0.02 },
                imageFrom: { xPercent: 0, yPercent: 3, scale: 1.12 },
                lightFrom: -180,
                lightTo: 820
            }
        };

        sections.forEach((section) => {
            const visual = section.querySelector('.section-visual');
            const curtain = section.querySelector('.section-visual-curtain');
            const image = section.querySelector('.section-visual-image');
            const backdrop = section.querySelector('.section-visual-backdrop');
            const shade = section.querySelector('.section-visual-shade');
            const content = section.querySelector('.section-container');
            if (!visual || !curtain || !image) return;

            const light = ensureLight(visual);
            const config = configs[section.id] || configs.about;
            const finalOpacity = section.classList.contains('image-section-landscape') ? 0.9 : 1;

            gsap.set(curtain, config.curtainFrom);
            gsap.set(image, { opacity: 0, ...config.imageFrom });
            gsap.set(backdrop, { opacity: 0, scale: 1.09 });
            gsap.set(shade, { opacity: 0 });
            gsap.set(light, { opacity: 0, xPercent: config.lightFrom });
            if (content) gsap.set(content, { opacity: 0.72, y: 24 });

            const reveal = gsap.timeline({
                paused: true,
                defaults: { overwrite: 'auto' },
                onStart: () => section.classList.add('cinematic-playing'),
                onComplete: () => {
                    section.classList.remove('cinematic-playing');
                    section.classList.add('cinematic-revealed');
                    gsap.set(curtain, { display: 'none' });
                }
            });

            reveal
                .to(curtain, {
                    ...config.curtainTo,
                    duration: section.id === 'works' ? 1.25 : 1.08,
                    ease: 'power4.inOut'
                }, 0)
                .to(backdrop, {
                    opacity: 0.68,
                    scale: 1.055,
                    duration: 1.15,
                    ease: 'power2.out'
                }, 0.08)
                .to(image, {
                    opacity: finalOpacity,
                    xPercent: 0,
                    yPercent: 0,
                    scale: 1,
                    duration: 1.55,
                    ease: 'power3.out'
                }, 0.14)
                .to(shade, {
                    opacity: 1,
                    duration: 0.9,
                    ease: 'power2.out'
                }, 0.3)
                .to(content, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out'
                }, 0.38)
                .to(light, {
                    opacity: 0.82,
                    duration: 0.14,
                    ease: 'power1.out'
                }, 0.58)
                .to(light, {
                    xPercent: config.lightTo,
                    duration: 0.9,
                    ease: 'power2.inOut'
                }, 0.58)
                .to(light, {
                    opacity: 0,
                    duration: 0.22,
                    ease: 'power1.in'
                }, 1.25);

            ScrollTrigger.create({
                trigger: section,
                start: 'top 78%',
                once: true,
                onEnter: () => reveal.play(0)
            });

            // Very small post-reveal movement. It is intentionally restrained.
            gsap.fromTo(image,
                { yPercent: -1.2 },
                {
                    yPercent: 1.2,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                }
            );
        });

        requestAnimationFrame(() => ScrollTrigger.refresh());
        window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
