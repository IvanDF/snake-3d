import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Candy from "./src/Candy";
import Rock from "./src/Rock";
import Snake from "./src/Snake";
import "./style.css";
import Tree from "./src/Tree";

/**
 * Debug
 */
// const gui = new dat.GUI()

const resolution = new THREE.Vector2(20, 20);

/**
 * Scene
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color("#dd9b64");
scene.fog = new THREE.Fog("#dd9b64", 30, 80);

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
camera.position.set(8 + resolution.x / 2, resolution.x / 2, resolution.y + 6);
camera.lookAt(new THREE.Vector3(0, 2.5, 0));

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
});
document.body.appendChild(renderer.domElement);
handleResize();

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;
controls.target.set(resolution.x / 2 + 4, 0, resolution.y / 2 + 4);

/**
 * Three js Clock
 */
// const clock = new THREE.Clock()

/**
 * Grid
 */
const planeGeometry = new THREE.PlaneGeometry(
    resolution.x * 50,
    resolution.y * 50
  ),
  planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff7438 }),
  plane = new THREE.Mesh(planeGeometry, planeMaterial);

planeGeometry.rotateX(-Math.PI * 0.5);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
plane.position.y = -0.5;
scene.add(plane);

plane.receiveShadow = true;

// Create snake
const snake = new Snake({ scene, resolution });
console.log("🔎 [snake] =>", snake);

snake.addEventListener("updated", () => {
  // Check if snake eat itself
  if (snake.checkSelfCollision() || snake.checkEntitiesCollision(entities)) {
    snake.die();
    resetGame();
  }

  // Check if snake eats a candy
  const headIndex = snake.indexes.at(-1);
  const candyIdx = candies.findIndex(
    (candy) => candy.getIndexByCoord() === headIndex
  );

  if (candyIdx >= 0) {
    const candy = candies[candyIdx];
    scene.remove(candies[candyIdx].mesh);
    candies.splice(candyIdx, 1);
    snake.body.head.data.candy = candy;
    addCandy();
  }
});

window.addEventListener("keyup", (e) => {
  const keyCode = e.code;

  if (keyCode === "Space") {
    !isRunning ? startGame() : stopGame();
  }

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

const resetGame = () => {
  stopGame();

  // Remove all candies once the game end
  let candy = candies.pop();
  while (candy) {
    scene.remove(candy.mesh);
    candy = candies.pop();
  }

  // Remove all entities once the game end
  let entity = entities.pop();
  while (entity) {
    scene.remove(entity.mesh);
    entity = entities.pop();
  }

  addCandy();
  generateEntities();
};

const candies = [];
const entities = [];

const addCandy = () => {
  const candy = new Candy(resolution);
  let index = getFreeIndex();

  candy.mesh.position.x = index % resolution.x;
  candy.mesh.position.z = Math.floor(index / resolution.x);

  candies.push(candy);

  scene.add(candy.mesh);
};

addCandy();

function getFreeIndex() {
  let index;
  let candyIdxs = candies.map((candy) => candy.getIndexByCoord());
  let entityIdxs = entities.map((entity) => entity.getIndexByCoord());

  do {
    index = Math.floor(Math.random() * resolution.x * resolution.y);
  } while (
    snake.indexes.includes(index) ||
    candyIdxs.includes(index) ||
    entityIdxs.includes(index)
  );

  return index;
}

const addEntity = () => {
  const entity =
    Math.random() > 0.5 ? new Rock(resolution) : new Tree(resolution);

  let index = getFreeIndex();

  entity.mesh.position.x = index % resolution.x;
  entity.mesh.position.z = Math.floor(index / resolution.x);

  entities.push(entity);

  scene.add(entity.mesh);
};

function generateEntities() {
  for (let idx = 0; idx < 20; idx++) {
    addEntity();
  }
}

generateEntities();

const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);

dirLight.position.set(20, 20, 20);
dirLight.target.position.set(resolution.x, 0, resolution.y);
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.radius = 6;
dirLight.shadow.blurSamples = 200;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;

dirLight.castShadow = true;

scene.add(ambLight, dirLight);

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
