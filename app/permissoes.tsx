import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { Activity, Database, BellRing, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';

export default function PerfilPermissoesScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const title = getResponsiveValues('headline-lg');
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [motionAvailable, setMotionAvailable] = useState<boolean | null>(null);
  const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

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
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationStatus(status);
      } catch {}
    })();
  }, []);

  const requestNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifGranted(status === 'granted');
    } catch {}
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status);
    } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'] }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB', backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }}>
          <ChevronLeft size={20} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default }}>Permissões</Text>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BellRing size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Notificações</Text>
          </View>
          <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
            Autorize o envio de lembretes suaves sobre atividades do app (opcional).
          </Text>
          <View style={{ height: 8 }} />
          <Pressable onPress={requestNotifications} style={{ height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Permitir notificações">
            <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 15 }}>{notifGranted ? 'Permitido' : 'Permitir'}</Text>
          </Pressable>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sensores de movimento</Text>
          </View>
          <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
            Use os sensores (passos/aceleração) para enriquecer suas estatísticas.
          </Text>
          <View style={{ height: 8 }} />
          <Pressable onPress={requestLocation} style={{ height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-tertiary-dark'] : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Permitir localização">
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 15 }}>{locationStatus === 'granted' ? 'Permitido' : 'Permitir localização'}</Text>
          </Pressable>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Database size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Armazenamento</Text>
          </View>
          <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
            Estatísticas são salvas localmente (não requer permissão adicional).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}


