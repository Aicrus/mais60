import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '@/hooks/useToast';

// Telephony APIs for native phone calls
let Communications: any = null;

// Tentar carregar biblioteca de comunicações (mais comum)
try {
  Communications = require('react-native-communications');
} catch (e) {
  console.log('react-native-communications not available, using Linking fallback');
}

type SensorsState = {
  stepsToday: number | null;
  accelMagnitude: number | null;
  locationEnabled: boolean | null;
  batteryLevel: number | null; // 0..1
  fallDetectionEnabled: boolean;
  emergencyContact: string | null;
  fallConfirmationCountdown: number | null;
  showFallAlert: boolean;
  setFallDetectionEnabled: (enabled: boolean) => void;
  setEmergencyContact: (contact: string) => void;
  callEmergencyContact: () => void;
  cancelFallAlert: () => void;
};

const SensorsContext = createContext<SensorsState>({
  stepsToday: null,
  accelMagnitude: null,
  locationEnabled: null,
  batteryLevel: null,
  fallDetectionEnabled: false,
  emergencyContact: null,
  fallConfirmationCountdown: null,
  showFallAlert: false,
  setFallDetectionEnabled: () => {},
  setEmergencyContact: () => {},
  callEmergencyContact: () => {},
  cancelFallAlert: () => {}
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
  const [fallConfirmationCountdown, setFallConfirmationCountdown] = useState<number | null>(null);
  const [showFallAlert, setShowFallAlert] = useState<boolean>(false);

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

  // Improved fall detection logic
  useEffect(() => {
    if (!fallDetectionEnabled || showFallAlert) return;

    let accelSubscription: any = null;
    let fallDetectionBuffer: number[] = [];
    let highImpactDetected = false;
    let stillnessStartTime = 0;

    try {
      Accelerometer.setUpdateInterval(50); // Very frequent readings for accurate detection
      accelSubscription = Accelerometer.addListener((data) => {
        const magnitude = Math.sqrt((data?.x || 0) ** 2 + (data?.y || 0) ** 2 + (data?.z || 0) ** 2);

        // Maintain buffer of recent readings
        fallDetectionBuffer.push(magnitude);
        if (fallDetectionBuffer.length > 20) {
          fallDetectionBuffer.shift();
        }

        // Only process if we have enough data
        if (fallDetectionBuffer.length < 10) return;

        const recent = fallDetectionBuffer.slice(-5);
        const older = fallDetectionBuffer.slice(-15, -5);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        // Detect high impact (sudden acceleration spike)
        if (!highImpactDetected && olderAvg < 2.0 && recentAvg > 3.5) {
          highImpactDetected = true;
          stillnessStartTime = Date.now();
        }

        // If high impact detected, look for subsequent stillness
        if (highImpactDetected) {
          const currentTime = Date.now();
          const timeSinceImpact = currentTime - stillnessStartTime;

          // Check for stillness (low movement for at least 2 seconds)
          if (recentAvg < 1.2 && timeSinceImpact > 2000 && timeSinceImpact < 8000) {
            // Additional check: ensure this isn't just sitting down
            const maxInRecent = Math.max(...recent);
            const minInRecent = Math.min(...recent);

            if (maxInRecent - minInRecent < 1.0 && !fallDetected) {
              setFallDetected(true);
              setShowFallAlert(true);
              handleFallDetected();
            }
          }

          // Reset if movement resumes or too much time passes
          if (recentAvg > 2.0 || timeSinceImpact > 10000) {
            highImpactDetected = false;
            stillnessStartTime = 0;
          }
        }
      });
    } catch {}

    return () => {
      try {
        if (accelSubscription?.remove) accelSubscription.remove();
      } catch {}
    };
  }, [fallDetectionEnabled, fallDetected, showFallAlert]);

  // Handle fall detection
  const handleFallDetected = () => {
    showToast({
      type: 'error',
      message: '⚠️ Queda detectada!',
      description: 'Uma queda foi detectada. Você tem 15 segundos para cancelar a ligação.',
      position: Platform.OS === 'web' ? 'bottom-right' : 'top',
      duration: 15000,
      closable: true,
    });

    // Start countdown for emergency call
    setFallConfirmationCountdown(15);
    const countdownInterval = setInterval(() => {
      setFallConfirmationCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          if (emergencyContact && showFallAlert) {
            callEmergencyContact();
          }
          setShowFallAlert(false);
          setFallDetected(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel fall alert
  const cancelFallAlert = () => {
    setShowFallAlert(false);
    setFallDetected(false);
    setFallConfirmationCountdown(null);
    showToast({
      type: 'success',
      message: 'Alerta cancelado',
      description: 'A ligação de emergência foi cancelada.',
      position: Platform.OS === 'web' ? 'bottom-right' : 'top',
      duration: 3000,
      closable: true,
    });
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
      // Validate phone number (Brazilian format)
      const cleanNumber = contact.replace(/\D/g, '');
      if (cleanNumber.length < 10 || cleanNumber.length > 11) {
        showToast({
          type: 'error',
          message: 'Número inválido',
          description: 'Digite um número de telefone válido com DDD (10 ou 11 dígitos).',
          position: Platform.OS === 'web' ? 'bottom-right' : 'top',
          duration: 5000,
          closable: true,
        });
        return;
      }

      await AsyncStorage.setItem('@emergency_contact', contact);
      setEmergencyContact(contact);

      showToast({
        type: 'success',
        message: 'Contato salvo',
        description: 'Contato de emergência configurado com sucesso.',
        position: Platform.OS === 'web' ? 'bottom-right' : 'top',
        duration: 3000,
        closable: true,
      });
    } catch {}
  };

  const callEmergencyContact = async () => {
    if (!emergencyContact) {
      Alert.alert('Erro', 'Nenhum contato de emergência configurado.');
      return;
    }

    const phoneNumber = emergencyContact.replace(/\D/g, '');
    const url = `tel:${phoneNumber}`;

    try {
      // Mostrar feedback visual antes da ligação
      showToast({
        type: 'info',
        message: 'Ligando...',
        description: `Discando para ${phoneNumber}`,
        position: Platform.OS === 'web' ? 'bottom-right' : 'top',
        duration: 2000,
        closable: true,
      });

      // Tentar ligação nativa primeiro - múltiplas opções
      let callSuccessful = false;

      // 1. Tentar react-native-communications (cross-platform e mais rápida)
      if (Communications && Communications.phonecall) {
        try {
          console.log('📞 Usando Communications API para ligação direta');
          Communications.phonecall(phoneNumber, false);
          callSuccessful = true;
        } catch (commError) {
          console.log('Communications call failed, trying fallback:', commError);
        }
      }

      // 2. Se Communications não funcionou ou não está disponível, usar Linking como fallback
      if (!callSuccessful) {
        console.log('📞 Usando Linking API como fallback');
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          callSuccessful = true;
        } else {
          throw new Error('URL not supported - sistema telefônico não disponível');
        }
      }

      // Feedback após ligação iniciada
      setTimeout(() => {
        showToast({
          type: 'success',
          message: 'Ligação iniciada',
          description: 'Verifique se a chamada foi estabelecida',
          position: Platform.OS === 'web' ? 'bottom-right' : 'top',
          duration: 3000,
          closable: true,
        });
      }, 1000);
    } catch (error) {
      console.error('Call error:', error);
      Alert.alert(
        'Erro na ligação',
        'Não foi possível fazer a ligação. Verifique:\n\n• Permissões de telefone\n• Número válido\n• Conexão de rede',
        [
          { text: 'Tentar novamente', onPress: callEmergencyContact },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const value = useMemo(() => ({
    stepsToday,
    accelMagnitude,
    locationEnabled,
    batteryLevel,
    fallDetectionEnabled,
    emergencyContact,
    fallConfirmationCountdown,
    showFallAlert,
    setFallDetectionEnabled: saveFallDetectionEnabled,
    setEmergencyContact: saveEmergencyContact,
    callEmergencyContact,
    cancelFallAlert
  }), [stepsToday, accelMagnitude, locationEnabled, batteryLevel, fallDetectionEnabled, emergencyContact, fallConfirmationCountdown, showFallAlert]);
  return (
    <SensorsContext.Provider value={value}>
      {children}
    </SensorsContext.Provider>
  );
}

export function useSensors() {
  return useContext(SensorsContext);
}


