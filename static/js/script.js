
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. Interactive score sliders
    // ==========================================

    const readingSlider = document.getElementById("reading_score");
    const writingSlider = document.getElementById("writing_score");

    const readingValue = document.getElementById("readingValue");
    const writingValue = document.getElementById("writingValue");

    function updateSlider(slider, output) {

        if (!slider || !output) {
            return;
        }

        output.textContent = slider.value;

        slider.style.setProperty(
            "--fill",
            `${slider.value}%`
        );
    }

    if (readingSlider && writingSlider) {

        updateSlider(readingSlider, readingValue);
        updateSlider(writingSlider, writingValue);

        readingSlider.addEventListener("input", () => {
            updateSlider(readingSlider, readingValue);
        });

        writingSlider.addEventListener("input", () => {
            updateSlider(writingSlider, writingValue);
        });
    }


    // ==========================================
    // 2. Prediction loading animation
    // ==========================================

    const form = document.getElementById("predictionForm");
    const predictButton = document.getElementById("predictButton");
    const buttonText = document.getElementById("buttonText");

    const spinner = document.querySelector(".spinner");
    const buttonArrow = document.querySelector(".button-arrow");

    if (form && predictButton) {

        form.addEventListener("submit", () => {

            predictButton.disabled = true;

            buttonText.textContent = "Generating Prediction...";

            spinner.hidden = false;

            buttonArrow.hidden = true;

        });
    }


    // Restore the button when returning using browser history.

    window.addEventListener("pageshow", () => {

        if (predictButton) {

            predictButton.disabled = false;

            buttonText.textContent = "Predict Mathematics Score";

            spinner.hidden = true;

            buttonArrow.hidden = false;
        }
    });


    // ==========================================
    // 3. Animated prediction result
    // ==========================================

    const resultContent = document.getElementById("resultContent");

    if (resultContent) {

        const score = Number(resultContent.dataset.score);

        const resultNumber = document.getElementById("resultNumber");

        const scoreCircle = document.getElementById("scoreCircle");

        const rangeWarning = document.getElementById("rangeWarning");

        if (!Number.isFinite(score)) {

            resultNumber.textContent = "Unavailable";

            return;
        }

        // Only limit the visual progress circle.
        // The original ML prediction is not modified.

        const visualScore = Math.max(
            0,
            Math.min(100, score)
        );

        if (score < 0 || score > 100) {

            rangeWarning.hidden = false;
        }

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reducedMotion) {

            resultNumber.textContent = score.toFixed(2);

            scoreCircle.style.setProperty(
                "--progress",
                `${visualScore}%`
            );

            return;
        }

        const duration = 1200;

        let startTime = null;

        function animateScore(timestamp) {

            if (startTime === null) {

                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentScore = score * easedProgress;

            resultNumber.textContent =
                currentScore.toFixed(2);

            scoreCircle.style.setProperty(
                "--progress",
                `${visualScore * easedProgress}%`
            );

            if (progress < 1) {

                requestAnimationFrame(animateScore);

            } else {

                resultNumber.textContent = score.toFixed(2);
            }
        }

        requestAnimationFrame(animateScore);

        if (window.innerWidth <= 900) {

            resultContent.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }

});
