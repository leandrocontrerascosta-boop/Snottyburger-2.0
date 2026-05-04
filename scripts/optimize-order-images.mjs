import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const root = process.cwd();
const imageDir = path.join(root, "public", "images", "order");

const assets = [
  { inputBase: "locura", output: "locura.webp", width: 1400, quality: 84 },
  { inputBase: "snotty", output: "snotty.webp", width: 1400, quality: 84 },
  { inputBase: "descontrolada", output: "descontrolada.webp", width: 1400, quality: 84 },
  { inputBase: "suavecita", output: "suavecita.webp", width: 1400, quality: 84 },
  { inputBase: "moquera", output: "moquera.webp", width: 1400, quality: 84 },
  { inputBase: "peligrosa", output: "peligrosa.webp", width: 1400, quality: 84 },
  { inputBase: "banner-home", output: "banner-home.webp", width: 1800, quality: 82 },
  { inputBase: "pepsi-can", output: "pepsi-can-v2.webp", width: 900, quality: 86 },
  { inputBase: "coca-cola-500", output: "coca-cola-500-v2.webp", width: 900, quality: 86 },
];

const SOURCE_EXTENSIONS = ["png", "jpg", "jpeg"];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function optimizeAsset(asset) {
  const sourceFile = await resolveSourceFile(asset.inputBase);
  const inputPath = path.join(imageDir, sourceFile);
  const outputPath = path.join(imageDir, asset.output);

  await sharp(inputPath)
    .rotate()
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: asset.quality, effort: 6 })
    .toFile(outputPath);

  const [sourceStat, outputStat] = await Promise.all([fs.stat(inputPath), fs.stat(outputPath)]);
  const savedPercent = Math.max(0, ((sourceStat.size - outputStat.size) / sourceStat.size) * 100);

  return {
    name: asset.output,
    sourceKB: (sourceStat.size / 1024).toFixed(1),
    outputKB: (outputStat.size / 1024).toFixed(1),
    saved: savedPercent.toFixed(1),
  };
}

async function resolveSourceFile(inputBase) {
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = `${inputBase}.${extension}`;
    const candidatePath = path.join(imageDir, candidate);

    if (await fileExists(candidatePath)) {
      return candidate;
    }
  }

  throw new Error(`Missing source image for base name: ${inputBase}`);
}

async function main() {
  const results = [];

  for (const asset of assets) {
    const result = await optimizeAsset(asset);
    results.push(result);
  }

  console.log("Optimized assets:");
  for (const result of results) {
    console.log(
      `- ${result.name}: ${result.sourceKB}KB -> ${result.outputKB}KB (${result.saved}% saved)`
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});