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
        // Primeiro, buscar todos os vídeos publicados do módulo
        const { data: allVideos, error: videosError } = await supabase
          .from('videos')
          .select('id')
          .eq('pilar_id', moduleKey)
          .eq('publicado', true);

        if (videosError) throw videosError;

        const totalVideos = allVideos?.length || 0;

        if (totalVideos === 0) {
          setStats({
            totalVideos: 0,
            completedVideos: 0,
            startedVideos: 0,
            completionPercentage: 0,
            totalWatchTime: 0,
            isLoading: false,
          });
          return;
        }

        // Agora buscar o progresso do usuário para estes vídeos
        const videoIds = allVideos?.map(v => v.id) || [];

        const { data: progressData, error: progressError } = await supabase
          .from('progresso_videos')
          .select('video_id, segundos_total, concluido')
          .eq('usuario_id', userId)
          .in('video_id', videoIds);

        if (progressError) throw progressError;

        // Calcular estatísticas
        const completedVideos = progressData?.filter(p => p.concluido === true).length || 0;
        const startedVideos = progressData?.filter(p =>
          p.concluido === false && (p.segundos_total || 0) > 0
        ).length || 0;

        const totalWatchTime = progressData?.reduce((total: number, progress: any) =>
          total + (progress.segundos_total || 0), 0
        ) || 0;

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
