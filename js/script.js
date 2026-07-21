/*==================================================

HIRAGI HITSUGI Official Website
Version 0.2

==================================================*/

"use strict";

/*=========================================
Loader
=========================================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";

        setTimeout(() => {

            loader.remove();

        }, 1000);

    }, 1800);

});


/*=========================================
Lenis
=========================================*/

const lenis = new Lenis({

    duration: 1.2,

    smoothWheel: true,

    wheelMultiplier: 1

});

function raf(time){

    lenis.raf(time);

    requestAnimationFrame(raf);

}

requestAnimationFrame(raf);


/*=========================================
Mouse Light
=========================================*/

const cursor = document.getElementById("cursor-light");

window.addEventListener("mousemove",(e)=>{

    cursor.animate({

        left:e.clientX+"px",

        top:e.clientY+"px"

    },{

        duration:300,

        fill:"forwards"

    });

});


/*=========================================
GSAP
=========================================*/

gsap.registerPlugin(ScrollTrigger);


/*=========================================
Hero
=========================================*/

gsap.from(".hero-sub",{

    opacity:0,

    y:40,

    duration:1,

    delay:1.8

});

gsap.from(".hero-content h1",{

    opacity:0,

    y:80,

    duration:1.3,

    delay:2

});

gsap.from(".hero-text",{

    opacity:0,

    y:50,

    duration:1,

    delay:2.4

});

gsap.from("#explore",{

    opacity:0,

    scale:.8,

    duration:1,

    delay:2.8

});


/*=========================================
Hero Image
=========================================*/

gsap.to(".hero-background img",{

    scale:1.15,

    ease:"none",

    scrollTrigger:{

        trigger:"#hero",

        start:"top top",

        end:"bottom top",

        scrub:true

    }

});


/*=========================================
About
=========================================*/

gsap.from("#about .section-title",{

    opacity:0,

    y:80,

    scrollTrigger:{

        trigger:"#about",

        start:"top 75%"

    }

});

gsap.from("#about h2",{

    opacity:0,

    y:80,

    duration:1,

    scrollTrigger:{

        trigger:"#about",

        start:"top 70%"

    }

});

gsap.from("#about p",{

    opacity:0,

    y:50,

    duration:1,

    delay:.2,

    scrollTrigger:{

        trigger:"#about",

        start:"top 70%"

    }

});


/*=========================================
Works Cards
=========================================*/

gsap.utils.toArray(".work-card").forEach((card,index)=>{

    gsap.from(card,{

        opacity:0,

        y:120,

        duration:1,

        delay:index*.15,

        scrollTrigger:{

            trigger:card,

            start:"top 80%"

        }

    });

});


/*=========================================
Contact
=========================================*/

gsap.from("#contact h2",{

    opacity:0,

    y:80,

    duration:1,

    scrollTrigger:{

        trigger:"#contact",

        start:"top 80%"

    }

});

gsap.from("#contact p",{

    opacity:0,

    y:40,

    duration:1,

    delay:.2,

    scrollTrigger:{

        trigger:"#contact",

        start:"top 80%"

    }

});


/*=========================================
Explore Button
=========================================*/

document
.getElementById("explore")
.addEventListener("click",()=>{

    lenis.scrollTo("#about");

});


/*=========================================
Navigation
=========================================*/

document
.querySelectorAll("nav a")
.forEach(link=>{

    link.addEventListener("click",(e)=>{

        e.preventDefault();

        const target=e.target.getAttribute("href");

        lenis.scrollTo(target);

    });

});


/*=========================================
Header Background
=========================================*/

window.addEventListener("scroll",()=>{

    const header=document.querySelector("header");

    if(window.scrollY>100){

        header.style.background="rgba(3,7,18,.82)";

    }else{

        header.style.background="rgba(0,0,0,.28)";

    }

});


/*=========================================
Hero Floating
=========================================*/

gsap.to(".hero-content",{

    y:-30,

    ease:"none",

    scrollTrigger:{

        trigger:"#hero",

        start:"top top",

        end:"bottom top",

        scrub:true

    }

});


/*=========================================
Work Hover
=========================================*/

document.querySelectorAll(".work-card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;

        const y=e.clientY-rect.top;

        card.style.background=

        `radial-gradient(circle at ${x}px ${y}px,
        rgba(0,207,255,.18),
        rgba(255,255,255,.05))`;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.background="rgba(255,255,255,.05)";

    });

});


/*=========================================
Console Message
=========================================*/

console.log(
"%cHIRAGI HITSUGI Official Website",
"color:#00CFFF;font-size:18px;font-weight:bold;"
);