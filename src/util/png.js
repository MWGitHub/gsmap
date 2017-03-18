import pako from 'pako';

const CHUNK_SIZE = 8;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const IHDR_SIGNATURE = [0, 0, 0, 13, 73, 72, 68, 82];
const SIGNATURE = PNG_SIGNATURE.concat(IHDR_SIGNATURE);
const META_SIZE = 4;
const MAX_SIGNIFICANT_SIZE = 127;

class PNG {
  constructor(byteArray) {
    this.byteArray = byteArray;
  }

  static load(path) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.responseType = 'arraybuffer';

      req.addEventListener('load', (e) => {
        const arrayBuffer = e.target.response;

        if (!arrayBuffer) {
          reject(new Error('No response'));
          return;
        }

        const byteArray = new Uint8Array(arrayBuffer);

        try {
          const png = new PNG(byteArray);

          resolve(png);
        } catch (processError) {
          reject(processError);
        }
      });

      req.addEventListener('error', reject);

      req.open('GET', path, true);
      req.send();
    });
  }
}

export default PNG;
