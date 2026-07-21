/*==================================================
    HIIRAGI HITSUGI Official Website

    cursor.js
    Version : 0.3.0
==================================================*/

"use strict";

/*==================================================
    Cursor Elements
==================================================*/

const cursorLight = document.getElementById("cursor-light");
const cursorRing = document.getElementById("cursor-ring");
const cursorDot = document.getElementById("cursor-dot");

if (!cursorLight || !cursorRing || !cursorDot) {

    console.warn("Cursor module skipped.");

} else {

    /*==================================================
        Disable on Touch Devices
    ==================================================*/

    if (window.matchMedia("(pointer: coarse)").matches) {

        cursorLight.remove();
        cursorRing.remove();
        cursorDot.remove();

    } else {

        /*==================================================
            Position
        ==================================================*/

        const mouse = {

            x: window.innerWidth / 2,
            y: window.innerHeight / 2

        };

        const ring = {

            x: mouse.x,
            y: mouse.y

        };

        const light = {

            x: mouse.x,
            y: mouse.y

        };



        /*==================================================
            Mouse Move
        ==================================================*/

        window.addEventListener("mousemove", (event) => {

            mouse.x = event.clientX;
            mouse.y = event.clientY;

        });



        /*==================================================
            Render
        ==================================================*/

        function render() {

            ring.x += (mouse.x - ring.x) * 0.16;
            ring.y += (mouse.y - ring.y) * 0.16;

            light.x += (mouse.x - light.x) * 0.08;
            light.y += (mouse.y - light.y) * 0.08;

            cursorDot.style.left = mouse.x + "px";
            cursorDot.style.top = mouse.y + "px";

            cursorRing.style.left = ring.x + "px";
            cursorRing.style.top = ring.y + "px";

            cursorLight.style.left = light.x + "px";
            cursorLight.style.top = light.y + "px";

            requestAnimationFrame(render);

        }

        requestAnimationFrame(render);



        /*==================================================
            Hover Target
        ==================================================*/

        const hoverTargets = document.querySelectorAll(

            "a,button,.work-card,.skill-card"

        );

        hoverTargets.forEach(target => {

            target.addEventListener("mouseenter", () => {

                document.body.classList.add("cursor-hover");

            });

            target.addEventListener("mouseleave", () => {

                document.body.classList.remove("cursor-hover");

            });

        });



        /*==================================================
            Click
        ==================================================*/

        window.addEventListener("mousedown", () => {

            document.body.classList.add("cursor-click");

        });

        window.addEventListener("mouseup", () => {

            document.body.classList.remove("cursor-click");

        });



        /*==================================================
            Window Leave
        ==================================================*/

        document.addEventListener("mouseleave", () => {

            document.body.classList.add("cursor-hidden");

        });

        document.addEventListener("mouseenter", () => {

            document.body.classList.remove("cursor-hidden");

        });



        /*==================================================
            Window Blur
        ==================================================*/

        window.addEventListener("blur", () => {

            document.body.classList.add("cursor-hidden");

        });

        window.addEventListener("focus", () => {

            document.body.classList.remove("cursor-hidden");

        });



        /*==================================================
            Smooth Scale Pulse
        ==================================================*/

        let pulse = 0;

        function pulseCursor() {

            pulse += 0.02;

            const scale = 1 + Math.sin(pulse) * 0.05;

            cursorDot.style.transform =
                `translate(-50%, -50%) scale(${scale})`;

            requestAnimationFrame(pulseCursor);

        }

        requestAnimationFrame(pulseCursor);



        /*==================================================
            Debug
        ==================================================*/

        console.info(

            "%cCursor Module Loaded",

            "color:#00CFFF;font-weight:bold;"

        );

    }

}