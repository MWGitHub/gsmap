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
