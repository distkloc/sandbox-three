import * as THREE from 'three';
import Throttle from "../utils/throttle"
import Resize from '../utils/resize';
import Fade from '../utils/fade';

export default class Screen {
    constructor(private canvas: HTMLCanvasElement,
        private camera: THREE.PerspectiveCamera,
        devicePixelRatio: number,
        private width: number, private height: number) {
        this.renderer = this.initRenderer();
        this.windowResize = new Resize(this.renderer, camera, devicePixelRatio);
        this.fade = new Fade(width, height);
    }

    private renderer: THREE.WebGLRenderer;
    private windowResize: Resize;
    private fade: Fade;

    private initRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true
        })
        
        renderer.autoClearColor = false;

        return renderer;
    }

    public resize(): void {
        this.windowResize.onResize(this.width, this.height);
    }

    public onResize(): void {
        const throttle = new Throttle(() => {
          this.windowResize.onResize(this.width, this.height);
    
          this.fade.dispose();
          this.fade = new Fade(this.width, this.height);
        }, 300);
    
        throttle.execute();
    }

    public render(scene: THREE.Scene): void {
        this.renderer.render(scene, this.camera);
        this.renderer.render(this.fade.scene, this.fade.camera);
    }
}
