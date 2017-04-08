import {
  Group, PlaneGeometry, MeshBasicMaterial, Mesh,
} from 'three';

class PolygonMap extends Group {
  constructor(pixels) {
    super();
    const height = pixels.length;
    const width = pixels[0].length;

    const geometry = new PlaneGeometry(width, height, 32, 32);
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true
    });
    const plane = new Mesh(geometry, material);

    this.add(plane);
  }
}

export default PolygonMap;
