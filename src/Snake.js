import { Mesh, MeshNormalMaterial, Vector2, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import LinkedList from "./LinkedList";
import ListNode from "./ListNode";

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshNormalMaterial();

const UP = new Vector3(0, 0, -1);
const DOWN = new Vector3(0, 0, 1);
const LEFT = new Vector3(-1, 0, 0);
const RIGHT = new Vector3(1, 0, 0);

export default class Snake {
  direction = RIGHT;

  constructor({ scene, resolution = new Vector2(10, 10) }) {
    // Snake head
    this.scene = scene;
    this.resolution = resolution;
    const head = new ListNode(new SnakeNode());
    head.data.mesh.position.x = resolution.x / 2;
    head.data.mesh.position.z = resolution.y / 2;

    this.body = new LinkedList(head);

    // Creating initial body
    for (let idx = 0; idx < 3; idx++) {
      this.addTailNode();
    }

    scene.add(head.data.mesh);
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

    while (currentNode.prev) {
      const position = currentNode.prev.data.mesh.position;
      currentNode.data.mesh.position.copy(position);

      currentNode = currentNode.prev;
    }

    const headPostition = currentNode.data.mesh.position;
    headPostition.add(this.direction);

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
  }

  addTailNode() {
    const node = new ListNode(new SnakeNode());

    const position = this.end.data.mesh.position.clone();
    position.sub(this.direction);
    node.data.mesh.position.copy(position);
    this.scene.add(node.data.mesh);

    this.body.addNode(node);
  }
}

class SnakeNode {
  constructor() {
    this.mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
  }
}
