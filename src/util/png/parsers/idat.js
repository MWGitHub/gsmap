import pako from 'pako';
import { bytesToUint32 } from '../byte-converter';

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

export default function parse(byteArray, start, length, header) {
  const compressed = byteArray.slice(start, start + length);
  const decompressed = pako.inflate(compressed);

  const width = header.width;
  const bitDepth = header.bitDepth;
  const colorType = header.colorType;
  const bytesPerPixel = getBytesPerPixel(bitDepth, colorType);
  const bytesPerScanline = width * bytesPerPixel;
  const bytesPerSample = bitDepth === 16 ? 2 : 1;

  const filters = [];
  const pixels = [];
  let i = 0;
  while (i < decompressed.length) {
    switch (colorType) {
      case 0:
        pixels.push({
          v: bytesToUint32(byteArray, start, bytesPerSample)
        });
        break;
      case 2:
        pixels.push({
          r: bytesToUint32(byteArray, start + i, bytesPerSample),
          g: bytesToUint32(byteArray, start + i * bytesPerSample, bytesPerSample),
          b: bytesToUint32(byteArray, start + i * bytesPerSample * 2, bytesPerSample),
        })
        break;
      case 3:
        break;
      case 4:
        break;
      default:

    }
  }
  for (let i = 0; i < decompressed.length; i += bytesPerPixel) {
    const pixel = {};
    if (i % 13 === 0) {

    }

    pixel.r = decompressed[i];
    pixel.g = decompressed[i + 1];
    pixel.b = decompressed[i + 2];
    pixel.a = decompressed[i + 3];

    pixels.push(pixel);
  }
}
