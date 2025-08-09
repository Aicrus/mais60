import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Dumbbell, Play, ChevronLeft } from 'lucide-react-native';
import { GradientView } from '@/components/effects/GradientView';
import { useRouter } from 'expo-router';

export default function PhysicalActivityScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('subtitle-sm');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-md');
  const appBarLabelType = getResponsiveValues('label-md');

  const ui = {
    bg: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
  };

  const BRAND = {
    purple: colors['brand-purple'],
    green: colors['brand-green'],
  } as const;

  const idosoImage = require('@/assets/images/Imagem idoso feliz 8 ago 2025.png');

  const categories = [
    { id: 'alongamento', label: 'Alongamento' },
    { id: 'caminhada', label: 'Caminhada' },
    { id: 'fortalecimento', label: 'Fortalecimento' },
  ];
  const [selected, setSelected] = useState<string>('alongamento');

  const exercises = [
    { id: '1', title: 'Alongamento matinal', subtitle: 'Função do exercício • 10 min' },
    { id: '2', title: 'Caminhada leve', subtitle: 'Função do exercício • 15 min' },
    { id: '3', title: 'Fortalecimento das pernas', subtitle: 'Função do exercício • 12 min' },
  ];

  return (
    <PageContainer>
      {/* App Bar fixa no topo */}
      <View style={styles.appBar} accessibilityRole="header">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={styles.appBarBack}
        >
          <ChevronLeft size={22} color={'#430593'} />
        </Pressable>
        <Text style={styles.appBarLabel}>Voltar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero inspirado no mock: imagem à direita, badge roxo e barra branca com título/subtítulo */}
        <View style={[styles.heroCard, { backgroundColor: BRAND.green }]}> 
          <View pointerEvents="none" style={styles.rightImageWrap}>
            <Image source={idosoImage} style={styles.rightImage} resizeMode="contain" accessibilityIgnoresInvertColors />
          </View>
          <View style={[styles.moduleBadge, { backgroundColor: BRAND.purple }]}> 
            <Dumbbell size={28} color="#FFFFFF" />
          </View>
          {/* Gradiente sutil para modernizar e dar leitura à barra de info */}
          <GradientView
            type="custom"
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={styles.infoBar}>
            <Text style={{
              color: '#3E0A7A',
              fontFamily: dsFontFamily['jakarta-extrabold'],
              fontSize: titleType.fontSize.default,
              lineHeight: titleType.lineHeight.default,
              textAlign: 'center',
            }}>
              Movimente-se
            </Text>
            <Text style={{
              marginTop: 6,
              color: '#6B7280',
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: subtitleType.fontSize.default,
              lineHeight: subtitleType.lineHeight.default,
              textAlign: 'center',
            }}>
              Aulas de exercícios e movimentos
            </Text>
          </View>
        </View>

        {/* Filtros de categoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 2, gap: 10, marginTop: 6, marginBottom: 6 }}
        >
          {categories.map((c) => {
            const active = c.id === selected;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelected(c.id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? '#430593' : '#FFFFFF', borderColor: active ? '#430593' : '#E5E7EB' },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filtro: ${c.label}`}
                accessibilityState={{ selected: active }}
              >
                <Text style={{
                  color: active ? '#FFFFFF' : '#430593',
                  fontFamily: dsFontFamily['jakarta-medium'],
                }}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lista de exercícios (UI inicial) */}
        <View style={{ gap: 14, marginTop: 8 }}>
          {exercises.map((item) => (
            <Pressable key={item.id} style={[styles.exerciseCard]}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.subtitle}`}
              accessibilityHint="Toque para ver o vídeo"
              onPress={() => { /* Em breve: abrir player */ }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontFamily: dsFontFamily['jakarta-extrabold'],
                  fontSize: listTitleType.fontSize.default,
                  lineHeight: listTitleType.lineHeight.default,
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  marginTop: 6,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: dsFontFamily['jakarta-medium'],
                  fontSize: listSubtitleType.fontSize.default,
                  lineHeight: listSubtitleType.lineHeight.default,
                }}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={styles.playCircle}>
                <Play size={26} color={BRAND.purple} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 4,
  },
  heroCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 8,
    overflow: 'hidden',
    height: 240,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 8,
    marginBottom: 6,
  },
  appBarBack: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  appBarTitle: {
    color: '#1F2937',
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 20,
  },
  appBarLabel: {
    color: '#1F2937',
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 16,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  rightImageWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '72%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightImage: {
    height: '100%',
    aspectRatio: 11/10,
    transform: [{ translateY: -10 }],
  },
  moduleBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  infoBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#430593',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});


