import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, Dimensions } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';
import { spacing } from '../../design-system/tokens/spacing';

/**
 * PageContainer - Componente responsável por gerenciar os espaçamentos e layout padrão da aplicação
 * 
 * Este componente aplica automaticamente os espaçamentos e paddings conforme nosso Design System,
 * se adaptando responsivamente para desktop, tablet e mobile, além de se ajustar quando há
 * presença de sidebar e/ou header.
 * 
 * @example
 * // Modo Padrão
 * <PageContainer>
 *   {conteúdo da página}
 * </PageContainer>
 * 
 * // Com Header e Sidebar
 * <PageContainer
 *   withHeader
 *   withSidebar
 *   sidebarWidth={250}
 * >
 *   {conteúdo da página}
 * </PageContainer>
 * 
 * // Com Header e Estilo Customizado
 * <PageContainer
 *   withHeader
 *   style={{ backgroundColor: '#f5f5f5' }}
 * >
 *   {conteúdo da página}
 * </PageContainer>
 * 
 * CARACTERÍSTICAS:
 * - Responsivo: adapta-se automaticamente para desktop, tablet e mobile
 * - Suporte a Sidebar: ajusta o layout quando há uma sidebar presente
 * - Suporte a Header: adiciona margem superior apropriada
 * - Espaçamento Consistente: segue o Design System
 * - Layout Flexível: permite customização através de props
 * 
 * ESPAÇAMENTOS PADRÃO:
 * Desktop:
 * - Horizontal: 32px (xl)
 * - Vertical: 32px (xl)
 * 
 * Tablet:
 * - Horizontal: 24px (lg)
 * - Vertical: 24px (lg)
 * 
 * Mobile:
 * - Horizontal: 16px (md)
 * - Vertical: 16px (md)
 */

/**
 * Constantes de espaçamento padronizadas conforme nosso Design System
 * Estes valores estão em sincronia com o tailwind.config.js
 */
export const SPACING = {
  xxxs: 2,  // 0.5 no tailwind (2px)
  xxs: 4,   // 1 no tailwind (4px)
  xs: 8,    // 2 no tailwind (8px)
  sm: 12,   // 3 no tailwind (12px)
  md: 16,   // 4 no tailwind (16px)
  lg: 24,   // 6 no tailwind (24px)
  xl: 32,   // 8 no tailwind (32px)
  '2xl': 48,  // 12 no tailwind (48px)
  '3xl': 64,  // 16 no tailwind (64px)
  '4xl': 80,  // 20 no tailwind (80px)
  '5xl': 96,  // 24 no tailwind (96px)
  '6xl': 128, // 32 no tailwind (128px)
};

interface PageContainerProps {
  /**
   * Conteúdo do container
   */
  children: React.ReactNode;

  /**
   * Estilos adicionais para o container
   */
  style?: ViewStyle;

  /**
   * Se deve considerar espaço para sidebar
   * @default false
   */
  withSidebar?: boolean;

  /**
   * Se deve considerar espaço para header
   * @default false
   */
  withHeader?: boolean;

  /**
   * Largura da sidebar em pixels
   * Necessário quando withSidebar é true
   * @default 0
   */
  sidebarWidth?: number;

  /**
   * Altura do header em pixels
   * @default 64 (mobile/tablet), 75 (desktop)
   */
  headerHeight?: number;

  /**
   * Quando true, adiciona padding inferior extra equivalente à altura da Tab Bar
   * para evitar que o conteúdo fique oculto sob a Navibar
   */
  withTabBarPadding?: boolean;
}

