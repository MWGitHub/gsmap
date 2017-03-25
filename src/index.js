import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { load as loadPNG } from './util/png';
import SimpleMap from './maps/SimpleMap';

function load() {
  // return loadPNG('png-test.png');
  return loadPNG('bw-filled.png');
}

function makeScene(image) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  // scene.add(cube);
  const map = new SimpleMap(image.pixels);

  scene.add(map);

  camera.position.z = 100;

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
}

function start() {
  load()
  .then(makeScene)
  .catch(console.error); // eslint-disable-line no-console
}

module.exports = {
  start
};
