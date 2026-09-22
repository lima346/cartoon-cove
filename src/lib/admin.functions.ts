import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Acesso restrito a administradores.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export const amIAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const getAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const [categories, series, seasons, episodes, purchases, profiles, subs, history, settings] =
      await Promise.all([
        db.from("categories").select("*").order("sort_order"),
        db.from("series").select("*").order("created_at"),
        db.from("seasons").select("*").order("number"),
        db.from("episodes").select("*").order("number"),
        db.from("purchases").select("*").order("created_at", { ascending: false }),
        db.from("profiles").select("*").order("created_at", { ascending: false }),
        db.from("subscriptions").select("*"),
        db.from("watch_history").select("user_id,updated_at"),
        db.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
      ]);

    const eps = episodes.data ?? [];
    const purch = purchases.data ?? [];
    const since = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const active = new Set(
      (history.data ?? [])
        .filter((h: any) => new Date(h.updated_at).getTime() > since)
        .map((h: any) => h.user_id),
    );

    return {
      categories: categories.data ?? [],
      series: series.data ?? [],
      seasons: seasons.data ?? [],
      episodes: eps,
      purchases: purch,
      profiles: profiles.data ?? [],
      subscriptions: subs.data ?? [],
      settings: settings.data,
      stats: {
        users: (profiles.data ?? []).length,
        activeUsers: active.size,
        series: (series.data ?? []).length,
        episodes: eps.length,
        premiumEpisodes: eps.filter((e: any) => e.is_premium).length,
        views:
          (series.data ?? []).reduce((a: number, s: any) => a + (s.views ?? 0), 0) +
          eps.reduce((a: number, e: any) => a + (e.views ?? 0), 0),
        purchases: purch.filter((p: any) => p.status === "approved").length,
        pending: purch.filter((p: any) => p.status === "pending").length,
        revenueCents: purch
          .filter((p: any) => p.status === "approved")
          .reduce((a: number, p: any) => a + (p.amount_cents ?? 0), 0),
        topSeries: [...(series.data ?? [])]
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 6)
          .map((s: any) => ({ title: s.title, views: s.views })),
        topEpisodes: [...eps]
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 6)
          .map((e: any) => ({ title: e.title, views: e.views })),
      },
    };
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id?: string; slug: string; name: string; emoji?: string; sort_order?: number }) => d,
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const row = {
      slug: data.slug,
      name: data.name,
      emoji: data.emoji ?? null,
      sort_order: data.sort_order ?? 0,
    };
    const res = data.id
      ? await db.from("categories").update(row).eq("id", data.id)
      : await db.from("categories").insert(row);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: "categories" | "series" | "seasons" | "episodes"; id: string }) => d)
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { error } = await db.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSeries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      slug: string;
      title: string;
      description: string;
      cover_url?: string;
      backdrop_url?: string;
      category_id?: string | null;
      is_featured: boolean;
      is_published: boolean;
      season_price_cents: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { id, ...row } = data;
    const payload = {
      ...row,
      cover_url: row.cover_url || null,
      backdrop_url: row.backdrop_url || null,
      category_id: row.category_id || null,
    };
    const res = id
      ? await db.from("series").update(payload).eq("id", id)
      : await db.from("series").insert(payload);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

export const saveSeason = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id?: string; series_id: string; number: number; title: string; price_cents: number }) =>
      d,
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { id, ...row } = data;
    const res = id
      ? await db.from("seasons").update(row).eq("id", id)
      : await db.from("seasons").insert(row);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

export const saveEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      season_id: string;
      number: number;
      title: string;
      description: string;
      thumb_url?: string;
      video_url?: string;
      subtitles_url?: string;
      duration_seconds: number;
      is_premium: boolean;
      price_cents: number;
      is_published: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { id, ...row } = data;
    const payload = {
      ...row,
      thumb_url: row.thumb_url || null,
      video_url: row.video_url || null,
      subtitles_url: row.subtitles_url || null,
    };
    const res = id
      ? await db.from("episodes").update(payload).eq("id", id)
      : await db.from("episodes").insert(payload);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      allow_episode_purchase: boolean;
      allow_season_purchase: boolean;
      allow_subscription: boolean;
      monthly_price_cents: number;
      annual_price_cents: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { error } = await db.from("platform_settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; blocked: boolean }) => d)
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { error } = await db
      .from("profiles")
      .update({ is_blocked: data.blocked })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPurchaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "pending" | "refused" }) => d)
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { error } = await db.from("purchases").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
