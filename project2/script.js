document.addEventListener("DOMContentLoaded", function () {
    const closeIcon = document.querySelector(".close-icon");
    const overlay = document.querySelector(".overlay");
    const initialOverlay = document.querySelector(".initial-overlay");
    const settingBtn = document.querySelector(".settings-button");
    const shapes = document.querySelectorAll(".shape");
    const shape1 = document.querySelector(".shape1");
    const shape2 = document.querySelector(".shape2");
    const shape3 = document.querySelector(".shape3");
    const shape4 = document.querySelector(".shape4");
    const shape5 = document.querySelector(".shape5");
    let paused = true;

    function pauseHeart() {
      paused = true;
    }

    function unpauseHeart() {
      paused = false;
    }

    closeIcon.addEventListener("click", () => {
        overlay.style.display = "none";
        unpauseHeart();
    })

    settingBtn.addEventListener("click", () => {
        overlay.style.display = "block";
        pauseHeart();
    })

    let currentDuration = 1000; 

    const pos1A = { x: 0, y: 0 };
    const pos1B = { x: 80, y: 0 };
    const pos2A = { x: 0, y: 0 };
    const pos2B = { x: 100, y: 100 };
    const pos3A = { x: 0, y: 0 };
    const pos3B = { x: 80, y: 0 };
    const pos4A = { x: 0, y: 0 };
    const pos4B = { x: 80, y: 0 };
    const pos5A = { x: 0, y: 0 };
    const pos5B = { x: 80, y: 0 };
    let toggle = false;

    function updateTransition() {
        const transitionTime = currentDuration;
        shapes.forEach((shape) => {
            shape.style.transition = `transform ${transitionTime}ms ease-in-out`;
        });
    }
    updateTransition();

    function heartbeat() {
      if (paused) return;
      toggle = !toggle;

      const pos1 = toggle ? pos1A : pos1B;
      shape1.style.transform = `translate(${pos1.x}px, ${pos1.y}px)`;

      const pos2 = toggle ? pos2A : pos2B;
      shape2.style.transform = `translate(${pos2.x}px, ${pos2.y}px)`;

      const pos3 = toggle ? pos3A : pos3B;
      shape3.style.transform = `translate(${pos3.x}px, ${pos3.y}px)`;

    }

    setInterval(heartbeat, currentDuration);




})