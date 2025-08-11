import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Point = { latitude: number; longitude: number; timestamp: number };

type DayTrack = {
  date: string; // YYYY-MM-DD
  points: Point[];
  totalMeters: number;
};

type LocationState = {
  isTracking: boolean;
  permission: 'granted' | 'denied' | 'undetermined';
  todayMeters: number;
  pointsCount: number;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
};

const LocationContext = createContext<LocationState>({} as LocationState);

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function haversine(a: Point, b: Point): number {
  const R = 6371e3; // meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isTracking, setIsTracking] = useState(false);
  const [todayMeters, setTodayMeters] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const storageKey = useMemo(() => `@mais60:location:${formatDate(new Date())}:v1`, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const obj: DayTrack = JSON.parse(raw);
          setTodayMeters(obj?.totalMeters || 0);
          setPointsCount(obj?.points?.length || 0);
        }
      } catch {}
    })();
  }, [storageKey]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermission(status);
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (track: DayTrack) => {
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(track)); } catch {}
  }, [storageKey]);

  const startTracking = useCallback(async () => {
    try {
      let status = permission;
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
        setPermission(status);
      }
      if (status !== 'granted') return;
      if (watcher.current) return;
      const options: Location.LocationOptions = { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 };
      watcher.current = await Location.watchPositionAsync(options, async (loc) => {
        try {
          const point: Point = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, timestamp: Date.now() };
          const raw = (await AsyncStorage.getItem(storageKey)) || '';
          let track: DayTrack = raw ? JSON.parse(raw) : { date: formatDate(new Date()), points: [], totalMeters: 0 };
          const last = track.points[track.points.length - 1];
          if (last) {
            const inc = haversine(last, point);
            if (Number.isFinite(inc) && inc >= 0.5) {
              track.totalMeters += inc;
            }
          }
          track.points.push(point);
          setTodayMeters(track.totalMeters);
          setPointsCount(track.points.length);
          await persist(track);
        } catch {}
      });
      setIsTracking(true);
    } catch {}
  }, [permission, persist, storageKey]);

  const stopTracking = useCallback(async () => {
    try { watcher.current?.remove(); } catch {}
    watcher.current = null;
    setIsTracking(false);
  }, []);

  const value = useMemo(() => ({ isTracking, permission, todayMeters, pointsCount, startTracking, stopTracking }), [isTracking, permission, todayMeters, pointsCount, startTracking, stopTracking]);
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationTrack() {
  return useContext(LocationContext);
}


