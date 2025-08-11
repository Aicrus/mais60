import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useUsage } from '@/contexts/usage';
import { useSensors } from '@/contexts/sensors';
import { Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Activity, Database } from 'lucide-react-native';

function formatMinutes(totalSeconds: number) {
  const min = Math.floor(totalSeconds / 60);
  return `${min} min`;
}

export default function UsoScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { aggregates, clearUsage } = useUsage();
  const sensors = useSensors();
  const [showPermModal, setShowPermModal] = useState(false);
  useEffect(() => {
    // Ao abrir a tela de Uso, solicita permissões básicas (mock UI)
    setShowPermModal(true);
  }, []);

  const titleType = getResponsiveValues('headline-lg');
  const statValueType = getResponsiveValues('title-sm');
  const statLabelType = getResponsiveValues('label-lg');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-lg');

  const ui = useMemo(() => ({
    card: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
    divider: isDark ? colors['divider-dark'] : '#E5E7EB',
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    text2: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    tint: colors['brand-purple'],
  }), [isDark]);

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{formatMinutes(aggregates.todaySeconds)}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Hoje</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
            <View style={styles.statItem}>
              <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: statValueType.fontSize.default, lineHeight: statValueType.lineHeight.default }}>{formatMinutes(aggregates.weekSeconds)}</Text>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: statLabelType.fontSize.default, lineHeight: statLabelType.lineHeight.default, marginTop: 2 }}>Semana</Text>
            </View>
          </View>
        </View>

        {/* Sensores */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 6, marginTop: 8 }}>Sensores</Text>
        <View style={{ gap: 12 }}>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'] }}>Passos hoje</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginTop: 4 }}>{sensors.stepsToday ?? '—'}</Text>
          </View>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'] }}>Movimento (aceleração)</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginTop: 4 }}>{sensors.accelMagnitude ?? '—'}</Text>
          </View>
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'] }}>Bateria</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginTop: 4 }}>{sensors.batteryLevel != null ? `${Math.round((sensors.batteryLevel || 0) * 100)}%` : '—'}</Text>
          </View>
        </View>

        {/* Lista de vídeos recentes */}
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 6, marginTop: 8 }}>Recentes</Text>
        <View style={{ gap: 12 }}>
          {aggregates.recentVideos.length === 0 ? (
            <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card, alignItems: 'center', justifyContent: 'center' }] }>
              <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>Ainda sem atividades.</Text>
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
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>Limpar estatísticas</Text>
        </Pressable>
      </ScrollView>
      {/* Modal de permissões (mock inicial) */}
      <Modal visible={showPermModal} transparent animationType="fade" onRequestClose={() => setShowPermModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 420, borderRadius: 16, borderWidth: 1, borderColor: ui.divider, backgroundColor: ui.card, padding: 16 }}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: 18 }}>Permissões necessárias</Text>
            <View style={{ height: 8 }} />
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Activity size={18} color={ui.text} />
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>Sensores de movimento (passos/atividade)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Database size={18} color={ui.text} />
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>Armazenamento local para estatísticas</Text>
              </View>
            </View>
            <View style={{ height: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable onPress={() => setShowPermModal(false)} style={{ height: 44, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: ui.divider, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-medium'] }}>Agora não</Text>
              </Pressable>
              <Pressable onPress={() => setShowPermModal(false)} style={{ height: 44, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] }}>Permitir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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


