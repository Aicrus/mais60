import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { Activity, Database, BellRing, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';
import { PageContainer } from '@/components/layout/PageContainer';

export default function PerfilPermissoesScreen() {
  const router = useRouter();
  const { currentTheme, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const appBarLabelType = getResponsiveValues('label-md');
  const cardTitleType = getResponsiveValues('subtitle-md');
  const cardBodyType = getResponsiveValues('body-md');
  const cardBtnType = getResponsiveValues('label-md');
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [motionAvailable, setMotionAvailable] = useState<boolean | null>(null);
  // Sensores de movimento não exigem permissão explícita; exibimos disponibilidade

  useEffect(() => {
    (async () => {
      try {
        const settings = await Notifications.getPermissionsAsync();
        setNotifGranted(settings.status === 'granted');
      } catch {}
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setMotionAvailable(!!isAvailable);
      } catch { setMotionAvailable(false); }
      // Localização não é solicitada nesta tela
    })();
  }, []);

  const requestNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifGranted(status === 'granted');
    } catch {}
  };

  // Sem solicitação para sensores de movimento

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{}}>
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
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BellRing size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: cardTitleType.fontSize.default, lineHeight: cardTitleType.lineHeight.default }}>Notificações</Text>
          </View>
          <Text style={{ marginTop: 4, color: uiColors.textSecondary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: cardBodyType.fontSize.default, lineHeight: cardBodyType.lineHeight.default }}>
            Autorize o envio de lembretes suaves sobre atividades do app (opcional).
          </Text>
          <View style={{ height: 8 }} />
          <Pressable onPress={requestNotifications} style={{ height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Permitir notificações">
            <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: cardBtnType.fontSize.default, lineHeight: cardBtnType.lineHeight.default }}>{notifGranted ? 'Permitido' : 'Permitir'}</Text>
          </Pressable>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: cardTitleType.fontSize.default, lineHeight: cardTitleType.lineHeight.default }}>Sensores de movimento</Text>
          </View>
          <Text style={{ marginTop: 4, color: uiColors.textSecondary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: cardBodyType.fontSize.default, lineHeight: cardBodyType.lineHeight.default }}>
            Use os sensores (passos/aceleração) para enriquecer suas estatísticas.
          </Text>
          <View style={{ height: 8 }} />
          <View style={{ height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }} accessibilityRole="text" accessibilityLabel="Status dos sensores de movimento">
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: cardBtnType.fontSize.default, lineHeight: cardBtnType.lineHeight.default }}>
              {motionAvailable ? 'Permitido' : 'Indisponível no dispositivo'}
            </Text>
          </View>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Database size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: cardTitleType.fontSize.default, lineHeight: cardTitleType.lineHeight.default }}>Armazenamento</Text>
          </View>
          <Text style={{ marginTop: 4, color: uiColors.textSecondary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: cardBodyType.fontSize.default, lineHeight: cardBodyType.lineHeight.default }}>
            Estatísticas são salvas localmente (não requer permissão adicional).
          </Text>
        </View>
      </View>
      </ScrollView>
    </PageContainer>
  );
}


