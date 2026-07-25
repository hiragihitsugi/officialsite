"use strict";

(() => {
    const copyText = async (id, button) => {
        const element = document.getElementById(id);
        if (!element || !button) return;

        element.focus();
        element.select();

        let copied = false;
        if (navigator.clipboard && location.protocol !== "file:") {
            try {
                await navigator.clipboard.writeText(element.value);
                copied = true;
            } catch {
                // The selected text remains available for a manual copy.
            }
        } else {
            try {
                copied = document.execCommand("copy");
            } catch {
                // The selected text remains available for a manual copy.
            }
        }

        const previousText = button.textContent;
        button.textContent = copied ? "コピーしました" : "選択しました";
        window.setTimeout(() => {
            button.textContent = previousText;
        }, 1600);
    };

    const generateConfig = () => {
        const input = document.getElementById("workerUrl");
        const output = document.getElementById("configOutput");
        if (!input || !output) return;

        const workerUrl = input.value.trim().replace(/\/$/, "");
        if (!/^https:\/\/[a-z0-9._-]+\.workers\.dev$/i.test(workerUrl)) {
            output.value = "Worker URLを https://...workers.dev の形式で入力してください。";
            return;
        }

        output.value = `window.MEDIA_CONFIG = Object.freeze({
    twitchLatestEndpoint: "${workerUrl}/latest?channel=hiragi_hitsugi"
});`;
    };

    document.querySelectorAll("[data-copy-target]").forEach(button => {
        button.addEventListener("click", () => {
            copyText(button.dataset.copyTarget, button);
        });
    });

    document.querySelector("[data-generate-config]")
        ?.addEventListener("click", generateConfig);
})();
