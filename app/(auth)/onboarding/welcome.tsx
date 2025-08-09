import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const title = getResponsiveValues('headline-xl');
  const subtitle = getResponsiveValues('body-lg');

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'], padding: 24, justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Image source={require('@/assets/images/logo-mais60.png')} style={{ width: 120, height: 120 }} resizeMode="contain" accessibilityIgnoresInvertColors />
        <Text style={{ marginTop: 24, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default, textAlign: 'center' }}>
          Bem-vindo ao Mais 60!
        </Text>
        <Text style={{ marginTop: 12, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: subtitle.fontSize.default, lineHeight: subtitle.lineHeight.default, textAlign: 'center' }}>
          Um app feito especialmente para você cuidar da sua saúde de forma simples e prática.
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Image source={require('@/assets/images/Imagem idoso feliz 8 ago 2025.png')} style={{ width: '100%', height: 280 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </View>

      <View style={{ gap: 12 }}>
        <Pressable onPress={() => router.push('/(auth)/onboarding/permissions')} style={{ height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Começar">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 18 }}>Começar</Text>
        </Pressable>
        <Pressable onPress={async () => { await AsyncStorage.setItem('onboardingCompleted', 'true'); router.replace('/(auth)/login'); }} style={{ height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Pular apresentação">
          <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 16 }}>Pular apresentação</Text>
        </Pressable>
      </View>
    </View>
  );
}


