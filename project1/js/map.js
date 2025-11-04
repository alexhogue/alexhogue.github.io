const overlay = document.querySelector(".page-overlay");
// load the data
d3.csv("location_coordinates.csv").then((data) => {
  const width = 4000;
  const height = 2000;

  const centerLon = -54; // point of New England
  const container = document.getElementById("map-container");

  // Compute min/max of latitude and longitude
  const lonExtent = d3.extent(data, (d) => +d.lon);
  const latExtent = d3.extent(data, (d) => +d.lat);

  function wrapLon(lon, centerLon) {
    let x = lon - centerLon;
    if (x < -180) x += 360;
    if (x > 160) x -= 360;
    return x;
  }

  // Maps real-world coordinates to SVG coordinates.
  const xScale = d3
    .scaleLinear()
    .domain(lonExtent)
    .range([0, width * 0.4]);
  const yScale = d3
    .scaleLinear()
    .domain(latExtent)
    .range([height * 0.7, height * 0.1]);

  const compressLat = (lat) => {
    if (lat < 0) {
      // Compress latitudes below 0° by 40%
      return lat * 0.6;
    }
    return lat;
  };

  // Transforms each CSV row into a node object added in an array
  const nodes = data.map((d) => {
    const x0 = xScale(wrapLon(+d.lon, centerLon));
    const y0 = yScale(compressLat(+d.lat));
    return {
      name: d.name,
      img_path: d.img_path,
      x0, // target coordinates
      y0,
      x: x0, // current coordinates
      y: y0,
      r: 15, // radius (for image size & collision)
    };
  });

  const links = [
    { source: "New_England", target: "Chicago" },
    { source: "New_England", target: "Mexico" },
    { source: "New_England", target: "Ireland" },
    { source: "New_England", target: "Algeria" },
    { source: "Ireland", target: "Germany" },
    { source: "Ireland", target: "Auvergne" },
    { source: "Auvergne", target: "Portugal" },
    { source: "Auvergne", target: "Germany" },
    { source: "Auvergne", target: "Italy" },
    { source: "Auvergne", target: "Austria" },
    { source: "Algeria", target: "Egypt" },
    { source: "Egypt", target: "India" },
    { source: "Italy", target: "India" },
    { source: "Portugal", target: "Algeria" },
    { source: "Germany", target: "Austria" },
    { source: "Chicago", target: "Japan" },
    { source: "Japan", target: "Java_Indonesia" },
    { source: "Australia", target: "Java_Indonesia" },
    { source: "Chicago", target: "Pacific_NW" },
    { source: "Mexico", target: "Peru" },
    { source: "Mexico", target: "Java_Indonesia" },
    { source: "Peru", target: "Australia" },
    { source: "Peru", target: "Algeria" },
    { source: "Tasmania", target: "Australia" },
    { source: "Austria", target: "USSR" },
    { source: "Pacific_NW", target: "Alaska" },
  ];

  const nodeByName = new Map(nodes.map((d) => [d.name, d]));
  const linesData = links.map((d) => ({
    source: nodeByName.get(d.source),
    target: nodeByName.get(d.target),
  }));

  // create SVG and layers
  const svg = d3
    .select("#map")
    .attr("width", width)
    .attr("height", height)
    .attr("tabindex", 0); // main canvas
  const lineLayer = svg.append("g").attr("class", "link-layer");
  const travelLayer = svg.append("g").attr("class", "travel-layer");
  const mapLayer = svg.append("g").attr("class", "map-layer"); // top-level group for all map content
  const nodeLayer = mapLayer.append("g").attr("class", "nodes"); // group for all nodes/images

  const travelLine = document.getElementById("travel-line");

  const image = svg.selectChild("#image");

//   const { w, h } = image.node().getBoundingClientRect();
//   const { w: svgWidth, h: svgHeight } = svg
//     .node()
//     .getBoundingClientRect();
  const travelPath = travelLayer
    .append("image")
    .attr("href", "./icons/dotted-line.svg")
    .attr("x", -490)
    .attr("y", 160)
    // .attr("transform", "scale(1)")
    .attr("width", width/1.82)
    .attr("height", height/1.82)
    .lower();

  // D3 force simulation moves nodes dynamically
  const simulation = d3
    .forceSimulation(nodes)
    .force("x", d3.forceX((d) => d.x0).strength(0.2))
    .force("y", d3.forceY((d) => d.y0).strength(0.2))
    // .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
    .force("charge", d3.forceManyBody().strength(-3))
    .force(
      "collide",
      d3.forceCollide((d) => d.r + 5)
    )
    .force("charge", d3.forceManyBody().strength(-5))
    .alphaDecay(0.02)
    .on("tick", ticked);

  // create node groups
  const nodeGroup = nodeLayer
    .selectAll(".node-group")
    .data(nodes)
    .join("g")
    .attr("class", "node-group")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .style("cursor", "pointer");

  nodeGroup
    .append("image")
    .attr("id", (d) => d.name)
    .attr("class", "poster")
    .attr("href", (d) => d.img_path)
    .attr("x", (d) => -d.r * 2) // center image on the group
    .attr("y", (d) => -d.r * 2)
    .attr("width", (d) => d.r * 4)
    .attr("height", (d) => d.r * 4)
    .on("click", (event, d) => {
      console.log(".page-overlay-" + d.name);
      const posterPage = document.getElementById("page-overlay-" + d.name);
      posterPage.style.display = "block";
      posterPage.classList.add("opened");
    //   posterPage.classList.toggle("opened", !overlay.classList.contains("closed"));
      posterPage.classList.add("first-opened");
    //   overlay.classList.remove("closed");
    })

  nodeGroup.on("mouseover", (e, d) => {
        const scale = zoomTransform.k; // current zoom scale
        const adjustedR = d.r * scale;
        
        const popUpMessage = document.getElementById("pop-up-" + d.name);
        popUpMessage.classList.add("opened");
        popUpMessage.style.left = e.pageX - 5 + "px"; // offset from mouse
        popUpMessage.style.top = e.pageY - 5 + "px";
     
        const popUpMessage2 = document.getElementById("pop-up-" + d.name + "2");
        popUpMessage2.classList.add("opened");
        popUpMessage2.style.left = e.pageX + d.r * 4 + 60 + "px"; // offset from mouse
        popUpMessage2.style.top = e.pageY + d.r * 2 - 5 + "px";
        
        const popUpMessage3 = document.getElementById("pop-up-" + d.name + "3");
        popUpMessage3.classList.add("opened");
        popUpMessage3.style.left = e.pageX - 28 + "px"; // offset from mouse
        popUpMessage3.style.top = e.pageY + 36 + "px";

        const popUpMessage4 = document.getElementById("pop-up-" + d.name + "4");
        popUpMessage4.classList.add("opened");
        popUpMessage4.style.left = e.pageX + 10 + "px"; // offset from mouse
        popUpMessage4.style.top = e.pageY + 65 + "px";
    })
    .on("mouseout", (e, d) => {
        const popUpMessage = document.getElementById("pop-up-" + d.name);
        popUpMessage.classList.remove("opened");
        
        const popUpMessage2 = document.getElementById("pop-up-" + d.name + "2");
        popUpMessage2.classList.remove("opened");

        const popUpMessage3 = document.getElementById("pop-up-" + d.name + "3");
        popUpMessage3.classList.remove("opened");

        const popUpMessage4 = document.getElementById("pop-up-" + d.name + "4");
        popUpMessage4.classList.remove("opened");
    });

  // 7. Optional: draw faint lines showing anchor-to-relaxed position
  const lines = lineLayer
    .selectAll("line")
    .data(linesData)
    .join("line")
    .attr("stroke", "rgb(214, 214, 214)")
    .attr("stroke-width", 0.75);

  // 8. Simulation tick handler
  function ticked() {
    nodeGroup.attr("x", (d) => d.x - d.r).attr("y", (d) => d.y - d.r);

    lines
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

  }
  setTimeout(() => simulation.stop(), 15000);


  const regions = [
    { name: "North America", lon: [-96, -14], lat: [21, 64] },
    { name: "South America", lon: [-90, -30], lat: [-25, 21] },
    { name: "Europe", lon: [14, 118], lat: [35, 70] },
    { name: "Russia", lon: [119, 190], lat: [58, 80] },
    { name: "Africa", lon: [35, 96], lat: [-9, 28] },
    { name: "Asia", lon: [-222, -136], lat: [-2, 54] },
    { name: "Australia", lon: [110, 155], lat: [-45, -10] },
    { name: "Oceania", lon: [-185, -129], lat: [-25, -3] },
    { name: "South Asia", lon: [111, 170], lat: [14, 31] },
    // Add Antarctica, etc. if needed
  ];

  function getRegionForCenter([lon, lat]) {
    for (const region of regions) {
      if (
        lon >= region.lon[0] &&
        lon <= region.lon[1] &&
        lat >= region.lat[0] &&
        lat <= region.lat[1]
      ) {
        return region.name;
      }
    }
    return " ";
  }
  const regionLabel = document.getElementById("region-label");

  svg.on("mousemove", (event) => {
    // Get the current zoom transform from the SVG
    const currentTransform = d3.zoomTransform(svg.node());

    // Mouse position relative to SVG
    const [mouseX, mouseY] = d3.pointer(event, svg.node());

    // Invert the transform to get map coordinates
    const [mapX, mapY] = currentTransform.invert([mouseX, mouseY]);

    // Convert SVG coordinates to longitude/latitude
    const lon = xScale.invert(mapX);
    const lat = yScale.invert(mapY);

    // Determine region based on lon/lat
    const region = getRegionForCenter([lon, lat]);
    console.log(lon, lat)

    // Update label
    regionLabel.textContent = region;
  });

  let zoomTransform = d3.zoomIdentity;
  const scaleX = container.clientWidth / width;
  const scaleY = container.clientHeight / height;
  const minScale = Math.max(scaleX, scaleY) * 1.8; // not too tiny
  const maxScale = 14;

  const zoom = d3
    .zoom()
    .scaleExtent([minScale, 14]) // min/max zoom
    .translateExtent([
      [-450, 0],
      [width, height + 500],
    ])
    .on("zoom", (event) => {
      zoomTransform = event.transform;
      mapLayer.attr("transform", zoomTransform);
      lineLayer.attr("transform", zoomTransform);
      travelPath.attr("transform", zoomTransform);
    });

    let targetDX = 0;
    let targetDY = 0;

    container.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      const margin = 50; // distance from edge to start panning
      const speed = 1; // pixels per frame

      targetDX = 0;
      targetDY = 0;

      if (event.clientX - rect.left < margin) targetDX = speed;
      else if (rect.right - event.clientX < margin) targetDX = -speed;

      if (event.clientY - rect.top < margin) targetDY = speed;
      else if (rect.bottom - event.clientY < margin) targetDY = -speed;
    });

    function animatePan() {
      if (targetDX !== 0 || targetDY !== 0) {
        svg.transition().duration(20).call(zoom.translateBy, targetDX, targetDY);
      }
      requestAnimationFrame(animatePan);
    }

    requestAnimationFrame(animatePan);

  // 10. Center initial view on New England
  // Scroll container to center New England initially
  const newEngland = nodes.find((d) => d.name === "New_England");
  const initialScale = 3.4;

  const initialTransform = d3.zoomIdentity
    .translate(
      container.clientWidth / 2 - newEngland.x * initialScale,
      container.clientHeight / 2 - newEngland.y * initialScale
    )
    .scale(initialScale);
  svg.call(zoom).call(zoom.transform, initialTransform);
  // Stop simulation after settling

  const title = document.getElementById("title-area");
  title.addEventListener("click", () => {
    const openOverlays = document.querySelectorAll(".page-overlay.opened");
    for (const overlay of openOverlays) {
        if (overlay.style.display === "block") {
            overlay.style.display = "none";
            overlay.classList.remove("opened");
            //   overlay.classList.replace("opened", "closed");
            overlay.classList.remove("first-opened");
            //   overlay.classList.add("closed");
            return;
        }
    };
    svg.call(zoom).call(zoom.transform, initialTransform);
  });

  const closeIcons = document.querySelectorAll(".close-icon");
  closeIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
        const openOverlays = document.querySelectorAll(".page-overlay.opened");
        for (const overlay of openOverlays) {
            overlay.classList.remove("opened");
            overlay.classList.remove("first-opened");
            overlay.style.display = "none";
        }
    });
  });



  const nextButtons = document.querySelectorAll(".arrow");
  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      overlay.classList.remove("first-opened");
      overlay.classList.remove("opened");
    });
  });

  const compass = document.getElementById("compass");
  compass.addEventListener("click", () => {
    const aboutPage = document.getElementById("page-overlay-about");
    aboutPage.style.display = "block";
    aboutPage.classList.add("opened");
    aboutPage.classList.add("first-opened");
  });


  const regionArea = document.getElementById("region-area")
  const aboutPopup = document.getElementById("about-popup");
  setTimeout(function() {
    aboutPopup.classList.add("hidden");
    regionArea.classList.remove("hidden");
    // aboutPopup.style.display = "none";
  }, 6000)
  aboutPopup.addEventListener("mouseover", () => {
    aboutPopup.classList.remove("hidden");
    regionArea.classList.add("hidden");
  })
  aboutPopup.addEventListener("mouseout", () => {
    aboutPopup.classList.add("hidden");
    regionArea.classList.remove("hidden");
  });

  const zoomStep = 1.3;
  document.getElementById("zoom-in").addEventListener("click", () => {
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    svg.transition().duration(500).call(zoom.scaleBy, zoomStep, [cx, cy]);
  });
  document.getElementById("zoom-out").addEventListener("click", () => {
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    svg
      .transition()
      .duration(500)
      .call(zoom.scaleBy, 1 / zoomStep, [cx, cy]);
  });


  svg.node().focus();

  svg.on("keydown", function(event) {
    const panAmount = 30;
    const transform = d3.zoomTransform(svg.node());
    let newTransform = transform;

    switch (event.key) {
      case "ArrowUp":
        newTransform = transform.translate(0, panAmount);
        break;
      case "ArrowDown":
        newTransform = transform.translate(0, -panAmount);
        break;
      case "ArrowLeft":
        newTransform = transform.translate(panAmount, 0);
        break;
      case "ArrowRight":
        newTransform = transform.translate(-panAmount, 0);
        break;
      default:
        return; // ignore other keys
    }

    svg.transition().duration(250).call(zoom.transform, newTransform);
  });

});
