/**
 * Checks for valid PNGs and loads them.
 */

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/**
 * Checks if the PNG byte array is valid.
 *
 * @param  {Uint8Array}  byteArray - array to check.
 * @return {Boolean} true if valid, false otherwise.
 */
function isValidPNG(byteArray) {
  if (byteArray.byteLength < 8) {
    return false;
  }

  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (byteArray[i] !== PNG_SIGNATURE[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Processes the PNG file, throws on errors.
 *
 * @param  {Uint8Array} byteArray - array to process.
 * @return {undefined} nothing
 */
function processPNG(byteArray) {
  if (!isValidPNG(byteArray)) {
    throw new Error('Invalid file format');
  }

  console.log('processing');
}

function load(path) {
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
        const png = processPNG(byteArray);

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

export default {
  load
};
