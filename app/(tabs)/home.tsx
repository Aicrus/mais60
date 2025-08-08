import React from 'react';
import { View, Text, StyleSheet, Image, Platform, Pressable, ScrollView, TextInput } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/useToast';
import {
  ChevronRight,
  Dumbbell,
  Utensils,
  Shield,
  Brain,
  Heart,
  Bell,
  Search as SearchIcon,
} from 'lucide-react-native';

export default function Home() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { session } = useAuth();
  const { showToast } = useToast();

  const titleType = getResponsiveValues('headline-lg');
  const subtitleType = getResponsiveValues('body-sm');
  const sectionType = getResponsiveValues('label-sm');
  // Saudação: mesmo tamanho para as duas linhas, com a primeira mais fina
  const greetType = getResponsiveValues('headline-lg');

  const ui = {
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    tint: isDark ? colors['primary-dark'] : colors['primary-light'],
  };

  // Paleta fixa (sem gradientes) enviada
  const BRAND = {
    purple: '#430593',
    green: '#27CC95',
    light: '#E8F3F5',
    coral: '#FB5C3D',
    blue: '#06AAFC',
    orange: '#FFA300',
  } as const;

  // Logo central superior
  const logoRoxo = require('@/assets/images/Logo Mais 60 Roxo.png');
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
    <Pressable onPress={onPress} style={styles.row} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>{icon}</View>
      <Text
        style={{
          flex: 1,
          color: ui.textPrimary,
          fontFamily: titleType.fontFamily,
          fontWeight: '500',
          fontSize: 15,
        }}
      >
        {label}
      </Text>
      {right}
    </Pressable>
  );

  const Stat = ({ value, label }: { value: string; label: string }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: ui.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: ui.textSecondary }]}>{label}</Text>
    </View>
  );

  const ModuleTile = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.moduleTile, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}
      accessibilityRole="button"
    >
      <View style={[styles.moduleIconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>{icon}</View>
      <Text
        style={{
          marginTop: 8,
          color: ui.textPrimary,
          fontFamily: titleType.fontFamily,
          fontWeight: '600',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  // Novo card vertical com imagem para layout moderno
  const ModuleCard = ({
    icon,
    label,
    description,
    color,
    imageUri,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    imageUri: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.moduleCardLarge, { backgroundColor: color }]}
    >
      {/* Ícone circular destacado */}
      <View style={[styles.moduleBadge, { backgroundColor: BRAND.purple }]}> 
        {icon}
      </View>

      {/* Imagem grande à direita */}
      <Image
        source={{ uri: imageUri }}
        resizeMode="cover"
        style={styles.moduleHeroImage}
        accessible
        accessibilityLabel={`Imagem ilustrativa de ${label}`}
      />

      {/* Faixa informativa branca */}
      <View style={styles.moduleInfoBar}>
        <Text
          style={{
            color: BRAND.purple,
            fontFamily: titleType.fontFamily,
            fontWeight: '800',
            fontSize: 20,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: '#6B7280',
            fontFamily: subtitleType.fontFamily,
            fontSize: 15,
            marginTop: 2,
          }}
        >
          {description}
        </Text>
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
        <Image source={logoRoxo} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Logo Mais60" />
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
    <View style={styles.welcomeWrap}>
      <Text
        style={{
          color: ui.textPrimary,
          fontFamily: dsFontFamily['jakarta-light'],
          fontSize: greetType.fontSize.default - 1,
          lineHeight: greetType.lineHeight.default - 1,
        }}
      >
        Bem-vindo
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text
          style={{
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-light'],
            fontSize: greetType.fontSize.default - 1,
            lineHeight: greetType.lineHeight.default - 1,
          }}
        >
          de volta,
        </Text>
        <Text
          style={{
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-bold'],
            fontSize: greetType.fontSize.default - 1,
            lineHeight: greetType.lineHeight.default - 1,
          }}
        >
          {' '}{userName}
        </Text>
        <Text
          style={{
            fontSize: greetType.fontSize.default - 1,
            lineHeight: greetType.lineHeight.default - 1,
          }}
        >
          {' '}👋
        </Text>
      </View>
    </View>
  );

  const SearchBar = () => (
    <View style={[styles.searchBar, { borderColor: ui.divider, backgroundColor: isDark ? '#0F1216' : '#FFFFFF' }]}> 
      <SearchIcon size={18} color={ui.textSecondary} />
      <TextInput
        placeholder="Buscar atividades, receitas, dicas..."
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        style={{ flex: 1, color: ui.textPrimary, fontFamily: subtitleType.fontFamily, fontSize: 14 }}
        accessibilityLabel="Campo de busca"
        returnKeyType="search"
        onSubmitEditing={handleSoon}
      />
    </View>
  );

  // Removido: Chips de categorias/abas ('Para você', 'Populares', 'Novidades', ...)

  // Removido o HeroCard a pedido (sem destaque de boas-vindas)

  return (
    <PageContainer style={{ backgroundColor: '#FFFFFF', paddingTop: 0, paddingBottom: 32 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollbar"
      >
      <TopRow />
      <WelcomeText />
      <SearchBar />

      <Text style={[styles.sectionTitle, { color: ui.textSecondary, fontFamily: sectionType.fontFamily }]}>Seu resumo</Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <View style={styles.statsRow}>
          <Stat value="18 min" label="Tempo hoje" />
          <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
          <Stat value="12" label="Atividades/semana" />
          <View style={[styles.statDivider, { backgroundColor: ui.divider }]} />
          <Stat value="7" label="Favoritos" />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: ui.textSecondary, fontFamily: sectionType.fontFamily }]}>Módulos</Text>
      <View style={styles.modulesList}>
        <ModuleCard
          icon={<Dumbbell size={28} color="#FFFFFF" />}
          label="Movimente‑se"
          description="Aulas de exercícios e movimentos"
          color={BRAND.green}
          imageUri="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=1200&auto=format&fit=crop"
          onPress={handleSoon}
        />
        <ModuleCard
          icon={<Utensils size={28} color="#FFFFFF" />}
          label="Alimente‑se"
          description="Receitas e hábitos saudáveis"
          color={BRAND.orange}
          imageUri="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop"
          onPress={handleSoon}
        />
        <ModuleCard
          icon={<Shield size={28} color="#FFFFFF" />}
          label="Segurança em casa"
          description="Dicas e checklists de prevenção"
          color={BRAND.blue}
          imageUri="https://images.unsplash.com/photo-1623119623412-8cf0ec3de6dc?q=80&w=1200&auto=format&fit=crop"
          onPress={handleSoon}
        />
        <ModuleCard
          icon={<Brain size={28} color="#FFFFFF" />}
          label="Mente ativa"
          description="Jogos e estímulos cognitivos"
          color={BRAND.purple}
          imageUri="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop"
          onPress={handleSoon}
        />
        <ModuleCard
          icon={<Heart size={28} color="#FFFFFF" />}
          label="Bem‑estar"
          description="Respiração, relaxamento e humor"
          color={BRAND.coral}
          imageUri="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
          onPress={handleSoon}
        />
        {/* Favoritos removido conforme solicitação */}
      </View>

      <Text style={[styles.sectionTitle, { color: ui.textSecondary, fontFamily: sectionType.fontFamily }]}>Acesso rápido</Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Dumbbell size={18} color={ui.textPrimary} />}
          label="Alongamento matinal"
          right={<ChevronRight size={18} color={ui.textSecondary} />}
          onPress={handleSoon}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Utensils size={18} color={ui.textPrimary} />}
          label="Receita: Sopa nutritiva"
          right={<ChevronRight size={18} color={ui.textSecondary} />}
          onPress={handleSoon}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Brain size={18} color={ui.textPrimary} />}
          label="Jogo de memória"
          right={<ChevronRight size={18} color={ui.textSecondary} />}
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
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
    paddingBottom: 50,
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
    height: 220,
    borderRadius: 18,
  },
  moduleInfoBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});