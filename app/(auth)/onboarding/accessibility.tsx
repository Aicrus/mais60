import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Type, Contrast, Volume2 } from 'lucide-react-native';
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

  const ProgressDots = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 12, marginBottom: 2 }}>
        Passo 3 de 3
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#430593' }} />
      </View>
    </View>
  );

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
    <View style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'], padding: 20, justifyContent: 'space-between' }}>
      <View style={{ gap: 18 }}>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default }}>
          Deixe o app do seu jeito
        </Text>
        <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
          Essas preferências facilitam a leitura e a navegação. Você pode alterar quando quiser.
        </Text>

        {/* Tamanho da letra */}
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Type size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Tamanho da letra</Text>
          </View>
          <Text style={{ marginTop: 6, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>Ajuste conforme sua preferência e veja abaixo o preview.</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={fontSize === 'normal'} onPress={() => setFontSize('normal')} />
            <Pill label="Grande" active={fontSize === 'grande'} onPress={() => setFontSize('grande')} />
            <Pill label="Muito grande" active={fontSize === 'muito-grande'} onPress={() => setFontSize('muito-grande')} />
          </View>
          <Text style={{ marginTop: 10, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: fontSize === 'normal' ? 16 : fontSize === 'grande' ? 20 : 22, lineHeight: fontSize === 'normal' ? 22 : fontSize === 'grande' ? 28 : 30 }}>
            Preview do texto em tempo real
          </Text>
        </View>

        {/* Contraste */}
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Contrast size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Contraste</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={contrast === 'normal'} onPress={() => setContrast('normal')} />
            <Pill label="Alto contraste" active={contrast === 'alto'} onPress={() => setContrast('alto')} />
          </View>
          <Text style={{ marginTop: 10, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14 }}>Preview das cores conforme a opção.</Text>
        </View>

        {/* Sons */}
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Volume2 size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sons</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Com som" active={sound === 'com'} onPress={() => setSound('com')} />
            <Pill label="Sem som" active={sound === 'sem'} onPress={() => setSound('sem')} />
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <ProgressDots />
        <Pressable onPress={finish} style={{ height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Pronto, vamos começar!">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 17 }}>Pronto, vamos começar!</Text>
        </Pressable>
      </View>
    </View>
  );
}


