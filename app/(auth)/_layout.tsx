import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
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