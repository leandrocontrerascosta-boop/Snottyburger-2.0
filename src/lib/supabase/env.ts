export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServiceEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseServiceEnv(): SupabaseServiceEnv | null {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!publicEnv || !serviceRoleKey) {
    return null;
  }

  return {
    ...publicEnv,
    serviceRoleKey,
  };
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function hasSupabaseServiceEnv(): boolean {
  return getSupabaseServiceEnv() !== null;
}