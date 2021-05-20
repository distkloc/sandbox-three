import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as SimplexNoise from "simplex-noise";
import Agent from "./agent"
import Throttle from "../utils/throttle"
import Resize from '../utils/resize';
import Fade from '../utils/fade';
import { Mesh, Scene } from "three";

class Main {
  constructor(private window: Window & typeof globalThis) {
    this.window.addEventListener('DOMContentLoaded', () => this.onReady());
  }

  private onReady(): void {
    const renderer = this.initRenderer();
  
    const camera = new THREE.PerspectiveCamera(45, 1.0);
    camera.position.set(0, 0, 500);
    
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
    
    const textureScene = new THREE.Scene();
    textureScene.add(line);


    const renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping
    })

    const geometry = new THREE.SphereGeometry(150, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: renderTarget.texture,
    });
    const sphere = new Mesh(geometry, material);

    const light = new THREE.PointLight(0xFFFFFF, 1.5, 1000, 1.0);
    light.position.y = 100;
    light.position.z = 200;
    const scene = new Scene();
    scene.add(sphere);
    scene.add(light);

    const textureCamera = new THREE.PerspectiveCamera(45, 1.0);
    textureCamera.position.set(0, 0, 1000);

    const controls = new OrbitControls(camera, renderer.domElement);

    const tick = (): void => {
      this.updateLine(line, agents);
  
      renderer.setRenderTarget(renderTarget);
      renderer.render(textureScene, textureCamera)
      renderer.render(fade.scene, fade.camera);
      renderer.setRenderTarget(null);

      renderer.render(scene, camera);

      requestAnimationFrame(tick);
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
      const { vectorOld, vector } = agent.update(1000, 10);
      return [vectorOld, vector];
    })

    line.geometry.setFromPoints(points);
    line.geometry.attributes.position.needsUpdate = true;
  }
}

new Main(window);
