/*==================================================
    HIIRAGI HITSUGI Official Website
    navigation.js / Version 1.0.0
==================================================*/

"use strict";

(() => {
    const MOBILE_BREAKPOINT = "(max-width: 768px)";
    const header = document.querySelector("header");
    const menuButton = document.querySelector(".hamburger");
    const navigation = document.getElementById("primary-navigation");

    if (!header || !menuButton || !navigation) {
        console.warn("Navigation module skipped.");
        return;
    }

    const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT);

    function setMenuState(isOpen) {
        const shouldOpen = isOpen && mobileQuery.matches;

        header.classList.toggle("is-menu-open", shouldOpen);
        menuButton.setAttribute("aria-expanded", String(shouldOpen));
        menuButton.setAttribute("aria-label", shouldOpen ? "メニューを閉じる" : "メニューを開く");
    }

    function closeMenu() {
        setMenuState(false);
    }

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    navigation.addEventListener("click", event => {
        if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("pointerdown", event => {
        if (!header.contains(event.target)) closeMenu();
    }, { passive: true });

    document.addEventListener("keydown", event => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";

        if (event.key === "Escape" && isOpen) {
            closeMenu();
            menuButton.focus();
        }
    });

    mobileQuery.addEventListener("change", closeMenu);
})();
