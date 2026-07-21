/*==================================================
    HIIRAGI HITSUGI Official Website

    animation.js
    Version : 0.3.0

==================================================*/

"use strict";

/*==================================================
    GSAP
==================================================*/

gsap.registerPlugin(ScrollTrigger);



/*==================================================
    Wait Loader
==================================================*/

window.addEventListener("siteLoaded",()=>{

    initHero();

    initAbout();

    initSkills();

    initWorks();

    initContact();

});



/*==================================================
    Hero
==================================================*/

function initHero(){

    const tl = gsap.timeline({

        defaults:{

            ease:"power3.out"

        }

    });

    tl.from(

        ".hero-sub",

        {

            y:40,

            opacity:0,

            duration:.8

        }

    );



    tl.from(

        ".hero-title span",

        {

            opacity:0,

            y:100,

            rotateX:90,

            stagger:.05,

            duration:.7

        },

        "-=.35"

    );



    tl.from(

        ".hero-text",

        {

            opacity:0,

            y:40,

            duration:.7

        },

        "-=.45"

    );



    tl.from(

        ".hero-buttons>*",

        {

            opacity:0,

            y:30,

            stagger:.15,

            duration:.6

        },

        "-=.35"

    );



    tl.from(

        ".hero-social a",

        {

            opacity:0,

            x:-30,

            stagger:.08,

            duration:.5

        },

        "-=.45"

    );

}



/*==================================================
    Hero Parallax
==================================================*/

gsap.to(

    ".hero-background img",

    {

        scale:1.2,

        ease:"none",

        scrollTrigger:{

            trigger:"#hero",

            start:"top top",

            end:"bottom top",

            scrub:true

        }

    }

);



gsap.to(

    ".hero-content",

    {

        y:-120,

        ease:"none",

        scrollTrigger:{

            trigger:"#hero",

            start:"top top",

            end:"bottom top",

            scrub:true

        }

    }

);



/*==================================================
    About
==================================================*/

function initAbout(){

    const tl = gsap.timeline({

        scrollTrigger:{

            trigger:"#about",

            start:"top 70%"

        }

    });



    tl.from(

        "#about .section-title",

        {

            opacity:0,

            x:-80,

            duration:.7

        }

    );



    tl.from(

        ".about-image",

        {

            opacity:0,

            x:120,

            duration:1

        },

        "-=.5"

    );



    tl.from(

        ".about-text h2",

        {

            opacity:0,

            y:60,

            duration:.7

        },

        "-=.8"

    );



    tl.from(

        ".about-text p",

        {

            opacity:0,

            y:30,

            stagger:.15,

            duration:.5

        },

        "-=.4"

    );

}



/*==================================================
    Skills
==================================================*/

function initSkills(){

    gsap.from(

        ".skill-card",

        {

            opacity:0,

            y:80,

            rotateY:20,

            stagger:.12,

            duration:.8,

            ease:"back.out(1.7)",

            scrollTrigger:{

                trigger:"#skills",

                start:"top 75%"

            }

        }

    );

}



/*==================================================
    Works
==================================================*/

function initWorks(){

    gsap.utils

    .toArray(".work-card")

    .forEach((card,index)=>{

        gsap.from(

            card,

            {

                opacity:0,

                y:120,

                rotateX:30,

                scale:.9,

                duration:.8,

                delay:index*.12,

                ease:"power3.out",

                scrollTrigger:{

                    trigger:card,

                    start:"top 85%"

                }

            }

        );

    });

}



/*==================================================
    Contact
==================================================*/

function initContact(){

    gsap.from(

        "#contact .section-title",

        {

            opacity:0,

            y:50,

            scrollTrigger:{

                trigger:"#contact",

                start:"top 75%"

            }

        }

    );



    gsap.from(

        "#contact h2",

        {

            opacity:0,

            y:60,

            duration:.8,

            scrollTrigger:{

                trigger:"#contact",

                start:"top 75%"

            }

        }

    );



    gsap.from(

        "#contact p",

        {

            opacity:0,

            y:40,

            delay:.2,

            duration:.6,

            scrollTrigger:{

                trigger:"#contact",

                start:"top 75%"

            }

        }

    );



    gsap.from(

        ".contact-button",

        {

            opacity:0,

            scale:.8,

            delay:.3,

            duration:.6,

            scrollTrigger:{

                trigger:"#contact",

                start:"top 75%"

            }

        }

    );

}



/*==================================================
    Refresh
==================================================*/

window.addEventListener(

    "resize",

    ()=>{

        ScrollTrigger.refresh();

    }

);



/*==================================================
    Debug
==================================================*/

console.info(

    "%cAnimation Module Loaded",

    "color:#00CFFF;font-weight:bold;"

);