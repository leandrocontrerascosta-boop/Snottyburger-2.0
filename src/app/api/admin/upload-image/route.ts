import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TARGETS = new Set(["order", "promos", "home"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const targetFolderRaw = String(formData.get("targetFolder") ?? "order");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio archivo" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado grande (max 8MB)" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imagenes" }, { status: 400 });
    }

    const targetFolder = ALLOWED_TARGETS.has(targetFolderRaw) ? targetFolderRaw : "order";
    const projectRoot = process.cwd();
    const outputDir = path.join(projectRoot, "public", "images", targetFolder);
    await mkdir(outputDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const sourceBuffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const safeBaseName = normalizeFilename(file.name.replace(/\.[^.]+$/, ""));
    const fileName = `${safeBaseName}-${timestamp}.webp`;
    const diskPath = path.join(outputDir, fileName);

    const optimizedBuffer = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    await writeFile(diskPath, optimizedBuffer);

    return NextResponse.json({
      url: `/images/${targetFolder}/${fileName}`,
      size: optimizedBuffer.byteLength,
      mimeType: "image/webp",
    });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la imagen" }, { status: 500 });
  }
}

function normalizeFilename(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "image";
}
