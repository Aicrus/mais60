import React from 'react';
import { View, Text, Image, Pressable, ScrollView, PanResponder, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { currentTheme, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';

  const title = getResponsiveValues('headline-xl');
  const subtitle = getResponsiveValues('body-lg');
  const buttonType = getResponsiveValues('label-lg');

  const panResponder = React.useRef(
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
          router.push('/(auth)/onboarding/intro2');
        }
      },
    })
  ).current;

  React.useEffect(() => {
    try {
      applyFontScale('grande');
    } catch {}
    // Intencionalmente sem dependências para evitar re-render loop
    // ao depender de referências não estáveis do contexto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <ImageBackground
      source={require('@/assets/images/Homem Idoso Hidratando-se.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
      {...panResponder.panHandlers}
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
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 160, justifyContent: 'flex-start' }}
        bounces={false}
      >
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Image source={require('@/assets/images/Logo Mais 60 Roxo.png')} style={{ width: 128, height: 38 }} resizeMode="contain" accessibilityIgnoresInvertColors />
          {/* Espaço equivalente à imagem central removida para manter o layout como antes */}
          <View style={{ height: 300, marginTop: 8 }} />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ marginTop: 8, color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default, textAlign: 'center' }}>
            Descubra conteúdos para o seu bem‑estar
          </Text>
          <Text style={{ marginTop: 10, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: subtitle.fontSize.default, lineHeight: subtitle.lineHeight.default, textAlign: 'center' }}>
            Exercícios guiados, dicas de saúde e programas pensados para a sua rotina.
          </Text>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 24, right: 24, bottom: 48 }}>
        <View style={{ gap: 16 }}>
          <ProgressDots />
          <Pressable onPress={() => router.push('/(auth)/onboarding/intro2')} style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Avançar">
            <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: buttonType.fontSize.default, lineHeight: buttonType.lineHeight.default }}>Avançar</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}


