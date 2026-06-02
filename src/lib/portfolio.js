import fs from "node:fs";
import path from "node:path";

const publicDirectory = path.join(process.cwd(), "public");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const categoryFolders = [
  { slug: "birthday", label: "Birthday" },
  { slug: "marraige", label: "Marriage" },
  { slug: "meternity", label: "Maternity" },
  { slug: "model", label: "Model" },
  { slug: "prewed", label: "Pre-Wedding" },
];

function getPngDimensions(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += length + 2;
  }

  throw new Error("Could not read JPEG dimensions");
}

function getWebpDimensions(buffer) {
  const format = buffer.toString("ascii", 12, 16);

  if (format === "VP8X") {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }

  if (format === "VP8L") {
    return {
      width: 1 + (((buffer[22] & 0x3f) << 8) | buffer[21]),
      height:
        1 +
        (((buffer[24] & 0x0f) << 10) |
          (buffer[23] << 2) |
          ((buffer[22] & 0xc0) >> 6)),
    };
  }

  if (format === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  throw new Error("Could not read WebP dimensions");
}

function getImageDimensions(filePath, extension) {
  const buffer = fs.readFileSync(filePath);

  if (extension === ".png") return getPngDimensions(buffer);
  if (extension === ".jpg" || extension === ".jpeg") {
    return getJpegDimensions(buffer);
  }
  if (extension === ".webp") return getWebpDimensions(buffer);

  throw new Error(`Unsupported image format: ${extension}`);
}

function getPublicSrc(folder, filename) {
  return `/${[folder, filename].map(encodeURIComponent).join("/")}`;
}

export function getPortfolioCategories() {
  return categoryFolders.map(({ slug, label }) => {
    const folderPath = path.join(publicDirectory, slug);
    const filenames = fs
      .readdirSync(folderPath)
      .filter((filename) =>
        supportedExtensions.has(path.extname(filename).toLowerCase())
      )
      .sort((first, second) =>
        first.localeCompare(second, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );

    const images = filenames.map((filename, index) => {
      const extension = path.extname(filename).toLowerCase();
      const dimensions = getImageDimensions(
        path.join(folderPath, filename),
        extension
      );

      return {
        ...dimensions,
        src: getPublicSrc(slug, filename),
        title: `${label} Frame ${String(index + 1).padStart(2, "0")}`,
        category: label,
        alt: `${label} photography by Ramp Studio`,
      };
    });

    return {
      slug,
      label,
      cover: images[0],
      images,
    };
  });
}
