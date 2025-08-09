import React, { useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/auth';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../hooks/DesignSystemContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const hasCheckedSession = useRef(false);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoiza o estado de autenticação para evitar recálculos
  const isAuthenticated = useMemo(() => Boolean(session), [session]);

  useEffect(() => {
    // Limpa o timeout anterior se existir
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }

    // Se já verificou a sessão e não está autenticado, redireciona
    if (!isAuthenticated && hasCheckedSession.current) {
      // Usa um timeout mínimo para evitar flashes de loading
      navigationTimeout.current = setTimeout(() => {
        router.replace('/(auth)/onboarding/welcome');
      }, 50) as unknown as NodeJS.Timeout;
    }

    // Marca que já verificou a sessão
    hasCheckedSession.current = true;

    // Cleanup
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, [isAuthenticated, router]);

  // Mostra loading apenas no carregamento inicial
  if (isLoading && !hasCheckedSession.current) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator 
          size="large"
          color={isDark ? '#892CDC' : '#892CDC'} // Cor primária do tema
        />
      </View>
    );
  }

  // Não renderiza nada se não estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Renderiza o conteúdo se estiver autenticado
  return children;
} 