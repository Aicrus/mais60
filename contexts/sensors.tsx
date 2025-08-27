import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '@/hooks/useToast';

type SensorsState = {
  stepsToday: number | null;
  accelMagnitude: number | null;
  locationEnabled: boolean | null;
  batteryLevel: number | null; // 0..1
  fallDetectionEnabled: boolean;
  emergencyContact: string | null;
  setFallDetectionEnabled: (enabled: boolean) => void;
  setEmergencyContact: (contact: string) => void;
  callEmergencyContact: () => void;
};

const SensorsContext = createContext<SensorsState>({
  stepsToday: null,
  accelMagnitude: null,
  locationEnabled: null,
  batteryLevel: null,
  fallDetectionEnabled: false,
  emergencyContact: null,
  setFallDetectionEnabled: () => {},
  setEmergencyContact: () => {},
  callEmergencyContact: () => {}
});

export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [accelMagnitude, setAccelMagnitude] = useState<number | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const { showToast } = useToast();
  const [batteryWarned, setBatteryWarned] = useState<boolean>(false);

  // Fall detection states
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState<boolean>(false);
  const [emergencyContact, setEmergencyContact] = useState<string | null>(null);
  const [lastAccelValues, setLastAccelValues] = useState<number[]>([]);
  const [fallDetected, setFallDetected] = useState<boolean>(false);

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

  // Load fall detection settings
  useEffect(() => {
    (async () => {
      try {
        const enabled = await AsyncStorage.getItem('@fall_detection_enabled');
        const contact = await AsyncStorage.getItem('@emergency_contact');
        setFallDetectionEnabled(enabled === 'true');
        if (contact) setEmergencyContact(contact);
      } catch {}
    })();
  }, []);

  // Fall detection logic
  useEffect(() => {
    if (!fallDetectionEnabled) return;

    let accelSubscription: any = null;

    try {
      Accelerometer.setUpdateInterval(100); // More frequent readings for fall detection
      accelSubscription = Accelerometer.addListener((data) => {
        const magnitude = Math.sqrt((data?.x || 0) ** 2 + (data?.y || 0) ** 2 + (data?.z || 0) ** 2);

        setLastAccelValues(prev => {
          const newValues = [...prev, magnitude].slice(-10); // Keep last 10 values

          // Detect fall: sudden drop in acceleration followed by stillness
          if (newValues.length >= 5) {
            const recent = newValues.slice(-3);
            const older = newValues.slice(-8, -3);
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

            // Fall pattern: high acceleration followed by low acceleration (sudden stop)
            if (olderAvg > 1.5 && recentAvg < 0.8 && !fallDetected) {
              setFallDetected(true);
              handleFallDetected();
            }
          }

          return newValues;
        });
      });
    } catch {}

    return () => {
      try {
        if (accelSubscription?.remove) accelSubscription.remove();
      } catch {}
    };
  }, [fallDetectionEnabled, fallDetected]);

  // Handle fall detection
  const handleFallDetected = () => {
    showToast({
      type: 'error',
      message: 'Queda detectada!',
      description: 'Uma queda foi detectada. Ligue para emergência se precisar de ajuda.',
      position: Platform.OS === 'web' ? 'bottom-right' : 'top',
      duration: 10000,
      closable: true,
    });

    // Call emergency contact after 10 seconds if no response
    setTimeout(() => {
      if (emergencyContact && !fallDetected) {
        callEmergencyContact();
      }
      setFallDetected(false);
    }, 10000);
  };

  // Emergency contact functions
  const saveFallDetectionEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('@fall_detection_enabled', enabled.toString());
      setFallDetectionEnabled(enabled);
    } catch {}
  };

  const saveEmergencyContact = async (contact: string) => {
    try {
      await AsyncStorage.setItem('@emergency_contact', contact);
      setEmergencyContact(contact);
    } catch {}
  };

  const callEmergencyContact = () => {
    if (!emergencyContact) {
      Alert.alert('Erro', 'Nenhum contato de emergência configurado.');
      return;
    }

    const phoneNumber = emergencyContact.replace(/\D/g, '');
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível fazer a ligação.');
      }
    });
  };

  const value = useMemo(() => ({
    stepsToday,
    accelMagnitude,
    locationEnabled,
    batteryLevel,
    fallDetectionEnabled,
    emergencyContact,
    setFallDetectionEnabled: saveFallDetectionEnabled,
    setEmergencyContact: saveEmergencyContact,
    callEmergencyContact
  }), [stepsToday, accelMagnitude, locationEnabled, batteryLevel, fallDetectionEnabled, emergencyContact]);
  return (
    <SensorsContext.Provider value={value}>
      {children}
    </SensorsContext.Provider>
  );
}

export function useSensors() {
  return useContext(SensorsContext);
}


