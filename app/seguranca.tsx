import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert, TextInput, Modal } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { ChevronLeft, Heart, Phone, Shield, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Pedometer } from 'expo-sensors';
import { useSensors } from '@/contexts/sensors';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { PageContainer } from '@/components/layout/PageContainer';

export default function SegurancaScreen() {
  const router = useRouter();
  const { currentTheme, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const sensors = useSensors();
  const { session } = useAuth();

  const [emergencyContactInput, setEmergencyContactInput] = useState(sensors.emergencyContact || '');
  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);
  const [emergencyPhoneInput, setEmergencyPhoneInput] = useState('');
  const [isLoadingEmergencyContact, setIsLoadingEmergencyContact] = useState(false);

  const titleType = getResponsiveValues('headline-lg');
  const sectionType = getResponsiveValues('title-sm');
  const bodyType = getResponsiveValues('body-md');
  const buttonType = getResponsiveValues('label-lg');
  const appBarLabelType = getResponsiveValues('label-md');

  // Funções para contato de emergência
  const loadEmergencyContact = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoadingEmergencyContact(true);
      const { data } = await supabase
        .from('usuarios')
        .select('emergency_contact')
        .eq('id', session.user.id)
        .single();

      if (data?.emergency_contact) {
        sensors.setEmergencyContact(data.emergency_contact);
        setEmergencyContactInput(data.emergency_contact);
      }
    } catch (error) {
      console.log('Erro ao carregar contato de emergência:', error);
    } finally {
      setIsLoadingEmergencyContact(false);
    }
  };

  const saveEmergencyContact = async () => {
    if (!session?.user?.id || !emergencyPhoneInput.trim()) return;

    try {
      setIsLoadingEmergencyContact(true);

      // Validar número de telefone (formato brasileiro)
      const cleanNumber = emergencyPhoneInput.replace(/\D/g, '');
      if (cleanNumber.length < 10 || cleanNumber.length > 11) {
        Alert.alert('Número inválido', 'Digite um número válido com DDD (10 ou 11 dígitos).');
        return;
      }

      // Salvar no Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({
          emergency_contact: emergencyPhoneInput.trim()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Atualizar estado local
      sensors.setEmergencyContact(emergencyPhoneInput.trim());
      setShowEmergencyContactModal(false);
      setEmergencyPhoneInput('');

      // Solicitar automaticamente permissão de movimento após salvar contato
      await requestMotionPermission();

      Alert.alert('Salvo', 'Contato de emergência configurado');
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      Alert.alert('Erro', 'Não foi possível salvar o contato. Tente novamente.');
    } finally {
      setIsLoadingEmergencyContact(false);
    }
  };

  const requestMotionPermission = async () => {
    try {
      // Verificar se já temos permissão
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Sensores não disponíveis',
          'Os sensores de movimento não estão disponíveis neste dispositivo.',
          [{ text: 'Entendi' }]
        );
        return;
      }

      // Solicitar permissão se necessário
      const { status } = await Pedometer.requestPermissionsAsync();

      if (status === 'granted') {
        Alert.alert(
          'Permissão concedida',
          'Detecção de movimento ativada',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permissão necessária',
          'Conceda permissão de movimento nas configurações do dispositivo.',
          [
            { text: 'Depois' },
            {
              text: 'Configurações',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  require('expo-linking').openURL('app-settings:');
                } else {
                  require('expo-linking').openSettings();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.warn('Erro ao solicitar permissão de movimento:', error);
    }
  };

  // Carregar contato ao abrir a tela
  React.useEffect(() => {
    loadEmergencyContact();
  }, [session?.user?.id]);

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          paddingBottom: 16,
          marginBottom: 8
        }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={{
              height: 44,
              paddingHorizontal: 12,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              borderWidth: 1,
              backgroundColor: uiColors.bgSecondary,
              borderColor: uiColors.divider,
            }}
          >
            <ChevronLeft size={20} color={uiColors.textPrimary} />
            <Text style={{
              color: uiColors.textPrimary,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: appBarLabelType.fontSize.default,
              lineHeight: appBarLabelType.lineHeight.default,
            }}>
              Voltar
            </Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 24 }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#43059320',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Heart size={32} color="#430593" />
          </View>
          <Text style={{
            color: uiColors.textPrimary,
            fontFamily: dsFontFamily['jakarta-bold'],
            fontSize: titleType.fontSize.default,
            lineHeight: titleType.lineHeight.default,
            textAlign: 'center',
            marginBottom: 8
          }}>
            Segurança
          </Text>
        </View>

        {/* Detecção de queda */}
        <View style={{
          borderRadius: 16,
          padding: 20,
          backgroundColor: uiColors.bgSecondary,
          borderWidth: 1,
          borderColor: uiColors.divider,
          marginBottom: 20
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Shield size={24} color="#430593" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: uiColors.textPrimary,
                fontFamily: dsFontFamily['jakarta-semibold'],
                fontSize: bodyType.fontSize.default,
                lineHeight: bodyType.lineHeight.default,
                marginBottom: 4
              }}>
                Detecção de Queda
              </Text>
              <Text style={{
                color: uiColors.textSecondary,
                fontFamily: dsFontFamily['jakarta-medium'],
                fontSize: bodyType.fontSize.default - 2,
                lineHeight: bodyType.lineHeight.default,
              }}>
                Alerta automático em caso de emergência
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{
              color: uiColors.textSecondary,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: bodyType.fontSize.default - 1,
              flex: 1,
              marginRight: 16
            }}>
              {sensors.fallDetectionEnabled ? 'Ativo' : 'Inativo'}
            </Text>

            <Pressable
              onPress={() => sensors.setFallDetectionEnabled(!sensors.fallDetectionEnabled)}
              style={{
                width: 80,
                height: 40,
                borderRadius: 20,
                backgroundColor: sensors.fallDetectionEnabled ? '#10B981' : uiColors.divider,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                transform: [{ translateX: sensors.fallDetectionEnabled ? 20 : -20 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }} />
            </Pressable>
          </View>

          {sensors.fallDetectionEnabled && (
            <View style={{
              backgroundColor: '#E0F2FE',
              borderRadius: 12,
              padding: 12,
              marginTop: 8
            }}>
              <Text style={{
                color: '#0277BD',
                fontFamily: dsFontFamily['jakarta-medium'],
                fontSize: bodyType.fontSize.default - 2,
                textAlign: 'center'
              }}>
                Detecta quedas e liga automaticamente para emergência
              </Text>
            </View>
          )}
        </View>

        {/* Contato de emergência */}
        <View style={{
          borderRadius: 16,
          padding: 20,
          backgroundColor: uiColors.bgSecondary,
          borderWidth: 1,
          borderColor: uiColors.divider
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Phone size={24} color="#430593" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: uiColors.textPrimary,
                fontFamily: dsFontFamily['jakarta-semibold'],
                fontSize: bodyType.fontSize.default,
                lineHeight: bodyType.lineHeight.default,
                marginBottom: 4
              }}>
                Contato de Emergência
              </Text>
              <Text style={{
                color: uiColors.textSecondary,
                fontFamily: dsFontFamily['jakarta-medium'],
                fontSize: bodyType.fontSize.default - 2,
                lineHeight: bodyType.lineHeight.default,
              }}>
                {sensors.emergencyContact || 'Não configurado'}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => {
                setEmergencyPhoneInput(sensors.emergencyContact || '');
                setShowEmergencyContactModal(true);
              }}
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: colors['brand-purple'],
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontFamily: dsFontFamily['jakarta-bold'],
                fontSize: 16
              }}>
                {sensors.emergencyContact ? 'Editar Contato' : 'Configurar Contato'}
              </Text>
            </Pressable>

            {sensors.emergencyContact && (
              <Pressable
                onPress={() => {
                  console.log('Botão de emergência pressionado');
                  sensors.callEmergencyContact();
                }}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#EF4444',
                  backgroundColor: '#FEF2F2',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  color: '#EF4444',
                  fontFamily: dsFontFamily['jakarta-bold'],
                  fontSize: 16
                }}>
                  Ligar para Emergência
                </Text>
              </Pressable>
            )}
          </View>
        </View>


      </ScrollView>

      {/* Emergency Contact Modal */}
      <Modal visible={showEmergencyContactModal} transparent animationType="fade" onRequestClose={() => setShowEmergencyContactModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 400, borderRadius: 16, borderWidth: 1, borderColor: uiColors.divider, backgroundColor: uiColors.bgSecondary, padding: 24 }}>
            <Text style={{
              fontSize: 20,
              fontFamily: dsFontFamily['jakarta-extrabold'],
              color: uiColors.textPrimary,
              textAlign: 'center',
              marginBottom: 20
            }}>
              Contato de Emergência
            </Text>

            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: uiColors.divider,
                borderRadius: 8,
                paddingHorizontal: 12
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    height: 48,
                    color: uiColors.text,
                    fontFamily: dsFontFamily['jakarta-medium'],
                    fontSize: 16
                  }}
                  placeholder="Ex: (11) 99999-9999"
                  placeholderTextColor={uiColors.textSecondary}
                  value={emergencyPhoneInput}
                  onChangeText={(text) => {
                    // Formatar telefone enquanto digita
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length <= 11) {
                      if (formatted.length <= 2) {
                        formatted = formatted;
                      } else if (formatted.length <= 6) {
                        formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2)}`;
                      } else if (formatted.length <= 10) {
                        formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2, 6)}-${formatted.slice(6)}`;
                      } else {
                        formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2, 7)}-${formatted.slice(7)}`;
                      }
                      setEmergencyPhoneInput(formatted);
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={15}
                  autoFocus
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowEmergencyContactModal(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: uiColors.divider,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={isLoadingEmergencyContact}
              >
                <Text style={{
                  color: uiColors.text,
                  fontFamily: dsFontFamily['jakarta-semibold'],
                  fontSize: 16
                }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={saveEmergencyContact}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: colors['brand-purple'],
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={isLoadingEmergencyContact || !emergencyPhoneInput.trim()}
              >
                {isLoadingEmergencyContact ? (
                  <Text style={{
                    color: '#FFFFFF',
                    fontFamily: dsFontFamily['jakarta-semibold'],
                    fontSize: 16
                  }}>
                    Salvando...
                  </Text>
                ) : (
                  <Text style={{
                    color: '#FFFFFF',
                    fontFamily: dsFontFamily['jakarta-semibold'],
                    fontSize: 16
                  }}>
                    Salvar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </PageContainer>
  );
}
