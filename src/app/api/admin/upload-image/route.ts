import sharp from "sharp";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TARGETS = new Set(["order", "promos", "home"]);
const CARD_IMAGE_WIDTH = 1400;
const CARD_IMAGE_HEIGHT = 1200;

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

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ error: "Almacenamiento no configurado" }, { status: 500 });
    }

    const targetFolder = ALLOWED_TARGETS.has(targetFolderRaw) ? targetFolderRaw : "order";
    const arrayBuffer = await file.arrayBuffer();
    const sourceBuffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const safeBaseName = normalizeFilename(file.name.replace(/\.[^.]+$/, ""));
    const fileName = `${safeBaseName}-${timestamp}.webp`;
    const storagePath = `${targetFolder}/${fileName}`;

    const optimizedBuffer = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: CARD_IMAGE_WIDTH,
        height: CARD_IMAGE_HEIGHT,
        fit: "cover",
        position: "attention",
      })
      // Prevent transparent PNG uploads from showing odd frames on card backgrounds.
      .flatten({ background: "#f0e8de" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, optimizedBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `No se pudo subir la imagen: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(storagePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      size: optimizedBuffer.byteLength,
      mimeType: "image/webp",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: `No se pudo procesar la imagen: ${message}` }, { status: 500 });
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
