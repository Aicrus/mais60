import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Dumbbell, Utensils, Shield, Brain, Heart, ChevronLeft, Play, Check } from 'lucide-react-native';
import { GradientView } from '@/components/effects/GradientView';
import { useRouter } from 'expo-router';
// Removidos imports de componentes excluídos; usando versões simples inline

type ModuleKey = 'atividade-fisica' | 'habitos-alimentares' | 'seguranca-domiciliar' | 'estimulacao-cognitiva' | 'saude-mental';

export function ModuleScreen({ moduleKey }: { moduleKey: ModuleKey }) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('subtitle-sm');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-md');
  const appBarLabelType = getResponsiveValues('label-md');

  const BRAND = {
    purple: colors['brand-purple'],
    green: colors['brand-green'],
    light: colors['brand-light'],
    coral: colors['brand-coral'],
    blue: colors['brand-blue'],
    orange: colors['brand-orange'],
  } as const;

  const defaultImage = require('@/assets/images/Imagem idoso feliz 8 ago 2025.png');
  const foodImage = require('@/assets/images/Imagem idoso feliz 8 ago 2025 (1).png');

  // Cor unificada para o cartão hero, igual aos cards da Home
  const UNIFIED_HERO_COLOR = '#27CC95';

  const config = useMemo(() => {
    const map: Record<ModuleKey, {
      title: string;
      subtitle: string;
      heroColor: string; // mantido no tipo para compatibilidade, mas será sobrescrito pelo UNIFIED_HERO_COLOR
      icon: JSX.Element;
      image: any;
      categories: { id: string; label: string }[];
      list: { id: string; title: string; subtitle: string; type?: 'video' | 'check' }[];
      rightIconType?: 'play' | 'check';
    }> = {
      'atividade-fisica': {
        title: 'Movimente-se',
        subtitle: 'Aulas de exercícios e movimentos',
        heroColor: BRAND.green,
        icon: <Dumbbell size={28} color="#FFFFFF" />,
        image: defaultImage,
        categories: [
          { id: 'alongamento', label: 'Alongamento' },
          { id: 'caminhada', label: 'Caminhada' },
          { id: 'fortalecimento', label: 'Fortalecimento' },
        ],
        list: [
          { id: 'dQw4w9WgXcQ', title: 'Vídeo de demonstração', subtitle: 'YouTube • 4 min', type: 'video' },
          { id: '1', title: 'Alongamento matinal', subtitle: 'Função do exercício • 10 min', type: 'video' },
          { id: '2', title: 'Caminhada leve', subtitle: 'Função do exercício • 15 min', type: 'video' },
          { id: '3', title: 'Fortalecimento', subtitle: 'Função do exercício • 12 min', type: 'video' },
        ],
        rightIconType: 'play',
      },
      'habitos-alimentares': {
        title: 'Alimente-se',
        subtitle: 'Receitas saudáveis e nutritivas',
        heroColor: BRAND.orange,
        icon: <Utensils size={28} color="#FFFFFF" />,
        image: foodImage,
        categories: [
          { id: 'cafe', label: 'Café' },
          { id: 'almoco', label: 'Almoço' },
          { id: 'lanche', label: 'Lanche' },
          { id: 'jantar', label: 'Jantar' },
        ],
        list: [
          { id: '1', title: 'Sopa nutritiva', subtitle: 'Fácil • 20 min' },
          { id: '2', title: 'Salada colorida', subtitle: 'Fácil • 10 min' },
          { id: '3', title: 'Frango assado', subtitle: 'Médio • 30 min' },
        ],
        rightIconType: 'play',
      },
      'seguranca-domiciliar': {
        title: 'Segurança em casa',
        subtitle: 'Dicas e checklists',
        heroColor: BRAND.blue,
        icon: <Shield size={28} color="#FFFFFF" />,
        image: defaultImage,
        categories: [
          { id: 'banheiro', label: 'Banheiro' },
          { id: 'cozinha', label: 'Cozinha' },
          { id: 'quarto', label: 'Quarto' },
        ],
        list: [
          { id: '1', title: 'Banheiro seguro', subtitle: 'Barra de apoio e antiderrapante', type: 'check' },
          { id: '2', title: 'Cozinha organizada', subtitle: 'Utensílios ao alcance', type: 'check' },
          { id: '3', title: 'Quarto iluminado', subtitle: 'Luz noturna', type: 'check' },
        ],
        rightIconType: 'check',
      },
      'estimulacao-cognitiva': {
        title: 'Mente ativa',
        subtitle: 'Jogos e desafios',
        heroColor: BRAND.light,
        icon: <Brain size={28} color="#FFFFFF" />,
        image: defaultImage,
        categories: [
          { id: 'memoria', label: 'Memória' },
          { id: 'logica', label: 'Lógica' },
          { id: 'atencao', label: 'Atenção' },
        ],
        list: [
          { id: '1', title: 'Jogo da memória', subtitle: 'Fácil • 5 min' },
          { id: '2', title: 'Palavras rápidas', subtitle: 'Médio • 8 min' },
          { id: '3', title: 'Lógica simples', subtitle: 'Médio • 10 min' },
        ],
        rightIconType: 'play',
      },
      'saude-mental': {
        title: 'Bem‑estar',
        subtitle: 'Respiração e relaxamento',
        heroColor: BRAND.coral,
        icon: <Heart size={28} color="#FFFFFF" />,
        image: defaultImage,
        categories: [
          { id: 'meditacao', label: 'Meditação' },
          { id: 'respiracao', label: 'Respiração' },
          { id: 'sono', label: 'Sono' },
        ],
        list: [
          { id: '1', title: 'Meditação para ansiedade', subtitle: '10 min' },
          { id: '2', title: 'Respiração relaxante', subtitle: '7 min' },
          { id: '3', title: 'Para dormir melhor', subtitle: '12 min' },
        ],
        rightIconType: 'play',
      },
    };
    return map[moduleKey];
  }, [moduleKey]);

  const [selected, setSelected] = useState<string>(config.categories[0]?.id || '');

  return (
    <PageContainer>
      {/* App Bar */}
      <View style={styles.appBar} accessibilityRole="header">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={[
            styles.appBarBack,
            {
              backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
              borderColor: isDark ? colors['divider-dark'] : 'transparent',
            },
          ]}
        >
          <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : BRAND.purple} />
        </Pressable>
        <Text
          style={[
            styles.appBarLabel,
            { color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'] },
          ]}
        >
          Voltar
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: UNIFIED_HERO_COLOR }]}> 
          <View pointerEvents="none" style={styles.rightImageWrap}>
            <Image source={config.image} style={styles.rightImage} resizeMode="contain" accessibilityIgnoresInvertColors />
          </View>
          <View style={[styles.moduleBadge, { backgroundColor: BRAND.purple }]}> 
            {config.icon}
          </View>
          <GradientView
            type="custom"
            colors={['rgba(255,255,255,0)', isDark ? 'rgba(20,24,27,0.95)' : 'rgba(255,255,255,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={[
            styles.infoBar,
            { backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' },
          ]}>
            <Text style={{
              color: isDark ? colors['text-primary-dark'] : '#3E0A7A',
              fontFamily: dsFontFamily['jakarta-extrabold'],
              fontSize: titleType.fontSize.default,
              lineHeight: titleType.lineHeight.default,
              textAlign: 'center',
            }}>{config.title}</Text>
            <Text style={{
              marginTop: 6,
              color: isDark ? colors['text-secondary-dark'] : '#6B7280',
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: subtitleType.fontSize.default,
              lineHeight: subtitleType.lineHeight.default,
              textAlign: 'center',
            }}>{config.subtitle}</Text>
          </View>
        </View>

        {/* Filtros por categoria (chips simples) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
          {config.categories.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setSelected(opt.id)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selected === opt.id
                      ? (isDark ? colors['primary-dark'] : colors['primary-light'])
                      : (isDark ? colors['bg-secondary-dark'] : '#FFFFFF'),
                  borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                },
              ]}
            >
              <Text
                style={{
                  color: selected === opt.id ? '#FFFFFF' : (isDark ? colors['text-primary-dark'] : colors['text-primary-light']),
                  fontFamily: dsFontFamily['jakarta-semibold'],
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lista por módulo (usando componentes dedicados) */}
        <View style={{ gap: 14, marginTop: 8 }}>
          {moduleKey === 'atividade-fisica' && (
            <View style={{ gap: 10 }}>
              {config.list
                .filter((i) => i.type === 'video')
                .map((i) => (
                  <Pressable
                    key={i.id}
                    style={[
                      styles.listItem,
                      {
                        borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                        backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                      },
                    ]}
                    onPress={() => router.push({ pathname: '/player/video/[id]', params: { id: i.id } })}
                  >
                    <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-bold'] }}>{i.title}</Text>
                    <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>{i.subtitle}</Text>
                  </Pressable>
                ))}
            </View>
          )}

          {moduleKey === 'habitos-alimentares' && (
            <View style={{ gap: 10 }}>
              {config.list.map((i) => (
                <Pressable
                  key={i.id}
                  style={[
                    styles.listItem,
                    {
                      borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                      backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                    },
                  ]}
                  onPress={() => router.push((`/receita/${i.id}`) as any)}
                >
                  <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-bold'] }}>{i.title}</Text>
                  <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>{i.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {moduleKey === 'seguranca-domiciliar' && (
            <View style={{ gap: 10 }}>
              {config.list.map((i) => (
                <Pressable
                  key={i.id}
                  style={[
                    styles.listItem,
                    {
                      borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                      backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                    },
                  ]}
                  onPress={() => router.push((`/checklist/${i.id}`) as any)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {config.rightIconType === 'check' ? (
                      <Check size={18} color={colors['brand-green']} />
                    ) : (
                      <Play size={18} color={colors['brand-purple']} />
                    )}
                    <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-bold'] }}>{i.title}</Text>
                  </View>
                  <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>{i.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {moduleKey === 'estimulacao-cognitiva' && (
            <View style={{ gap: 10 }}>
              {config.list.map((i) => (
                <Pressable
                  key={i.id}
                  style={[
                    styles.listItem,
                    {
                      borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                      backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                    },
                  ]}
                  onPress={() => router.push((`/jogo/${i.id}`) as any)}
                >
                  <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-bold'] }}>{i.title}</Text>
                  <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>{i.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {moduleKey === 'saude-mental' && (
            <View style={{ gap: 10 }}>
              {config.list.map((i) => (
                <Pressable
                  key={i.id}
                  style={[
                    styles.listItem,
                    {
                      borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                      backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                    },
                  ]}
                  onPress={() => router.push((`/audio/${i.id}`) as any)}
                >
                  <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-bold'] }}>{i.title}</Text>
                  <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'] }}>{i.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 90, paddingTop: 4 },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8, paddingHorizontal: 2, paddingBottom: 8, marginBottom: 6 },
  appBarBack: { height: 44, paddingHorizontal: 10, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  appBarLabel: { fontFamily: dsFontFamily['jakarta-medium'], fontSize: 16 },
  heroCard: { borderRadius: 24, padding: 16, marginBottom: 8, overflow: 'hidden', height: 240 },
  heroGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  rightImageWrap: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '72%', alignItems: 'flex-end', justifyContent: 'center' },
  rightImage: { height: '100%', aspectRatio: 11 / 10, transform: [{ translateY: -10 }] },
  moduleBadge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 16, left: 16 },
  infoBar: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 14, position: 'absolute', left: 16, right: 16, bottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  listItem: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12 },
});


