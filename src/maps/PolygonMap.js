import {
  Group, PlaneGeometry, MeshBasicMaterial, MeshLambertMaterial,
  SceneUtils
} from 'three';

class PolygonMap extends Group {
  constructor(imageData) {
    super();
    const height = imageData.height;
    const width = imageData.width;

    const geometry = new PlaneGeometry(width, height, width, height);
    for (let i = 0; i < geometry.vertices.length; i++) {
      const start = i * 4;
      const r = imageData.data[start];
      const g = imageData.data[start + 1];
      const b = imageData.data[start + 2];

      if (i < imageData.data.length) {
        const magnitude = (r + g + b) / 3;

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
