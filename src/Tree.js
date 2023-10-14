import {
  IcosahedronGeometry,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
} from "three";
import Entity from "./Entity";

const GEOMETRY = new IcosahedronGeometry(0.3, 1);
GEOMETRY.scale(1, 6, 1);
const MATERIAL = new MeshStandardMaterial({
  color: 0xa2d109,
  flatShading: true,
});

export default class Tree extends Entity {
  constructor(resolution) {
    // Bug: Scaling Y axis in the tree shape is causing an issue
    // \/ This code creates a bug because it will add scaling, multiplying with every tree created
    // GEOMETRY.scale(1, 1.5, 1);
    const mesh = new Mesh(GEOMETRY, MATERIAL);
    mesh.scale.setScalar(0.6 + Math.random() * 1.2);
    mesh.rotation.y = Math.random() * Math.PI * 2;

    super(mesh, resolution);
  }
}
