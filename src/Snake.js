import {
  EventDispatcher,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import Entity from "./Entity";
import LinkedList from "./LinkedList";
import ListNode from "./ListNode";

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshStandardMaterial({
  color: 0xff470a,
});

const UP = new Vector3(0, 0, -1);
const DOWN = new Vector3(0, 0, 1);
const LEFT = new Vector3(-1, 0, 0);
const RIGHT = new Vector3(1, 0, 0);

export default class Snake extends EventDispatcher {
  direction = RIGHT;
  indexes = [];

  constructor({ scene, resolution = new Vector2(10, 10) }) {
    super();

    // Snake head
    this.scene = scene;
    this.resolution = resolution;
    this.init();
  }

  get getHead() {
    return this.body.head;
  }

  get end() {
    return this.body.end;
  }

  setDirection(keyCode) {
    switch (keyCode) {
      case "ArrowUp":
        this.newDirection = UP;
        break;
      case "ArrowLeft":
        this.newDirection = LEFT;
        break;
      case "ArrowRight":
        this.newDirection = RIGHT;
        break;
      case "ArrowDown":
        this.newDirection = DOWN;
        break;
    }

    if (this.newDirection) {
      const dot = this.direction.dot(this.newDirection);
      if (dot !== 0) {
        this.newDirection = null;
      }
    }
  }

  update() {
    if (this.newDirection) {
      this.direction = this.newDirection;
      this.newDirection = null;
    }

    let currentNode = this.end;

    // Check if the candy is at the end of the snake and add new piece of snake
    if (this.end.data.candy) {
      this.end.data.candy = null;

      // Scale body if has candy
      this.end.data.mesh.scale.setScalar(1);

      this.addTailNode();
    }

    while (currentNode.prev) {
      const candy = currentNode.prev.data.candy;

      if (candy) {
        currentNode.data.candy = candy;

        // Scale body if has candy
        currentNode.data.mesh.scale.setScalar(1.15);

        currentNode.prev.data.candy = null;

        // Scale body if has candy
        currentNode.prev.data.mesh.scale.setScalar(1);
      }

      const position = currentNode.prev.data.mesh.position;
      currentNode.data.mesh.position.copy(position);

      currentNode = currentNode.prev;
    }

    const headPostition = currentNode.data.mesh.position;
    headPostition.add(this.direction);

    const headMesh = this.body.head.data.mesh;
    headMesh.lookAt(headMesh.position.clone().add(this.direction));

    if (headPostition.z < 0) {
      headPostition.z = this.resolution.y - 1;
    } else if (headPostition.z > this.resolution.y - 1) {
      headPostition.z = 0;
    }

    if (headPostition.x < 0) {
      headPostition.x = this.resolution.x - 1;
    } else if (headPostition.x > this.resolution.x - 1) {
      headPostition.x = 0;
    }

    this.updateIndexes();

    this.dispatchEvent({ type: "updated" });
  }

  die() {
    let node = this.body.head;
    do {
      this.scene.remove(node.data.mesh);
      node = node.next;
    } while (node);

    this.init();
    this.addEventListener({ type: "die" });
  }

  checkSelfCollision() {
    const headIdx = this.indexes.pop();
    const collide = this.indexes.includes(headIdx);

    this.indexes.push(headIdx);

    return collide;
  }

  createHeadMesh() {
    const headMesh = this.body.head.data.mesh;

    const leftEye = new Mesh(
      new SphereGeometry(0.2, 10, 10),
      new MeshStandardMaterial({ color: "0xffffff" })
    );

    leftEye.scale.x = 0.1;
    leftEye.position.x = 0.5;
    leftEye.position.y = 0.1;
    leftEye.position.z = 0.1;

    const rightEye = new Mesh(
      new SphereGeometry(0.2, 10, 10),
      new MeshStandardMaterial({ color: "0xffffff" })
    );

    rightEye.scale.x = 0.1;
    rightEye.position.x = -0.5;
    rightEye.position.y = 0.1;
    rightEye.position.z = 0.1;

    const mouthMesh = new Mesh(
      new RoundedBoxGeometry(1.1, 0.08, 0.5, 5, 0.08),
      new MeshStandardMaterial({
        color: 0x614bdd,
      })
    );

    mouthMesh.rotation.x = -Math.PI * 0.1;
    mouthMesh.position.z = 0.3;
    mouthMesh.position.y = -0.2;

    headMesh.add(leftEye, rightEye, mouthMesh);

    headMesh.lookAt(headMesh.position.clone().add(this.direction));
  }

  init() {
    // Set default snake direction on init
    this.direction = UP;

    // Create head and body -> prepended to head
    const head = new ListNode(new SnakeNode(this.resolution));

    head.data.mesh.position.x = this.resolution.x / 2;
    head.data.mesh.position.z = this.resolution.y / 2;
    this.body = new LinkedList(head);

    this.createHeadMesh();

    this.indexes.push(head.data.getIndexByCoord());
    // Creating initial body
    for (let idx = 0; idx < 3; idx++) {
      const position = this.end.data.mesh.position.clone();
      position.sub(this.direction);
      this.addTailNode();
      this.end.data.mesh.position.copy(position);

      this.indexes.push(this.end.data.getIndexByCoord());
    }

    this.scene.add(head.data.mesh);
  }

  checkEntitiesCollision(entities) {
    const headIdx = this.indexes.at(-1);

    const entity = entities.find(
      (entity) => entity.getIndexByCoord() === headIdx
    );

    return !!entity;
  }

  updateIndexes() {
    this.indexes = [];

    let node = this.body.end;

    while (node) {
      this.indexes.push(node.data.getIndexByCoord());
      node = node.prev;
    }
  }

  addTailNode(position) {
    const node = new ListNode(new SnakeNode(this.resolution));

    if (position) {
      node.data.mesh.position.copy(position);
    } else {
      node.data.mesh.position.copy(this.end.data.mesh.position);
    }

    this.scene.add(node.data.mesh);

    this.body.addNode(node);
  }
}

class SnakeNode extends Entity {
  constructor(resolution) {
    const mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
    super(mesh, resolution);
  }
}
