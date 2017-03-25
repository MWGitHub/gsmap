class SimpleMap extends THREE.Group {
  constructor(pixels) {
    super();

    for (let row = 0; row < pixels.length; row++) {
      for (let col = 0; col < pixels[row].length; col++) {
        const pixel = pixels[row][col];

        if (pixel.a !== 0) {
          const geometry = new THREE.PlaneGeometry(1, 1);
          const material = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            side: THREE.DoubleSide
          });
          const plane = new THREE.Mesh(geometry, material);

          plane.position.x = row;
          plane.position.y = col;

          this.add(plane);
        }
      }
    }
  }
}

export default SimpleMap;
