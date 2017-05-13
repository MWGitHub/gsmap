import {
  Group, PlaneGeometry, MeshBasicMaterial, MeshLambertMaterial,
  SceneUtils
} from 'three';

class PolygonMap extends Group {
  constructor(imageData) {
    super();
    const height = imageData.height;
    const width = imageData.width;
    console.log(imageData);

    const geometry = new PlaneGeometry(width, height, width, height);
    for (let i = 0; i < geometry.vertices.length; i++) {
      const pixels = [];
      const row = Math.floor(i / (width + 1));
      const col = i % (width + 1);

      if (row === 0) {
        pixels.push({
          row,
          col
        });
      } else {
        pixels.push({
          row: row - 1,
          col
        });
        if (col > 0) {
          pixels.push({
            row: row - 1,
            col: col - 1
          });
        }
      }
      if (row < height) {
        pixels.push({
          row,
          col
        });
        if (col > 0) {
          pixels.push({
            row,
            col: col - 1
          });
        }
      }

      console.log(row, col);

      const start = i * 4;
      const r = imageData.data[start];
      const g = imageData.data[start + 1];
      const b = imageData.data[start + 2];
      const a = imageData.data[start + 3];

      if (i < imageData.data.length) {
        const magnitude = (r + g + b + a) / 3;

        // geometry.vertices[i].z = magnitude / 10;
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
