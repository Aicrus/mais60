import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { Type, Contrast, Volume2, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PageContainer } from '@/components/layout/PageContainer';
// Persistência principal já é feita no DesignSystemContext via AsyncStorage

export default function PerfilAcessibilidadeScreen() {
  const router = useRouter();
  const { currentTheme, uiColors, accessibility, setAccessibility, typographyVersion, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';
  const appBarLabelType = getResponsiveValues('label-md');

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
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1, backgroundColor: active ? '#430593' : uiColors.bgSecondary, borderColor: active ? '#430593' : uiColors.divider }}>
      <Text style={{ color: active ? '#FFFFFF' : uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-medium'] }}>{label}</Text>
    </Pressable>
  );

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{}}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2, paddingBottom: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={{
            height: 44,
            paddingHorizontal: 10,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
            backgroundColor: uiColors.bgSecondary,
            borderColor: uiColors.divider,
          }}
        >
          <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text
          style={{
            color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
            fontFamily: appBarLabelType.fontFamily,
            fontSize: appBarLabelType.fontSize.default,
            lineHeight: appBarLabelType.lineHeight.default,
          }}
        >
          Voltar
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Type size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Tamanho da letra</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={fontSize === 'normal'} onPress={() => { setFontSize('normal'); applyFontScale('normal'); }} />
            <Pill label="Grande" active={fontSize === 'grande'} onPress={() => { setFontSize('grande'); applyFontScale('grande'); }} />
            <Pill label="Muito grande" active={fontSize === 'muito-grande'} onPress={() => { setFontSize('muito-grande'); applyFontScale('muito-grande'); }} />
          </View>
          {/* Pré-visualização de tamanhos (apenas um texto dinâmico) */}
          <View style={{ marginTop: 12 }}>
            {(() => {
              // Recalcula quando typographyVersion muda
              const preview = getResponsiveValues('body-md');
              return (
                <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-regular'], fontSize: preview.fontSize.default, lineHeight: preview.lineHeight.default }}>
                  Exemplo de texto
                </Text>
              );
            })()}
          </View>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Contrast size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Contraste</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Normal" active={contrast === 'normal'} onPress={() => { setContrast('normal'); setAccessibility({ contrast: 'normal' }); }} />
            <Pill label="Alto contraste" active={contrast === 'alto'} onPress={() => { setContrast('alto'); setAccessibility({ contrast: 'alto' }); }} />
          </View>
        </View>

        <View style={{ borderRadius: 14, padding: 12, backgroundColor: uiColors.bgSecondary, borderWidth: 1, borderColor: uiColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Volume2 size={20} color={'#430593'} />
            <Text style={{ color: uiColors.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sons</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill label="Com som" active={sound === 'com'} onPress={() => { setSound('com'); setAccessibility({ sound: 'com' }); }} />
            <Pill label="Sem som" active={sound === 'sem'} onPress={() => { setSound('sem'); setAccessibility({ sound: 'sem' }); }} />
          </View>
        </View>
      </View>
      </ScrollView>
    </PageContainer>
  );
}


