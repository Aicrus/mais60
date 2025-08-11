import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth';

type VideoUsage = {
  videoId: string;
  title?: string;
  seconds: number;
  lastAt: number; // epoch ms
};

type DayUsage = {
  totalSeconds: number;
  videos: Record<string, VideoUsage>;
};

type UsageStorage = {
  days: Record<string, DayUsage>; // key: YYYY-MM-DD
  updatedAt: number;
};

type Aggregates = {
  todaySeconds: number;
  weekSeconds: number;
  recentVideos: Array<VideoUsage & { date: string }>; // últimos 14 dias
};

type UsageContextData = {
  aggregates: Aggregates;
  logWatch: (params: { videoId: string; seconds: number; title?: string }) => Promise<void>;
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

  const logWatch = useCallback(async ({ videoId, seconds, title }: { videoId: string; seconds: number; title?: string }) => {
    if (!videoId || !Number.isFinite(seconds) || seconds <= 0) return;
    const now = new Date();
    const dayKey = formatDate(now);
    const next: UsageStorage = { days: { ...usage.days }, updatedAt: Date.now() };
    const day = next.days[dayKey] ?? { totalSeconds: 0, videos: {} };
    const current = day.videos[videoId] ?? { videoId, seconds: 0, lastAt: 0, title };
    current.seconds += seconds;
    current.lastAt = Date.now();
    if (title && !current.title) current.title = title;
    day.videos[videoId] = current;
    day.totalSeconds = Object.values(day.videos).reduce((acc, v) => acc + v.seconds, 0);
    next.days[dayKey] = day;
    await persist(next);
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
    return { todaySeconds, weekSeconds, recentVideos: list.slice(0, 20) };
  }, [usage]);

  const clearUsage = useCallback(async () => {
    const empty: UsageStorage = { days: {}, updatedAt: Date.now() };
    await persist(empty);
  }, [persist]);

  const value = useMemo(() => ({ aggregates, logWatch, clearUsage }), [aggregates, logWatch, clearUsage]);

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


