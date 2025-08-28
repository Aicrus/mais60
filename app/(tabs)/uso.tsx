import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, TextInput, Modal } from 'react-native';
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


function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`;
  return `${Math.floor(totalSeconds / 60)} min`;
}



export default function UsoScreen() {
  const { currentTheme, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const { aggregates, clearUsage } = useUsage();
  const sensors = useSensors();
  const locationTrack = useLocationTrack();
  const { session } = useAuth();
  const [showCompleteModal, setShowCompleteModal] = React.useState(false);
  const [historyMode, setHistoryMode] = React.useState<'7d' | '4w'>('7d');
  const [showAllRecent, setShowAllRecent] = React.useState(false);
  const [showRoute, setShowRoute] = React.useState(false);




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

  // Estado para controlar se já verificamos o perfil
  const [profileChecked, setProfileChecked] = React.useState(false);

  // Função para verificar se perfil está concluído
  const checkProfileCompletion = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) return false;

      const { data } = await supabase
        .from('usuarios')
        .select('perfil_concluido, nome, email, telefone')
        .eq('id', userId)
        .maybeSingle();

      const nomeOk = !!(data?.nome && data.nome.trim().length >= 3);
      const emailOk = !!(data?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
      const telOk = !!(data?.telefone && String(data.telefone).replace(/\D/g,'').length >= 10);
      const concluded = (data as any)?.perfil_concluido ?? (nomeOk && emailOk && telOk);

      return concluded;
    } catch (error) {
      console.log('Erro ao verificar perfil:', error);
      return false;
    }
  };

  React.useEffect(() => {
    (async () => {
      // Primeiro verifica se perfil já está concluído
      const isCompleted = await checkProfileCompletion();
      setProfileChecked(true);

      if (!isCompleted) {
        try {
          const nextStr = await AsyncStorage.getItem('@profile_prompt_next');
          const next = nextStr ? parseInt(nextStr, 10) : 0;
          if (!next || Date.now() >= next) {
            setShowCompleteModal(true);
          }
        } catch {
          setShowCompleteModal(true);
        }
      }
    })();
  }, [session]);

  // Revalida no foco da tela para fechar o modal se o perfil já foi concluído após edição
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        // Só executa se já fez a verificação inicial
        if (!profileChecked) return;

        const isCompleted = await checkProfileCompletion();
        if (!isActive) return;

        if (isCompleted) {
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
      })();
      return () => { isActive = false; };
    }, [session, profileChecked])
  );

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text
            style={{
              color: ui.text,
              fontFamily: dsFontFamily['jakarta-bold'],
              fontSize: getResponsiveValues('headline-lg').fontSize.default,
              lineHeight: getResponsiveValues('headline-lg').lineHeight.default,
            }}
          >
            Uso do App
          </Text>
          <Text
            style={{
              color: ui.text2,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: getResponsiveValues('body-md').fontSize.default,
              lineHeight: getResponsiveValues('body-md').lineHeight.default,
              marginTop: 4,
              textAlign: 'center',
              paddingHorizontal: 20
            }}
          >
            Acompanhe seu desempenho e atividade
          </Text>
        </View>

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
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>
                {sensors.accelMagnitude ?? '—'}
              </Text>
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


    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 90, paddingTop: 4 },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
  },
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


