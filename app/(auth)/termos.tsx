import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';

export default function TermosPoliticas() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const titleType = getResponsiveValues('headline-md');
  const bodyType = getResponsiveValues('body-md');

  const ui = {
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    text2: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    bg: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
  };

  return (
    <View style={{ flex: 1, backgroundColor: ui.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default, marginBottom: 12 }}>
          Termos e Políticas de Uso
        </Text>
        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-regular'], fontSize: bodyType.fontSize.default, lineHeight: bodyType.lineHeight.default }}>
          Aqui vão os termos de uso e as políticas de privacidade do aplicativo Mais 60. Este é um placeholder. Você pode substituir por conteúdo real quando estiver pronto.
        </Text>
        <View style={{ height: 24 }} />
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={{ color: colors['brand-purple'], fontFamily: dsFontFamily['jakarta-semibold'] }}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}


