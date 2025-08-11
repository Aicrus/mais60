import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

type ModuleKey = 'atividade-fisica' | 'habitos-alimentares' | 'seguranca-domiciliar' | 'estimulacao-cognitiva' | 'saude-mental';

type VideoUsage = {
  videoId: string;
  title?: string;
  seconds: number;
  lastAt: number; // epoch ms
  module?: ModuleKey | string;
  completed?: boolean;
};

type DayUsage = {
  totalSeconds: number;
  videos: Record<string, VideoUsage>;
  modules: Record<string, { count: number; seconds: number }>;
};

type UsageStorage = {
  days: Record<string, DayUsage>; // key: YYYY-MM-DD
  updatedAt: number;
};

type Aggregates = {
  todaySeconds: number;
  weekSeconds: number;
  recentVideos: Array<VideoUsage & { date: string }>; // últimos 14 dias
  perModuleToday: Record<string, number>; // seconds
  perModuleCountToday: Record<string, number>; // access count
  last7Days: Array<{ date: string; seconds: number }>;
  last4Weeks: Array<{ weekStart: string; seconds: number }>;
};

type UsageContextData = {
  aggregates: Aggregates;
  logWatch: (params: { videoId: string; seconds: number; title?: string; module?: ModuleKey | string }) => Promise<void>;
  logModuleAccess: (moduleKey: ModuleKey | string) => Promise<void>;
  markCompleted: (params: { videoId: string; title?: string; module?: ModuleKey | string }) => Promise<void>;
  unmarkCompleted: (params: { videoId: string }) => Promise<void>;
  clearUsage: () => Promise<void>;
};

