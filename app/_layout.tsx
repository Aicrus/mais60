// Importar polyfills antes de tudo para garantir compatibilidade
import '@/lib/polyfills';

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, useFocusEffect } from '@react-navigation/native';
// 🎯 IMPORT DINÂMICO - NUNCA MAIS PRECISA ALTERAR!
import { useDynamicFonts } from '@/hooks/useDynamicFonts';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useEffect, useState, memo, useRef } from 'react';
import { ActivityIndicator, Platform, View, StatusBar } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationManager } from '@/lib/orientation';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Session } from '@supabase/supabase-js';
import { PortalProvider } from '@gorhom/portal';
import Head from './head';

// Importação do arquivo global.css para NativeWind
import '@/global.css';

import { useTheme } from '@/hooks/DesignSystemContext';
import { DesignSystemProvider } from '@/hooks/DesignSystemContext';
import { ToastProvider } from '@/hooks/useToast';
import { AuthProvider } from '@/contexts/auth';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { FavoritesProvider } from '@/contexts/favorites';
import { UsageProvider } from '@/contexts/usage';
import { SensorsProvider } from '@/contexts/sensors';
import { LocationProvider } from '@/contexts/location';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Memoize o componente LoadingScreen para evitar renderizações desnecessárias
const LoadingScreen = memo(function LoadingScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  return (
    <View className={`flex-1 justify-center items-center ${isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'}`}>
      <ExpoStatusBar 
        style={isDark ? 'light' : 'dark'}
        backgroundColor={isDark ? '#1C1E26' : '#F7F8FA'}
      />
      <ActivityIndicator 
        size="large" 
        color="#892CDC" // Cor primária fixa do tema
      />
    </View>
  );
});

// Cria um contexto para o Helmet
const helmetContext = {};

