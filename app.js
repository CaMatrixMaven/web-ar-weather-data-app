import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

let scene, camera, renderer, cube;
let appStarted = false;

// Camera state
let currentFacingMode = "environment";
let currentStream = null;
let videoElement = null;

// START / SWITCH CAMERA
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const video = videoElement || document.createElement("video");

  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");

  Object.assign(video.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: "0"
  });

  if (!videoElement) {
    document.body.appendChild(video);
    videoElement = video;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode }
    });

    video.srcObject = stream;
    currentStream = stream;

  } catch (err) {
    alert("Camera access error");
    console.error(err);
  }
}

// SWITCH CAMERA
function switchCamera() {
  if (!appStarted) return;

  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  console.log("Switching to:", currentFacingMode);

  startCamera();
}

// MAIN APP
async function startApp() {
  if (appStarted) {
    console.log("App already running");
    return;
  }
  appStarted = true;

  console.log("Starting camera + 3D");

  await startCamera();

  // THREE SETUP
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  Object.assign(renderer.domElement.style, {
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: "1"
  });

  document.body.appendChild(renderer.domElement);

  // tap/click to toggle cube visibility except on functional buttons 
  let cubeVisible = true;

  function isButtonTap(target) {
    return !!target.closest && !!target.closest("#start-ar, #switch-camera");
  }

  function toggleCubeVisibility() {
    if (!cube) return;
    cubeVisible = !cubeVisible;
    cube.visible = cubeVisible;
  }

  function onScreenTap(e) {
    // If the event has a target (mouse click) or changedTouches (touch):
    const target = e.target || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].target);
    if (!target) return;
    if (isButtonTap(target)) return;
    toggleCubeVisibility();
  }

  // Use click and touch fuctions so taps work on mobile
  window.addEventListener("click", onScreenTap, { passive: true });
  window.addEventListener("touchend", onScreenTap, { passive: true });
 
  // TEXTURE HELPER
  function createTextTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 512, 512);

    // CUBE BORDER (black outline)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8; // thickness of outline
    const pad = 8; // inset so stroke sits inside edge
    ctx.strokeRect(pad, pad, canvas.width - pad*2, canvas.height - pad*2);
    
    ctx.fillStyle = "black";
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }

  // PLACEHOLDER TEXTURES
  const tempTex = createTextTexture("Temp...");
  const humidityTex = createTextTexture("Humidity...");
  const coordTex = createTextTexture("Coords...");
  const locationTex = createTextTexture("Location...");
  const helloTex = createTextTexture("Dean St, Bangor, Gwynedd");

  const materials = [
    new THREE.MeshBasicMaterial({ map: humidityTex }), // +X
    new THREE.MeshBasicMaterial({ map: coordTex }),    // -X
    new THREE.MeshBasicMaterial({ map: locationTex }), // +Y
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }),  // -Y
    new THREE.MeshBasicMaterial({ map: tempTex }),     // +Z
    new THREE.MeshBasicMaterial({ map: helloTex })     // -Z 
  ];

  cube = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.40, 0.40), materials);
  scene.add(cube);

  // RENDER LOOP
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  // DATA LOAD (with fallback)
  (async () => {
    let lat = 51.5;
    let lon = -0.1;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000
        });
      });

      lat = position.coords.latitude;
      lon = position.coords.longitude;

      console.log("Got GPS:", lat, lon);

    } catch {
      console.warn("Using fallback location");
    }

    try {
      // WEATHER
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
      );
      const weatherData = await weatherRes.json();

      const temp = weatherData.current_weather.temperature;
      const humidity = weatherData.hourly.relativehumidity_2m[0];

      // LOCATION
      let locationName = "Unknown";

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const geoData = await geoRes.json();

        locationName =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          "Unknown";
      } catch {}

      // UPDATE TEXTURES
      materials[4].map = createTextTexture(`Temp ${temp}°C`);
      materials[0].map = createTextTexture(`Humidity ${humidity}%`);
      materials[1].map = createTextTexture(`Lat ${lat.toFixed(2)} Lon ${lon.toFixed(2)}`);
      materials[2].map = createTextTexture(locationName);

      // ensure updated textures render (helloTex remains unchanged)
      materials.forEach(m => m.map && (m.map.needsUpdate = true));

      console.log("Data updated");

    } catch (err) {
      console.error("Weather fetch error:", err);
    }
  })();
}

// BUTTONS
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-ar").addEventListener("click", startApp);
  document.getElementById("switch-camera").addEventListener("click", switchCamera);
});




