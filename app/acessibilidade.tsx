import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { Type, Contrast, Volume2, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// Persistência principal já é feita no DesignSystemContext via AsyncStorage

export default function PerfilAcessibilidadeScreen() {
  const router = useRouter();
  const { currentTheme, accessibility, setAccessibility } = useTheme();
  const isDark = currentTheme === 'dark';
  const title = getResponsiveValues('headline-lg');

  const [fontSize, setFontSize] = useState<'normal' | 'grande' | 'muito-grande'>(accessibility.fontScale);
  const [contrast, setContrast] = useState<'normal' | 'alto'>(accessibility.contrast);
  const [sound, setSound] = useState<'com' | 'sem'>(accessibility.sound);

  useEffect(() => {
    // Mantém sincronizado caso outro lugar altere
    setFontSize(accessibility.fontScale);
    setContrast(accessibility.contrast);
    setSound(accessibility.sound);
  }, [accessibility]);

  // Observação: não persistimos em Supabase para evitar custos. AsyncStorage já é persistente.

  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1, backgroundColor: active ? '#430593' : (isDark ? colors['bg-secondary-dark'] : '#FFFFFF'), borderColor: active ? '#430593' : (isDark ? colors['divider-dark'] : '#E5E7EB') }}>
      <Text style={{ color: active ? '#FFFFFF' : (isDark ? colors['text-primary-dark'] : colors['text-primary-light']), fontFamily: dsFontFamily['jakarta-medium'] }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'] }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB', backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }}>
          <ChevronLeft size={20} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default }}>Acessibilidade</Text>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Type size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Tamanho da letra</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={fontSize === 'normal'} onPress={() => { setFontSize('normal'); setAccessibility({ fontScale: 'normal' }); }} />
            <Pill label="Grande" active={fontSize === 'grande'} onPress={() => { setFontSize('grande'); setAccessibility({ fontScale: 'grande' }); }} />
            <Pill label="Muito grande" active={fontSize === 'muito-grande'} onPress={() => { setFontSize('muito-grande'); setAccessibility({ fontScale: 'muito-grande' }); }} />
          </View>
          {/* Pré-visualização de tamanhos */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-regular'] }}>Exemplo:</Text>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-regular'], fontSize: 14 }}>Normal: Este é um exemplo de texto.</Text>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-regular'], fontSize: 14 * 1.00 }}>Grande: Este é um exemplo de texto.</Text>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-regular'], fontSize: 14 * 1.15 }}>Muito grande: Este é um exemplo de texto.</Text>
          </View>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Contrast size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Contraste</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={contrast === 'normal'} onPress={() => { setContrast('normal'); setAccessibility({ contrast: 'normal' }); }} />
            <Pill label="Alto contraste" active={contrast === 'alto'} onPress={() => { setContrast('alto'); setAccessibility({ contrast: 'alto' }); }} />
          </View>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Volume2 size={20} color={'#430593'} />
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sons</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Com som" active={sound === 'com'} onPress={() => { setSound('com'); setAccessibility({ sound: 'com' }); }} />
            <Pill label="Sem som" active={sound === 'sem'} onPress={() => { setSound('sem'); setAccessibility({ sound: 'sem' }); }} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


