/**
 * SISTEMA DE DESIGN - TOKENS
 * ------------------------------
 * Exporta todos os tokens do sistema de design de forma unificada.
 * Isso permite importar tudo de um único lugar: import { colors, spacing, etc } from '@/design-system'
 */

// Importa todos os tokens
import { colors } from './tokens/colors';
import { 
  fontFamily, 
  fontSize, 
  responsiveFontSize,
  getResponsiveTypography,
  createResponsiveTypography,
  getResponsiveValues
} from './tokens/typography';
import { spacing } from './tokens/spacing';
import { borderRadius } from './tokens/borders';
import { boxShadow, shadows, opacity, zIndex, transitionDuration } from './tokens/effects';
import { breakpoints, responsiveSpacing } from './tokens/breakpoints';

// Exporta todos os tokens
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';
export * from './tokens/borders';
export * from './tokens/effects';
export * from './tokens/breakpoints';

// Tema completo unificado
export const designSystem = {
  colors,
  fontFamily,
  fontSize,
  responsiveFontSize,
  spacing,
  borderRadius,
  boxShadow,
  shadows, // Novo sistema de sombras inteligentes
  opacity,
  zIndex,
  transitionDuration,
  breakpoints,
  responsiveSpacing,
  // Funções utilitárias responsivas
  getResponsiveTypography,
  createResponsiveTypography,
  getResponsiveValues,
} as const;

// Tipo para o esquema de cores
export type ColorScheme = 'light' | 'dark';

/**
 * Função utilitária para obter valores corretos do tema com base no colorScheme
 */
export function getThemedValue<T>(
  colorScheme: ColorScheme, 
  lightValue: T, 
  darkValue: T
): T {
  return colorScheme === 'dark' ? darkValue : lightValue;
}

// Tipos globais do sistema de design
export type ThemeMode = 'light' | 'dark';

// Configuração padrão do tema
export const defaultTheme = {
  mode: 'light' as ThemeMode,
} as const;

// Funções utilitárias globais
export function getThemeValue<T>(lightValue: T, darkValue: T, mode: ThemeMode): T {
  return mode === 'light' ? lightValue : darkValue;
}

// Exporta o tema completo
export const theme = {
  colors,
  fontFamily,
  fontSize,
  responsiveFontSize,
  spacing,
  borderRadius,
  boxShadow,
  shadows, // Novo sistema de sombras inteligentes
  opacity,
  zIndex,
  transitionDuration,
  // Funções utilitárias responsivas
  getResponsiveTypography,
  createResponsiveTypography,
  getResponsiveValues,
} as const;

// Tipo para o tema completo
export type Theme = typeof theme; 