import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { Check, Clock, Play } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface VideoProgressIndicatorProps {
  videoId: string;
  style?: any;
}

interface VideoProgress {
  segundosTotal: number;
  concluido: boolean;
  isLoading: boolean;
}

export function VideoProgressIndicator({ videoId, style }: VideoProgressIndicatorProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const [progress, setProgress] = useState<VideoProgress>({
    segundosTotal: 0,
    concluido: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchVideoProgress = async () => {
      if (!videoId) {
        setProgress(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          setProgress(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const { data, error } = await supabase
          .from('progresso_videos')
          .select('segundos_total, concluido')
          .eq('video_id', videoId)
          .eq('usuario_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProgress({
            segundosTotal: data.segundos_total || 0,
            concluido: data.concluido || false,
            isLoading: false,
          });
        } else {
          setProgress({
            segundosTotal: 0,
            concluido: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar progresso do vídeo:', error);
        setProgress(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchVideoProgress();
  }, [videoId]);

  if (progress.isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.indicator, { backgroundColor: colors['bg-secondary-light'] }]} />
      </View>
    );
  }

  const getIndicatorConfig = () => {
    if (progress.concluido) {
      return {
        icon: Check,
        color: '#27CC95',
        backgroundColor: '#27CC9520',
      };
    } else if (progress.segundosTotal > 0) {
      return {
        icon: Clock,
        color: '#F59E0B',
        backgroundColor: '#F59E0B20',
      };
    } else {
      return {
        icon: Play,
        color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
        backgroundColor: isDark ? colors['bg-secondary-dark'] : '#F3F4F6',
      };
    }
  };

  const config = getIndicatorConfig();
  const IconComponent = config.icon;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.indicator, { backgroundColor: config.backgroundColor }]}>
        <IconComponent size={16} color={config.color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
