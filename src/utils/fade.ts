import * as THREE from "three";

export default class Fade {
  constructor(private width: number, private height: number,
    private color: number = 0x000000, private opacity: number = .01) {
    this.scene = new THREE.Scene();
    this.mesh = this.createFadeMesh();
    this.scene.add(this.mesh);
    this.camera = new THREE.OrthographicCamera(0, this.width, this.height, 0, 0, 1000);
  }

  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  private mesh: THREE.Mesh<THREE.Geometry, THREE.Material>;

  public dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = null;
    this.scene = null;
    this.camera = null;
  }

  private createFadeMesh():THREE.Mesh<THREE.Geometry, THREE.Material> {
    var geometry = new THREE.PlaneGeometry(this.width, this.height, 10, 10);
    var material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: this.opacity,
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.x = this.width / 2;
    plane.position.y = this.height / 2;
    
    return plane;
  }
}
