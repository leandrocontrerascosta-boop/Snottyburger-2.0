import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const LOCAL_IMAGE_PREFIX = "/images/";
const LOSSY_EXT_REGEX = /\.(png|jpe?g)$/i;

export async function ensureWebOptimizedImage(imagePath: string): Promise<string> {
  if (!imagePath.startsWith(LOCAL_IMAGE_PREFIX)) {
    return imagePath;
  }

  if (!LOSSY_EXT_REGEX.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.split("?")[0]?.split("#")[0] ?? imagePath;
  const relativePath = normalizedPath.replace(/^\//, "");
  const sourceDiskPath = path.join(process.cwd(), "public", relativePath.replace(/^images\//, "images/"));

  const sourceBuffer = await readFile(sourceDiskPath);
  const extension = path.extname(sourceDiskPath);
  const outputDiskPath = sourceDiskPath.replace(new RegExp(`${extension}$`, "i"), "-optimized.webp");

  const optimizedBuffer = await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  await mkdir(path.dirname(outputDiskPath), { recursive: true });
  await writeFile(outputDiskPath, optimizedBuffer);

  const publicPrefix = `${path.sep}public${path.sep}`;
  const relativeOutput = outputDiskPath.split(publicPrefix)[1] ?? "";
  return `/${relativeOutput.replace(/\\/g, "/")}`;
}
