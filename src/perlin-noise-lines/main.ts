import * as THREE from "three";
import * as SimplexNoise from "simplex-noise";
import Agent from "./agent"
import Throttle from "../utils/throttle"
import Resize from '../utils/resize';
import Fade from '../utils/fade';

class Main {
  constructor(private window: Window & typeof globalThis) {
    this.window.addEventListener('DOMContentLoaded', () => this.onReady());
  }

  private onReady(): void {
    const renderer = this.initRenderer();
  
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1.0);
    camera.position.set(0, 0, 700);
    
    const resize = new Resize(renderer, camera, this.window.devicePixelRatio);
    resize.onResize(this.window.innerWidth, this.window.innerHeight);
  
    let fade = new Fade(this.window.innerWidth, this.window.innerHeight);
  
    const throttle = new Throttle(() => {
      resize.onResize(this.window.innerWidth, this.window.innerHeight);

      fade.dispose();
      fade = new Fade(this.window.innerWidth, this.window.innerHeight);
    }, 300);
  
    this.window.addEventListener('resize', () => throttle.execute());
  
    const agents = this.initAgents();
    const line = this.initLineSegments(agents);
    scene.add(line);
  
    renderer.render(scene, camera);
    renderer.render(fade.scene, fade.camera);
  
    const tick = (): void => {
      requestAnimationFrame(tick);
  
      this.updateLine(line, agents);
  
      renderer.render(scene, camera);
      renderer.render(fade.scene, fade.camera);
    };
  
    tick();
  }

  private initRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ 
      canvas: this.window.document.querySelector('#myCanvas') as HTMLCanvasElement,
      antialias: true,
      preserveDrawingBuffer: true
    })
  
    renderer.autoClearColor = false;

    return renderer;
  }

  private initAgents(): Agent[] {
    const agentCount = 4000;
    const agents: Agent[] = [];
  
    const simplexNoise = new SimplexNoise();
  
    for(let i = 0; i < agentCount; i++){
      agents[i] = new Agent(this.window.innerWidth, this.window.innerHeight, simplexNoise);
    }

    return agents;
  }

  private initLineSegments(agents: Agent[]): THREE.LineSegments<THREE.BufferGeometry, THREE.Material> {
    const geometry = new THREE.BufferGeometry()
      .setFromPoints(agents.flatMap(a => [a.vectorOld, a.vector]));
  
    const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

    return new THREE.LineSegments(geometry, material);
  }

  private updateLine(line: THREE.LineSegments<THREE.BufferGeometry, THREE.Material>, agents: Agent[]):void {
    const points = agents.flatMap(agent => {
      const { vectorOld, vector } = agent.update(1000, 5);
      return [vectorOld, vector];
    })

    line.geometry.setFromPoints(points);
    line.geometry.attributes.position.needsUpdate = true;
  }
}

new Main(window);
