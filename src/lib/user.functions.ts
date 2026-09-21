import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Server-side access check + signed content delivery for premium episodes. */
export const getProtectedStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { episodeId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: allowed } = await supabaseAdmin.rpc("has_episode_access", {
      _user_id: context.userId,
      _episode_id: data.episodeId,
    });
    if (!allowed) return { allowed: false, url: null, subtitles: null };
    const { data: row } = await supabaseAdmin
      .from("episodes")
      .select("video_url,subtitles_url")
      .eq("id", data.episodeId)
      .maybeSingle();
    const ep = row as { video_url: string | null; subtitles_url: string | null } | null;
    return { allowed: true, url: ep?.video_url ?? null, subtitles: ep?.subtitles_url ?? null };
  });

export const getMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, purchases, subscription, history, favorites, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").maybeSingle(),
      supabase.from("watch_history").select("*").order("updated_at", { ascending: false }),
      supabase.from("favorites").select("*"),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      profile: profile.data,
      purchases: purchases.data ?? [],
      subscription: subscription.data,
      history: history.data ?? [],
      favorites: favorites.data ?? [],
      isAdmin: (roles.data ?? []).some((r: { role: string }) => r.role === "admin"),
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { display_name: string; avatar_url?: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ display_name: data.display_name, avatar_url: data.avatar_url ?? null })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { episodeId: string; position: number; completed: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("watch_history").upsert(
      {
        user_id: context.userId,
        episode_id: data.episodeId,
        position_seconds: Math.floor(data.position),
        completed: data.completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,episode_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { seriesId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("series_id", data.seriesId)
      .maybeSingle();
    if (existing) {
      await supabase.from("favorites").delete().eq("id", (existing as { id: string }).id);
      return { favorited: false };
    }
    await supabase.from("favorites").insert({ user_id: userId, series_id: data.seriesId });
    return { favorited: true };
  });

/**
 * Demo checkout. A real payment provider webhook would confirm the transaction;
 * here the purchase is recorded server-side and access is derived from it.
 */
export const createPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      kind: "episode" | "season" | "plan";
      episodeId?: string;
      seasonId?: string;
      plan?: "monthly" | "annual";
      method: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settingsRow } = await supabaseAdmin
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const settings = settingsRow as {
      allow_episode_purchase: boolean;
      allow_season_purchase: boolean;
      allow_subscription: boolean;
      monthly_price_cents: number;
      annual_price_cents: number;
      currency: string;
    };

    let amount = 0;
    if (data.kind === "episode") {
      if (!settings.allow_episode_purchase) throw new Error("Compra por episódio desativada.");
      const { data: ep } = await supabaseAdmin
        .from("episodes")
        .select("price_cents")
        .eq("id", data.episodeId!)
        .maybeSingle();
      amount = (ep as { price_cents: number } | null)?.price_cents ?? 0;
    } else if (data.kind === "season") {
      if (!settings.allow_season_purchase) throw new Error("Compra de temporada desativada.");
      const { data: se } = await supabaseAdmin
        .from("seasons")
        .select("price_cents")
        .eq("id", data.seasonId!)
        .maybeSingle();
      amount = (se as { price_cents: number } | null)?.price_cents ?? 0;
    } else {
      if (!settings.allow_subscription) throw new Error("Assinaturas desativadas.");
      amount = data.plan === "annual" ? settings.annual_price_cents : settings.monthly_price_cents;
    }

    const { error } = await supabaseAdmin.from("purchases").insert({
      user_id: context.userId,
      kind: data.kind,
      episode_id: data.kind === "episode" ? data.episodeId : null,
      season_id: data.kind === "season" ? data.seasonId : null,
      plan: data.kind === "plan" ? data.plan : null,
      amount_cents: amount,
      currency: settings.currency,
      method: data.method,
      status: "approved",
    });
    if (error) throw new Error(error.message);

    if (data.kind === "plan") {
      const end = new Date();
      end.setMonth(end.getMonth() + (data.plan === "annual" ? 12 : 1));
      await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: context.userId,
          plan: data.plan,
          status: "active",
          current_period_end: end.toISOString(),
        },
        { onConflict: "user_id" },
      );
    }
    return { ok: true, amount_cents: amount };
  });

export const getContinueWatching = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("watch_history")
      .select("episode_id,position_seconds,completed,updated_at")
      .order("updated_at", { ascending: false })
      .limit(20);
    return (data ?? []) as {
      episode_id: string;
      position_seconds: number;
      completed: boolean;
      updated_at: string;
    }[];
  });
