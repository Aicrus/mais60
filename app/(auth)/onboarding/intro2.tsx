import React from 'react';
import { View, Text, Image, Pressable, ScrollView, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';

export default function OnboardingIntro2() {
  const router = useRouter();
  const { currentTheme, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';

  const title = getResponsiveValues('headline-xl');
  const subtitle = getResponsiveValues('body-lg');
  const buttonType = getResponsiveValues('label-lg');

  const ProgressDots = () => (
    <View style={{ gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 2 }}>
        Passo 2 de 3
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: colors['brand-green'] }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
      </View>
    </View>
  );

  return (
    <View
      style={{ flex: 1 }}
      {...React.useRef(
        PanResponder.create({
          onMoveShouldSetPanResponder: (_evt, gestureState) => {
            const { dx, dy } = gestureState;
            return Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy);
          },
          onPanResponderRelease: (_evt, gestureState) => {
            const { dx, vx } = gestureState;
            const distanceThreshold = 40;
            const velocityThreshold = 0.3;
            if (dx < -distanceThreshold || vx < -velocityThreshold) {
              router.push('/(auth)/onboarding/intro3');
            } else if (dx > distanceThreshold || vx > velocityThreshold) {
              router.back();
            }
          },
        })
      ).current.panHandlers}
    >
        {React.useEffect(() => { try { applyFontScale('grande'); } catch {} }, [])}
      <ScrollView
        style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'] }}
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'flex-start' }}
        bounces={false}
      >
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Image source={require('@/assets/images/Logo Mais 60 Verde.png')} style={{ width: 108, height: 32 }} resizeMode="contain" accessibilityIgnoresInvertColors />
        <Image source={require('@/assets/images/logo-mais60.png')} style={{ width: '100%', height: 220, marginTop: 8 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </View>

      <View style={{ alignItems: 'center' }}>
        <Text style={{ marginTop: 8, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default, textAlign: 'center' }}>
          Como funciona
        </Text>
        <Text style={{ marginTop: 10, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: subtitle.fontSize.default, lineHeight: subtitle.lineHeight.default, textAlign: 'center' }}>
          Explore vídeos nas 5 áreas principais, favorite conteúdos e acompanhe seu uso na aba "Uso".
        </Text>
      </View>

        <View style={{ gap: 16, marginTop: 24 }}>
        <ProgressDots />
          <Pressable onPress={() => router.push('/(auth)/onboarding/intro3')} style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors['brand-green'], shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Avançar">
            <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: buttonType.fontSize.default, lineHeight: buttonType.lineHeight.default }}>Avançar</Text>
        </Pressable>
      </View>
      </ScrollView>
    </View>
  );
}


