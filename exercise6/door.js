
document.addEventListener("DOMContentLoaded", function () {

  const doors = document.querySelectorAll(".grid-item");
  const doorknobs = document.querySelectorAll(".doorknob");
  const clickSound = document.getElementById("clickSound");
  const special_doorframe = document.getElementById("special-doorframe");
  const special_door = document.getElementById("special-door");
  const special_animation = document.getElementById('special-animation');
  let isMouseOverDiv = false;
  
  
    doors.forEach(function (door) {
        if (door.querySelector(".doorknob")) {
          door.addEventListener("click", function () {
            this.classList.toggle("open");

            clickSound.currentTime = 0; 
            clickSound.play();

            if (door.id === "special-door" && this.classList.contains("open")) {
              setTimeout(() => {
                special_animation.style.display = "block";
              }, 400);
            } else if (door.id === "special-door" && !this.classList.contains("open")) {
              special_animation.style.display = "none";
            }

          });
          
        }
        
    });

    special_doorframe.addEventListener("mouseenter", () => {
      isMouseOverDiv = true;
      console.log("Mouse entered the div");
    });

    special_doorframe.addEventListener("mouseleave", () => {
      isMouseOverDiv = false;
      console.log("Mouse left the div");
    });

    const cursor = document.querySelector(".cursor");

    // Position cursor div to cursor position
    
    document.addEventListener("mousemove", (e) => {
      if (!isMouseOverDiv) {
        cursor.style.display = "none";
        document.body.style.cursor = "auto";
        return;
      }
      
      cursor.style.display = "block";
      document.body.style.cursor = "none";

      let x = e.clientX;
      let y = e.clientY;
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
    });

});

const special_doorframe = document.getElementById("special-doorframe");
function confetti(event) {
  let i = document.createElement("i");
  const rect = special_doorframe.getBoundingClientRect();
  i.style.left = `${event.clientX - rect.left}px`;
  i.style.top = `${event.clientY - rect.top}px`;
  const scale = `${Math.random() * 3}px`;
  i.style.transform = `scale(${scale})`;
  i.style.setProperty("--scale", getRandomScale());
  i.style.setProperty(
    "--random-color",
    randomColor({ hue: "pink"})
  );
  i.style.setProperty(`--x`, getRandomTransitionVal());
  i.style.setProperty(`--y`, getRandomTransitionVal());

  special_doorframe.appendChild(i);

  setTimeout(() => {
    special_doorframe.removeChild(i);
  }, 800);
}

function getRandomTransitionVal() {
  return `${Math.random() * 200 - 100}px`;
}

function getRandomScale() {
  return `${Math.random() * (2 - 0.5) + 0.5}`;
}

function getRandomColor() {
  const red = Math.floor(Math.random() * 250); // Random integer between 0 and 255
  const green = Math.floor(Math.random() * 120);
  const blue = Math.floor(Math.random() * 200);
  const color = `rgb(${red}, ${green}, ${blue})`;
  return color;
}

special_doorframe.addEventListener("mousemove", confetti);