export default function RootLayout() {
  // 🎯 CARREGAMENTO DINÂMICO - baseado na configuração central!
  const { fontsLoaded, currentConfig } = useDynamicFonts();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [initialSession, setInitialSession] = useState<Session | null>(null);
  const sessionCheckTimeout = useRef<NodeJS.Timeout | number | undefined>(undefined);

  // Verificar e limpar tokens inválidos na inicialização
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          await supabase.auth.signOut();
          setInitialSession(null);
        } else {
          setInitialSession(data.session);
        }
      } catch (e) {
        console.error('Erro ao verificar sessão inicial:', e);
        setInitialSession(null);
      } finally {
        // Usa um pequeno timeout para suavizar a transição
        sessionCheckTimeout.current = setTimeout(() => {
          setInitialCheckDone(true);
        }, 100) as any;
      }
    };

    checkSession();

    return () => {
      if (sessionCheckTimeout.current) {
        clearTimeout(sessionCheckTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    // Garante retrato por padrão, mas permite landscape quando autorizado temporariamente
    if (Platform.OS !== 'web') {
      const enforce = () => {
        if (OrientationManager.isTemporaryLandscapeAllowed()) return; // não relocka; tela que abriu controla
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      };
      enforce();
      const sub = ScreenOrientation.addOrientationChangeListener(enforce);
      return () => {
        ScreenOrientation.removeOrientationChangeListener(sub);
      };
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && initialCheckDone) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, initialCheckDone]);

  // Mantém a tela de splash até ter certeza do estado de autenticação
  if (!fontsLoaded || !initialCheckDone) {
    return (
      <SafeAreaProvider>
        <DesignSystemProvider>
          <LoadingScreen />
        </DesignSystemProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <HelmetProvider context={helmetContext}>
      {Platform.OS === 'web' && (
        <Helmet>
          <title>Mais 60 — Saúde e bem-estar para pessoas 60+</title>
          <meta name="description" content="Aplicativo de saúde e bem-estar focado em pessoas com mais de 60 anos: acompanhamento de hábitos, consultas e qualidade de vida." />
          <meta charSet="utf-8" />
          <html lang="pt-BR" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        </Helmet>
      )}
      <SafeAreaProvider>
        <DesignSystemProvider>
          <Head />
          <PortalProvider>
            <ToastProvider>
              <AuthProvider initialSession={initialSession}>
                {/* Favoritos depende de sessão para key no storage */}
                {/* eslint-disable-next-line react/jsx-no-undef */}
                <FavoritesProvider>
                  <UsageProvider>
                    <SensorsProvider>
                      <LocationProvider>
                        <RootLayoutNav />
                      </LocationProvider>
                    </SensorsProvider>
                  </UsageProvider>
                </FavoritesProvider>
              </AuthProvider>
            </ToastProvider>
          </PortalProvider>
        </DesignSystemProvider>
      </SafeAreaProvider>
    </HelmetProvider>
  );
}

// Memoize o componente principal 
const RootLayoutNav = memo(function RootLayoutNav() {
  const { currentTheme } = useTheme();
  const { isLoading, isInitialized, session } = useAuth();
  const isDark = currentTheme === 'dark';
  const pathname = usePathname();
  const isOnboardingFullscreen = Boolean(
    pathname && (
      pathname.includes('/onboarding/welcome') ||
      pathname.includes('/onboarding/intro2') ||
      pathname.includes('/onboarding/intro3')
    )
  );

  // Reforça retrato sempre que a navegação principal ganha foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'web') {
        if (!OrientationManager.isTemporaryLandscapeAllowed()) {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        }
      }
      return () => {};
    }, [])
  );

  // Se ainda está carregando ou não foi inicializado, mantém a tela de loading
  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  // Cores do tema conforme definidos em tailwind.config.js e theme.ts
  const headerColors = {
    light: '#F7F8FA', // igual ao fundo claro da tela (bg primary light)
    dark: '#1C1E26'   // igual ao fundo escuro do app
  };

  // Configurar a StatusBar nativa para ter a mesma cor do Header
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Configurações para Android e iOS
      if (isOnboardingFullscreen) {
        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('transparent');
          // @ts-ignore - RN API disponível no Android
          StatusBar.setTranslucent?.(true);
        }
      } else {
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(isDark ? headerColors.dark : headerColors.light);
          // @ts-ignore - RN API disponível no Android
          StatusBar.setTranslucent?.(false);
        }
      }
    }
  }, [isDark, headerColors, isOnboardingFullscreen]);

  const MainContent = (
    <NavigationThemeProvider value={currentTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className={`flex-1 ${isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'}`}>
        {/* Usando a ExpoStatusBar apenas para manter compatibilidade, mas as configurações reais vêm do StatusBar nativo */}
        <ExpoStatusBar 
          style={isOnboardingFullscreen ? 'light' : (currentTheme === 'dark' ? 'light' : 'dark')}
          backgroundColor={isOnboardingFullscreen ? 'transparent' : (isDark ? headerColors.dark : headerColors.light)}
        />
        <Stack 
          screenOptions={{
            headerShown: false,
            // Reforça orientação retrato nas telas deste Stack
            orientation: 'portrait',
            contentStyle: { 
              flex: 1,
              backgroundColor: currentTheme === 'dark' ? '#14181B' : '#F7F8FA'
            }
          }}
        >
          {session ? (
            <Stack.Screen 
              name="(tabs)" 
              options={{
                gestureEnabled: false,
                animation: 'none'
              }}
            />
          ) : (
            <Stack.Screen 
              name="(auth)" 
              options={{
                gestureEnabled: false,
                animation: 'none'
              }}
            />
          )}
          <Stack.Screen 
            name="+not-found" 
            options={{
              animation: 'none'
            }}
          />
        </Stack>
      </View>
    </NavigationThemeProvider>
  );

  if (Platform.OS === 'web') {
    return MainContent;
  }

  return (
    <SafeAreaView 
      className={`flex-1 ${isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light'}`}
      edges={isOnboardingFullscreen ? ['right', 'left'] : ['top', 'right', 'left']}
      style={{ 
        backgroundColor: isOnboardingFullscreen ? 'transparent' : (isDark ? headerColors.dark : headerColors.light) 
      }}
    >
      {MainContent}
    </SafeAreaView>
  );
});

// 🎯 ESTE ARQUIVO NUNCA MAIS PRECISA SER ALTERADO!
// Para trocar a fonte, altere apenas FONT_CONFIG.primary em:
// design-system/tokens/typography.ts
