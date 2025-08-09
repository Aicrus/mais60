import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, Pressable, ScrollView, ImageSourcePropType } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Dumbbell,
  Utensils,
  Shield,
  Brain,
  Heart,
  Bell,
} from 'lucide-react-native';

export default function Home() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { session } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('subtitle-sm');
  const sectionType = getResponsiveValues('title-sm');
  // Saudação: mesmo tamanho para as duas linhas, com a primeira mais fina
  const greetType = getResponsiveValues('headline-lg');
  const statValueType = getResponsiveValues('title-sm');
  const statLabelType = getResponsiveValues('label-lg');
  const rowLabelType = getResponsiveValues('body-md');
  const moduleTitleType = getResponsiveValues('title-sm');
  const moduleSubtitleType = getResponsiveValues('body-md');

  const ui = {
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    tint: isDark ? colors['primary-dark'] : colors['primary-light'],
  };

  // Paleta fixa da marca vinda do design-system
  const BRAND = {
    purple: colors['brand-purple'],
    green: colors['brand-green'],
    light: colors['brand-light'],
    coral: colors['brand-coral'],
    blue: colors['brand-blue'],
    orange: colors['brand-orange'],
  } as const;

  // Logo central superior
  const logoRoxo = require('@/assets/images/Logo Mais 60 Roxo.png');
  const logoAmarelo = require('@/assets/images/Logo Mais 60 Amarelo (1).png');
  // Imagem do idoso usada nos cards
  const idosoImage = require('@/assets/images/Imagem idoso feliz 8 ago 2025.png');
  const idosoImageAlt = require('@/assets/images/Imagem idoso feliz 8 ago 2025 (1).png');
  // Removidos assets remotos de módulos
  const userName = ((session?.user?.user_metadata as any)?.name as string) || 'você';
  const avatarUrl =
    ((session?.user?.user_metadata as any)?.avatar_url as string) || 'https://i.pravatar.cc/120?img=20';

  const Row = ({
    icon,
    label,
    right,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole={onPress ? 'button' : undefined}
      hitSlop={8}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>{icon}</View>
      <Text
        style={{
          flex: 1,
          color: ui.textPrimary,
          fontFamily: dsFontFamily['jakarta-medium'],
          fontWeight: '600',
          fontSize: rowLabelType.fontSize.default,
          lineHeight: rowLabelType.lineHeight.default,
          textAlign: 'left',
        }}
      >
        {label}
      </Text>
      {right}
    </Pressable>
  );

  const Stat = ({ value, label }: { value: string; label: string }) => (
    <View style={styles.statItem}>
      <Text style={{
        color: ui.textPrimary,
        fontFamily: dsFontFamily['jakarta-bold'],
        fontSize: statValueType.fontSize.default,
        lineHeight: statValueType.lineHeight.default,
        textAlign: 'center',
      }}>{value}</Text>
      <Text style={{
        marginTop: 2,
        color: ui.textSecondary,
        fontFamily: dsFontFamily['jakarta-medium'],
        fontSize: statLabelType.fontSize.default,
        lineHeight: statLabelType.lineHeight.default,
        textAlign: 'center',
      }}>{label}</Text>
    </View>
  );

  // Card padrão para todos os módulos (acessível e consistente)
  const ModuleCard = ({
    icon,
    title,
    subtitle,
    badgeColor,
    cardColor,
    onPress,
    imageSource,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    badgeColor: string;
    cardColor: string;
    onPress?: () => void;
    imageSource?: ImageSourcePropType;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint="Toque para abrir"
      hitSlop={8}
      style={[styles.moduleCardLarge, { backgroundColor: cardColor, height: 300 }]}
    >
      <View pointerEvents="none" style={styles.rightImageWrap}>
        <Image
          source={imageSource ?? idosoImage}
          style={styles.rightImage}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={[styles.moduleBadge, { backgroundColor: badgeColor }]}> 
        {icon}
      </View>
      <View style={styles.moduleInfoBar}>
        <Text style={{
          color: '#111827',
          fontFamily: dsFontFamily['jakarta-bold'],
          fontSize: moduleTitleType.fontSize.default,
          lineHeight: moduleTitleType.lineHeight.default,
        }}>{title}</Text>
        <Text style={{
          marginTop: 4,
          color: '#6B7280',
          fontFamily: dsFontFamily['jakarta-medium'],
          fontSize: moduleSubtitleType.fontSize.default,
          lineHeight: moduleSubtitleType.lineHeight.default,
        }}>{subtitle}</Text>
      </View>
    </Pressable>
  );

  const handleSoon = () =>
    showToast({ type: 'info', message: 'Em breve', description: 'Conteúdo será adicionado nas próximas etapas.' });

  const TopRow = () => (
    <View style={styles.topRowHeader}>
      <View style={styles.topSide}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarSmall} />
      </View>
      <View style={styles.topCenter}>
        <Image source={isDark ? logoAmarelo : logoRoxo} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Logo Mais60" />
      </View>
      <View style={styles.topSide}>
        <Pressable accessibilityLabel="Notificações" accessibilityRole="button" onPress={handleSoon}>
          <View style={[styles.bellWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Bell size={18} color={ui.textPrimary} />
          </View>
        </Pressable>
      </View>
    </View>
  );

  const WelcomeText = () => (
    <View style={[styles.welcomeWrap, { marginTop: 10 }]}>
      <Text
        style={{
          color: ui.textPrimary,
          fontFamily: dsFontFamily['jakarta-light'],
          fontSize: greetType.fontSize.default,
          lineHeight: greetType.lineHeight.default,
        }}
      >
        Bem-vindo
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text
          style={{
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-light'],
            fontSize: greetType.fontSize.default,
            lineHeight: greetType.lineHeight.default,
          }}
        >
          de volta,
        </Text>
        <Text
          style={{
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-bold'],
            fontSize: greetType.fontSize.default,
            lineHeight: greetType.lineHeight.default,
          }}
        >
          {' '}{userName}
        </Text>
        <Text
          style={{
            fontSize: greetType.fontSize.default,
            lineHeight: greetType.lineHeight.default,
          }}
        >
          {' '}👋
        </Text>
      </View>
    </View>
  );


  // Removido: Chips de categorias/abas ('Para você', 'Populares', 'Novidades', ...)

  // Removido o HeroCard a pedido (sem destaque de boas-vindas)

  return (
    <PageContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollbar"
        keyboardShouldPersistTaps="handled"
      >
      <TopRow />
      <WelcomeText />

      <Text accessibilityRole="header" style={{
        marginTop: 10,
        marginBottom: 8,
        paddingHorizontal: 4,
        color: ui.textSecondary,
        fontFamily: sectionType.fontFamily,
        fontSize: sectionType.fontSize.default,
        lineHeight: sectionType.lineHeight.default,
      }}>Resumo</Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <View style={styles.statsRow}>
          <Stat value="18 min" label="Hoje" />
          <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
          <Stat value="12" label="Atividades" />
          <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
          <Stat value="7" label="Favoritos" />
        </View>
      </View>

      <Text accessibilityRole="header" style={{
        marginTop: 10,
        marginBottom: 8,
        paddingHorizontal: 4,
        color: ui.textSecondary,
        fontFamily: sectionType.fontFamily,
        fontSize: sectionType.fontSize.default,
        lineHeight: sectionType.lineHeight.default,
      }}>Módulos</Text>
      <View style={styles.modulesList}>
        <ModuleCard
          icon={<Dumbbell size={22} color="#FFFFFF" />}
          title="Movimente‑se"
          subtitle="Aulas e alongamentos"
          badgeColor="#430593"
          cardColor="#27CC95"
          onPress={() => router.push('/modulo/atividade-fisica')}
        />
        <ModuleCard
          icon={<Utensils size={22} color="#FFFFFF" />}
          title="Alimente‑se"
          subtitle="Receitas e hábitos"
          badgeColor="#430593"
          cardColor="#27CC95"
          onPress={() => router.push('/modulo/habitos-alimentares')}
          imageSource={idosoImageAlt}
        />
        <ModuleCard
          icon={<Shield size={22} color="#FFFFFF" />}
          title="Segurança em casa"
          subtitle="Dicas e checklists"
          badgeColor="#430593"
          cardColor="#27CC95"
          onPress={() => router.push('/modulo/seguranca-domiciliar')}
        />
        <ModuleCard
          icon={<Brain size={22} color="#FFFFFF" />}
          title="Mente ativa"
          subtitle="Jogos e desafios"
          badgeColor="#430593"
          cardColor="#27CC95"
          onPress={() => router.push('/modulo/estimulacao-cognitiva')}
        />
        <ModuleCard
          icon={<Heart size={22} color="#FFFFFF" />}
          title="Bem‑estar"
          subtitle="Respiração e relaxamento"
          badgeColor="#430593"
          cardColor="#27CC95"
          onPress={() => router.push('/modulo/saude-mental')}
        />
      </View>

      <Text accessibilityRole="header" style={{
        marginTop: 10,
        marginBottom: 8,
        paddingHorizontal: 4,
        color: ui.textSecondary,
        fontFamily: sectionType.fontFamily,
        fontSize: sectionType.fontSize.default,
        lineHeight: sectionType.lineHeight.default,
      }}>Acesso rápido</Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Dumbbell size={20} color={ui.textPrimary} />}
          label="Alongamento matinal"
          right={<ChevronRight size={20} color={ui.textSecondary} />}
          onPress={handleSoon}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Utensils size={20} color={ui.textPrimary} />}
          label="Receita: Sopa nutritiva"
          right={<ChevronRight size={20} color={ui.textSecondary} />}
          onPress={handleSoon}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Brain size={20} color={ui.textPrimary} />}
          label="Jogo de memória"
          right={<ChevronRight size={20} color={ui.textSecondary} />}
          onPress={handleSoon}
        />
      </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    // Mantido para referência, mas não utilizado; cabeçalho duplicado foi removido
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  logoBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 2,
    marginBottom: 8,
  },
  topRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 8,
    marginBottom: 6,
  },
  topSide: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 110,
    height: 22,
  },
  welcomeWrap: {
    paddingHorizontal: 2,
    paddingVertical: 10,
  },
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  greetingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'none',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  // Removidos estilos de chips/abas
  heroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  heroCta: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  heroImage: {
    width: 120,
    height: 92,
    borderRadius: 12,
    marginLeft: 8,
  },
  modulesList: {
    gap: 14,
    marginBottom: 8,
  },
  // Padrão de card de módulo
  moduleStandard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    height: 300,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  moduleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    marginVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moduleTile: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 4,
  },
  // Layout antigo dos módulos (não usado)
  moduleCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  moduleImage: {
    width: 84,
    height: 64,
    borderRadius: 12,
    marginLeft: 8,
  },
  // Novo layout grande no estilo do mock
  moduleCardLarge: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 6,
    overflow: 'hidden',
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
  moduleHeroImage: {
    width: '100%',
    height: 260,
    borderRadius: 18,
  },
  moduleInfoBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Promo card styles
  promoCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  promoSphere: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  promoTitle: {
    fontFamily: dsFontFamily['jakarta-bold'],
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  promoSubtitle: {
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    width: '70%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  promoButtonBg: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontFamily: dsFontFamily['jakarta-bold'],
    fontSize: 16,
  },
  movementGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  movementTextBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  movementTitle: {
    color: '#3E0A7A', // tom roxo mais escuro próximo ao BRAND.purple para contraste
    fontFamily: dsFontFamily['jakarta-extrabold'],
    fontSize: 22,
  },
  movementSubtitle: {
    marginTop: 4,
    color: 'rgba(17,24,39,0.75)',
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 15,
  },
  textOnlyContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  textOnlyTitle: {
    color: '#FFFFFF',
    fontFamily: dsFontFamily['jakarta-extrabold'],
    fontSize: 22,
  },
  textOnlySubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 15,
  },
});