import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth';

export type FavoriteItem = {
  id: string;
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        if (raw) {
          const parsed: FavoriteItem[] = JSON.parse(raw);
          setFavorites(Array.isArray(parsed) ? parsed : []);
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
  }, [storageKey]);

  const persist = useCallback(async (list: FavoriteItem[]) => {
    setFavorites(list);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  }, [storageKey]);

  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    persist(
      isFavorite(item.id)
        ? favorites.filter(f => f.id !== item.id)
        : [{ id: item.id, title: item.title, subtitle: item.subtitle, type: item.type || 'video', thumbnailUrl: item.thumbnailUrl }, ...favorites]
    );
  }, [favorites, isFavorite, persist]);

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


