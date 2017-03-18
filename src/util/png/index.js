import pako from 'pako';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const IHDR_SIGNATURE = [0, 0, 0, 13, 73, 72, 68, 82];
const SIGNATURE = PNG_SIGNATURE.concat(IHDR_SIGNATURE);
const CHUNK_SIZE = 8;
const META_SIZE = 4;
const MAX_SIGNIFICANT_SIZE = 127;

const chunkDefinitions = {
  header: {
    signature: '73726882',
    parser: parseHeader
  },
  data: {
    signature: '73686584',
    parser: parseData
  },
  palette: {
    signature: '80768469',
    parser: parsePalette
  },
  end: {
    signature: '73697868'
  }
};

/**
 * Retrieves the chunk definition from the signature.
 *
 * @param  {String} signature - signature of the chunk as a number string.
 * @return {String} the chunk key or null if none matching.
 */
function getChunkKeyFromSignature(signature) {
  const keys = Object.keys(chunkDefinitions);

  for (let i = 0; i < keys.length; i++) {
    const definition = chunkDefinitions[keys[i]];

    if (definition.signature === signature) {
      return keys[i];
    }
  }

  return null;
}

/**
 * Converts a series of bytes to an unsigned 32-bit integer.
 *
 * @param  {Uint8Array} byteArray - array to read from.
 * @param  {Number} start - starting position.
 * @param  {Number} count - number of bytes to read.
 * @return {Number} 32-bit unsigned integer.
 */
function bytesToUint32(byteArray, start, count) {
  if (count > 4) {
    throw new Error('Length cannot be greater than 4');
  }

  let position = start;
  let value = 0;

  if (count === 4) {
    let sigValue = byteArray[position];

    if (sigValue > MAX_SIGNIFICANT_SIZE) {
      value += MAX_SIGNIFICANT_SIZE << 24;
      sigValue -= MAX_SIGNIFICANT_SIZE;
    }
    value += sigValue << 24;
    position++;
  }

  for (let i = position; i < start + count; i++) {
    value += byteArray[i] << (8 * (count - (i - start) - 1));
  }

  return value;
}

/**
 * Converts a series of bytes to a string.
 *
 * @param  {Uint8Array} byteArray - array to read from.
 * @param  {Number} start - starting position.
 * @param  {Number} count - number of bytes to read.
 * @return {String} the bytes as a string.
 */
function bytesToString(byteArray, start, count) {
  let result = '';
  for (let i = start; i < start + count; i++) {
    const byte = byteArray[i];

    if (byte === 0) {
      result += '00';
    } else if (byte < 10) {
      result += `0${byte.toString()}`;
    } else {
      result += byte.toString();
    }
  }

  return result;
}

/**
 * Retrieves all the chunks meta data from the byte array.
 *
 * @param  {Uint8Array} byteArray - array to use.
 * @return {Object} the chunks with the header data and length.
 */
function retrieveMetaChunks(byteArray) {
  const chunks = [];

  let i = PNG_SIGNATURE.length; // skip the PNG signature
  while (i < byteArray.byteLength) {
    const dataLength = bytesToUint32(byteArray, i, META_SIZE);

    i += META_SIZE;
    const signature = bytesToString(byteArray, i, META_SIZE);
    const key = getChunkKeyFromSignature(signature);

    i += META_SIZE + dataLength;
    const crc = bytesToUint32(byteArray, i, META_SIZE);

    i += META_SIZE;

    const meta = {
      key,
      signature,
      crc,
      data: {
        start: i * META_SIZE * 2,
        length: dataLength,
      }
    };

    if (key) {
      chunks.push(meta);
    }
  }

  return chunks;
}

/**
 * Checks if the PNG byte array is valid.
 *
 * @param  {Uint8Array}  byteArray - array to check.
 * @return {Boolean} true if valid, false otherwise.
 */
function isSignatureValid(byteArray) {
  if (byteArray.byteLength < CHUNK_SIZE * 2) {
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
 * Parse the header.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to begin.
 * @return {Object} the parsed header.
 */
function parseHeader(byteArray, start) {
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

/**
 * Parse the data.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to begin.
 * @return {Object} the parsed data.
 */
function parseData(byteArray, start, length) {
  const compressed = byteArray.slice(start, start + length);
  const decompressed = pako.inflate(compressed);

  const pixels = [];
  for (let i = 0; i < decompressed.length; i += 4) {
    const pixel = {};
    if (i % 13 === 0) {

    }

    pixel.r = decompressed[i];
    pixel.g = decompressed[i + 1];
    pixel.b = decompressed[i + 2];
    pixel.a = decompressed[i + 3];

    pixels.push(pixel);
  }

  console.log(pixels);

  return decompressed;
}

/**
 * Parse the palette.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to start reading from.
 * @return {Object} the parsed palette.
 */
function parsePalette(byteArray, start, length) {
  return null;
}

/**
 * Processes a chunk.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to start reading from.
 * @return {Object} length if unmatched chunk, else the result with the key, value, and length.
 */
function processChunk(byteArray, start) {
  const processors = {
    73726882: {
      key: 'header',
      parse: parseHeader
    },
    73686584: {
      key: 'data',
      parse: parseData
    },
    80768469: {
      key: 'palette',
      parse: parsePalette
    },
    73697868: {
      key: 'end',
      parse: () => {}
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

  const totalLength = META_SIZE * 3 + dataLength;
  const processor = processors[type];

  if (!processor) {
    return {
      length: totalLength
    };
  }

  const result = processor.parse(byteArray, start + CHUNK_SIZE, dataLength);
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
  for (let i = 0; i < byteArray.byteLength; i++) {
    console.log(byteArray[i], String.fromCharCode(byteArray[i]));
  }

  if (!isSignatureValid(byteArray)) {
    throw new Error('Invalid file format');
  }

  let data = new Uint8Array(0);
  const result = {};

  let i = CHUNK_SIZE;
  let lastChunkKey = null;
  while (i < byteArray.byteLength) {
    const chunkResult = processChunk(byteArray, i);
    const key = chunkResult.key;
    const value = chunkResult.value;

    if (key) {
      lastChunkKey = key;
    }

    if (value) {
      if (key !== 'data') {
        result[key] = value;
      } else {
        const concatArray = new Uint8Array(data.byteLength + chunkResult.value.byteLength);

        concatArray.set(data);
        concatArray.set(value, data.byteLength);
        data = concatArray;
      }
    }

    i += chunkResult.length;
  }

  if (lastChunkKey !== 'end') {
    throw new Error('End is not last');
  }

  result.data = data;

  return result;
}

function png(byteArray) {
  const metaChunks = retrieveMetaChunks(byteArray);
  const isLastChunkIEND = metaChunks[metaChunks.length - 1].key === 'end';

  if (!isLastChunkIEND) {
    throw new Error('IEND must be the last chunk.');
  }

  console.log(metaChunks);
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
        resolve(png(byteArray));
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
  png,
  load
};
