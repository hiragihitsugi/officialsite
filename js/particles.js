/*==================================================
    HIIRAGI HITSUGI Official Website

    particles.js
    Version : 0.3.0
    Part 1

==================================================*/

"use strict";

/*==================================================
    Canvas
==================================================*/

const particleLayer = document.getElementById("particles");

let canvas;
let ctx;

if (particleLayer) {

    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    particleLayer.appendChild(canvas);

}

/*==================================================
    Settings
==================================================*/

const CONFIG = {

    particleCount: 80,

    maxSpeed: 0.35,

    minRadius: 1,

    maxRadius: 3,

    color: "rgba(102,241,255,0.85)",

    devicePixelRatio: Math.min(window.devicePixelRatio, 2)

};

/*==================================================
    Size
==================================================*/

let width = 0;
let height = 0;

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * CONFIG.devicePixelRatio;
    canvas.height = height * CONFIG.devicePixelRatio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        CONFIG.devicePixelRatio,
        0,
        0,
        CONFIG.devicePixelRatio,
        0,
        0
    );

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

/*==================================================
    Particle Class
==================================================*/

class Particle {

    constructor() {

        this.reset(true);

    }

    reset(randomPosition = false) {

        this.radius =
            CONFIG.minRadius +
            Math.random() *
            (CONFIG.maxRadius - CONFIG.minRadius);

        if (randomPosition) {

            this.x = Math.random() * width;
            this.y = Math.random() * height;

        } else {

            this.x = Math.random() > 0.5 ? -20 : width + 20;
            this.y = Math.random() * height;

        }

        this.vx =
            (Math.random() - 0.5) *
            CONFIG.maxSpeed;

        this.vy =
            (Math.random() - 0.5) *
            CONFIG.maxSpeed;

        this.opacity =
            0.3 + Math.random() * 0.7;

    }

    update() {

        this.x += this.vx;
        this.y += this.vy;

        if (

            this.x < -30 ||
            this.x > width + 30 ||
            this.y < -30 ||
            this.y > height + 30

        ) {

            this.reset(false);

        }

    }

    draw() {

        ctx.beginPath();

        ctx.arc(

            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2

        );

        ctx.fillStyle =
            `rgba(102,241,255,${this.opacity})`;

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#66f1ff";

        ctx.fill();

    }

}

/*==================================================
    Particle List
==================================================*/

const particles = [];

function createParticles() {

    particles.length = 0;

    for (

        let i = 0;

        i < CONFIG.particleCount;

        i++

    ) {

        particles.push(

            new Particle()

        );

    }

}

createParticles();

/*==================================================
    Draw
==================================================*/

function drawBackground() {

    ctx.clearRect(

        0,

        0,

        width,

        height

    );

}

/*==================================================
    Update
==================================================*/

function updateParticles() {

    for (const particle of particles) {

        particle.update();

        particle.draw();

    }

}

/*==================================================
    Animation Loop
==================================================*/

function animate() {

    drawBackground();

    updateParticles();

    requestAnimationFrame(

        animate

    );

}

animate();

/*==================================================
    Debug
==================================================*/

console.info(

    "%cParticles Module Part1 Loaded",

    "color:#66f1ff;font-weight:bold;"

);

/*==================================================
    Mouse
==================================================*/

const mouse = {

    x: -9999,
    y: -9999,
    radius: 150

};

window.addEventListener("mousemove", (event) => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

});

window.addEventListener("mouseleave", () => {

    mouse.x = -9999;
    mouse.y = -9999;

});

/*==================================================
    Mouse Interaction
==================================================*/

function interactParticles() {

    for (const particle of particles) {

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;

        const distance = Math.sqrt(

            dx * dx +
            dy * dy

        );

        if (distance < mouse.radius) {

            const force =

                (mouse.radius - distance) /
                mouse.radius;

            particle.x +=
                (dx / distance) *
                force *
                3;

            particle.y +=
                (dy / distance) *
                force *
                3;

        }

    }

}

/*==================================================
    Connections
==================================================*/

function drawConnections() {

    const maxDistance = 140;

    for (

        let i = 0;

        i < particles.length;

        i++

    ) {

        for (

            let j = i + 1;

            j < particles.length;

            j++

        ) {

            const p1 = particles[i];
            const p2 = particles[j];

            const dx =

                p1.x - p2.x;

            const dy =

                p1.y - p2.y;

            const distance = Math.sqrt(

                dx * dx +
                dy * dy

            );

            if (

                distance < maxDistance

            ) {

                const alpha =

                    (1 -

                    distance /

                    maxDistance)

                    * .35;

                ctx.beginPath();

                ctx.moveTo(

                    p1.x,

                    p1.y

                );

                ctx.lineTo(

                    p2.x,

                    p2.y

                );

                ctx.strokeStyle =

                    `rgba(102,241,255,${alpha})`;

                ctx.lineWidth = 1;

                ctx.stroke();

            }

        }

    }

}

/*==================================================
    Highlight
==================================================*/

function highlightParticles() {

    for (const particle of particles) {

        const dx =

            particle.x - mouse.x;

        const dy =

            particle.y - mouse.y;

        const distance = Math.sqrt(

            dx * dx +
            dy * dy

        );

        if (

            distance < mouse.radius

        ) {

            ctx.beginPath();

            ctx.arc(

                particle.x,

                particle.y,

                particle.radius * 2,

                0,

                Math.PI * 2

            );

            ctx.fillStyle =

                "rgba(255,255,255,.15)";

            ctx.fill();

        }

    }

}

/*==================================================
    Particle Count Optimization
==================================================*/

function updateParticleCount() {

    let count = 80;

    if (width < 1600) count = 70;
    if (width < 1200) count = 60;
    if (width < 900) count = 45;
    if (width < 600) count = 30;

    CONFIG.particleCount = count;

    createParticles();

}

/*==================================================
    Resize
==================================================*/

window.addEventListener("resize", () => {

    resizeCanvas();

    updateParticleCount();

});

/*==================================================
    Visibility API
==================================================*/

let animationId = null;

function startAnimation() {

    if (!animationId) {

        animationId = requestAnimationFrame(loop);

    }

}

function stopAnimation() {

    if (animationId) {

        cancelAnimationFrame(animationId);

        animationId = null;

    }

}

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        stopAnimation();

    } else {

        startAnimation();

    }

});

/*==================================================
    Main Loop
==================================================*/

function loop() {

    animationId = requestAnimationFrame(loop);

    drawBackground();

    updateParticles();

    interactParticles();

    drawConnections();

    highlightParticles();

}

startAnimation();

/*==================================================
    Mouse Safety
==================================================*/

const originalInteractParticles = interactParticles;

interactParticles = function () {

    for (const particle of particles) {

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < mouse.radius) {

            const force = (mouse.radius - distance) / mouse.radius;

            particle.x += (dx / distance) * force * 3;
            particle.y += (dy / distance) * force * 3;

        }

    }

};

/*==================================================
    Initialize
==================================================*/

updateParticleCount();

/*==================================================
    Debug
==================================================*/

console.info(

    "%cParticles Module Loaded",

    "color:#66F1FF;font-weight:bold;"

);