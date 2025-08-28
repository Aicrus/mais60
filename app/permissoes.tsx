import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { Activity, BellRing, Heart, MapPin, ChevronLeft, Check, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Pedometer } from 'expo-sensors';
import { PageContainer } from '@/components/layout/PageContainer';

export default function PerfilPermissoesScreen() {
  const router = useRouter();
  const { currentTheme, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const isExpoGo = Constants.appOwnership === 'expo';

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('subtitle-md');
  const bodyType = getResponsiveValues('body-md');
  const buttonType = getResponsiveValues('label-lg');
  const appBarLabelType = getResponsiveValues('label-md');

  const [permissions, setPermissions] = useState({
    notifications: { granted: null as boolean | null, loading: true },
    motion: { available: null as boolean | null, loading: true },
    location: { granted: null as boolean | null, loading: false }
  });

  useEffect(() => {
    // Pequeno delay para garantir que o componente esteja totalmente montado
    const timer = setTimeout(() => {
      checkPermissions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkPermissions = async () => {
    try {
      // Verificar notificações
      if (Platform.OS === 'android' && isExpoGo) {
        // No Expo Go para Android, notificações não são suportadas
        setPermissions(prev => ({
          ...prev,
          notifications: { granted: false, loading: false }
        }));
      } else {
        try {
          const Notifications = await import('expo-notifications');
          const settings = await Notifications.getPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            notifications: { granted: settings.status === 'granted', loading: false }
          }));
        } catch (error) {
          console.warn('Erro ao verificar notificações:', error);
          setPermissions(prev => ({
            ...prev,
            notifications: { granted: false, loading: false }
          }));
        }
      }
    } catch (error) {
      console.warn('Erro geral ao verificar permissões:', error);
      setPermissions(prev => ({
        ...prev,
        notifications: { granted: false, loading: false }
      }));
    }

    try {
      // Verificar sensores de movimento
      const isAvailable = await Pedometer.isAvailableAsync();
      setPermissions(prev => ({
        ...prev,
        motion: { available: !!isAvailable, loading: false }
      }));
    } catch (error) {
      console.warn('Erro ao verificar sensores de movimento:', error);
      setPermissions(prev => ({
        ...prev,
        motion: { available: false, loading: false }
      }));
    }
  };

  const requestNotifications = async () => {
    setPermissions(prev => ({
      ...prev,
      notifications: { ...prev.notifications, loading: true }
    }));

    try {
      if (Platform.OS === 'android' && isExpoGo) {
        Alert.alert(
          'Recurso não disponível',
          'Notificações push não são suportadas no Expo Go. Use um app compilado para testar essa funcionalidade.',
          [{ text: 'Entendi' }]
        );
        return;
      }

      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();

      setPermissions(prev => ({
        ...prev,
        notifications: { granted: status === 'granted', loading: false }
      }));

      if (status === 'granted') {
        Alert.alert(
          'Permissão concedida!',
          'Agora você receberá lembretes suaves para suas atividades diárias.',
          [{ text: 'Ótimo!' }]
        );
      }
    } catch (error) {
      setPermissions(prev => ({
        ...prev,
        notifications: { granted: false, loading: false }
      }));
    }
  };

  const revokeNotifications = async () => {
    setPermissions(prev => ({
      ...prev,
      notifications: { ...prev.notifications, loading: true }
    }));

    try {
      if (Platform.OS === 'android' && isExpoGo) {
        Alert.alert(
          'Recurso não disponível',
          'Notificações push não são suportadas no Expo Go.',
          [{ text: 'Entendi' }]
        );
        setPermissions(prev => ({
          ...prev,
          notifications: { granted: false, loading: false }
        }));
        return;
      }

      const Notifications = await import('expo-notifications');
      // Para revogar permissões, podemos tentar solicitar novamente ou apenas atualizar o estado local
      // Como não há uma API direta para revogar, vamos atualizar o estado para false
      setPermissions(prev => ({
        ...prev,
        notifications: { granted: false, loading: false }
      }));

      Alert.alert(
        'Permissão revogada',
        'As notificações foram desativadas. Você pode reativar a qualquer momento.',
        [{ text: 'Entendi' }]
      );
    } catch (error) {
      setPermissions(prev => ({
        ...prev,
        notifications: { granted: false, loading: false }
      }));
    }
  };

  const toggleNotifications = async () => {
    if (permissions.notifications.granted) {
      await revokeNotifications();
    } else {
      await requestNotifications();
    }
  };

  const toggleMotion = async () => {
    if (permissions.motion.available) {
      Alert.alert(
        'Permissão de Movimento',
        'Para revogar a permissão de movimento, você precisa ir nas configurações do dispositivo e desativar manualmente.',
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
    } else {
      // Tentar verificar novamente
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPermissions(prev => ({
          ...prev,
          motion: { available: !!isAvailable, loading: false }
        }));
      } catch (error) {
        console.warn('Erro ao verificar sensores de movimento:', error);
      }
    }
  };

  const PermissionCard = ({
    icon,
    title,
    description,
    benefit,
    granted,
    available,
    loading,
    onRequest,
    disabled
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    benefit: string;
    granted: boolean | null;
    available?: boolean | null;
    loading: boolean;
    onRequest: () => void;
    disabled?: boolean;
  }) => (
    <View style={{
      borderRadius: 14,
      padding: 12,
      backgroundColor: uiColors.bgSecondary,
      borderWidth: 1,
      borderColor: uiColors.divider
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          {granted ? (
            <Check size={24} color="#10B981" />
          ) : (
            icon
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: uiColors.textPrimary,
            fontFamily: dsFontFamily['jakarta-semibold'],
            fontSize: subtitleType.fontSize.default,
            lineHeight: subtitleType.lineHeight.default,
            marginBottom: 4
          }}>
            {title}
          </Text>
          <Text style={{
            color: uiColors.textSecondary,
            fontFamily: dsFontFamily['jakarta-medium'],
            fontSize: bodyType.fontSize.default,
            lineHeight: bodyType.lineHeight.default,
            marginBottom: 8
          }}>
            {description}
          </Text>
          <Text style={{
            color: '#10B981',
            fontFamily: dsFontFamily['jakarta-medium'],
            fontSize: bodyType.fontSize.default - 2,
            lineHeight: bodyType.lineHeight.default,
          }}>
            {benefit}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-start' }}>
        {granted ? (
          <Pressable
            onPress={onRequest}
            disabled={disabled || loading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#10B98120',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#10B981',
              opacity: (disabled || loading) ? 0.6 : 1
            }}
          >
            <Check size={16} color="#10B981" />
            <Text style={{
              color: '#10B981',
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: buttonType.fontSize.default,
              lineHeight: buttonType.lineHeight.default,
              marginLeft: 6
            }}>
              {loading ? 'Processando...' : 'Permitido'}
            </Text>
          </Pressable>
        ) : available === false ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: uiColors.bgSecondary,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: uiColors.divider
          }}>
            <Info size={16} color={uiColors.textSecondary} />
            <Text style={{
              color: uiColors.textSecondary,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: buttonType.fontSize.default,
              lineHeight: buttonType.lineHeight.default,
              marginLeft: 6
            }}>
              Indisponível no dispositivo
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onRequest}
            disabled={disabled || loading}
            style={{
              backgroundColor: disabled ? uiColors.bgSecondary : '#430593',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
              opacity: (disabled || loading) ? 0.6 : 1
            }}
          >
            <Text style={{
              color: disabled ? uiColors.textSecondary : '#FFFFFF',
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: buttonType.fontSize.default,
              lineHeight: buttonType.lineHeight.default,
              textAlign: 'center'
            }}>
              {loading ? 'Solicitando...' : disabled ? 'Não disponível' : 'Permitir acesso'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2, paddingBottom: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={{
              height: 44,
              paddingHorizontal: 10,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              borderWidth: 1,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
              backgroundColor: uiColors.bgSecondary,
              borderColor: uiColors.divider,
            }}
          >
            <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
          </Pressable>
          <Text
            style={{
              color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
              fontFamily: appBarLabelType.fontFamily,
              fontSize: appBarLabelType.fontSize.default,
              lineHeight: appBarLabelType.lineHeight.default,
            }}
          >
            Voltar
          </Text>
        </View>

        <View style={{ gap: 16 }}>
        <PermissionCard
          icon={<BellRing size={24} color="#430593" />}
          title="Lembretes Inteligentes"
          description="Receba notificações personalizadas sobre seus exercícios e hábitos diários."
          benefit="Mantém você motivado com lembretes suaves no momento ideal"
          granted={permissions.notifications.granted}
          loading={permissions.notifications.loading}
          onRequest={toggleNotifications}
          disabled={Platform.OS === 'android' && isExpoGo}
        />

        <PermissionCard
          icon={<Activity size={24} color="#430593" />}
          title="Detecção de Movimento"
          description="Monitora seus movimentos para detectar quedas e acompanhar atividade física."
          benefit="Protege você com detecção automática de emergências"
          granted={permissions.motion.available}
          available={permissions.motion.available}
          loading={permissions.motion.loading}
          onRequest={toggleMotion}
          disabled={false}
        />
      </View>
      </ScrollView>
    </PageContainer>
  );
}


