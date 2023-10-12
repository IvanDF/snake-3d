import { IcosahedronGeometry, Mesh, MeshNormalMaterial } from "three";
import Entity from "./Entity";

const GEOMETRY = new IcosahedronGeometry(0.5);
const MATERIAL = new MeshNormalMaterial();

export default class Rock extends Entity {
  constructor(resolution) {
    const mesh = new Mesh(GEOMETRY, MATERIAL);

    super(mesh, resolution);
  }
}
