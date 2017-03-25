import { Group, PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';

class SimpleMap extends Group {
  constructor(pixels) {
    super();
    const height = pixels.length;
    const width = pixels[0].length;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const pixel = pixels[row][col];

        if (pixel.a !== 0) {
          const geometry = new PlaneGeometry(1, 1);
          const material = new MeshBasicMaterial({
            color: 0xFFFF00,
            side: DoubleSide
          });
          const plane = new Mesh(geometry, material);

          plane.position.x = col;
          plane.position.y = (height - row);

          this.add(plane);
        }
      }
    }
  }
}

export default SimpleMap;
