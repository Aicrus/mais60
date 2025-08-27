import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Modal, Alert } from 'react-native';
// Mapa simples do percurso (se disponível)
let MapView: any = null;
let Polyline: any = null;
try { const Maps = require('expo-maps'); MapView = Maps.default; Polyline = Maps.Polyline; } catch {}
import { PageContainer } from '@/components/layout/PageContainer';
import { GradientView } from '@/components/effects/GradientView';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useUsage } from '@/contexts/usage';
import { useSensors } from '@/contexts/sensors';
import { useLocationTrack } from '@/contexts/location';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Pedometer } from 'expo-sensors';
import { Activity, Database, BellRing } from 'lucide-react-native';

function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`;
  return `${Math.floor(totalSeconds / 60)} min`;
}

// Funções de permissões
const checkPermissions = async (setPermissions: any) => {
  try {
    // Verificar notificações
    if (Constants.appOwnership !== 'expo') {
      try {
        const Notifications = await import('expo-notifications');
        const settings = await Notifications.getPermissionsAsync();
        setPermissions((prev: any) => ({
          ...prev,
          notifications: { granted: settings.status === 'granted', loading: false }
        }));
      } catch (error) {
        console.warn('Erro ao verificar notificações:', error);
        setPermissions((prev: any) => ({
          ...prev,
          notifications: { granted: false, loading: false }
        }));
      }
    } else {
      setPermissions((prev: any) => ({
        ...prev,
        notifications: { granted: false, loading: false }
      }));
    }
  } catch (error) {
    console.warn('Erro geral ao verificar permissões:', error);
    setPermissions((prev: any) => ({
      ...prev,
      notifications: { granted: false, loading: false }
    }));
  }

  try {
    // Verificar sensores de movimento
    const isAvailable = await Pedometer.isAvailableAsync();
    setPermissions((prev: any) => ({
      ...prev,
      motion: { available: !!isAvailable, loading: false }
    }));
  } catch (error) {
    console.warn('Erro ao verificar sensores de movimento:', error);
    setPermissions((prev: any) => ({
      ...prev,
      motion: { available: false, loading: false }
    }));
  }
};

const requestNotifications = async (setPermissions: any, isExpoGo: boolean) => {
  setPermissions((prev: any) => ({
    ...prev,
    notifications: { ...prev.notifications, loading: true }
  }));

  try {
    if (isExpoGo) {
      Alert.alert(
        'Recurso não disponível',
        'Notificações push não são suportadas no Expo Go. Use um app compilado para testar essa funcionalidade.',
        [{ text: 'Entendi' }]
      );
      return;
    }

    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();

    setPermissions((prev: any) => ({
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
    setPermissions((prev: any) => ({
      ...prev,
      notifications: { granted: false, loading: false }
    }));
  }
};

export default function UsoScreen() {
  const { currentTheme, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const { aggregates, clearUsage } = useUsage();
  const sensors = useSensors();
  const locationTrack = useLocationTrack();
  const { session } = useAuth();
  const [emergencyContactInput, setEmergencyContactInput] = React.useState(sensors.emergencyContact || '');
  const [showCompleteModal, setShowCompleteModal] = React.useState(false);
  const [historyMode, setHistoryMode] = React.useState<'7d' | '4w'>('7d');
  const [showAllRecent, setShowAllRecent] = React.useState(false);
  const [showRoute, setShowRoute] = React.useState(false);

  // Estados para permissões
  const [showPermModal, setShowPermModal] = useState(false);
  const [permissions, setPermissions] = useState({
    notifications: { granted: null as boolean | null, loading: false },
    motion: { available: null as boolean | null, loading: false }
  });
  const isExpoGo = Constants.appOwnership === 'expo';

  const titleType = getResponsiveValues('headline-lg');
  const sectionType = getResponsiveValues('title-sm');
  const statValueType = getResponsiveValues('title-sm');
  const statLabelType = getResponsiveValues('label-lg');
  const rowLabelType = getResponsiveValues('body-md');
  const smallLabelType = getResponsiveValues('body-sm');

  const ui = useMemo(() => ({
    card: uiColors.bgSecondary,
    divider: uiColors.divider,
    text: uiColors.textPrimary,
    text2: uiColors.textSecondary,
    tint: colors['brand-purple'],
  }), [uiColors]);

  // Verificar permissões ao abrir a tela
  useEffect(() => {
    const checkPermsAndShowModal = async () => {
      await checkPermissions(setPermissions);

      // Pequeno delay antes de mostrar o modal para melhor UX
      setTimeout(() => {
        // Lógica corrigida para Expo Go
        if (isExpoGo) {
          // No Expo Go, sempre mostra o modal explicativo
          setShowPermModal(true);
        } else {
          // Fora do Expo Go, mostra apenas se notificações não foram concedidas
          if (permissions.notifications.granted === false) {
            setShowPermModal(true);
          }
        }
      }, 1000);
    };

    checkPermsAndShowModal();
  }, [isExpoGo]);

  const palette = useMemo(() => [
    colors['brand-purple'],
    '#892CDC',
    '#4F46E5',
    '#06B6D4',
    '#22C55E',
    '#F59E0B',
    '#EF4444',
  ], []);

  // Cores fixas por módulo para consistência entre sessões
  const moduleColorMap = useMemo(() => ({
    'atividade-fisica': colors['brand-green'],
    'habitos-alimentares': colors['brand-orange'],
    'seguranca-domiciliar': colors['brand-blue'],
    'estimulacao-cognitiva': colors['brand-light'],
    'saude-mental': colors['brand-coral'],
  } as Record<string, string>), []);

  const perModulePieData = useMemo(() => {
    const entries = Object.entries(aggregates.perModuleToday || {})
      .map(([name, sec]) => ({ name, seconds: Number(sec || 0) }))
      .filter((i) => i.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);
    const total = entries.reduce((acc, i) => acc + i.seconds, 0) || 1;
    return entries.map((item, idx) => ({
      value: Math.max(1, Math.round((item.seconds / total) * 100)),
      color: moduleColorMap[item.name] || palette[idx % palette.length],
      text: item.name,
      label: item.name,
      seconds: item.seconds,
      minutes: Math.floor(item.seconds / 60),
      timeText: Math.floor(item.seconds / 60) > 0
        ? `${Math.floor(item.seconds / 60)} min`
        : `${Math.max(1, Math.floor(item.seconds))}s`,
      accesses: (aggregates.perModuleCountToday || {})[item.name] || 0,
    }));
  }, [aggregates.perModuleToday, aggregates.perModuleCountToday, palette, moduleColorMap]);

  const last7Bars = useMemo(() => {
    return (aggregates.last7Days || []).map((d) => {
      const totalSeconds = Math.floor(d.seconds || 0);
      const minutes = Math.floor(totalSeconds / 60);
      const labelText = minutes > 0 ? `${minutes}m` : `${totalSeconds}s`;
      const value = minutes > 0 ? minutes : (totalSeconds > 0 ? 1 : 0);
      const label = new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
      return {
        value,
        label,
        frontColor: ui.tint,
        topLabelComponent: totalSeconds > 0 ? () => (
          <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: 10 }}>{labelText}</Text>
        ) : undefined,
      } as any;
    });
  }, [aggregates.last7Days, ui.tint, ui.text2]);

  const last4Bars = useMemo(() => {
    return (aggregates.last4Weeks || []).map((w) => {
      const totalSeconds = Math.floor(w.seconds || 0);
      const minutes = Math.floor(totalSeconds / 60);
      const labelText = minutes > 0 ? `${minutes}m` : `${totalSeconds}s`;
      const value = minutes > 0 ? minutes : (totalSeconds > 0 ? 1 : 0);
      const label = new Date(w.weekStart + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return {
        value,
        label,
        frontColor: ui.tint,
        topLabelComponent: totalSeconds > 0 ? () => (
          <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: 10 }}>{labelText}</Text>
        ) : undefined,
      } as any;
    });
  }, [aggregates.last4Weeks, ui.tint, ui.text2]);

  React.useEffect(() => {
    (async () => {
      try {
        const userId = session?.user?.id;
        if (!userId) return;
        const { data } = await supabase
          .from('usuarios')
          .select('perfil_concluido, nome, email, telefone')
          .eq('id', userId)
          .maybeSingle();
        const nomeOk = !!(data?.nome && data.nome.trim().length >= 3);
        const emailOk = !!(data?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
        const telOk = !!(data?.telefone && String(data.telefone).replace(/\D/g,'').length >= 10);
        const concluded = (data as any)?.perfil_concluido ?? (nomeOk && emailOk && telOk);
        if (!concluded) {
          try {
            const nextStr = await AsyncStorage.getItem('@profile_prompt_next');
            const next = nextStr ? parseInt(nextStr, 10) : 0;
            if (!next || Date.now() >= next) setShowCompleteModal(true);
          } catch {
            setShowCompleteModal(true);
          }
        }
      } catch {}
    })();
  }, [session]);

  // Revalida no foco da tela para fechar o modal se o perfil já foi concluído após edição
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const userId = session?.user?.id;
          if (!userId) return;
          const { data } = await supabase
            .from('usuarios')
            .select('perfil_concluido, nome, email, telefone')
            .eq('id', userId)
            .maybeSingle();
          const nomeOk = !!(data?.nome && data.nome.trim().length >= 3);
          const emailOk = !!(data?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
          const telOk = !!(data?.telefone && String(data.telefone).replace(/\D/g,'').length >= 10);
          const concluded = (data as any)?.perfil_concluido ?? (nomeOk && emailOk && telOk);
          if (!isActive) return;
          if (concluded) {
            setShowCompleteModal(false);
          } else {
            try {
              const nextStr = await AsyncStorage.getItem('@profile_prompt_next');
              const next = nextStr ? parseInt(nextStr, 10) : 0;
              if (!next || Date.now() >= next) setShowCompleteModal(true);
            } catch {
              setShowCompleteModal(true);
            }
          }
        } catch {}
      })();
      return () => { isActive = false; };
    }, [session])
  );

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={{
          color: ui.text,
          fontFamily: dsFontFamily['jakarta-extrabold'],
          fontSize: titleType.fontSize.default,
          lineHeight: titleType.lineHeight.default,
          marginBottom: 8,
        }}>Meu progresso</Text>

        {/* KPIs de Hoje e Semana */}
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{formatDuration(aggregates.todaySeconds)}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Hoje</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{formatDuration(aggregates.weekSeconds)}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Semana</Text>
            </View>
          </View>
        </View>

        {/* Movimento do corpo */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Movimento do corpo</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
          <View style={[styles.statsRow, { paddingVertical: 6 }]}>
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{sensors.stepsToday ?? '—'}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Passos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{sensors.accelMagnitude ?? '—'}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Movimento</Text>
            </View>
          </View>
        </View>

        {/* Estado do aparelho */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Estado do aparelho</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
          <View style={[styles.statsRow, { paddingVertical: 6 }]}>
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{sensors.batteryLevel != null ? `${Math.round((sensors.batteryLevel || 0) * 100)}%` : '—'}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Bateria</Text>
            </View>
          </View>
        </View>

        {/* Segurança */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Segurança</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 8 }}>Detecção de queda</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], flex: 1 }}>
                Ativar detecção automática de quedas
              </Text>
              <Pressable
                onPress={() => sensors.setFallDetectionEnabled(!sensors.fallDetectionEnabled)}
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: sensors.fallDetectionEnabled ? colors['brand-purple'] : ui.divider,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: sensors.fallDetectionEnabled ? 11 : -11 }]
                }} />
              </Pressable>
            </View>

            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: rowLabelType.fontSize.default, lineHeight: rowLabelType.lineHeight.default, marginBottom: 8 }}>Contato de emergência</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: ui.divider, borderRadius: 8, paddingHorizontal: 12 }}>
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginRight: 8 }}>📞</Text>
                <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'], flex: 1 }}>
                  {sensors.emergencyContact || 'Nenhum contato configurado'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Alert.prompt(
                    'Contato de emergência',
                    'Digite o número de telefone para emergências:',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Salvar',
                        onPress: (phone) => {
                          if (phone) {
                            sensors.setEmergencyContact(phone);
                            setEmergencyContactInput(phone);
                          }
                        }
                      }
                    ],
                    'plain-text',
                    emergencyContactInput
                  );
                }}
                style={{ height: 44, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>
                  {sensors.emergencyContact ? 'Editar' : 'Configurar'}
                </Text>
              </Pressable>
            </View>

            {sensors.emergencyContact && (
              <Pressable
                onPress={sensors.callEmergencyContact}
                style={{ marginTop: 12, height: 44, borderRadius: 8, borderWidth: 2, borderColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#EF4444', fontFamily: dsFontFamily['jakarta-bold'] }}>Ligar para emergência</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Atividade física */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Atividade física</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default }}>Caminhada</Text>
            <Pressable onPress={() => setShowRoute((prev) => !prev)}>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>{showRoute ? 'Esconder percurso' : 'Ver percurso'}</Text>
            </Pressable>
          </View>
          <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: rowLabelType.fontSize.default, lineHeight: rowLabelType.lineHeight.default, marginTop: 4 }}>{(locationTrack.todayMeters / 1000).toFixed(2)} km • pontos {locationTrack.pointsCount}</Text>
          <View style={{ height: 8 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {locationTrack.isTracking ? (
              <Pressable onPress={locationTrack.stopTracking} style={{ height: 40, borderRadius: 10, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>Parar</Text>
              </Pressable>
            ) : (
              <Pressable onPress={locationTrack.startTracking} style={{ height: 40, borderRadius: 10, backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>Iniciar</Text>
              </Pressable>
            )}
            {locationTrack.permission === 'denied' && (
              <Pressable onPress={() => Platform.OS !== 'web' && require('expo-linking').openSettings()} style={{ height: 40, borderRadius: 10, borderWidth: 1, borderColor: ui.divider, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }}>
                <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'] }}>Abrir ajustes</Text>
              </Pressable>
            )}
          </View>
          {showRoute && !MapView && (
            <View style={{ height: 140, borderRadius: 12, borderWidth: 1, borderColor: ui.divider, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: smallLabelType.fontSize.default, lineHeight: smallLabelType.lineHeight.default, textAlign: 'center', paddingHorizontal: 10 }}>
                Mapa indisponível neste modo. Para visualizar o percurso, use um build de desenvolvimento ou habilite o módulo de mapas.
              </Text>
            </View>
          )}
          {!!MapView && showRoute && (
            <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginTop: 10 }}>
              {(() => {
                const pts = locationTrack.todayPoints || [];
                let region = { latitude: -14.235, longitude: -51.925, latitudeDelta: 0.3, longitudeDelta: 0.3 };
                if (pts.length > 0) {
                  const lats = pts.map(p => p.latitude);
                  const lons = pts.map(p => p.longitude);
                  const minLat = Math.min(...lats);
                  const maxLat = Math.max(...lats);
                  const minLon = Math.min(...lons);
                  const maxLon = Math.max(...lons);
                  const latDelta = Math.max(0.01, (maxLat - minLat) * 1.4);
                  const lonDelta = Math.max(0.01, (maxLon - minLon) * 1.4);
                  region = { latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2, latitudeDelta: latDelta, longitudeDelta: lonDelta };
                }
                if (pts.length < 2) {
                  return (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: smallLabelType.fontSize.default, lineHeight: smallLabelType.lineHeight.default, textAlign: 'center', paddingHorizontal: 10 }}>
                        Sem percurso registrado hoje. Inicie a caminhada para começar a registrar.
                      </Text>
                    </View>
                  );
                }
                return (
                  <MapView style={{ flex: 1 }} initialRegion={region}>
                    {!!Polyline && (
                      <Polyline coordinates={pts.map(p => ({ latitude: p.latitude, longitude: p.longitude }))} strokeColor={colors['brand-purple']} strokeWidth={4} />
                    )}
                  </MapView>
                );
              })()}
            </View>
          )}
        </View>

        {/* Uso por módulo (hoje) */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, marginBottom: 6, marginTop: 8 }}>Uso por módulo (hoje)</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}> 
          {perModulePieData.length === 0 ? (
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: rowLabelType.fontSize.default, lineHeight: rowLabelType.lineHeight.default }}>Sem dados hoje.</Text>
          ) : (
            <>
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                <PieChart
                  data={perModulePieData.map((i) => ({ value: i.value, color: i.color }))}
                  donut
                  radius={70}
                  innerRadius={48}
                  focusOnPress
                />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {perModulePieData.map((i, idx) => (
                  <View key={i.label + idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i.color }} />
                    <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'] }}>
                      {i.label} • {i.timeText} • {i.accesses} acessos
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Histórico */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, marginBottom: 6, marginTop: 8 }}>Histórico</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}> 
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {(['7d', '4w'] as const).map((tab) => (
              <Pressable key={tab} onPress={() => setHistoryMode(tab)} style={{
                paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
                backgroundColor: historyMode === tab ? colors['brand-purple'] : 'transparent',
                borderWidth: 1, borderColor: ui.divider,
              }}>
                <Text style={{ color: historyMode === tab ? '#FFFFFF' : ui.text, fontFamily: dsFontFamily['jakarta-semibold'] }}>
                  {tab === '7d' ? '7 dias' : 'Semanas'}
                </Text>
              </Pressable>
            ))}
          </View>
          <BarChart
            data={historyMode === '7d' ? last7Bars : last4Bars}
            width={undefined}
            barBorderRadius={6}
            noOfSections={4}
            yAxisTextStyle={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}
            xAxisLabelTextStyle={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}
            isAnimated
            animationDuration={800}
            spacing={historyMode === '7d' ? 18 : 28}
            xAxisThickness={0}
            yAxisThickness={0}
            initialSpacing={historyMode === '7d' ? 12 : 18}
            labelWidth={historyMode === '7d' ? 28 : 42}
          />
        </View>

        {/* Seção de semanas incorporada ao card de Histórico */}

        {/* Recentes */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Recentes</Text>
        <View style={{ gap: 12 }}>
          {aggregates.recentVideos.length === 0 ? (
            <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card, alignItems: 'center', justifyContent: 'center' }] }>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: rowLabelType.fontSize.default, lineHeight: rowLabelType.lineHeight.default }}>Sem atividade recente.</Text>
            </View>
          ) : (
            (showAllRecent ? aggregates.recentVideos : aggregates.recentVideos.slice(0, 3)).map((v) => (
              <View key={`${v.date}-${v.videoId}`} style={[styles.recentItem, { borderColor: ui.divider, backgroundColor: ui.card }]}>
                <View style={[styles.recentIcon, { backgroundColor: colors['brand-purple'] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: rowLabelType.fontSize.default, lineHeight: rowLabelType.lineHeight.default }} numberOfLines={1}>
                    {v.title || `Vídeo ${v.videoId}`}
                  </Text>
                  <Text style={{ marginTop: 2, color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: smallLabelType.fontSize.default, lineHeight: smallLabelType.lineHeight.default }}>
                    {new Date(v.lastAt).toLocaleDateString()} • {Math.max(1, Math.floor(v.seconds/60))} min
                  </Text>
                </View>
              </View>
            ))
          )}
          {aggregates.recentVideos.length > 3 && (
            <Pressable onPress={() => setShowAllRecent((p) => !p)} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: ui.divider }}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-semibold'] }}>{showAllRecent ? 'Ver menos' : 'Ver mais'}</Text>
            </Pressable>
          )}
        </View>

        {/* Ações */}
        <View style={{ height: 8 }} />
        <Pressable onPress={clearUsage} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: ui.divider }}>
          <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-semibold'] }}>Limpar estatísticas</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={showCompleteModal}
        title="Precisamos finalizar seu perfil"
        description="Complete o nome, e-mail e telefone para continuar usando todos os recursos."
        cancelLabel="Depois"
        confirmLabel="Concluir agora"
        onCancel={async () => {
          setShowCompleteModal(false);
          try { await AsyncStorage.setItem('@profile_prompt_next', String(Date.now() + 60_000)); } catch {}
        }}
        onConfirm={async () => {
          setShowCompleteModal(false);
          try { await AsyncStorage.setItem('@profile_prompt_next', String(Date.now() + 60_000)); } catch {}
          require('expo-router').router.push('/perfil/editar');
        }}
      />

      {/* Modal de permissões */}
      <Modal visible={showPermModal} transparent animationType="fade" onRequestClose={() => setShowPermModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 420, borderRadius: 16, borderWidth: 1, borderColor: ui.divider, backgroundColor: ui.card, padding: 16 }}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
              {isExpoGo ? 'Informações sobre Permissões' : 'Permissões necessárias'}
            </Text>

            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
              {isExpoGo
                ? 'Veja quais recursos estão disponíveis no Expo Go'
                : 'Essas permissões ajudam o app a funcionar melhor'
              }
            </Text>

            <View style={{ gap: 12, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BellRing size={18} color={isExpoGo ? ui.text2 : ui.text} />
                <Text style={{ color: isExpoGo ? ui.text2 : ui.text, fontFamily: dsFontFamily['jakarta-medium'], flex: 1 }}>
                  Notificações (opcional)
                </Text>
                {isExpoGo && (
                  <View style={{ backgroundColor: '#FFF3CD', borderColor: '#FFEAA7', borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: '#856404', fontFamily: dsFontFamily['jakarta-medium'], fontSize: 10 }}>
                      Expo Go
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Activity size={18} color={ui.text} />
                <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'], flex: 1 }}>
                  Sensores de movimento
                </Text>
                <View style={{ backgroundColor: '#D4EDDA', borderColor: '#C3E6CB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#155724', fontFamily: dsFontFamily['jakarta-medium'], fontSize: 10 }}>
                    Ativo
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Database size={18} color={ui.text} />
                <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'], flex: 1 }}>
                  Armazenamento local
                </Text>
                <View style={{ backgroundColor: '#D4EDDA', borderColor: '#C3E6CB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#155724', fontFamily: dsFontFamily['jakarta-medium'], fontSize: 10 }}>
                    Ativo
                  </Text>
                </View>
              </View>
            </View>

            {isExpoGo ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                  💡 Para testar notificações, use um app compilado ou o Expo Application Services (EAS)
                </Text>
                <Pressable
                  onPress={() => setShowPermModal(false)}
                  style={{ height: 44, paddingHorizontal: 24, borderRadius: 10, backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>Entendi</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <Pressable
                  onPress={() => setShowPermModal(false)}
                  style={{ height: 44, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: ui.divider, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'] }}>Agora não</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    setShowPermModal(false);
                    await requestNotifications(setPermissions, isExpoGo);
                  }}
                  style={{
                    height: 44,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    backgroundColor: colors['brand-purple'],
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontFamily: dsFontFamily['jakarta-bold']
                  }}>
                    Permitir
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 90, paddingTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 0 },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  statDivider: { width: 1, marginVertical: 6 },
  listCard: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  listIconCircle: { width: 40, height: 40, borderRadius: 20 },
  recentItem: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentIcon: { width: 28, height: 28, borderRadius: 14 },
  clearBtn: { backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
});


