import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';

export default function OnboardingAccessibility() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const title = getResponsiveValues('headline-lg');
  const body = getResponsiveValues('body-lg');

  const [fontSize, setFontSize] = useState<'normal' | 'grande' | 'muito-grande'>('grande');
  const [contrast, setContrast] = useState<'normal' | 'alto'>('normal');
  const [sound, setSound] = useState<'com' | 'sem'>('com');

  const finish = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      // Persistir preferências básicas (mock simples)
      await AsyncStorage.setItem('accessibility.prefs', JSON.stringify({ fontSize, contrast, sound }));
    } catch {}
    router.replace('/(auth)/login');
  };

  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1, backgroundColor: active ? '#430593' : (isDark ? colors['bg-secondary-dark'] : '#FFFFFF'), borderColor: active ? '#430593' : (isDark ? colors['divider-dark'] : '#E5E7EB') }}>
      <Text style={{ color: active ? '#FFFFFF' : (isDark ? colors['text-primary-dark'] : colors['text-primary-light']), fontFamily: dsFontFamily['jakarta-medium'] }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'], padding: 24, justifyContent: 'space-between' }}>
      <View style={{ gap: 18 }}>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default }}>
          Como você prefere?
        </Text>

        {/* Tamanho da letra */}
        <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Tamanho da letra</Text>
          <Text style={{ marginTop: 8, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: body.fontSize.default, lineHeight: body.lineHeight.default }}>Ajuste conforme sua preferência e veja abaixo o preview.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pill label="Normal" active={fontSize === 'normal'} onPress={() => setFontSize('normal')} />
            <Pill label="Grande" active={fontSize === 'grande'} onPress={() => setFontSize('grande')} />
            <Pill label="Muito grande" active={fontSize === 'muito-grande'} onPress={() => setFontSize('muito-grande')} />
          </View>
          <Text style={{ marginTop: 14, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: fontSize === 'normal' ? 16 : fontSize === 'grande' ? 20 : 24, lineHeight: fontSize === 'normal' ? 24 : fontSize === 'grande' ? 28 : 32 }}>
            Preview do texto em tempo real
          </Text>
        </View>

        {/* Contraste */}
        <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Contraste</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pill label="Normal" active={contrast === 'normal'} onPress={() => setContrast('normal')} />
            <Pill label="Alto contraste" active={contrast === 'alto'} onPress={() => setContrast('alto')} />
          </View>
          <Text style={{ marginTop: 14, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>Preview das cores conforme a opção.</Text>
        </View>

        {/* Sons */}
        <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sons</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pill label="Com som" active={sound === 'com'} onPress={() => setSound('com')} />
            <Pill label="Sem som" active={sound === 'sem'} onPress={() => setSound('sem')} />
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Pressable onPress={finish} style={{ height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Pronto, vamos começar!">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 18 }}>Pronto, vamos começar!</Text>
        </Pressable>
      </View>
    </View>
  );
}


