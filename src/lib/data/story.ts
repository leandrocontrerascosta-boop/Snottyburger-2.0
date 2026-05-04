import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export type StoryData = {
  title: string;
  body: string;
  updatedAt: string;
};

const defaultStory: StoryData = {
  title: "Nuestra Historia",
  body: "Snottyburger arranco como una cocina chica obsesionada por hacer la burger perfecta: pan suave, carne con sello propio y salsas caseras. Hoy seguimos con la misma regla: todo fresco, sin atajos y con sabor real.",
  updatedAt: new Date().toISOString(),
};

export async function fetchStory(): Promise<StoryData> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return defaultStory;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "story")
    .single();

  if (error || !data?.value) {
    return defaultStory;
  }

  const value = data.value as Partial<StoryData>;

  return {
    title: typeof value.title === "string" ? value.title : defaultStory.title,
    body: typeof value.body === "string" ? value.body : defaultStory.body,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : defaultStory.updatedAt,
  };
}
