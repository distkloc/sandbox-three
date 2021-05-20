
export default class Resize {
    constructor(private renderer: THREE.WebGLRenderer,
        private camera: THREE.PerspectiveCamera,
        private devicePixelRatio: number){
    }

    onResize(width: number, height: number) : void {   
      // レンダラーのサイズを調整する
      this.renderer.setPixelRatio(this.devicePixelRatio);
      this.renderer.setSize(width, height);
    
      // カメラのアスペクト比を正す
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
}
