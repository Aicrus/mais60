import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
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

  const ProgressDots = () => (
    <View style={{ gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 2 }}>
        Passo 1 de 3
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: '#430593' }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'] }}
      contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'space-between' }}
      bounces={false}
    >
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <View style={{ width: 88, height: 36, borderRadius: 999, backgroundColor: isDark ? 'rgba(67,5,147,0.18)' : 'rgba(67,5,147,0.08)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
          <Sparkles size={16} color={'#430593'} />
          <Text style={{ color: '#430593', fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 12 }}>Mais 60</Text>
        </View>
        <Image source={require('@/assets/images/Imagem idoso feliz 8 ago 2025.png')} style={{ width: '100%', height: 300, marginTop: 8 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </View>

      <View style={{ alignItems: 'center' }}>
        <Text style={{ marginTop: 8, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default, textAlign: 'center' }}>
          Descubra conteúdos para o seu bem‑estar
        </Text>
        <Text style={{ marginTop: 10, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: subtitle.fontSize.default, lineHeight: subtitle.lineHeight.default, textAlign: 'center' }}>
          Exercícios guiados, dicas de saúde e programas pensados para a sua rotina.
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <ProgressDots />
        <Pressable onPress={() => router.push('/(auth)/onboarding/permissions')} style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Avançar">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 18 }}>Avançar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}


