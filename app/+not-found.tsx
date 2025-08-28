import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import React from 'react';

export default function NotFoundScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View className={`flex-1 items-center justify-center p-5 ${isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'}`}>
        <Text className="text-display-lg font-jakarta-bold mb-6">
          404
        </Text>
        
        <Text className={`text-headline-sm font-jakarta-bold mt-6 mb-2 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
          Ops! Página não encontrada
        </Text>
        
        <Text className={`text-body-lg text-center mb-8 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Parece que você se perdeu no caminho. Não se preocupe, vamos te ajudar a voltar para casa!
        </Text>

        <Link href="/" className="mt-4">
          <View className={`flex-row items-center px-6 py-3 rounded-full ${
            isDark ? 'bg-primary-dark' : 'bg-primary-light'
          }`}>
            <Text className="text-label-md font-jakarta-semibold text-white">
              Voltar para o início
            </Text>
          </View>
        </Link>
      </View>
    </>
  );
}
