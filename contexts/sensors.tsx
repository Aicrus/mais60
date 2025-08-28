import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { Platform, Linking, Alert, Clipboard } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useToast } from '@/hooks/useToast';

// Função de ligação simplificada usando apenas Linking (mais confiável)

type SensorsState = {
  stepsToday: number | null;
  accelMagnitude: number | null;
  locationEnabled: boolean | null;
  batteryLevel: number | null; // 0..1
  fallDetectionEnabled: boolean;
  emergencyContact: string | null;

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

  showFallAlert: false,
  setFallDetectionEnabled: () => {},
  setEmergencyContact: () => {},
  callEmergencyContact: () => {},
  cancelFallAlert: () => {}
});

export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [accelMagnitude, setAccelMagnitude] = useState<number | null>(null);
  const [accelHistory, setAccelHistory] = useState<number[]>([]);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const { showToast } = useToast();
  const [batteryWarned, setBatteryWarned] = useState<boolean>(false);

  // Fall detection states
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState<boolean>(false);
  const [emergencyContact, setEmergencyContact] = useState<string | null>(null);
  const [lastAccelValues, setLastAccelValues] = useState<number[]>([]);
  const [fallDetected, setFallDetected] = useState<boolean>(false);
  const [showFallAlert, setShowFallAlert] = useState<boolean>(false);

  // Fall detection internal state
  const highImpactDetectedRef = useRef<boolean>(false);
  const stillnessStartTimeRef = useRef<number>(0);
  const monitoringStartTimeRef = useRef<number>(0);

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

        // Manter histórico das últimas 5 leituras para média móvel
        setAccelHistory(prev => {
          const newHistory = [...prev, m].slice(-5); // Manter apenas as últimas 5
          const average = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;

          // Atualizar magnitude com média arredondada para 1 casa decimal
          setAccelMagnitude(Number.isFinite(average) ? Number(average.toFixed(1)) : 0);
          return newHistory;
        });
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

  // Load fall detection settings (only enabled/disabled state from AsyncStorage)
  useEffect(() => {
    (async () => {
      try {
        const enabled = await AsyncStorage.getItem('@fall_detection_enabled');
        setFallDetectionEnabled(enabled === 'true');
      } catch {}
    })();
  }, []);

  // Simplified and more reliable fall detection
  useEffect(() => {
    if (!fallDetectionEnabled || showFallAlert) return;

    let accelSubscription: any = null;
    let fallDetectionBuffer: number[] = [];

    try {
      Accelerometer.setUpdateInterval(200); // Faster updates for quicker detection
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
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

        // Detect high impact (sudden spike) - simplified threshold
        if (!highImpactDetectedRef.current && recentAvg > 2.5) {
          highImpactDetectedRef.current = true;
          stillnessStartTimeRef.current = Date.now();
          monitoringStartTimeRef.current = stillnessStartTimeRef.current + 500; // Start monitoring after 0.5s
          console.log('🚨 Queda detectada - modal aberto');
        }

        // If high impact detected, monitor for stillness
        if (highImpactDetectedRef.current) {
          const currentTime = Date.now();

          // Start monitoring after brief delay
          if (currentTime >= monitoringStartTimeRef.current && monitoringStartTimeRef.current > 0) {
            const monitoringTime = Math.round((currentTime - monitoringStartTimeRef.current) / 1000);

            // Check for stillness (magnitude below 2.5 during monitoring)
            if (recentAvg < 2.5) {
              // If still for 2+ seconds, confirm fall
              if (monitoringTime >= 2 && !fallDetected) {
                console.log('✅ Ligação de emergência acionada');
                setFallDetected(true);
                setShowFallAlert(true);
                handleFallDetected();
              }
            } else if (recentAvg > 4.0) {
              // Only reset if movement is very high (indicates normal activity)
              highImpactDetectedRef.current = false;
              stillnessStartTimeRef.current = 0;
              monitoringStartTimeRef.current = 0;
            }
          }

          // Reset everything after 8 seconds total
          if (currentTime - stillnessStartTimeRef.current > 8000) {
            highImpactDetectedRef.current = false;
            stillnessStartTimeRef.current = 0;
            monitoringStartTimeRef.current = 0;
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

  // Handle fall detection - improved
  const handleFallDetected = () => {
    console.log('🚨 Modal de emergência exibido');
    showToast({
      type: 'error',
      message: 'Queda detectada!',
      description: 'Modal de emergência aberto',
      position: Platform.OS === 'web' ? 'bottom-right' : 'top',
      duration: 5000,
      closable: true,
    });

    // Remove automatic calling - let user decide via modal
    // The modal will handle the call after user interaction
  };

  // Cancel fall alert
  const cancelFallAlert = () => {
    console.log('🚫 Alerta de queda cancelado pelo usuário');
    setShowFallAlert(false);
    setFallDetected(false);
    // Reset all fall detection states
    highImpactDetectedRef.current = false;
    stillnessStartTimeRef.current = 0;
    monitoringStartTimeRef.current = 0;

    showToast({
      type: 'success',
      message: 'Alerta cancelado',
      description: 'Tudo está bem - alerta de emergência cancelado.',
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

      setEmergencyContact(contact);
    } catch {}
  };

  const callEmergencyContact = async () => {
    if (!emergencyContact) {
      Alert.alert('Erro', 'Nenhum contato de emergência configurado.');
      return;
    }

    const isExpoGo = Constants.appOwnership === 'expo';

    // Sempre tentar ligar diretamente primeiro
    // Mesmo no Expo Go, vamos tentar abrir o app de telefone
    const message = `Ligar para ${emergencyContact}?`;

    Alert.alert(
      'Confirmação de emergência',
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ligar agora',
          style: 'destructive',
          onPress: async () => {
            await makeEmergencyCall();
          }
        }
      ]
    );
  };

  const makeEmergencyCall = async () => {
    try {
      console.log('📞 Iniciando ligação de emergência...');

      // Fechar modal imediatamente
      setShowFallAlert(false);
      setFallDetected(false);

      // Reset all fall detection states
      highImpactDetectedRef.current = false;
      stillnessStartTimeRef.current = 0;
      monitoringStartTimeRef.current = 0;

      // Verificar se emergencyContact existe
      if (!emergencyContact) {
        throw new Error('Contato de emergência não configurado');
      }

      // Limpar o número de telefone (remover formatação)
      const phoneNumber = emergencyContact.replace(/\D/g, '');

      // Validar se é um número válido (10 ou 11 dígitos)
      if (phoneNumber.length < 10 || phoneNumber.length > 11) {
        Alert.alert('Número inválido', 'O número deve ter 10 ou 11 dígitos.');
        return;
      }

      console.log('📞 Ligando para:', phoneNumber, '- Ambiente:', Constants.appOwnership);

      // Mostrar feedback visual antes da ligação
      showToast({
        type: 'info',
        message: 'Ligando...',
        description: `Discando para ${phoneNumber}`,
        position: Platform.OS === 'web' ? 'bottom-right' : 'top',
        duration: 3000,
        closable: true,
      });

      // Criar URL de ligação
      const url = `tel:${phoneNumber}`;

      // Sempre tentar abrir o app de telefone diretamente
      // Mesmo no Expo Go, isso vai abrir o app de telefone nativo
      await Linking.openURL(url);
      console.log('✅ Tentativa de ligação realizada');

      // Feedback de sucesso
      setTimeout(() => {
        showToast({
          type: 'success',
          message: 'Ligação iniciada!',
          description: 'Verifique seu telefone',
          position: Platform.OS === 'web' ? 'bottom-right' : 'top',
          duration: 5000,
          closable: true,
        });
      }, 1500);

    } catch (error) {
      console.error('❌ Erro na ligação:', error);

      // Reset states even on error
      setShowFallAlert(false);
      setFallDetected(false);
      highImpactDetectedRef.current = false;
      stillnessStartTimeRef.current = 0;
      monitoringStartTimeRef.current = 0;

      // Em caso de erro, oferecer alternativas
      const phoneNumber = emergencyContact?.replace(/\D/g, '');
      await showAlternativeContactOptions(phoneNumber);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      showToast({
        type: 'success',
        message: 'Número copiado!',
        description: `Número ${text} copiado para área de transferência`,
        position: Platform.OS === 'web' ? 'bottom-right' : 'top',
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      Alert.alert('Erro', 'Não foi possível copiar o número.');
    }
  };

  const showAlternativeContactOptions = async (phoneNumber: string | null) => {
    const isExpoGo = Constants.appOwnership === 'expo';

    let message = '';
    let actions: any[] = [];

    if (isExpoGo) {
      message = `🚨 Número de emergência: ${phoneNumber || 'não disponível'}\n\nCopie este número e ligue manualmente através do seu app de telefone.`;

      actions = [
        {
          text: '📋 Copiar número',
          onPress: () => {
            if (phoneNumber) {
              copyToClipboard(phoneNumber);
            }
          }
        },
        {
          text: '📱 Abrir app Telefone',
          onPress: () => {
            Linking.openURL('tel:').catch(() => {
              Alert.alert('Atenção', 'Abra manualmente o app Telefone do seu dispositivo.');
            });
          }
        },
        { text: 'Fechar', style: 'cancel' }
      ];
    } else {
      message = `🚨 Erro na ligação automática.\n\nNúmero de emergência: ${phoneNumber || 'não disponível'}\n\nCopie o número e ligue manualmente.`;

      actions = [
        {
          text: '📋 Copiar número',
          onPress: () => {
            if (phoneNumber) {
              copyToClipboard(phoneNumber);
            }
          }
        },
        {
          text: '📱 Abrir app Telefone',
          onPress: () => {
            Linking.openURL('tel:').catch(() => {
              Alert.alert('Dica', 'Abra manualmente o app Telefone do seu dispositivo.');
            });
          }
        },
        { text: 'Fechar', style: 'cancel' }
      ];
    }

    Alert.alert(
      'Opções de emergência',
      message,
      actions
    );
  };

  const value = useMemo(() => ({
    stepsToday,
    accelMagnitude,
    locationEnabled,
    batteryLevel,
    fallDetectionEnabled,
    emergencyContact,

    showFallAlert,
    setFallDetectionEnabled: saveFallDetectionEnabled,
    setEmergencyContact: saveEmergencyContact,
    callEmergencyContact,
    cancelFallAlert
  }), [stepsToday, accelMagnitude, locationEnabled, batteryLevel, fallDetectionEnabled, emergencyContact, showFallAlert]);
  return (
    <SensorsContext.Provider value={value}>
      {children}
    </SensorsContext.Provider>
  );
}

export function useSensors() {
  return useContext(SensorsContext);
}


