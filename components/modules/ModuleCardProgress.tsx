import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { useModuleProgress } from '@/hooks/useModuleProgress';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ModuleCardProgressProps {
  moduleKey: string;
  style?: any;
  compact?: boolean;
}

export function ModuleCardProgress({ moduleKey, style, compact = false }: ModuleCardProgressProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const [userId, setUserId] = useState<string | undefined>();
  const stats = useModuleProgress(moduleKey, userId);

  useEffect(() => {
    const getUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id);
    };
    getUser();
  }, []);

  if (stats.isLoading || stats.totalVideos === 0) {
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

  if (compact) {
    // Versão compacta para cards
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactProgressContainer}>
          {/* Fundo do círculo */}
          <View style={[styles.compactProgressCircle, {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }]} />

          {/* Barra de progresso semicircular */}
          <View style={[styles.compactProgressBar, {
            backgroundColor: progressColor,
            transform: [{ rotate: `${(stats.completionPercentage / 100) * 180}deg` }]
          }]} />

          {/* Porcentagem no centro */}
          <View style={styles.compactPercentageContainer}>
            <Text style={[
              styles.compactPercentageText,
              {
                color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                fontFamily: 'jakarta-bold',
              }
            ]}>
              {stats.completionPercentage}%
            </Text>
          </View>
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
        {/* Fundo do círculo */}
        <View style={[styles.progressCircle, {
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }]} />

        {/* Barra de progresso semicircular */}
        <View style={[styles.progressBar, {
          backgroundColor: progressColor,
          transform: [{ rotate: `${(stats.completionPercentage / 100) * 180}deg` }]
        }]} />

        {/* Porcentagem no centro */}
        <View style={styles.percentageContainer}>
          <Text style={[
            styles.percentageText,
            {
              color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
              fontFamily: 'jakarta-bold',
            }
          ]}>
            {stats.completionPercentage}%
          </Text>
          <Text style={[
            styles.percentageLabel,
            {
              color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
              fontFamily: 'jakarta-medium',
            }
          ]}>
            concluído
          </Text>
        </View>
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
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    top: 0,
    left: 0,
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  percentageText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  percentageLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
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
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactProgressCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  compactProgressBar: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    top: 0,
    left: 0,
  },
  compactPercentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  compactPercentageText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  compactStatsContainer: {
    alignItems: 'center',
  },
  compactStatsText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
