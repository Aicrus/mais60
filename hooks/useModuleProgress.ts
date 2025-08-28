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

        // Buscar o progresso deste usuário para estes vídeos
        const videoIds = allVideos?.map(v => v.id) || [];

        const { data: progressData, error: progressError } = await supabase
          .from('progresso_videos')
          .select('video_id, segundos_total, concluido')
          .eq('usuario_id', userId)
          .in('video_id', videoIds);

        if (progressError) throw progressError;

        let completedVideos = 0;
        let startedVideos = 0;
        let totalWatchTime = 0;

        if (progressData && progressData.length > 0) {
          progressData.forEach((progress: any) => {
            if (progress.concluido === true) {
              completedVideos++;
            } else if (progress.segundos_total > 0) {
              startedVideos++;
            }
            totalWatchTime += progress.segundos_total || 0;
          });
        }

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
