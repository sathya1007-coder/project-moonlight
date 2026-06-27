(function () {

    const validPasswords = new Set([
        "27062000",
        "27/06/2000"
    ]);

    function normalize(value) {
        return value.trim();
    }

    function formatDate(value) {

        // Keep only numbers
        let digits = value.replace(/\D/g, "");

        // Maximum 8 digits
        digits = digits.substring(0, 8);

        let formatted = "";

        if (digits.length > 0) {
            formatted += digits.substring(0, 2);
        }

        if (digits.length > 2) {
            formatted += "/" + digits.substring(2, 4);
        }

        if (digits.length > 4) {
            formatted += "/" + digits.substring(4, 8);
        }

        return formatted;
    }

    function initPassword() {

        const form = Moonlight.qs("#password-form");
        const input = Moonlight.qs("#password-input");
        const message = Moonlight.qs("#password-message");

        if (!form || !input || !message) return;

        input.addEventListener("input", () => {

            const previousLength = input.value.length;

            input.value = formatDate(input.value);

            // Keep cursor at the end
            requestAnimationFrame(() => {
                input.selectionStart = input.selectionEnd = input.value.length;
            });

        });

        form.addEventListener("submit", (event) => {

            event.preventDefault();

            const value = normalize(input.value);

            const raw = value.replace(/\//g, "");

            if (validPasswords.has(value) || validPasswords.has(raw)) {

                message.textContent = "";

                input.blur();

                Moonlight.showHero();

                return;

            }

            message.textContent = "Maybe today's date knows the answer.";

            input.animate(
                [
                    { transform: "translateX(0)" },
                    { transform: "translateX(-8px)" },
                    { transform: "translateX(8px)" },
                    { transform: "translateX(0)" }
                ],
                {
                    duration: 260,
                    easing: "ease-out"
                }
            );

        });

    }

    document.addEventListener("DOMContentLoaded", initPassword);

})();