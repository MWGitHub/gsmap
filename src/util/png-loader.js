/**
 * Checks for valid PNGs and loads them.
 */

const CHUNK_SIZE = 8;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const IHDR_SIGNATURE = [0, 0, 0, 13, 73, 72, 68, 82];
const SIGNATURE = PNG_SIGNATURE.concat(IHDR_SIGNATURE);
const META_SIZE = 4;
const MAX_SIGNIFICANT_SIZE = 127;

/**
 * Converts a series of bytes to an unsigned 32-bit integer.
 *
 * @param  {Uint8Array} byteArray - array to use.
 * @param  {Number} start - starting position.
 * @param  {Number} length - number of bytes to use.
 * @return {Number} 32-bit unsigned integer.
 */
function bytesToUint32(byteArray, start, length) {
  if (length > 4) {
    throw new Error('Length cannot be greater than 4');
  }

  let position = start;
  let value = 0;

  if (length === 4) {
    let sigValue = byteArray[position];

    if (sigValue > MAX_SIGNIFICANT_SIZE) {
      value += MAX_SIGNIFICANT_SIZE << 24;
      sigValue -= MAX_SIGNIFICANT_SIZE;
    }
    value += sigValue << 24;
    position++;
  }

  for (let i = position; i < start + length; i++) {
    value += byteArray[i] << (8 * (length - (i - start) - 1));
  }

  return value;
}

/**
 * Checks if the PNG byte array is valid.
 *
 * @param  {Uint8Array}  byteArray - array to check.
 * @return {Boolean} true if valid, false otherwise.
 */
function isPNG(byteArray) {
  if (byteArray.byteLength < CHUNK_SIZE) {
    return false;
  }

  for (let i = 0; i < SIGNATURE.length; i++) {
    if (byteArray[i] !== SIGNATURE[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Process the header.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to begin.
 * @return {Object} the processed header.
 */
function processHeader(byteArray, start) {
  const colorBitCombinations = {
    0: [1, 2, 4, 8, 16],
    2: [8, 16],
    3: [1, 2, 4, 8],
    4: [8, 16],
    6: [8, 16]
  };

  const width = bytesToUint32(byteArray, start, 4);
  const height = bytesToUint32(byteArray, start + 4, 4);
  const bitDepth = bytesToUint32(byteArray, start + 8, 1);
  const colorType = bytesToUint32(byteArray, start + 9, 1);
  const compressionMethod = bytesToUint32(byteArray, start + 10, 1);
  const filterMethod = bytesToUint32(byteArray, start + 11, 1);
  const interlaceMethod = bytesToUint32(byteArray, start + 12, 1);

  if (width === 0 || height === 0) {
    throw new Error('Dimensions can not be 0');
  }

  const combination = colorBitCombinations[colorType];
  if (!combination) {
    throw new Error('Invalid color type');
  }

  if (!combination.includes(bitDepth)) {
    throw new Error('Invalid bit depth');
  }

  return {
    width,
    height,
    bitDepth,
    colorType,
    compressionMethod,
    filterMethod,
    interlaceMethod
  };
}

function processChunk(byteArray, start) {
  const processors = {
    73726882: {
      key: 'header',
      process: processHeader
    }
  };


  if (byteArray[start] > MAX_SIGNIFICANT_SIZE) {
    throw new Error('Invalid chunk length');
  }

  let position = start;

  // parse the length of the chunk
  const dataLength = bytesToUint32(byteArray, position, META_SIZE);
  position += META_SIZE;

  // parse the type of chunk
  let type = '';
  for (let i = position; i < position + META_SIZE; i++) {
    const value = byteArray[i];

    type += value;
  }
  position += META_SIZE;

  console.log('data length', dataLength);
  console.log('type', type);

  const totalLength = META_SIZE * 3 + dataLength;
  const processor = processors[type];

  if (!processor) {
    return {
      length: totalLength
    };
  }

  const result = processor.process(byteArray, start + CHUNK_SIZE, dataLength);
  console.log(result);

  return {
    key: processor.key,
    result,
    length: totalLength
  };
}

/**
 * Processes the PNG file, throws on errors.
 *
 * @param  {Uint8Array} byteArray - array to process.
 * @return {undefined} nothing
 */
function processPNG(byteArray) {
  if (!isPNG(byteArray)) {
    throw new Error('Invalid file format');
  }

  const result = {};

  for (let i = 0; i < byteArray.byteLength; i++) {
    console.log(byteArray[i], String.fromCharCode(byteArray[i]));
  }

  let i = CHUNK_SIZE;
  while (i < byteArray.byteLength) {
    const chunkResult = processChunk(byteArray, i);

    if (chunkResult.value) {
      result[chunkResult.key] = chunkResult.value;
    }

    // i += chunkResult.length;
    i += 1000000000;
  }
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
