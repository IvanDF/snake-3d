export default class Entity {
  constructor(mesh, resolution) {
    this.mesh = mesh;
    this.resolution = resolution;
  }

  get position() {
    return this.mesh.position;
  }

  getIndexByCoord() {
    const { x } = this.resolution;
    return this.position.z * x + this.position.x;
  }
}
