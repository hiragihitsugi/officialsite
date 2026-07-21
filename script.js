const btn = document.getElementById("btn");

btn.addEventListener("click", () => {

    window.scrollTo({

        top: window.innerHeight,

        behavior: "smooth"

    });

});