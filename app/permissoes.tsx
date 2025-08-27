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
    location: { granted: null as boolean | null, loading: false },
    health: { granted: null as boolean | null, loading: false }
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
          '✅ Permissão concedida!',
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
      borderRadius: 16,
      padding: 20,
      backgroundColor: uiColors.bgSecondary,
      borderWidth: 1,
      borderColor: uiColors.divider,
      marginBottom: 16
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
            💡 {benefit}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-start' }}>
        {granted ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#10B98120',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#10B981'
          }}>
            <Check size={16} color="#10B981" />
            <Text style={{
              color: '#10B981',
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: buttonType.fontSize.default,
              lineHeight: buttonType.lineHeight.default,
              marginLeft: 6
            }}>
              Permitido
            </Text>
          </View>
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
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 24 }}>
          <Text style={{
            color: uiColors.textPrimary,
            fontFamily: dsFontFamily['jakarta-bold'],
            fontSize: titleType.fontSize.default,
            lineHeight: titleType.lineHeight.default,
            textAlign: 'center',
            marginBottom: 8
          }}>
            Permissões do App
          </Text>
          <Text style={{
            color: uiColors.textSecondary,
            fontFamily: dsFontFamily['jakarta-medium'],
            fontSize: bodyType.fontSize.default,
            lineHeight: bodyType.lineHeight.default,
            textAlign: 'center',
            paddingHorizontal: 20
          }}>
            Essas permissões ajudam o app a funcionar melhor e personalizar sua experiência
          </Text>
        </View>

        {/* Navigation Bar */}
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

        {/* Permissions Cards */}
        <PermissionCard
          icon={<BellRing size={24} color="#430593" />}
          title="Notificações"
          description="Receba lembretes suaves sobre suas atividades diárias e metas de saúde."
          benefit="Ajuda você a manter hábitos saudáveis com lembretes no momento certo"
          granted={permissions.notifications.granted}
          loading={permissions.notifications.loading}
          onRequest={requestNotifications}
          disabled={Platform.OS === 'android' && isExpoGo}
        />

        <PermissionCard
          icon={<Activity size={24} color="#430593" />}
          title="Sensores de Movimento"
          description="Acesse dados de passos e movimento do seu dispositivo."
          benefit="Permite acompanhar sua atividade física e progresso diário"
          granted={permissions.motion.available}
          available={permissions.motion.available}
          loading={permissions.motion.loading}
          onRequest={() => {}}
          disabled={true}
        />

        <PermissionCard
          icon={<Heart size={24} color="#430593" />}
          title="Dados de Saúde"
          description="Integre com apps de saúde para dados mais precisos."
          benefit="Combina informações para um acompanhamento mais completo da sua saúde"
          granted={permissions.health.granted}
          loading={permissions.health.loading}
          onRequest={() => Alert.alert('Em breve', 'Integração com apps de saúde estará disponível em breve!')}
          disabled={true}
        />

        {/* Footer */}
        <View style={{
          paddingTop: 20,
          alignItems: 'center'
        }}>
          <Text style={{
            color: uiColors.textSecondary,
            fontFamily: dsFontFamily['jakarta-medium'],
            fontSize: bodyType.fontSize.default - 2,
            lineHeight: bodyType.lineHeight.default,
            textAlign: 'center',
            paddingHorizontal: 20
          }}>
            🔒 Suas permissões são armazenadas apenas no seu dispositivo e podem ser alteradas a qualquer momento nas configurações do sistema.
          </Text>
        </View>
      </ScrollView>
    </PageContainer>
  );
}


