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
        const { data, error } = await supabase
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

        if (data && data.length > 0) {
          const totalVideos = data.length;
          const completedVideos = data.filter((video: any) =>
            video.progresso_videos?.[0]?.concluido === true
          ).length;

          const startedVideos = data.filter((video: any) =>
            video.progresso_videos?.[0]?.concluido === false &&
            (video.progresso_videos?.[0]?.segundos_total || 0) > 0
          ).length;

          const totalWatchTime = data.reduce((total: number, video: any) =>
            total + (video.progresso_videos?.[0]?.segundos_total || 0), 0
          );

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
        } else {
          // Buscar apenas contagem total de vídeos se não há progresso
          const { count } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('pilar_id', moduleKey)
            .eq('publicado', true);

          setStats({
            totalVideos: count || 0,
            completedVideos: 0,
            startedVideos: 0,
            completionPercentage: 0,
            totalWatchTime: 0,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar progresso do módulo:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProgressStats();
  }, [moduleKey, userId]);

  return stats;
}
