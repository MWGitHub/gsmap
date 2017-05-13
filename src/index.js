import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import PolygonMap from './maps/PolygonMap';

function load(path) {
  const loader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (texture) => {
        const image = texture.image;
        const canvas = document.createElement('canvas');
        const canvas2d = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;
        canvas2d.drawImage(image, 0, 0, image.width, image.height);

        const imageData = canvas2d.getImageData(0, 0, image.width, image.height);

        resolve(imageData);
      },
      null,
      reject
    );
  });
}

function makeScene(imageData) {
  const scene = new THREE.Scene();

  const light = new THREE.SpotLight(0xffffff, 0.5);
  light.castShadow = true;
  light.position.set(10, 10, 10);
  scene.add(light);

  const polygonMap = new PolygonMap(imageData);
  scene.add(polygonMap);

  return scene;
}

function render(scene, { onRenderStart, onRenderEnd } = {}) {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 100;
  camera.rotateX(0.1);
  document.body.appendChild(renderer.domElement);

  camera.lookAt(new THREE.Vector3());
  const Controls = OrbitControls(THREE);
  const instance = new Controls(camera);

  function tick() {
    onRenderStart && onRenderStart();
    renderer.render(scene, camera);
    onRenderEnd && onRenderEnd();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function start({ onRenderStart, onRenderEnd } = {}) {
  load('png-test.png')
  .then((imageData) => {
    const scene = makeScene(imageData);

    render(scene, { onRenderStart, onRenderEnd });
  })
  .catch(console.error); // eslint-disable-line no-console
}

module.exports = {
  start
};
