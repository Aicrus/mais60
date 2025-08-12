import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { useToast } from '@/hooks/useToast';

type SensorsState = {
  stepsToday: number | null;
  accelMagnitude: number | null;
  locationEnabled: boolean | null;
  batteryLevel: number | null; // 0..1
};

const SensorsContext = createContext<SensorsState>({ stepsToday: null, accelMagnitude: null, locationEnabled: null, batteryLevel: null });

export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [accelMagnitude, setAccelMagnitude] = useState<number | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const { showToast } = useToast();
  const [batteryWarned, setBatteryWarned] = useState<boolean>(false);

  // Pedometer
  useEffect(() => {
    let subscription: any = null;
    (async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) return;
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const result = await Pedometer.getStepCountAsync(start, end);
        setStepsToday(result?.steps ?? 0);
        subscription = Pedometer.watchStepCount((res) => {
          setStepsToday((prev) => Math.max(res.steps, prev || 0));
        });
      } catch {}
    })();
    return () => { try { subscription && subscription.remove && subscription.remove(); } catch {} };
  }, []);

  // Accelerometer magnitude média
  useEffect(() => {
    let sub: any;
    try {
      Accelerometer.setUpdateInterval(2000);
      sub = Accelerometer.addListener((data) => {
        const m = Math.sqrt((data?.x || 0) ** 2 + (data?.y || 0) ** 2 + (data?.z || 0) ** 2);
        setAccelMagnitude(Number.isFinite(m) ? Number(m.toFixed(2)) : 0);
      });
    } catch {}
    return () => { try { sub && sub.remove && sub.remove(); } catch {} };
  }, []);

  // Location (só estado de permissão, sem solicitar ao abrir; pedido ocorre no LocationProvider quando o usuário iniciar o tracking)
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'web') { setLocationEnabled(false); return; }
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationEnabled(status === 'granted');
      } catch { setLocationEnabled(false); }
    })();
  }, []);

  // Battery level
  useEffect(() => {
    let sub: any = null;
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        setBatteryLevel(level);
        sub = Battery.addBatteryLevelListener(({ batteryLevel }) => setBatteryLevel(batteryLevel));
      } catch {}
    })();
    return () => { try { sub && sub.remove && sub.remove(); } catch {} };
  }, []);

  // Battery low alert (15%)
  useEffect(() => {
    if (batteryLevel == null) return;
    if (!batteryWarned && batteryLevel <= 0.15) {
      showToast({
        type: 'warning',
        message: 'Bateria baixa',
        description: 'Conecte o carregador para não interromper suas atividades.',
        position: Platform.OS === 'web' ? 'bottom-right' : 'top',
        duration: 5000,
        closable: true,
      });
      setBatteryWarned(true);
    }
    if (batteryWarned && batteryLevel > 0.20) {
      // Reseta aviso quando subir acima de 20%
      setBatteryWarned(false);
    }
  }, [batteryLevel, batteryWarned, showToast]);

  const value = useMemo(() => ({ stepsToday, accelMagnitude, locationEnabled, batteryLevel }), [stepsToday, accelMagnitude, locationEnabled, batteryLevel]);
  return (
    <SensorsContext.Provider value={value}>
      {children}
    </SensorsContext.Provider>
  );
}

export function useSensors() {
  return useContext(SensorsContext);
}