const UsageContext = createContext<UsageContextData>({} as UsageContextData);

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom
  const diff = (day + 6) % 7; // segunda como início
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function useStorageKey(userId?: string | null) {
  return useMemo(() => `@mais60:usage:${userId || 'anon'}:v1`, [userId]);
}

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const storageKey = useStorageKey(userId);
  const [usage, setUsage] = useState<UsageStorage>({ days: {}, updatedAt: Date.now() });

  // Load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        if (raw) setUsage(JSON.parse(raw));
        else setUsage({ days: {}, updatedAt: Date.now() });
      } catch {
        setUsage({ days: {}, updatedAt: Date.now() });
      }
    })();
    return () => { mounted = false; };
  }, [storageKey]);

  const persist = useCallback(async (data: UsageStorage) => {
    setUsage(data);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
  }, [storageKey]);

  const logWatch = useCallback(async ({ videoId, seconds, title, module }: { videoId: string; seconds: number; title?: string; module?: ModuleKey | string }) => {
    if (!videoId || !Number.isFinite(seconds) || seconds <= 0) return;
    const now = new Date();
    const dayKey = formatDate(now);
    const next: UsageStorage = { days: { ...usage.days }, updatedAt: Date.now() };
    const day = next.days[dayKey] ?? { totalSeconds: 0, videos: {}, modules: {} };
    const current = day.videos[videoId] ?? { videoId, seconds: 0, lastAt: 0, title, module };
    current.seconds += seconds;
    current.lastAt = Date.now();
    if (title && !current.title) current.title = title;
    if (module && !current.module) current.module = module;
    day.videos[videoId] = current;
    day.totalSeconds = Object.values(day.videos).reduce((acc, v) => acc + v.seconds, 0);
    // Acumula segundos por módulo
    const mk = (module || current.module || 'desconhecido') as string;
    const m = day.modules[mk] ?? { count: 0, seconds: 0 };
    m.seconds += seconds;
    day.modules[mk] = m;
    next.days[dayKey] = day;
    await persist(next);

    // Persistência no Supabase (se logado)
    try {
      if (!userId) return;
      const { data: v } = await supabase
        .from('videos')
        .select('id, pilar_id')
        .eq('youtube_id', videoId)
        .limit(1)
        .maybeSingle();
      const videoUuid = v?.id as string | undefined;
      const pilarId = (v?.pilar_id as string | undefined) || (module as string | undefined);
      if (videoUuid) {
        // upsert progresso_videos
        await supabase.rpc('upsert_progresso_videos', { p_usuario_id: userId, p_video_id: videoUuid, p_inc_segundos: seconds });
      }
      if (pilarId) {
        // upsert acessos_modulos (incrementa segundos)
        await supabase.rpc('upsert_acessos_modulos', { p_usuario_id: userId, p_pilar_id: pilarId, p_inc_contador: 0, p_inc_segundos: seconds });
      }
    } catch {}
  }, [usage, persist]);

  const logModuleAccess = useCallback(async (moduleKey: ModuleKey | string) => {
    const dayKey = formatDate(new Date());
    const next: UsageStorage = { days: { ...usage.days }, updatedAt: Date.now() };
    const day = next.days[dayKey] ?? { totalSeconds: 0, videos: {}, modules: {} };
    const m = day.modules[moduleKey] ?? { count: 0, seconds: 0 };
    m.count += 1;
    day.modules[moduleKey] = m;
    next.days[dayKey] = day;
    await persist(next);

    // Persistência no Supabase (se logado): incrementa contador de acesso
    try {
      if (!userId) return;
      await supabase.rpc('upsert_acessos_modulos', { p_usuario_id: userId, p_pilar_id: moduleKey as string, p_inc_contador: 1, p_inc_segundos: 0 });
    } catch {}
  }, [usage, persist]);

  const markCompleted = useCallback(async ({ videoId, title, module }: { videoId: string; title?: string; module?: ModuleKey | string }) => {
    const dayKey = formatDate(new Date());
    const next: UsageStorage = { days: { ...usage.days }, updatedAt: Date.now() };
    const day = next.days[dayKey] ?? { totalSeconds: 0, videos: {}, modules: {} };
    const current = day.videos[videoId] ?? { videoId, seconds: 0, lastAt: Date.now(), title, module, completed: true };
    current.completed = true;
    if (title && !current.title) current.title = title;
    if (module && !current.module) current.module = module;
    day.videos[videoId] = current;
    next.days[dayKey] = day;
    await persist(next);

    try {
      if (!userId) return;
      const { data: v } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', videoId)
        .limit(1)
        .maybeSingle();
      const videoUuid = v?.id as string | undefined;
      if (videoUuid) {
        await supabase
          .from('progresso_videos')
          .upsert({ usuario_id: userId, video_id: videoUuid, concluido: true }, { onConflict: 'usuario_id,video_id' });
      }
    } catch {}
  }, [usage, persist]);

  const unmarkCompleted = useCallback(async ({ videoId }: { videoId: string }) => {
    const dayKey = formatDate(new Date());
    const next: UsageStorage = { days: { ...usage.days }, updatedAt: Date.now() };
    const day = next.days[dayKey] ?? { totalSeconds: 0, videos: {}, modules: {} };
    const current = day.videos[videoId];
    if (current) {
      current.completed = false;
      day.videos[videoId] = current;
      next.days[dayKey] = day;
      await persist(next);
    }

    try {
      if (!userId) return;
      const { data: v } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', videoId)
        .limit(1)
        .maybeSingle();
      const videoUuid = v?.id as string | undefined;
      if (videoUuid) {
        await supabase
          .from('progresso_videos')
          .update({ concluido: false })
          .eq('usuario_id', userId)
          .eq('video_id', videoUuid);
      }
    } catch {}
  }, [usage, persist]);

  const aggregates: Aggregates = useMemo(() => {
    const todayKey = formatDate(new Date());
    const todaySeconds = usage.days[todayKey]?.totalSeconds ?? 0;
    // Semana atual (seg a dom)
    const start = getWeekStart(new Date());
    const weekSeconds = Object.entries(usage.days).reduce((acc, [k, d]) => {
      const dt = new Date(k + 'T00:00:00');
      return dt >= start ? acc + (d?.totalSeconds || 0) : acc;
    }, 0);
    // Recentes: últimos 14 dias
    const cut = new Date();
    cut.setDate(cut.getDate() - 14);
    const list: Array<VideoUsage & { date: string }> = [];
    Object.entries(usage.days).forEach(([k, d]) => {
      const dt = new Date(k + 'T00:00:00');
      if (dt >= cut) {
        Object.values(d.videos).forEach(v => list.push({ ...v, date: k }));
      }
    });
    list.sort((a, b) => b.lastAt - a.lastAt);
    // Por módulo hoje
    const perModuleToday = { ...(usage.days[todayKey]?.modules || {}) } as Record<string, { count: number; seconds: number }>;
    const perModuleSeconds: Record<string, number> = {};
    const perModuleCount: Record<string, number> = {};
    Object.entries(perModuleToday).forEach(([k, v]) => { perModuleSeconds[k] = v.seconds; perModuleCount[k] = v.count; });
    // Últimos 7 dias
    const last7Days: Array<{ date: string; seconds: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDate(d);
      last7Days.push({ date: key, seconds: usage.days[key]?.totalSeconds || 0 });
    }
    // Últimas 4 semanas (inclui a atual)
    const last4Weeks: Array<{ weekStart: string; seconds: number }> = [];
    for (let i = 0; i < 4; i++) {
      const base = new Date();
      base.setDate(base.getDate() - i * 7);
      const ws = getWeekStart(base);
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      let sum = 0;
      Object.entries(usage.days).forEach(([k, d]) => {
        const dt = new Date(k + 'T00:00:00');
        if (dt >= ws && dt <= we) sum += d?.totalSeconds || 0;
      });
      last4Weeks.unshift({ weekStart: formatDate(ws), seconds: sum });
    }
    return { todaySeconds, weekSeconds, recentVideos: list.slice(0, 20), perModuleToday: perModuleSeconds, perModuleCountToday: perModuleCount, last7Days, last4Weeks };
  }, [usage]);

  const clearUsage = useCallback(async () => {
    const empty: UsageStorage = { days: {}, updatedAt: Date.now() };
    await persist(empty);
  }, [persist]);

  const value = useMemo(() => ({ aggregates, logWatch, logModuleAccess, markCompleted, unmarkCompleted, clearUsage }), [aggregates, logWatch, logModuleAccess, markCompleted, unmarkCompleted, clearUsage]);

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) throw new Error('useUsage must be used within a UsageProvider');
  return ctx;
}


