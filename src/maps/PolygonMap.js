import {
  Group, PlaneGeometry, MeshBasicMaterial, MeshLambertMaterial,
  SceneUtils
} from 'three';

class PolygonMap extends Group {
  constructor(pixels) {
    super();
    const height = pixels.length;
    const width = pixels[0].length;

    const geometry = new PlaneGeometry(width, height, width, height);
    for (let i = 0; i < geometry.vertices.length; i++) {
      const row = Math.floor(i / (width + 1));
      const col = i % (width + 1);

      if (row < height && col < width) {
        const pixel = pixels[row][col];
        const magnitude = (pixel.r + pixel.g + pixel.b) / 3;

        geometry.vertices[i].z = magnitude / 10;
      }
    }

    const colorMaterial = new MeshLambertMaterial({ color: 0x00AAFF });
    const wireframeMaterial = new MeshBasicMaterial({
      color: 0x00BBFF,
      wireframe: true,
      transparent: true
    });
    const plane = SceneUtils.createMultiMaterialObject(geometry, [
      colorMaterial, wireframeMaterial
    ]);

    this.add(plane);
  }
}

export default PolygonMap;
