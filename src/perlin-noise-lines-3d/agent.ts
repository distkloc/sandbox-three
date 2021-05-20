import * as THREE from "three";
import * as SimplexNoise from "simplex-noise";

export default class Agent {

    constructor(private width: number, private height: number, private simplexNoise: SimplexNoise){
      this.vector = this.initVector(width, height);
      this.vectorOld = this.vector.clone();

      this.stepSize = THREE.MathUtils.randFloat(1, 5);
      this.isOutside = false;
    }
    
    public vector: THREE.Vector2;
    public vectorOld: THREE.Vector2;

    private stepSize: number;
    private isOutside: boolean;

    public update(noiseScale: number, noiseStrength: number)
      : { vector: THREE.Vector2, vectorOld: THREE.Vector2 } {
      const angle = this.simplexNoise.noise2D(
        this.vector.x / noiseScale,
        this.vector.y / noiseScale
      ) * noiseStrength;

      this.vector.x += Math.cos(angle) * this.stepSize;
      this.vector.y += Math.sin(angle) * this.stepSize;

      this.isOutside = this.vector.x < - this.width / 2 
          || this.vector.x > this.width / 2
          || this.vector.y <  - this.height / 2
          || this.vector.y > this.height / 2;

      if (this.isOutside) {
        this.vector = this.initVector(this.width, this.height);
        this.vectorOld = this.vector.clone();
      }
      this.isOutside = false;

      const currentVectorOld = this.vectorOld.clone();
      this.vectorOld = this.vector.clone();

      return { vectorOld: currentVectorOld, vector: this.vector.clone() }
    }

    private initVector(width: number, height: number): THREE.Vector2 {
      return new THREE.Vector2()
        .random()
        .subScalar(0.5)
        .multiply(new THREE.Vector2(width, height));
    }
}
