import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
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
import { Activity, Database } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmModal from '@/components/modals/ConfirmModal';

function formatDuration(totalSeconds: number) {
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

  const titleType = getResponsiveValues('headline-lg');
  const sectionType = getResponsiveValues('title-sm');
  const statValueType = getResponsiveValues('title-sm');
  const statLabelType = getResponsiveValues('label-lg');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-lg');
  const appBarLabelType = getResponsiveValues('label-md');

  const ui = useMemo(() => ({
    card: uiColors.bgSecondary,
    divider: uiColors.divider,
    text: uiColors.textPrimary,
    text2: uiColors.textSecondary,
    tint: colors['brand-purple'],
  }), [uiColors]);

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

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Bar simples com voltar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, paddingBottom: 8, marginBottom: 6 }}>
          <Pressable
            onPress={() => require('expo-router').router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
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
              backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
              borderColor: isDark ? colors['divider-dark'] : 'transparent',
            }}
          >
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: appBarLabelType.fontFamily, fontSize: appBarLabelType.fontSize.default, lineHeight: appBarLabelType.lineHeight.default }}>Voltar</Text>
          </Pressable>
        </View>
        <Text style={{
          color: ui.text,
          fontFamily: dsFontFamily['jakarta-extrabold'],
          fontSize: titleType.fontSize.default,
          lineHeight: titleType.lineHeight.default,
          marginBottom: 8,
        }}>Uso</Text>

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

        {/* Sensores */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Sensores</Text>
        <View style={{ gap: 12 }}>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default }}>Passos hoje</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default, marginTop: 4 }}>{sensors.stepsToday ?? '—'}</Text>
          </View>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default }}>Movimento (aceleração)</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default, marginTop: 4 }}>{sensors.accelMagnitude ?? '—'}</Text>
          </View>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default }}>Bateria</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default, marginTop: 4 }}>{sensors.batteryLevel != null ? `${Math.round((sensors.batteryLevel || 0) * 100)}%` : '—'}</Text>
          </View>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}> 
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default }}>Caminhada (hoje)</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default, marginTop: 4 }}>{(locationTrack.todayMeters / 1000).toFixed(2)} km • pontos {locationTrack.pointsCount}</Text>
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
            {!!MapView && (
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
                  return (
                    <MapView style={{ flex: 1 }} initialRegion={region}>
                      {!!Polyline && pts.length > 1 && (
                        <Polyline coordinates={pts.map(p => ({ latitude: p.latitude, longitude: p.longitude }))} strokeColor={colors['brand-purple']} strokeWidth={4} />
                      )}
                    </MapView>
                  );
                })()}
              </View>
            )}
          </View>
        </View>

        {/* Gráfico simples: minutos por módulo hoje */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, marginBottom: 6, marginTop: 8 }}>Uso por módulo (hoje)</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}> 
          {Object.keys(aggregates.perModuleToday || {}).length === 0 ? (
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default }}>Sem dados hoje.</Text>
          ) : (
            Object.entries(aggregates.perModuleToday).map(([k, sec]) => {
              const min = Math.max(1, Math.floor((sec as number) / 60));
              const widthPct = Math.min(100, Math.max(8, min));
              return (
                <View key={k} style={{ marginBottom: 8 }}>
                  <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-semibold'], marginBottom: 4 }}>{k} • {aggregates.perModuleCountToday?.[k] || 0} acessos</Text>
                  <View style={{ height: 12, backgroundColor: isDark ? '#1F2937' : '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                    <GradientView type="custom" colors={[colors['brand-purple'], '#892CDC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${widthPct}%` }} />
                  </View>
                  <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginTop: 4 }}>{min} min</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Histórico 7 dias */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, marginBottom: 6, marginTop: 8 }}>Histórico (7 dias)</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }]}> 
          {aggregates.last7Days.map((d) => {
            const min = Math.floor(d.seconds / 60);
            const h = Math.min(80, Math.max(6, min));
            const label = new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
            return (
              <View key={d.date} style={{ width: 26, height: 110, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ width: 18, height: h, backgroundColor: colors['brand-purple'], borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                <Text style={{ marginTop: 4, color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default }}>{label}</Text>
              </View>
            );
          })}
        </View>

        {/* Histórico semanal (4 semanas) */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, marginBottom: 6, marginTop: 8 }}>Semanas (últimas 4)</Text>
        <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }]}> 
          {aggregates.last4Weeks.map((w, idx) => {
            const min = Math.floor(w.seconds / 60);
            const h = Math.min(90, Math.max(8, Math.floor(min / 5))); // escala simples
            const start = new Date(w.weekStart + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            return (
              <View key={w.weekStart + idx} style={{ width: 48, height: 120, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ width: 32, height: h, backgroundColor: colors['brand-purple'], borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                <Text style={{ marginTop: 6, color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default }}>{start}</Text>
              </View>
            );
          })}
        </View>

        {/* Lista de vídeos recentes */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: sectionType.fontSize.default, lineHeight: sectionType.lineHeight.default, marginBottom: 6, marginTop: 8 }}>Recentes</Text>
        <View style={{ gap: 12 }}>
          {aggregates.recentVideos.length === 0 ? (
            <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card, alignItems: 'center', justifyContent: 'center' }] }>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default }}>Nenhuma atividade recente.</Text>
              <Text style={{ marginTop: 6, color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default, textAlign: 'center' }}>Assista a um vídeo para ele aparecer aqui.</Text>
            </View>
          ) : (
            aggregates.recentVideos.map((v) => (
              <View key={`${v.date}-${v.videoId}`} style={[styles.listCard, { borderColor: ui.divider, backgroundColor: ui.card }] }>
                <View style={[styles.listIconCircle, { backgroundColor: colors['brand-purple'] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: listTitleType.fontSize.default, lineHeight: listTitleType.lineHeight.default }}>{v.title || `Vídeo ${v.videoId}`}</Text>
                  <Text style={{ marginTop: 6, color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: listSubtitleType.fontSize.default, lineHeight: listSubtitleType.lineHeight.default }}>{new Date(v.lastAt).toLocaleDateString()} • {Math.max(1, Math.floor(v.seconds/60))} min</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Ações */}
        <View style={{ height: 12 }} />
        <Pressable onPress={clearUsage} accessibilityRole="button" style={[styles.clearBtn]}> 
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: listTitleType.fontSize.default, lineHeight: listTitleType.lineHeight.default }}>Limpar estatísticas</Text>
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
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  statDivider: { width: 1, marginVertical: 6 },
  listCard: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  listIconCircle: { width: 40, height: 40, borderRadius: 20 },
  clearBtn: { backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
});


