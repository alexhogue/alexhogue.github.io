document.addEventListener("DOMContentLoaded", function () {
  const closeIcon = document.querySelectorAll(".close-icon");
  const initialClose = document.getElementById("inital-close-icon");
  const overlay = document.querySelector(".overlay");
  const settingBtn = document.querySelector(".settings-button");
  const shapes = document.querySelectorAll(".shape");
  const heartCalc = document.querySelector(".heart-icon");
  const ageInput = document.getElementById("age-input");
  const ageDisplay = document.getElementById("age-display");
  const activityRadios = document.querySelectorAll('input[name="activity-level"]');
  const actDisplay = document.getElementById("activity-display");
  const visualizeBtn = document.querySelector(".visualize-button");
  const rateDisplay = document.getElementById("rate-display");
  const averageBtn = document.getElementById("use-average-btn");
  const stateItems = document.querySelectorAll(".state-item");
  const aboutOverlays = document.querySelectorAll(".about-overlay");
  const stateRateDisplay = document.querySelectorAll(".current-rate-display");
  const timerDisplay = document.getElementById("timer-display");
  const pulseCountDisplay = document.getElementById("pulse-count");
  const bpmDisplay = document.getElementById("bpm-display");

  let paused = true;
  document.body.classList.add("popup-open");

  function pauseHeart() {
    paused = true;
    updateBackgroundColorTransition();
  }

  function unpauseHeart() {
    paused = false;
    updateBackgroundColorTransition();
  }

  function hideAllAboutOverlays() {
    aboutOverlays.forEach((ov) => {
        ov.style.display = "none";
        document.body.classList.remove("popup-open");
    });
  }


  window.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.keyCode === 32) {
      document.body.style.overflow = "hidden";
        if (!document.body.classList.contains("popup-open")) {
            if (paused) {
            unpauseHeart();
            } else {
            pauseHeart();
            }
        }
        e.preventDefault();
      }
   });
  
  // Pulse tracking variables
  let pulseCount = 0;
  let pulseStartTime = null;
  let lastPulseTime = null;
  let restingHeartRate = null;
  let activeHeartRate = null;
  let timerSeconds = 60;
  let timerInterval = null;
  let currentMode = "resting";
  let backgroundColorInterval = null;
  let isOriginalColor = true;

  function animateBackground() {
    if (backgroundColorInterval) {
      clearInterval(backgroundColorInterval);
    }

    if (currentMode === "active" && !paused) {
        backgroundColorInterval = setInterval(() => {
        document.body.style.backgroundColor = isOriginalColor
            ? "#FDF7ED"
            : "#efd0cf";
        isOriginalColor = !isOriginalColor;
        }, currentDuration);
    }
  }

  function stopBackgroundAnimate() {
    if (backgroundColorInterval) {
      clearInterval(backgroundColorInterval);
      backgroundColorInterval = null;
    }
    // Reset to original color when stopping
    document.body.style.backgroundColor = "#FDF7ED";
    isOriginalColor = true;
  }

  // Start/stop based on mode and pause state
  function updateBackgroundColorTransition() {
    if (currentMode === "active" && !paused) {
      animateBackground();
    } else {
      stopBackgroundAnimate();
    }
  }


  closeIcon.forEach((icon) => {
    icon.addEventListener("click", () => {
      console.log(restingHeartRate);
      if (icon.id === "inital-close-icon") {
        if (!restingHeartRate) {
          alert(
            "Please measure your heart rate or use the average (72 BPM) before closing."
          );
          return;
        }
      }

      hideAllAboutOverlays();
      document.querySelectorAll(".overlay").forEach((ov) => {
        ov.style.display = "none";
      });

      document.body.classList.remove("popup-open");
      unpauseHeart();
    });
  });




  settingBtn.addEventListener("click", () => {
    overlay.style.display = "block";
    document.body.classList.add("popup-open");
    pauseHeart();
  });

  function recordPulse() {
    const now = Date.now();

   if (!pulseStartTime) {
     pulseStartTime = now;
     timerSeconds = 60;
    //  if (timerDisplay) {
    //    timerDisplay.textContent = "0:59";
    //  }
     timerInterval = setInterval(() => {
       timerSeconds--;
       const m = Math.floor(timerSeconds / 60);
       const s = timerSeconds % 60;
       if (timerDisplay) {
         timerDisplay.textContent = `${m.toString().padStart(2, "0")}:${s
           .toString()
           .padStart(2, "0")}`;
       }

       if (timerSeconds <= 0) {
         clearInterval(timerInterval);
         timerInterval = null;

         const bpm = computeRestingHeartRate();
         if (bpm && bpmDisplay) {
           bpmDisplay.textContent = `BPM: ${bpm}`;
           bpmDisplay.style.display = "block";
         }
       }
     }, 1000);
   }
   lastPulseTime = now;
   pulseCount++;

   if (pulseCountDisplay) {
     pulseCountDisplay.textContent = `Beats: ${pulseCount}`;
   }

   // Visual feedback
   heartCalc.style.transform = "scale(1.3)";
   setTimeout(() => {
     heartCalc.style.transform = "scale(1)";
   }, 120);
  }

  // Click on heart = one beat
  heartCalc.addEventListener("click", recordPulse);
  heartCalc.addEventListener(
    "mouseover", () => {
    (heartCalc.style.transform = "scale(1.3)")
  });
  heartCalc.addEventListener("mouseout", () => {
    heartCalc.style.transform = "scale(1)";
  });

  // Spacebar = one beat (only when popup is open)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && overlay.style.display !== "none") {
      e.preventDefault();
      recordPulse();
    }
  });

  function computeRestingHeartRate() {
    if (restingHeartRate &&
      (!pulseStartTime || !lastPulseTime || pulseCount === 0)
    ) {
      console.log(restingHeartRate);
      return restingHeartRate;
    }

    // Need at least a couple of taps
    if (!pulseStartTime || !lastPulseTime || pulseCount < 10) {
      return null;
    }

    const elapsedSeconds = (lastPulseTime - pulseStartTime) / 1000;

    if (elapsedSeconds < 15) {
      // Too short to be reliable
      return null;
    }

    const bpm = Math.round((pulseCount / elapsedSeconds) * 60);
    return bpm;
  }
  

  function computeActiveHR() {
    console.log(restingHeartRate * 2);
    return restingHeartRate * 2;
  }

  ageValue = 0;

  ageInput.addEventListener("input", () => {
    ageValue = ageInput.value;
    ageDisplay.textContent = ageValue;
  });

  activityLevel = null;

  activityRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      activityLevel = radio.value; // "low", "moderate", or "high"
      actDisplay.textContent = activityLevel;
    });
  });

  ageInput.addEventListener("input", () => {
    ageValue = ageInput.value;
    ageDisplay.textContent = ageValue;
  });

  const shapesConfig = [
    {
      selector: ".shape1",
      images: {
        resting: {
          A: "./shapes_active/shape1A.png",
          B: "./shapes_active/shape1B.png",
        },
        active: {
          A: "./shapes_active/shape1A.png",
          B: "./shapes_active/shape1B.png",
        },
        stressed: {
          A: "./shapes_stressed/shape1A.png",
          B: "./shapes_stressed/shape1B.png",
        },
        sleeping: {
          A: "./shapes_sleeping/shape1A.png",
          B: "./shapes_sleeping/shape1B.png",
        },
      },
      A: {
        x: -120,
        y: 0,
        width: 389,
        height: 576,
        rotate: "-25deg",
        //   filter: "blur(50px)",
      },
      B: {
        x: 270,
        y: 300,
        width: 341,
        height: 480,
        rotate: "100deg",
        //   filter: "blur(50px)",
      },
    },
    {
      selector: ".shape2",
      images: {
        resting: {
          A: "./shapes_active/shape2A.png",
          B: "./shapes_active/shape2B.png",
        },
        active: {
          A: "./shapes_active/shape2A.png",
          B: "./shapes_active/shape2B.png",
        },
        stressed: {
          A: "./shapes_stressed/shape2A.png",
          B: "./shapes_stressed/shape2B.png",
        },
        sleeping: {
          A: "./shapes_sleeping/shape2A.png",
          B: "./shapes_sleeping/shape2B.png",
        },
      },
      A: {
        x: 270,
        y: 150,
        width: 389,
        height: 576,
        rotate: "30deg",
        //   filter: "blur(50px)",
      },
      B: {
        x: 200,
        y: 650,
        width: 341,
        height: 480,
        rotate: "120deg",
        //   filter: "blur(50px)",
      },
    },
    {
      selector: ".shape3",
      svgA: "./shapes_active/shape3A.png",
      svgB: "./shapes_active/shape3B.png",
      A: {
        x: -200,
        y: 500,
        width: 535,
        height: 709,
        rotate: "31deg",
        //   filter: "blur(50px)",
      },
      B: {
        x: -200,
        y: 200,
        width: 635,
        height: 772,
        rotate: "136deg",
        //   filter: "blur(50px)",
      },
    },
    {
      selector: ".shape4",
      svgA: "./shapes_active/shape4A.png",
      svgB: "./shapes_active/shape4A.png",
      A: {
        x: 170,
        y: 470,
        width: 225,
        height: 221,
        rotate: "220deg",
        //   filter: "blur(50px)",
      },
      B: {
        x: 140,
        y: 100,
        width: 205,
        height: 201,
        rotate: "100deg",
        //   filter: "blur(50px)",
      },
    },
    {
      selector: ".shape5",
      svgA: "./shapes_active/shape5A.png",
      svgB: "./shapes_active/shape5B.png",
      A: {
        x: -140,
        y: 200,
        width: 160,
        height: 165,
        rotate: "0deg",
        //   filter: "blur(50px)",
      },
      B: {
        x: 0,
        y: 650,
        width: 200,
        height: 200,
        rotate: "-50deg",
        //   filter: "blur(50px)",
      },
    },
    // add shape3, shape4, shape5 the same way
  ];

  shapesConfig.forEach((cfg) => {
    const el = document.querySelector(cfg.selector);

    el.style.position = "absolute";
    el.style.transition =
      "transform 600ms ease, width 600ms ease, height 600ms ease, filter 600ms ease";

    let imgA_src, imgB_src;

    if (cfg.images && cfg.images[currentMode]) {
      // New format: use images object
      const stateImages = cfg.images[currentMode];
      imgA_src = stateImages.A;
      imgB_src = stateImages.B;
    } else if (cfg.images && cfg.images.resting) {
      // Fallback to resting if currentMode doesn't exist
      const stateImages = cfg.images.resting;
      imgA_src = stateImages.A;
      imgB_src = stateImages.B;
    } else if (cfg.svgA && cfg.svgB) {
      // Old format fallback
      imgA_src = cfg.svgA;
      imgB_src = cfg.svgB;
    } else {
      console.error(`No images found for ${cfg.selector}`);
      return; // Skip this shape if no images at all
    }

    el.innerHTML = `
            <img class="shape-img imgA" src="${imgA_src}">
            <img class="shape-img imgB" src="${imgB_src}">
        `;

    const imgA = el.querySelector(".imgA");
    const imgB = el.querySelector(".imgB");

    imgA.style.position = "absolute";
    imgA.style.inset = "0";
    imgA.style.transition = "opacity 600ms ease";
    imgA.style.opacity = "1";

    imgB.style.position = "absolute";
    imgB.style.inset = "0";
    imgB.style.transition = "opacity 600ms ease";
    imgB.style.opacity = "0";

    cfg.el = el;
    cfg.imgA = imgA;
    cfg.imgB = imgB;
  });

  function updateShapeImagesForMode(mode) {
    // Validate mode
    const validModes = ["resting", "active", "stressed", "sleeping"];
    if (!validModes.includes(mode)) {
      console.warn(`Invalid mode: ${mode}. Using "resting" instead.`);
      mode = "resting";
    }

    shapesConfig.forEach((cfg) => {
        if (!cfg.images) {
          return; // Skip shapes that don't have images object
        }
      const stateImages = cfg.images[mode];

      if (stateImages && cfg.imgA && cfg.imgB) {
        cfg.imgA.src = stateImages.A;
        cfg.imgB.src = stateImages.B;
      }
    });
  }

  let currentDuration = 1000;
  let restingSpeed = currentDuration;
  let activeSpeed = currentDuration;
  let toggle = false;

  let heartbeatInterval = setInterval(heartbeat, currentDuration);

  function updateTransition() {
    const transitionTime = currentDuration;
    shapes.forEach((shape) => {
      shape.style.transition = `transform ${transitionTime}ms ease-in-out`;
    });
  }
  updateTransition();

  function updateHeartbeatSpeed(bpm) {
    // Convert BPM → ms per beat, and clamp so it never gets crazy fast/slow
    restingSpeed = Math.max(300, Math.min(2000, Math.round(60000 / bpm)));
    activeSpeed = restingSpeed * .5;
    activeHeartRate = Math.round(60000 / activeSpeed);

    if (currentMode === "resting") {
        console.log(currentMode);
        currentDuration = restingSpeed;

    } else if (currentMode === "active") {
        currentDuration = activeSpeed;
        console.log(currentMode);
    }

    clearInterval(heartbeatInterval);
    updateTransition();
    heartbeatInterval = setInterval(heartbeat, currentDuration);
  }
  

  function heartbeat() {
    if (paused) return;
    toggle = !toggle;

    shapesConfig.forEach((cfg) => {
      const state = toggle ? cfg.A : cfg.B;

      // movement / scale / rotate / blur
      const rotateValue = state.rotate || "0deg";
      cfg.el.style.transform = `
      translate(${state.x}px, ${state.y}px)
      rotate(${rotateValue})
    `;

      cfg.el.style.width = state.width + "px";
      cfg.el.style.height = state.height + "px";
      cfg.el.style.filter = state.filter;
      

      // color / gradient crossfade
      cfg.imgA.style.opacity = toggle ? "1" : "0";
      cfg.imgB.style.opacity = toggle ? "0" : "1";

      
    });
  }

  averageBtn.addEventListener("click", () => {
    const bpm = 72;
    restingHeartRate = bpm;
    restingHeartRate = 72;
    document.body.classList.remove("popup-open");

    // Show BPM in sidebar and popup
    if (rateDisplay) {
      rateDisplay.textContent = restingHeartRate;
    }
    if (bpmDisplay) {
      bpmDisplay.textContent = `BPM: ${restingHeartRate}`;
      bpmDisplay.style.display = "block";
    }

    // Update the rateSpan in the resting state item immediately
    const restingStateItem = document.querySelector(
      '.state-item[data-state="resting"]'
    );
    if (restingStateItem) {
      const restingRateDisplay = restingStateItem.querySelector(
        ".current-rate-display"
      );
      if (restingRateDisplay) {
        const rateSpan = restingRateDisplay.querySelector(
          "#state-rate-display"
        );
        if (rateSpan) {
          rateSpan.textContent = restingHeartRate;
          restingRateDisplay.style.display = "flex";
          restingRateDisplay.classList.add("active");
        }
      }
    }

    // Reset manual pulse UI
    pulseCount = 0;
    pulseStartTime = null;
    lastPulseTime = null;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerDisplay) {
      timerDisplay.textContent = "00:00";
    }
    if (pulseCountDisplay) {
      pulseCountDisplay.textContent = "Beats: 0";
    }

    // Set heartbeat speed to 72 BPM
    updateHeartbeatSpeed(restingHeartRate);

    // Close popup and start animation
    overlay.style.display = "none";
    document.body.classList.remove("popup-open");
    unpauseHeart();
  });

  visualizeBtn.addEventListener("click", () => {
    const bpm = computeRestingHeartRate();

    if (!bpm) {
      alert(
        "Click the heart icon for about one minute so we can estimate your resting heart rate."
      );
      return;
    }

    restingHeartRate = bpm;

    if (rateDisplay) {
      rateDisplay.textContent = bpm;
    } 
    if (bpmDisplay) {
      bpmDisplay.textContent = `BPM: ${bpm}`;
      bpmDisplay.style.display = "block";
    }

    // Match visual heartbeat speed to measured BPM
    updateHeartbeatSpeed(bpm);

    // Close popup, unblur background, start animation
    overlay.style.display = "none";
    document.body.classList.remove("popup-open");
    unpauseHeart();
  });

  stateItems.forEach((item) => {
    item.addEventListener("click", () => {
      const state = item.dataset.state; // "resting", "active", etc.
      const overlayId = `${state}-overlay`; // e.g. "resting-overlay"
      const overlayEl = document.getElementById(overlayId);
      currentMode = state;
      unpauseHeart();

      updateBackgroundColorTransition();

      if (item.classList.contains("active")) {
        pauseHeart();
        hideAllAboutOverlays();
        console.log(overlayEl);
        overlayEl.style.display = "block";
        document.body.classList.add("popup-open"); // blur background if you want
        return;
      }

      updateShapeImagesForMode(state);

      stateRateDisplay.forEach((item2) => {
        item2.classList.remove("active");
        item2.style.display = "none";
      });

      // Remove active class from all state items
      stateItems.forEach((i) => i.classList.remove("active"));
      // Add active class to clicked item
      item.classList.add("active");
      console.log(activeHeartRate);
      console.log(restingHeartRate);
      const clickedRateDisplay = item.querySelector(".current-rate-display");
      if (clickedRateDisplay) {
        clickedRateDisplay.classList.add("active");
        clickedRateDisplay.style.display = "flex";
        const rateSpan = clickedRateDisplay.querySelector(
          "#state-rate-display"
        );
        if (currentMode === "active" && activeHeartRate) {
          rateSpan.textContent = activeHeartRate;
          console.log(activeHeartRate);
        } else if (currentMode === "resting" && restingHeartRate) {
          rateSpan.textContent = restingHeartRate;
        }
      }

      if (restingHeartRate) {
        updateHeartbeatSpeed(restingHeartRate);
      }

      if (!overlayEl) return;
    });
  });


})