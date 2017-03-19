import pako from 'pako';
import { bytesToUint32 } from '../byte-converter';

/**
 * Calculate the number of bytes per pixel.
 *
 * @param  {Number} bitDepth - number of bytes per sample.
 * @param  {Number} colorType - type of color.
 * @return {Number} the number of bytes per pixel.
 */
function getBytesPerPixel(bitDepth, colorType) {
  const bytesPerSample = bitDepth === 16 ? 2 : 1;

  if (colorType === 0) {
    return 1 * bytesPerSample;
  }

  if (colorType === 2) {
    return 3 * bytesPerSample;
  }

  if (colorType === 3) {
    return 1;
  }

  if (colorType === 4) {
    return 2 * bytesPerSample;
  }

  return 4 * bytesPerSample;
}

/**
 * Parse the a data chunk.
 *
 * @param  {Uint8Array} byteArray - byte array to read from.
 * @param  {Number} start - location to begin reading at.
 * @param  {Number} length - length of the chunk data.
 * @param  {Object} header - PNG IHDR properties.
 * @param  {Number} header.width - width of the PNG.
 * @param  {Number} header.bitDepth - number of bytes per sample.
 * @param  {Number} header.colorType - type of color.
 * @return {Object} the result with filters and pixels arrays.
 */
export default function parse(byteArray, start, length, header) {
  const compressed = byteArray.slice(start, start + length);
  const decompressed = pako.inflate(compressed);

  const width = header.width;
  const bitDepth = header.bitDepth;
  const colorType = header.colorType;
  const bytesPerPixel = getBytesPerPixel(bitDepth, colorType);
  const bytesPerScanline = width * bytesPerPixel + 1;
  const bytesPerSample = bitDepth === 16 ? 2 : 1;

  const filters = [];
  const pixels = [];
  let i = 0;
  while (i < decompressed.length) {
    if (i % bytesPerScanline === 0) {
      filters.push(decompressed[i]);
      i++;

      continue;
    }

    switch (colorType) {
      case 0:
        pixels.push({
          v: bytesToUint32(decompressed, i, bytesPerSample)
        });

        i += bytesPerSample;
        break;
      case 2:
        pixels.push({
          r: bytesToUint32(decompressed, i, bytesPerSample),
          g: bytesToUint32(decompressed, i + bytesPerSample, bytesPerSample),
          b: bytesToUint32(decompressed, i + bytesPerSample * 2, bytesPerSample),
        });

        i += bytesPerSample * 3;
        break;
      case 3:
        pixels.push({
          p: bytesToUint32(decompressed, i, 1)
        });

        i += 1;
        break;
      case 4:
        pixels.push({
          v: bytesToUint32(decompressed, i, bytesPerSample),
          a: bytesToUint32(decompressed, i + bytesPerSample, bytesPerSample)
        });

        i += bytesPerSample;
        break;
      case 6:
        pixels.push({
          r: bytesToUint32(decompressed, i, bytesPerSample),
          g: bytesToUint32(decompressed, i + bytesPerSample, bytesPerSample),
          b: bytesToUint32(decompressed, i + bytesPerSample * 2, bytesPerSample),
          a: bytesToUint32(decompressed, i + bytesPerSample * 3, bytesPerSample)
        });

        i += bytesPerSample * 4;
        break;
      default:
        throw new Error('Invalid color type');
    }
  }

  return {
    filters,
    pixels
  };
}
