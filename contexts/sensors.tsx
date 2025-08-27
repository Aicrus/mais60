import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
    let highImpactDetected = false;
    let stillnessStartTime = 0;
    let monitoringStartTime = 0;

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
        if (!highImpactDetected && recentAvg > 2.5) {
          highImpactDetected = true;
          stillnessStartTime = Date.now();
          monitoringStartTime = stillnessStartTime + 500; // Start monitoring after 0.5s
          console.log('🚨 IMPACTO DETECTADO:', recentAvg.toFixed(2));
        }

        // If high impact detected, monitor for stillness
        if (highImpactDetected) {
          const currentTime = Date.now();

          // Start monitoring after brief delay
          if (currentTime >= monitoringStartTime && monitoringStartTime > 0) {
            const monitoringTime = Math.round((currentTime - monitoringStartTime) / 1000);

            // Check for stillness (magnitude below 2.5 during monitoring)
            if (recentAvg < 2.5) {
              // If still for 2+ seconds, confirm fall
              if (monitoringTime >= 2 && !fallDetected) {
                console.log('✅ QUEDA CONFIRMADA! Ligando para emergência...');
                setFallDetected(true);
                setShowFallAlert(true);
                handleFallDetected();
              }
            } else if (recentAvg > 4.0) {
              // Only reset if movement is very high (indicates normal activity)
              highImpactDetected = false;
              stillnessStartTime = 0;
              monitoringStartTime = 0;
            }
          }

          // Reset everything after 8 seconds total
          if (currentTime - stillnessStartTime > 8000) {
            highImpactDetected = false;
            stillnessStartTime = 0;
            monitoringStartTime = 0;
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

  // Handle fall detection - simplified
  const handleFallDetected = () => {
    console.log('🚨 ALERTA DE QUEDA! Iniciando ligação em 3 segundos...');
    showToast({
      type: 'error',
      message: 'Queda detectada!',
      description: 'Ligando para emergência em 3 segundos...',
      position: Platform.OS === 'web' ? 'bottom-right' : 'top',
      duration: 3000,
      closable: true,
    });

    // Simple 3-second delay before calling
    setTimeout(() => {
      if (emergencyContact && showFallAlert) {
        console.log('📞 Executando ligação de emergência...');
        callEmergencyContact();
      }
      setShowFallAlert(false);
      setFallDetected(false);
    }, 3000);
  };

  // Cancel fall alert
  const cancelFallAlert = () => {
    setShowFallAlert(false);
    setFallDetected(false);
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

      setEmergencyContact(contact);
    } catch {}
  };

  const callEmergencyContact = async () => {
    if (!emergencyContact) {
      Alert.alert('Erro', 'Nenhum contato de emergência configurado.');
      return;
    }

    const isExpoGo = Constants.appOwnership === 'expo';
    const isDevelopment = __DEV__;

    let message = `Deseja ligar para ${emergencyContact}?`;
    let confirmButtonText = 'Ligar agora';

    if (isExpoGo) {
      message = `Expo Go: Copiará o número ${emergencyContact} para você ligar manualmente. Continuar?`;
      confirmButtonText = 'Copiar número';
    } else if (!isDevelopment) {
      message = `Ligação de emergência para ${emergencyContact}. Você será conectado diretamente. Continuar?`;
    }

    // Primeiro confirmar se o usuário quer ligar
    Alert.alert(
      'Confirmar ligação',
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: confirmButtonText,
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

      console.log('Iniciando ligação para:', phoneNumber);
      console.log('Plataforma:', Platform.OS);
      console.log('Contato original:', emergencyContact);

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
      console.log('URL:', url);

      // Verificar se o dispositivo suporta ligações
      const supported = await Linking.canOpenURL(url);
      console.log('Suportado:', supported);

      if (supported) {
        console.log('Abrindo ligação...');

        // Abrir ligação diretamente
        await Linking.openURL(url);

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
        }, 2000);

      } else {
        // Se não suporta ligações, mostrar alternativas
        await showAlternativeContactOptions(phoneNumber);
      }

    } catch (error) {
      console.error('Erro na ligação:', error);
      await showAlternativeContactOptions(null);
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
    const isDevelopment = __DEV__;

    let message = '';
    let actions: any[] = [];

    if (isExpoGo) {
      if (isDevelopment) {
        message = `Ambiente de Desenvolvimento:\n\nPara testar ligações no Expo Go:\n\n1. Copie o número abaixo\n2. Abra o app Telefone do seu dispositivo\n3. Cole o número e ligue manualmente\n\nPara produção: use um build nativo para ligações diretas.`;

        actions = [
          {
            text: 'Copiar número',
            onPress: () => {
              if (phoneNumber) {
                copyToClipboard(phoneNumber);
              }
            }
          },
          {
            text: 'Ver instruções',
            onPress: () => {
              Alert.alert(
                'Como testar ligações',
                `Para testar ligações de emergência:\n\n1. Copie o número: ${phoneNumber}\n2. Abra o app Telefone\n3. Cole e ligue\n\nOu use um build de desenvolvimento fora do Expo Go.`
              );
            }
          },
          { text: 'Entendi', style: 'cancel' }
        ];
      } else {
        message = `Expo Go não suporta ligações diretas.\n\nPara ligar:\n• Copie o número abaixo\n• Ligue manualmente`;

        actions = [
          {
            text: 'Copiar número',
            onPress: () => {
              if (phoneNumber) {
                copyToClipboard(phoneNumber);
              }
            }
          },
          { text: 'OK', style: 'cancel' }
        ];
      }
    } else {
      message = `Este dispositivo não suporta ligações telefônicas diretamente.\n\nPara ligar:\n• Copie o número abaixo\n• Abra o app Telefone\n• Ligue manualmente\n\nNúmero: ${phoneNumber || 'não disponível'}`;

      actions = [
        {
          text: 'Copiar número',
          onPress: () => {
            if (phoneNumber) {
              copyToClipboard(phoneNumber);
            }
          }
        },
        {
          text: 'Abrir Telefone',
          onPress: () => {
            Linking.openURL('tel:').catch(() => {
              Alert.alert('Dica', 'Abra manualmente o app Telefone do seu dispositivo.');
            });
          }
        },
        { text: 'OK', style: 'cancel' }
      ];
    }

    Alert.alert(
      'Como ligar para emergência',
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


