import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';

export default function EstatisticasScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const titleType = getResponsiveValues('headline-lg');
  const sectionType = getResponsiveValues('title-sm');
  const numberType = getResponsiveValues('title-sm');
  const labelType = getResponsiveValues('label-lg');

  const ui = {
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    brand: {
      purple: colors['brand-purple'],
      green: colors['brand-green'],
      coral: colors['brand-coral'],
      blue: colors['brand-blue'],
      orange: colors['brand-orange'],
    },
  } as const;

  // Dados estáticos placeholder (integração com Supabase virá na etapa 3)
  const today = { minutes: 18, activities: 4, favorites: 2 };
  const week = { minutes: 142, activities: 16, modules: 4 };
  const achievements = [
    { id: 'a1', title: '7 dias seguidos!', color: ui.brand.green },
    { id: 'a2', title: '10 receitas testadas!', color: ui.brand.orange },
    { id: 'a3', title: 'Primeira meditação!', color: ui.brand.coral },
  ];

  return (
    <PageContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollbar"
      >
        {/* Título */}
        <Text
          accessibilityRole="header"
          style={{
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-extrabold'],
            fontSize: titleType.fontSize.default,
            lineHeight: titleType.lineHeight.default,
            marginBottom: 8,
          }}
        >
          Seu Progresso
        </Text>

        {/* Cards de números rápidos */}
        <View style={styles.grid3}>
          <StatCard
            bgColor={ui.bgSecondary}
            borderColor={ui.divider}
            value={`${today.minutes} min`}
            label="Hoje"
            numberType={numberType}
            labelType={labelType}
            textPrimary={ui.textPrimary}
            textSecondary={ui.textSecondary}
          />
          <StatCard
            bgColor={ui.bgSecondary}
            borderColor={ui.divider}
            value={`${today.activities}`}
            label="Atividades"
            numberType={numberType}
            labelType={labelType}
            textPrimary={ui.textPrimary}
            textSecondary={ui.textSecondary}
          />
          <StatCard
            bgColor={ui.bgSecondary}
            borderColor={ui.divider}
            value={`${today.favorites}`}
            label="Favoritos"
            numberType={numberType}
            labelType={labelType}
            textPrimary={ui.textPrimary}
            textSecondary={ui.textSecondary}
          />
        </View>

        {/* Seção Semana/Mês */}
        <Text
          style={{
            marginTop: 10,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Esta semana
        </Text>
        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
          <View style={styles.statsRow}>
            <Stat value={`${week.activities}`} label="Atividades" textPrimary={ui.textPrimary} textSecondary={ui.textSecondary} numberType={numberType} labelType={labelType} />
            <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
            <Stat value={`${week.minutes} min`} label="Tempo" textPrimary={ui.textPrimary} textSecondary={ui.textSecondary} numberType={numberType} labelType={labelType} />
            <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
            <Stat value={`${week.modules}`} label="Módulos" textPrimary={ui.textPrimary} textSecondary={ui.textSecondary} numberType={numberType} labelType={labelType} />
          </View>
        </View>

        {/* Gráfico simples (barras) */}
        <Text
          style={{
            marginTop: 10,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Comparativo semanal
        </Text>
        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider, paddingVertical: 18 }]}>
          <BarChart
            data={[8, 22, 15, 30, 10, 28, 29]}
            labels={['S', 'T', 'Q', 'Q', 'S', 'S', 'D']}
            height={160}
            barColor={ui.brand.purple}
            axisColor={ui.divider}
            labelColor={ui.textSecondary}
          />
        </View>

        {/* Conquistas */}
        <Text
          style={{
            marginTop: 10,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Conquistas
        </Text>
        <View style={{ gap: 10 }}>
          {achievements.map((a) => (
            <View key={a.id} style={[styles.achievement, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
              <View style={[styles.achievementDot, { backgroundColor: a.color }]} />
              <Text style={{ color: ui.textPrimary, fontFamily: dsFontFamily['jakarta-bold'] }}>{a.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </PageContainer>
  );
}

function StatCard({
  bgColor,
  borderColor,
  value,
  label,
  numberType,
  labelType,
  textPrimary,
  textSecondary,
}: {
  bgColor: string;
  borderColor: string;
  value: string;
  label: string;
  numberType: ReturnType<typeof getResponsiveValues>;
  labelType: ReturnType<typeof getResponsiveValues>;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor, borderColor }]}>
      <Text style={{
        color: textPrimary,
        fontFamily: dsFontFamily['jakarta-bold'],
        fontSize: numberType.fontSize.default,
        lineHeight: numberType.lineHeight.default,
        textAlign: 'center',
      }}>{value}</Text>
      <Text style={{
        marginTop: 4,
        color: textSecondary,
        fontFamily: dsFontFamily['jakarta-medium'],
        fontSize: labelType.fontSize.default,
        lineHeight: labelType.lineHeight.default,
        textAlign: 'center',
      }}>{label}</Text>
    </View>
  );
}

function Stat({ value, label, textPrimary, textSecondary, numberType, labelType }: {
  value: string; label: string; textPrimary: string; textSecondary: string;
  numberType: ReturnType<typeof getResponsiveValues>;
  labelType: ReturnType<typeof getResponsiveValues>;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={{ color: textPrimary, fontFamily: dsFontFamily['jakarta-bold'], fontSize: numberType.fontSize.default, lineHeight: numberType.lineHeight.default, textAlign: 'center' }}>{value}</Text>
      <Text style={{ marginTop: 2, color: textSecondary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: labelType.fontSize.default, lineHeight: labelType.lineHeight.default, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

function BarChart({ data, labels, height = 160, barColor, axisColor, labelColor }: {
  data: number[];
  labels: string[];
  height?: number;
  barColor: string;
  axisColor: string;
  labelColor: string;
}) {
  // Gráfico de barras simples sem libs externas, focado em acessibilidade
  const max = Math.max(1, ...data);
  return (
    <View accessible accessibilityLabel="Gráfico de barras do progresso semanal" style={{ height }}>
      <View style={styles.chartArea}>
        {data.map((value, idx) => {
          const hPct = Math.round((value / max) * 100);
          return (
            <View key={idx} style={styles.chartBarWrap}>
              <View style={[styles.chartBar, { height: `${hPct}%`, backgroundColor: barColor }]} />
              <Text style={[styles.chartLabel, { color: labelColor }]}>{labels[idx]}</Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.chartAxis, { backgroundColor: axisColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 90, paddingTop: 4 },
  grid3: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  statDivider: { width: 1, marginVertical: 6 },

  // Gráfico
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 6,
  },
  chartBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: '70%', borderRadius: 8 },
  chartLabel: { marginTop: 6, fontFamily: dsFontFamily['jakarta-medium'], fontSize: 12 },
  chartAxis: { height: 1, marginTop: 8 },

  achievement: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementDot: { width: 14, height: 14, borderRadius: 7 },
});


