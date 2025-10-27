const overlay = document.querySelector(".page-overlay");
// load the data
d3.csv("location_coordinates.csv").then((data) => {
  const width = 4000;
  const height = 2000;

  const centerLon = -64; // point of New England
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
  const svg = d3.select("#map").attr("width", width).attr("height", height); // main canvas
  const lineLayer = svg.append("g").attr("class", "link-layer");
  const mapLayer = svg.append("g").attr("class", "map-layer"); // top-level group for all map content
  const nodeLayer = mapLayer.append("g").attr("class", "nodes"); // group for all nodes/images


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
    })
    .on("mouseover", (e, d) => {
        const popUpMessage = document.getElementById("pop-up-" + d.name);
        popUpMessage.classList.add("opened");
        popUpMessage.style.left = e.pageX + 5 + "px"; // offset from mouse
        popUpMessage.style.top = e.pageY + 5 + "px";
        console.log(d.name + " hovered");
    })
    .on("mouseout", (e, d) => {
        const popUpMessage = document.getElementById("pop-up-" + d.name);
        popUpMessage.classList.remove("opened");
    });

  // 7. Optional: draw faint lines showing anchor-to-relaxed position
  const lines = lineLayer
    .selectAll("line")
    .data(linesData)
    .join("line")
    .attr("stroke", "rgb(214, 214, 214)")
    .attr("stroke-width", .75);

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

  let zoomTransform = d3.zoomIdentity;

  const zoom = d3
    .zoom()
    .scaleExtent([1, 12]) // min/max zoom
    .translateExtent([
      [-400, 0],
      [width - 300, height + 300],
    ])
    .on("zoom", (event) => {
      zoomTransform = event.transform;
      mapLayer.attr("transform", zoomTransform);
      lineLayer.attr("transform", zoomTransform);
    });

//   let targetDX = 0;
//   let targetDY = 0;

//   container.addEventListener("mousemove", (event) => {
//     const rect = container.getBoundingClientRect();
//     const margin = 100; // distance from edge to start panning
//     const speed = 3; // pixels per frame

//     targetDX = 0;
//     targetDY = 0;

//     if (event.clientX - rect.left < margin) targetDX = speed;
//     else if (rect.right - event.clientX < margin) targetDX = -speed;

//     if (event.clientY - rect.top < margin) targetDY = speed;
//     else if (rect.bottom - event.clientY < margin) targetDY = -speed;
//   });

//   function animatePan() {
//     if (targetDX !== 0 || targetDY !== 0) {
//       svg.transition().duration(20).call(zoom.translateBy, targetDX, targetDY);
//     }
//     requestAnimationFrame(animatePan);
//   }

//   requestAnimationFrame(animatePan);

  // 10. Center initial view on New England
  // Scroll container to center New England initially
  const newEngland = nodes.find((d) => d.name === "New_England");
  const initialScale = 5;
  const initialTransform = d3.zoomIdentity
    .translate(
      container.clientWidth / 2.15 - newEngland.x * initialScale,
      container.clientHeight / 2.5 - newEngland.y * initialScale
    )
    .scale(initialScale);
  svg.call(zoom).call(zoom.transform, initialTransform);
  // Stop simulation after settling

  const title = document.getElementById("title-area");
  
  title.addEventListener("click", () => {
    const openOverlays = document.querySelectorAll(".page-overlay.opened");
    openOverlays.forEach((overlay) => {
    overlay.style.display = "none";
    overlay.classList.remove("opened");
    })
  });

  
});