/**
 * PageContainer - Componente responsável por gerenciar os espaçamentos e layout padrão da aplicação
 * 
 * Este componente aplica automaticamente os espaçamentos e paddings conforme nosso Design System,
 * se adaptando responsivamente para desktop, tablet e mobile, além de se ajustar quando há
 * presença de sidebar e/ou header.
 * 
 * PADRÕES DE ESPAÇAMENTO APLICADOS:
 * 
 * 1. ESPAÇAMENTO LATERAL (paddingHorizontal):
 *    - Desktop: SPACING.xl (32px) - equivalente a p-8 no Tailwind
 *    - Tablet: SPACING.lg (24px) - equivalente a p-6 no Tailwind
 *    - Mobile: SPACING.md (16px) - equivalente a p-4 no Tailwind
 * 
 * 2. ESPAÇAMENTO VERTICAL (paddingVertical):
 *    - Desktop: SPACING.xl (32px) - equivalente a p-8 no Tailwind
 *    - Tablet: SPACING.lg (24px) - equivalente a p-6 no Tailwind
 *    - Mobile: SPACING.md (16px) - equivalente a p-4 no Tailwind
 * 
 * 3. AJUSTE PARA SIDEBAR:
 *    - Em tablet e desktop, o componente ajusta automaticamente a largura e posição
 *      considerando o espaço ocupado pela sidebar
 * 
 * 4. AJUSTE PARA HEADER:
 *    - Adiciona margin superior apropriada quando há um header presente
 * 
 * @example
 * // Página com sidebar e header
 * <PageContainer withSidebar sidebarWidth={250} withHeader>
 *   {conteúdo da página}
 * </PageContainer>
 * 
 * // Página apenas com header
 * <PageContainer withHeader>
 *   {conteúdo da página}
 * </PageContainer>
 * 
 * // Página sem sidebar nem header
 * <PageContainer>
 *   {conteúdo da página}
 * </PageContainer>
 */
export function PageContainer({ 
  children, 
  style, 
  withSidebar = false,
  withHeader = false,
  sidebarWidth = 0,
  headerHeight = 64,
  withTabBarPadding = false,
}: PageContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Altura responsiva do header - maior para desktop
  const responsiveHeaderHeight = isDesktop ? 75 : headerHeight;
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  // Ajustes de layout baseados no dispositivo e configuração
  const effectiveSidebarWidth = (!isMobile && withSidebar) ? sidebarWidth : 0;
  const effectiveHeaderHeight = withHeader ? (isMobile ? 0 : responsiveHeaderHeight) : 0;
  const maxContentWidth = isDesktop ? 1200 : isTablet ? 800 : '100%';

  // Altura aproximada da Tab Bar por plataforma (sincronizado com app/(tabs)/_layout.tsx)
  const tabBarHeight = Platform.select<number>({
    ios: 88,
    android: 60,
    web: 70,
    default: 60,
  }) as number;

  // Estilos do container principal seguindo o Design System
  const containerStyle: ViewStyle = {
    marginTop: effectiveHeaderHeight,
    padding: isMobile ? SPACING.md : isTablet ? SPACING.lg : SPACING.xl,
    backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
  };

  // Garantir que o conteúdo não fique escondido atrás da Tab Bar
  const basePadding = isMobile ? SPACING.md : isTablet ? SPACING.lg : SPACING.xl;
  (containerStyle as any).paddingBottom = basePadding + (withTabBarPadding ? tabBarHeight : 0);

  // Ajustes para sidebar em tablets e desktops
  if (!isMobile && withSidebar) {
    containerStyle.marginLeft = effectiveSidebarWidth;
    
    if (Platform.OS === 'web') {
      (containerStyle as any).width = `calc(100% - ${effectiveSidebarWidth}px)`;
    } else {
      containerStyle.width = Dimensions.get('window').width - effectiveSidebarWidth;
    }
  }

  // Estilos do container interno - removendo a limitação de largura
  const contentContainerStyle: ViewStyle = {
    maxWidth: '100%', // Removendo limitação de largura máxima
    width: '100%', // Garantindo que ocupe toda a largura disponível
    ...(isMobile && { paddingTop: 0 }), // Apenas ajustando para mobile
  };

  return (
    <View 
      style={[styles.container, containerStyle, style]}
      accessibilityRole="none"
      accessibilityLabel="Container principal da página"
    >
      <View 
        style={[styles.contentContainer, contentContainerStyle]}
        accessibilityRole="none"
        accessibilityLabel="Área de conteúdo"
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  }
}); 