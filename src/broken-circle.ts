import * as THREE from "three";


window.addEventListener("DOMContentLoaded", () => {
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#myCanvas') as HTMLCanvasElement,
    antialias: true,
    preserveDrawingBuffer: true
  })

  renderer.autoClearColor = false;

  // シーンを作成
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, 1.0);
  camera.position.set(0, 0, 1000);

  onResize(renderer, camera);
  window.addEventListener('resize', () =>  onResize(renderer, camera));

  const mouse = new THREE.Vector2();
  window.addEventListener('mousemove', handleMouseMove);
  

  const formResolution = 15;
  const initRadius = 150;
  const circlePositions: THREE.Vector3[] = [];
  const stepSize = 2;
  const maxPoints = 50;
  let centerX = 0;
  let centerY = 0;
  
  const angle = THREE.MathUtils.degToRad(360 / formResolution);
  for (let i = 0; i < formResolution; i++) {
    circlePositions.push(
      new THREE.Vector3(
        Math.cos(angle * i) * initRadius,
        Math.sin(angle * i) * initRadius, 
        0
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(circlePositions, true);

  const points = curve.getPoints(maxPoints);
  
  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

  // Create the final object to add to the scene
  const curveObject = new THREE.Line( geometry, material );

  scene.add(curveObject);

  // 平行光源を生成
  // const light = new THREE.DirectionalLight(0xffffff);
  // light.position.set(1, 1, 1);
  // scene.add(light);

    // マウスを動かしたときのイベント
  function handleMouseMove(event) {
    const element = event.target;
    // canvas要素上のXY座標
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;

    // canvas要素の幅・高さ
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    // -1〜+1の範囲で現在のマウス座標を登録する
    // mouse.x = ( x / w ) * 2 - 1;
    // mouse.y = -( y / h ) * 2 + 1;
    mouse.x = x - w / 2;
    mouse.y = -(y - h / 2);
  }

  const tick = (): void => {
    requestAnimationFrame(tick);

    const curveGeometry = curveObject.geometry;

    centerX += (mouse.x - centerX) * 0.01;
    centerY += (mouse.y - centerY) * 0.01;
    
    for (let i = 0; i < formResolution; i++) {
      circlePositions[i].add( 
        new THREE.Vector3(
          THREE.MathUtils.randFloat(-stepSize, stepSize),
          THREE.MathUtils.randFloat(-stepSize, stepSize), 
          0
        )
      );
    }

    const currentPositions = circlePositions.map(p => new THREE.Vector3(centerX, centerY, 0).add(p));
    const currentCurve = new THREE.CatmullRomCurve3(currentPositions, true);
    
    curveGeometry.setFromPoints(currentCurve.getPoints(maxPoints));
    curveGeometry.attributes.position.needsUpdate = true;
    //  curveObject.rotation.y += 0.005;

    // 描画
    renderer.render(scene, camera);
  };
  tick();

  console.log("Hello Three.js");
});


function onResize(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) : void {
    // サイズを取得
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーのサイズを調整する
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // カメラのアスペクト比を正す
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
