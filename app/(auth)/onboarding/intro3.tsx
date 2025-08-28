import React from 'react';
import { View, Text, Image, Pressable, ScrollView, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
import { useResponsive } from '@/hooks/useResponsive';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

export default function OnboardingIntro3() {
  const router = useRouter();
  const { currentTheme, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';

  const { height } = useResponsive();
  const isShortScreen = height < 700;

  const title = getResponsiveValues(isShortScreen ? 'headline-lg' : 'headline-xl');
  const subtitle = getResponsiveValues(isShortScreen ? 'body-md' : 'body-lg');
  const buttonType = getResponsiveValues('label-lg');

  const heroSpacerHeight = isShortScreen ? 200 : 300;
  const topPadding = isShortScreen ? 40 : 64;
  const gradientHeight = isShortScreen ? '45%' : '55%';

  const [ctaContainerHeight, setCtaContainerHeight] = React.useState(0);
  const ctaBottomOffset = 48;
  const contentBottomPadding = Math.max(160, ctaContainerHeight + ctaBottomOffset + 24);

  // Hook para navegação por swipe
  const { panHandlers } = useSwipeNavigation({
    onSwipeRight: () => router.replace('/(auth)/onboarding/intro2'),
    swipeThreshold: 30,
    velocityThreshold: 0.1,
  });

  const ProgressDots = () => (
    <View style={{ gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors['text-secondary-dark'], fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 2 }}>
        Passo 3 de 3
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: colors['brand-orange'] }} />
      </View>
    </View>
  );

  React.useEffect(() => {
    try {
      applyFontScale('grande');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/images/Mulher Sênior com Figos (1).jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(0,0,0,0.97)',
          'rgba(0,0,0,0.85)',
          'rgba(0,0,0,0.45)',
          'rgba(0,0,0,0)'
        ]}
        locations={[0, 0.5, 0.9, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: gradientHeight }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: topPadding, paddingBottom: contentBottomPadding, justifyContent: 'flex-start' }}
        bounces={false}
        scrollEnabled={false}
        {...panHandlers}
      >
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Image source={require('@/assets/images/Logo Mais 60 Branco.png')} style={{ width: 128, height: 38 }} resizeMode="contain" accessibilityIgnoresInvertColors />
          <View style={{ height: heroSpacerHeight, marginTop: 8 }} />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ marginTop: 8, color: colors['text-primary-dark'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default, textAlign: 'center' }}>
            Privacidade em primeiro lugar
          </Text>
          <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.88)', fontFamily: dsFontFamily['jakarta-medium'], fontSize: subtitle.fontSize.default, lineHeight: subtitle.lineHeight.default, textAlign: 'center' }}>
            Seus dados ficam no dispositivo. Você controla permissões e acessibilidade no seu Perfil.
          </Text>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 24, right: 24, bottom: 48 }} onLayout={(e) => setCtaContainerHeight(e.nativeEvent.layout.height)}>
        <View style={{ gap: 16 }}>
          <ProgressDots />
          <Pressable onPress={() => router.replace('/(auth)/login')} style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors['brand-orange'], shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Começar">
            <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: buttonType.fontSize.default, lineHeight: buttonType.lineHeight.default }}>Começar</Text>
          </Pressable>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: dsFontFamily['jakarta-medium'], fontSize: 12, textAlign: 'center' }}>
              👉 Arraste para a direita para voltar
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}


