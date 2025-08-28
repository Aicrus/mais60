import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ModuleProgressStats {
  totalVideos: number;
  completedVideos: number;
  startedVideos: number;
  completionPercentage: number;
  totalWatchTime: number; // em segundos
  isLoading: boolean;
}

export function useModuleProgress(moduleKey: string, userId?: string): ModuleProgressStats {
  const [stats, setStats] = useState<ModuleProgressStats>({
    totalVideos: 0,
    completedVideos: 0,
    startedVideos: 0,
    completionPercentage: 0,
    totalWatchTime: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchProgressStats = async () => {
      if (!userId) {
        setStats(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Buscar vídeos e progresso em uma única operação mais eficiente
        const { data: videosWithProgress, error } = await supabase
          .from('videos')
          .select(`
            id,
            progresso_videos!inner(
              segundos_total,
              concluido
            )
          `)
          .eq('pilar_id', moduleKey)
          .eq('publicado', true)
          .eq('progresso_videos.usuario_id', userId);

        if (error) throw error;

        let completedVideos = 0;
        let startedVideos = 0;
        let totalWatchTime = 0;

        if (videosWithProgress && videosWithProgress.length > 0) {
          // Calcular estatísticas dos vídeos que têm progresso
          videosWithProgress.forEach((video: any) => {
            const progress = video.progresso_videos?.[0];
            if (progress) {
              if (progress.concluido === true) {
                completedVideos++;
              } else if (progress.segundos_total > 0) {
                startedVideos++;
              }
              totalWatchTime += progress.segundos_total || 0;
            }
          });
        }

        // Buscar contagem total de vídeos do módulo para calcular porcentagem correta
        const { count: totalVideosCount, error: countError } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('pilar_id', moduleKey)
          .eq('publicado', true);

        if (countError) throw countError;

        const totalVideos = totalVideosCount || 0;
        const completionPercentage = totalVideos > 0
          ? Math.round((completedVideos / totalVideos) * 100)
          : 0;

        setStats({
          totalVideos,
          completedVideos,
          startedVideos,
          completionPercentage,
          totalWatchTime,
          isLoading: false,
        });

      } catch (error) {
        console.error('Erro ao buscar progresso do módulo:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProgressStats();
  }, [moduleKey, userId]);



  return stats;
}
