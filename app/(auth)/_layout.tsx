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
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        animationDuration: Platform.OS === 'web' ? 0 : 200,
        contentStyle: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Auth' }} />
      <Stack.Screen
        name="onboarding/welcome"
        options={{ title: 'Boas-vindas' }}
      />
      <Stack.Screen
        name="onboarding/permissions"
        options={{ title: 'Permissões' }}
      />
      <Stack.Screen
        name="onboarding/accessibility"
        options={{ title: 'Acessibilidade' }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login'
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Cadastro'
        }}
      />
    </Stack>
  );
} 