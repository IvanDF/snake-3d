import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "lil-gui";
import Snake from "./src/Snake";

/**
 * Debug
 */
// const gui = new dat.GUI()

const resolution = new THREE.Vector2(10, 10);

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Cube
 */
// const material = new THREE.MeshNormalMaterial();
// const geometry = new THREE.BoxGeometry(1, 1, 1);

// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

/**
 * render sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const fov = 60;
const camera = new THREE.PerspectiveCamera(
  fov,
  sizes.width / sizes.height,
  0.1
);
camera.position.set(resolution.x / 2 + 2, 6, resolution.y / 2 + 2);
camera.lookAt(new THREE.Vector3(0, 2.5, 0));

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
});
document.body.appendChild(renderer.domElement);
handleResize();

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(resolution.x / 2, 2, resolution.y / 2);

/**
 * Three js Clock
 */
// const clock = new THREE.Clock()

/**
 * Grid
 */
const planeGeometry = new THREE.PlaneGeometry(
    resolution.x,
    resolution.y,
    resolution.x,
    resolution.y
  ),
  planeMaterial = new THREE.MeshNormalMaterial({ wireframe: true }),
  plane = new THREE.Mesh(planeGeometry, planeMaterial);

planeGeometry.rotateX(-Math.PI * 0.5);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
scene.add(plane);

// Create snake
const snake = new Snake({ scene, resolution });
console.log("🔎 [snake] =>", snake);

window.addEventListener("click", () => {
  !isRunning ? startGame() : stopGame();
});

window.addEventListener("keyup", (e) => {
  const keyCode = e.code;

  snake.setDirection(keyCode);
});

let isRunning;

const startGame = () => {
  if (!isRunning) {
    isRunning = setInterval(() => {
      snake.update();
    }, 400);
  }
};

const stopGame = () => {
  clearInterval(isRunning);
  isRunning = null;
};

const resetGame = () => {};

/**
 * frame loop
 */
function tic() {
  /**
   * tempo trascorso dal frame precedente
   */
  // const deltaTime = clock.getDelta()
  /**
   * tempo totale trascorso dall'inizio
   */
  // const time = clock.getElapsedTime()

  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(tic);
}

requestAnimationFrame(tic);

window.addEventListener("resize", handleResize);

function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
}
