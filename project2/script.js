document.addEventListener("DOMContentLoaded", function () {
    const closeIcon = document.querySelector(".close-icon");
    const overlay = document.querySelector(".overlay");
    const settingBtn = document.querySelector(".settings-button");
    const shapes = document.querySelectorAll(".shape")

    closeIcon.addEventListener("click", () => {
        overlay.style.display = "none";
    })

    settingBtn.addEventListener("click", () => {
        overlay.style.display = "block";
    })

    let currentDuration = 1000; 
    
    const pos1A = { x: 0, y: 0 };
    const pos1B = { x: 80, y: 0 };
    const pos2A = { x: 0, y: 0 };
    const pos2B = { x: 80, y: 0 };
    const pos3A = { x: 0, y: 0 };
    const pos3B = { x: 80, y: 0 };
    const pos4A = { x: 0, y: 0 };
    const pos4B = { x: 80, y: 0 };
    const pos5A = { x: 0, y: 0 };
    const pos5B = { x: 80, y: 0 };
    let toggle = false;

    function updateTransition() {
        const transitionTime = currentDuration;
        shapes.forEach((shape, index) => {
            shape.style.transition = `transform ${transitionTime}ms ease-in-out`;
        });
    }
    updateTransition();

    function heartbeat() {
      toggle = !toggle;
      shapes.forEach((shape, index) => {
        const pos = toggle ? pos1A : pos1B;
        shape.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      });
    }

    setInterval(heartbeat, currentDuration);



})