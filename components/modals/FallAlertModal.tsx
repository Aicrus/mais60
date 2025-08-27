import React, { memo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useSensors } from '@/contexts/sensors';
import { useTheme } from '@/hooks/DesignSystemContext';
import Constants from 'expo-constants';

const FallAlertModal = memo(function FallAlertModal() {
  const sensors = useSensors();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  if (!sensors.showFallAlert) return null;

  const handleCancel = () => {
    sensors.cancelFallAlert();
  };

  const handleCallNow = () => {
    sensors.callEmergencyContact();
  };

  return (
    <Modal
      visible={sensors.showFallAlert}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          backgroundColor: '#FFFFFF',
          padding: 30,
          alignItems: 'center',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8
        }}>
          {/* Ícone de Alerta */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}>
            <Text style={{ fontSize: 40, color: '#FFFFFF' }}>⚠️</Text>
          </View>

          {/* Título */}
          <Text style={{
            fontSize: 26,
            fontFamily: 'Jakarta-Bold',
            color: '#EF4444',
            textAlign: 'center',
            marginBottom: 12,
            fontWeight: '700'
          }}>
            QUEDA DETECTADA!
          </Text>

          {/* Mensagem principal */}
          <Text style={{
            fontSize: 18,
            fontFamily: 'Jakarta-SemiBold',
            color: isDark ? '#1F2937' : '#374151',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 24
          }}>
            Você está bem?
          </Text>

          {/* Instrução específica por ambiente */}
          <Text style={{
            fontSize: 16,
            fontFamily: 'Jakarta-Medium',
            color: '#EF4444',
            textAlign: 'center',
            marginBottom: 15,
            fontWeight: '500'
          }}>
            Toque "Ligar Agora" para emergência
          </Text>

          {/* Caixa explicativa para Expo Go */}
          {Constants.appOwnership === 'expo' && (
            <View style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#F59E0B',
              width: '100%'
            }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Jakarta-SemiBold',
                color: '#92400E',
                textAlign: 'center',
                marginBottom: 8
              }}>
                O que acontecerá:
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: 'Jakarta-Medium',
                color: '#92400E',
                textAlign: 'center',
                lineHeight: 18
              }}>
                • O app Telefone será aberto{'\n'}
                • Ligue manualmente para o contato{'\n'}
                • O número já estará pronto
              </Text>
            </View>
          )}

          {/* Contato de emergência */}
          <Text style={{
            fontSize: 15,
            fontFamily: 'Jakarta-Medium',
            color: isDark ? '#6B7280' : '#6B7280',
            textAlign: 'center',
            marginBottom: 30,
            fontStyle: 'italic'
          }}>
            Para: {sensors.emergencyContact || 'contato de emergência'}
          </Text>

          {/* Botões de ação */}
          <View style={{ flexDirection: 'row', gap: 15, width: '100%' }}>
            <Pressable
              onPress={handleCancel}
              style={{
                flex: 1,
                height: 55,
                borderRadius: 15,
                backgroundColor: '#10B981',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 3,
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontFamily: 'Jakarta-Bold',
                fontSize: 16,
                fontWeight: '700'
              }}>
                Estou Bem
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCallNow}
              style={{
                flex: 1,
                height: 55,
                borderRadius: 15,
                backgroundColor: '#EF4444',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 3,
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontFamily: 'Jakarta-Bold',
                fontSize: 16,
                fontWeight: '700'
              }}>
                Ligar Agora
              </Text>
            </Pressable>
          </View>

          {/* Instrução final */}
          <Text style={{
            fontSize: 12,
            fontFamily: 'Jakarta-Medium',
            color: isDark ? '#9CA3AF' : '#9CA3AF',
            textAlign: 'center',
            marginTop: 20
          }}>
            Ligue imediatamente ou toque "Estou Bem" se estiver tudo bem
          </Text>
        </View>
      </View>
    </Modal>
  );
});

export default FallAlertModal;
