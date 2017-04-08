import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { load as loadPNG } from './util/png';
import SimpleMap from './maps/SimpleMap';
import PolygonMap from './maps/PolygonMap';

function load() {
  // return loadPNG('png-test.png');
  return loadPNG('bw-filled.png');
}

function makeScene(image) {
  const scene = new Scene();
  const simpleMap = new SimpleMap(image.pixels);
  simpleMap.position.x = -50;
  scene.add(simpleMap);

  const polygonMap = new PolygonMap(image.pixels);
  scene.add(polygonMap);

  return scene;
}

function render(scene, { onRenderStart, onRenderEnd } = {}) {
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 100;
  document.body.appendChild(renderer.domElement);

  function tick() {
    onRenderStart && onRenderStart();
    renderer.render(scene, camera);
    onRenderEnd && onRenderEnd();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function start({ onRenderStart, onRenderEnd } = {}) {
  load()
  .then((image) => {
    const scene = makeScene(image);

    render(scene, { onRenderStart, onRenderEnd });
  })
  .catch(console.error); // eslint-disable-line no-console
}

module.exports = {
  start
};
