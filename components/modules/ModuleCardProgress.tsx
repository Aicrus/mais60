import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { useModuleProgress } from '@/hooks/useModuleProgress';
import { useAuth } from '@/contexts/auth';

interface ModuleCardProgressProps {
  moduleKey: string;
  style?: any;
  compact?: boolean;
  userId?: string;
}

export function ModuleCardProgress({ moduleKey, style, compact = false, userId: propUserId }: ModuleCardProgressProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { session } = useAuth();

  // Usar userId da prop ou do contexto de auth
  const userId = propUserId || session?.user?.id;

  const stats = useModuleProgress(moduleKey, userId);

  // Mostrar indicador de carregamento se estiver carregando
  if (stats.isLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <View style={styles.loadingCircle} />
      </View>
    );
  }

  // Não mostrar nada se não houver vídeos ou usuário não logado
  if (stats.totalVideos === 0 || !userId) {
    return null;
  }

  const progressColor = stats.completionPercentage === 100
    ? '#27CC95' // Verde para concluído
    : stats.completionPercentage > 0
    ? '#F59E0B' // Amarelo para em andamento
    : '#E5E7EB'; // Cinza para não iniciado

  const formatWatchTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes === 0) return '0min';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
  };

  // Configurações para o componente circular
  const circularProgressProps = {
    activeStrokeWidth: compact ? 4 : 6,
    inActiveStrokeWidth: compact ? 3 : 4,
    inActiveStrokeColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    activeStrokeColor: progressColor,
    value: stats.completionPercentage,
    radius: compact ? 22 : 40,
    duration: 1000,
    progressValueColor: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    maxValue: 100,
    valueSuffix: '%',
    title: compact ? '' : 'Progresso',
    titleColor: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    titleStyle: {
      fontFamily: 'jakarta-medium',
      fontSize: compact ? 8 : 12,
    },
    progressValueStyle: {
      fontFamily: 'jakarta-bold',
      fontSize: compact ? 10 : 16,
    },
    strokeLinecap: 'round' as const,
  };

  if (compact) {
    // Versão compacta para cards
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactProgressContainer}>
          <CircularProgressBase {...circularProgressProps} />
        </View>

        <View style={styles.compactStatsContainer}>
          <Text style={[
            styles.compactStatsText,
            {
              color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
              fontFamily: 'jakarta-medium',
            }
          ]}>
            {stats.completedVideos}/{stats.totalVideos} • {formatWatchTime(stats.totalWatchTime)}
          </Text>
        </View>
      </View>
    );
  }

  // Versão completa
  return (
    <View style={[styles.container, style]}>
      <View style={styles.progressContainer}>
        <CircularProgressBase {...circularProgressProps} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={[
            styles.statLabel,
            {
              color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
              fontFamily: 'jakarta-medium',
            }
          ]}>
            Vídeos assistidos
          </Text>
          <Text style={[
            styles.statValue,
            {
              color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
              fontFamily: 'jakarta-semibold',
            }
          ]}>
            {stats.completedVideos}/{stats.totalVideos}
          </Text>
        </View>

        {stats.totalWatchTime > 0 && (
          <View style={styles.statRow}>
            <Text style={[
              styles.statLabel,
              {
                color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                fontFamily: 'jakarta-medium',
              }
            ]}>
              Tempo total
            </Text>
            <Text style={[
              styles.statValue,
              {
                color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                fontFamily: 'jakarta-semibold',
              }
            ]}>
              {formatWatchTime(stats.totalWatchTime)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Versão completa
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
  },
  statValue: {
    fontWeight: '600',
  },

  // Versão compacta para cards
  compactContainer: {
    alignItems: 'center',
    gap: 8,
  },
  compactProgressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactStatsContainer: {
    alignItems: 'center',
  },
  compactStatsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: compact ? 22 : 40,
    height: compact ? 22 : 40,
    borderRadius: compact ? 11 : 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderTopColor: '#F59E0B',
    opacity: 0.7,
  },
});
