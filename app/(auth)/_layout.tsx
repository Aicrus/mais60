import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import React, { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationManager } from '@/lib/orientation';

export default function AuthLayout() {
  // Reforça retrato quando a pilha de auth monta
  useEffect(() => {
    const relock = () => {
      if (!OrientationManager.isTemporaryLandscapeAllowed()) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      }
    };
    relock();
    const sub = ScreenOrientation.addOrientationChangeListener(relock);
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, []);
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
        // Desabilita gesto nativo de voltar por padrão (iOS)
        gestureEnabled: false,
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        animationDuration: Platform.OS === 'web' ? 0 : 200,
        contentStyle: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Auth' }} />
      <Stack.Screen name="onboarding/welcome" options={{ title: 'Boas-vindas', gestureEnabled: true }} />
      <Stack.Screen name="onboarding/intro2" options={{ title: 'Introdução 2', gestureEnabled: true }} />
      <Stack.Screen name="onboarding/intro3" options={{ title: 'Introdução 3', gestureEnabled: true }} />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login'
        }}
      />
      <Stack.Screen
        name="login-telefone"
        options={{
          title: 'Login por telefone'
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Cadastro'
        }}
      />
      <Stack.Screen
        name="register-telefone"
        options={{
          title: 'Cadastro por telefone'
        }}
      />
      <Stack.Screen
        name="termos"
        options={{
          title: 'Termos e Políticas',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 