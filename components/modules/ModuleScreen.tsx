import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Dumbbell, Utensils, Shield, Brain, Heart, ChevronLeft, Play } from 'lucide-react-native';
import { GradientView } from '@/components/effects/GradientView';
import { useRouter } from 'expo-router';
import { useUsage } from '@/contexts/usage';
import { supabase } from '@/lib/supabase';
// Removidos imports de componentes excluídos; usando versões simples inline
import SafetyChecklist from '@/components/modules/SafetyChecklist';
import Sheet from '@/components/sheets/Sheet';

type ModuleKey = 'atividade-fisica' | 'habitos-alimentares' | 'seguranca-domiciliar' | 'estimulacao-cognitiva' | 'saude-mental';

type Categoria = { id: string; titulo: string };
type VideoItem = { id: string; youtube_id: string; titulo: string; descricao: string | null; categoria_id: string | null };

export function ModuleScreen({ moduleKey }: { moduleKey: ModuleKey }) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();
  const { logModuleAccess } = useUsage();

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('subtitle-sm');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-lg');
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
      heroColor: string;
      icon: JSX.Element;
      image: any;
      rightIconType?: 'play';
    }> = {
      'atividade-fisica': {
        title: 'Movimente-se',
        subtitle: 'Aulas de exercícios e movimentos',
        heroColor: BRAND.green,
        icon: <Dumbbell size={28} color="#FFFFFF" />,
        image: defaultImage,
        rightIconType: 'play',
      },
      'habitos-alimentares': {
        title: 'Alimente-se',
        subtitle: 'Receitas saudáveis e nutritivas',
        heroColor: BRAND.orange,
        icon: <Utensils size={28} color="#FFFFFF" />,
        image: foodImage,
        rightIconType: 'play',
      },
      'seguranca-domiciliar': {
        title: 'Segurança em casa',
        subtitle: 'Dicas e checklists',
        heroColor: BRAND.blue,
        icon: <Shield size={28} color="#FFFFFF" />,
        image: defaultImage,
        rightIconType: 'play',
      },
      'estimulacao-cognitiva': {
        title: 'Mente ativa',
        subtitle: 'Jogos e desafios',
        heroColor: BRAND.light,
        icon: <Brain size={28} color="#FFFFFF" />,
        image: defaultImage,
        rightIconType: 'play',
      },
      'saude-mental': {
        title: 'Bem‑estar',
        subtitle: 'Respiração e relaxamento',
        heroColor: BRAND.coral,
        icon: <Heart size={28} color="#FFFFFF" />,
        image: defaultImage,
        rightIconType: 'play',
      },
    };
    return map[moduleKey];
  }, [moduleKey]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const [selected, setSelected] = useState<string>('');
  
  const carregarCategorias = useCallback(async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, titulo')
      .eq('pilar_id', moduleKey)
      .order('ordem', { ascending: true });
    if (!error && data) {
      setCategorias(data as Categoria[]);
      if (!selected && data.length > 0) setSelected(data[0].id);
    }
  }, [moduleKey, selected]);

  const carregarVideos = useCallback(async (categoriaId?: string) => {
    let query = supabase
      .from('videos')
      .select('id, youtube_id, titulo, descricao, categoria_id')
      .eq('pilar_id', moduleKey)
      .eq('publicado', true)
      .order('criado_em', { ascending: false });
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    const { data, error } = await query;
    if (!error && data) setVideos(data as unknown as VideoItem[]);
  }, [moduleKey]);

  useEffect(() => {
    carregarCategorias();
    carregarVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  useEffect(() => {
    if (!selected) return;
    carregarVideos(selected);
  }, [selected, carregarVideos]);
  const [isChecklistOpen, setChecklistOpen] = useState<boolean>(false);

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
          {categorias.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setSelected(opt.id)}
              accessibilityRole="button"
              accessibilityLabel={opt.titulo}
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
                {opt.titulo}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Botão para abrir o Checklist de Segurança (somente neste módulo) */}
        {moduleKey === 'seguranca-domiciliar' && (
          <View style={{ marginTop: 6, alignItems: 'flex-end' }}>
            <Pressable
              onPress={() => setChecklistOpen(true)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'transparent',
                backgroundColor: colors['brand-blue']
              }}
            >
              <Shield size={16} color={'#FFFFFF'} />
              <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-semibold'] }}>
                Checklist de Segurança
              </Text>
            </Pressable>
          </View>
        )}

        {/* Lista de vídeos do Supabase */}
        <View style={{ gap: 12, marginTop: 8 }}>
          {videos.map((i) => (
            <Pressable
              key={i.id}
              style={[
                styles.listCard,
                {
                  borderColor: isDark ? colors['divider-dark'] : '#E5E7EB',
                  backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${i.titulo}. ${i.descricao || 'Vídeo do YouTube'}`}
              onPress={() => {
                logModuleAccess(moduleKey);
                router.push({ pathname: '/player/video/[id]', params: { id: i.youtube_id, title: i.titulo, subtitle: i.descricao || 'YouTube', module: moduleKey } });
              }}
            >
              <View style={[styles.listIconCircle, { backgroundColor: colors['brand-purple'] }]}>
                <Play size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                    fontFamily: dsFontFamily['jakarta-extrabold'],
                    fontSize: listTitleType.fontSize.default,
                    lineHeight: listTitleType.lineHeight.default,
                  }}
                >
                  {i.titulo}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                    fontFamily: dsFontFamily['jakarta-medium'],
                    fontSize: listSubtitleType.fontSize.default,
                    lineHeight: listSubtitleType.lineHeight.default,
                  }}
                >
                  {i.descricao || 'YouTube'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sheet do Checklist */}
        <Sheet
          isOpen={isChecklistOpen}
          onClose={() => setChecklistOpen(false)}
          position="bottom"
          showCloseButton
          height={520}
          testID="safety-checklist-sheet"
        >
          <View style={{ paddingHorizontal: 18, paddingVertical: 12 }}>
            <SafetyChecklist categoryId={(selected as any) as 'banheiro' | 'cozinha' | 'quarto'} />
          </View>
        </Sheet>
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
    listCard: {
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    listIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 2,
    },
});


