import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export type FavoriteItem = {
  id: string; // youtube_id
  title: string;
  subtitle?: string;
  type?: 'video';
  thumbnailUrl?: string;
};

type FavoritesContextData = {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

function useStorageKey(userId?: string | null) {
  return useMemo(() => `@mais60:favorites:${userId || 'anon'}:v1`, [userId]);
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const storageKey = useStorageKey(userId);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Garante unicidade por id preservando a primeira ocorrência
  const uniqueById = useCallback((items: FavoriteItem[]): FavoriteItem[] => {
    const map = new Map<string, FavoriteItem>();
    for (const it of items || []) {
      if (it && typeof it.id === 'string' && !map.has(it.id)) {
        map.set(it.id, it);
      }
    }
    return Array.from(map.values());
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Carrega do Supabase se logado; fallback para cache local
        if (userId) {
          const { data, error } = await supabase
            .from('favoritos')
            .select('video_id, videos(youtube_id,titulo,descricao)')
            .eq('usuario_id', userId);
          if (!mounted) return;
          if (!error && data) {
            const list: FavoriteItem[] = data
              .map((row: any) => {
                const v = row.videos as any;
                if (!v || !v.youtube_id) return null;
                return {
                  id: v.youtube_id,
                  title: v.titulo || `Vídeo ${v.youtube_id}`,
                  subtitle: v.descricao || 'YouTube',
                  type: 'video' as const,
                  thumbnailUrl: `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`
                };
              })
              .filter(Boolean) as FavoriteItem[];
            const deduped = uniqueById(list);
            setFavorites(deduped);
            await AsyncStorage.setItem(storageKey, JSON.stringify(deduped));
            return;
          }
        }
        // Fallback para cache local
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        if (raw) {
          const parsed: FavoriteItem[] = JSON.parse(raw);
          const normalized = uniqueById(Array.isArray(parsed) ? parsed : []);
          setFavorites(normalized);
          // Se houverem duplicatas, reescrever o cache normalizado
          if (Array.isArray(parsed) && parsed.length !== normalized.length) {
            try { await AsyncStorage.setItem(storageKey, JSON.stringify(normalized)); } catch {}
          }
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageKey, userId]);

  const persist = useCallback(async (list: FavoriteItem[]) => {
    const normalized = uniqueById(list);
    setFavorites(normalized);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(normalized));
    } catch {}
  }, [storageKey, uniqueById]);

  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites]);

  const toggleFavorite = useCallback(async (item: FavoriteItem) => {
    // Atualiza otimista local
    const next = isFavorite(item.id)
      ? favorites.filter(f => f.id !== item.id)
      : [{ id: item.id, title: item.title, subtitle: item.subtitle, type: item.type || 'video', thumbnailUrl: item.thumbnailUrl }, ...favorites];
    await persist(next);

    // Sincroniza com Supabase se logado
    try {
      if (!userId) return;
      // Obter UUID do vídeo pela youtube_id
      const { data: v } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', item.id)
        .limit(1)
        .maybeSingle();
      const videoUuid = v?.id as string | undefined;
      if (!videoUuid) return;

      if (isFavorite(item.id)) {
        // Remover favorito
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', userId)
          .eq('video_id', videoUuid);
      } else {
        // Adicionar favorito
        await supabase
          .from('favoritos')
          .insert({ usuario_id: userId, video_id: videoUuid });
      }
    } catch {}
  }, [favorites, isFavorite, persist, userId]);

  const removeFavorite = useCallback((id: string) => {
    persist(favorites.filter(f => f.id !== id));
  }, [favorites, persist]);

  const clearFavorites = useCallback(() => {
    persist([]);
  }, [persist]);

  const value = useMemo(() => ({ favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites }), [favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}


