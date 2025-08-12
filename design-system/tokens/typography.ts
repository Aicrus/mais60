/**
 * SISTEMA DE TIPOGRAFIA RESPONSIVA E CENTRALIZADA
 * ===============================================
 * 
 * 🎯 COMO TROCAR DE FONTE:
 * 1. Para fontes do Expo: npm install @expo-google-fonts/nova-fonte
 * 2. Mude apenas FONT_CONFIG.primary abaixo
 * 3. Pronto! Todo o app usa a nova fonte automaticamente
 * 
 * 📝 FONTES SUPORTADAS:
 * - 50+ fontes do Expo (Poppins, Inter, Roboto, etc.)
 * - Fontes customizadas (arquivos .ttf/.otf)
 * 
 * 🔧 Define todas as configurações tipográficas do sistema de design.
 * Inclui famílias de fonte, tamanhos responsivos, pesos e alturas de linha.
 * A responsividade é centralizada aqui para evitar duplicação nos componentes.
 */

import { isMobileWidth, isTabletWidth, isDesktopWidth } from './breakpoints';

// Escala tipográfica global (dinâmica em tempo de execução)
// Use os helpers `setTypographyScale` e `getTypographyScale` para controlar
let TYPOGRAPHY_SCALE_RUNTIME = 1.0;

export function setTypographyScale(scale: number) {
  // Guarda um mínimo e máximo de segurança
  const clamped = Math.max(0.8, Math.min(scale, 1.6));
  TYPOGRAPHY_SCALE_RUNTIME = clamped;
}

export function getTypographyScale() {
  return TYPOGRAPHY_SCALE_RUNTIME;
}

// ============================================================================
// 🎯 CONFIGURAÇÃO CENTRAL - MUDE SÓ AQUI PARA TROCAR A FONTE DO APP INTEIRO!
// ============================================================================

/**
 * 🎨 CONFIGURAÇÃO PRINCIPAL DA FONTE
 * 
 * SIMPLICIDADE: Só duas fontes no projeto
 * - PRIMARY: Poppins (para todo o app)
 * - SECONDARY: Space Mono (para código/monospace)
 * 
 * 🔄 PARA TROCAR A FONTE PRINCIPAL:
 * Mude apenas 'primary' abaixo para: 'inter', 'roboto', 'openSans', ou 'custom'
 */
const FONT_CONFIG = {
  primary: 'poppins' as const,   // ← FONTE PRINCIPAL (Poppins)
  secondary: 'spaceMono' as const, // ← FONTE SECUNDÁRIA (monospace)
} as const;

// ============================================================================
// 📚 SISTEMAS DE FONTES DISPONÍVEIS
// ============================================================================

/**
 * 🗂️ FONTES DISPONÍVEIS (SIMPLIFICADO)
 * 
 * ✨ FOCO: Só as opções essenciais
 * 
 * 🎯 PRINCIPAL: Poppins (padrão)
 * 🔄 ALTERNATIVAS: Inter, Roboto, Open Sans
 * 📁 CUSTOMIZADA: Sua própria fonte
 */
const FONT_SYSTEMS = {
  // 🎯 POPPINS (FONTE PRINCIPAL - PADRÃO)
  poppins: {
    package: '@expo-google-fonts/poppins',
    imports: ['Poppins_100Thin', 'Poppins_300Light', 'Poppins_400Regular', 'Poppins_500Medium', 'Poppins_600SemiBold', 'Poppins_700Bold', 'Poppins_800ExtraBold'],
    thin: 'Poppins_100Thin',
    light: 'Poppins_300Light', 
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extrabold: 'Poppins_800ExtraBold',
  },
  
  // 🔄 ALTERNATIVAS (caso queira trocar)
  inter: {
    package: '@expo-google-fonts/inter',
    imports: ['Inter_100Thin', 'Inter_300Light', 'Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold', 'Inter_800ExtraBold'],
    thin: 'Inter_100Thin',
    light: 'Inter_300Light',
    regular: 'Inter_400Regular', 
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
  },
  
  roboto: {
    package: '@expo-google-fonts/roboto',
    imports: ['Roboto_100Thin', 'Roboto_300Light', 'Roboto_400Regular', 'Roboto_500Medium', 'Roboto_700Bold', 'Roboto_900Black'],
    thin: 'Roboto_100Thin',
    light: 'Roboto_300Light',
    regular: 'Roboto_400Regular',
    medium: 'Roboto_500Medium',
    semibold: 'Roboto_700Bold', // Roboto não tem 600
    bold: 'Roboto_700Bold',
    extrabold: 'Roboto_900Black',
  },
  
  openSans: {
    package: '@expo-google-fonts/open-sans',
    imports: ['OpenSans_300Light', 'OpenSans_400Regular', 'OpenSans_500Medium', 'OpenSans_600SemiBold', 'OpenSans_700Bold', 'OpenSans_800ExtraBold'],
    thin: 'OpenSans_300Light',
    light: 'OpenSans_300Light',
    regular: 'OpenSans_400Regular',
    medium: 'OpenSans_500Medium',
    semibold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
    extrabold: 'OpenSans_800ExtraBold',
  },
  
  // 📁 SUA FONTE CUSTOMIZADA
  custom: {
    package: 'local',
    imports: [], // Configurado via app.json
    thin: 'MinhaFonte-Thin',
    light: 'MinhaFonte-Light',
    regular: 'MinhaFonte-Regular',
    medium: 'MinhaFonte-Medium', 
    semibold: 'MinhaFonte-SemiBold',
    bold: 'MinhaFonte-Bold',
    extrabold: 'MinhaFonte-ExtraBold',
  },
  
  // 🔤 SPACE MONO (SECUNDÁRIA - MONOSPACE)
  spaceMono: {
    package: '@expo-google-fonts/space-mono',
    imports: ['SpaceMono_400Regular'],
    regular: 'SpaceMono_400Regular',
  },
} as const;

// ============================================================================
// 🏭 GERAÇÃO AUTOMÁTICA DAS FAMÍLIAS DE FONTE
// ============================================================================

/**
 * 🔄 GERA AUTOMATICAMENTE baseado na configuração central
 * 
 * ⚠️ NÃO ALTERE AQUI! Use FONT_CONFIG acima.
 * 
 * Esta seção gera automaticamente as famílias de fonte baseado na configuração.
 * Os nomes mantêm compatibilidade com o código existente.
 */
const currentPrimaryFont = FONT_SYSTEMS[FONT_CONFIG.primary];
const currentSecondaryFont = FONT_SYSTEMS[FONT_CONFIG.secondary];

// Famílias de fonte disponíveis (geradas automaticamente)
export const fontFamily = {
  // 🎨 Família Principal (gerada automaticamente baseada em FONT_CONFIG.primary)
  // Mantém nomes "jakarta-*" para compatibilidade, mas usa a fonte configurada
  'jakarta-thin': currentPrimaryFont.thin,
  'jakarta-light': currentPrimaryFont.light,
  'jakarta-regular': currentPrimaryFont.regular,
  'jakarta-medium': currentPrimaryFont.medium,
  'jakarta-semibold': currentPrimaryFont.semibold,
  'jakarta-bold': currentPrimaryFont.bold,
  'jakarta-extrabold': currentPrimaryFont.extrabold,
  
  // 🔤 Família Secundária (monospace)
  'mono-regular': `${currentSecondaryFont.regular}, monospace`,
} as const;

// ============================================================================
// 📖 DOCUMENTAÇÃO E HELPERS
// ============================================================================

/**
 * 📋 INFORMAÇÕES DA FONTE ATUAL
 * Útil para debug e documentação
 */
export const CURRENT_FONT_INFO = {
  primary: {
    name: FONT_CONFIG.primary,
    package: currentPrimaryFont.package,
    isCustom: (currentPrimaryFont.package as string) === 'local',
  },
  secondary: {
    name: FONT_CONFIG.secondary,
    package: currentSecondaryFont.package,
  },
} as const;

/**
 * 🔧 HELPER: Lista as fontes principais disponíveis
 */
export function getAvailableFonts() {
  return ['poppins', 'inter', 'roboto', 'openSans', 'custom'];
}

/**
 * 🎯 INSTRUÇÕES SIMPLES PARA TROCAR DE FONTE
 */
export function getChangeInstructions() {
  return `
🎨 COMO TROCAR A FONTE DO APP:

1️⃣ TROCAR PARA INTER:
   • npm install @expo-google-fonts/inter
   • Mude: FONT_CONFIG.primary = 'inter'
   • Pronto! Todo o app usa Inter

2️⃣ TROCAR PARA ROBOTO:
   • npm install @expo-google-fonts/roboto
   • Mude: FONT_CONFIG.primary = 'roboto'
   • Pronto! Todo o app usa Roboto

3️⃣ USAR FONTE CUSTOMIZADA:
   • Coloque arquivos .ttf/.otf em: assets/fonts/
   • Configure no app.json seção "fonts"
   • Mude: FONT_CONFIG.primary = 'custom'
   • Atualize nomes em FONT_SYSTEMS.custom

✨ RESULTADO: TODO O APP muda automaticamente!
`;
}

// ============================================================================
// 🎯 SISTEMA SIMPLIFICADO DE TROCA DE FONTES
// ============================================================================

/**
 * 🔧 INSTRUÇÕES PARA INSTALAR NOVA FONTE
 */
export function getInstallCommand(fontName: 'inter' | 'roboto' | 'openSans' | 'custom') {
  if (fontName === 'custom') {
    return `
📁 FONTE CUSTOMIZADA:
1. Coloque arquivos .ttf/.otf em: assets/fonts/
2. Configure no app.json seção "fonts"
3. Atualize nomes em FONT_SYSTEMS.custom
4. Mude: FONT_CONFIG.primary = 'custom'
`;
  }
  
  const packages = {
    inter: '@expo-google-fonts/inter',
    roboto: '@expo-google-fonts/roboto', 
    openSans: '@expo-google-fonts/open-sans'
  };
  
  return `npm install ${packages[fontName]}`;
}

/**
 * 🎯 MOSTRA CONFIGURAÇÃO ATUAL
 */
export function getCurrentConfig() {
  return {
    primary: FONT_CONFIG.primary,
    secondary: FONT_CONFIG.secondary,
    primaryPackage: currentPrimaryFont.package,
    secondaryPackage: currentSecondaryFont.package,
    isUsingCustom: (currentPrimaryFont.package as string) === 'local',
  };
}

// ============================================================================
// 🎯 EXPORTAÇÕES PARA COMPATIBILIDADE (NÃO ALTERAR)
// ============================================================================

// Interface para valores responsivos
interface ResponsiveValue {
  desktop: number;   // Desktop: Web + Nativo (macOS, Windows)
  tablet: number;    // Tablet: Web + Nativo (iOS, Android)
  mobile: number;    // Mobile: Web + Nativo (iOS, Android)
  default: number;   // React Native (valor fallback)
}

// Interface para configuração tipográfica responsiva
interface ResponsiveTypographyConfig {
  size: ResponsiveValue;
  lineHeight: ResponsiveValue;
  fontWeight: string;
  fontFamily?: keyof typeof fontFamily;
}

// Configurações de tamanho de fonte e altura de linha RESPONSIVAS
export const responsiveFontSize = {
  // Display - Textos de grande destaque
  'display-xl': {
    size: { mobile: 42, tablet: 48, desktop: 56, default: 45 },
    lineHeight: { mobile: 48, tablet: 56, desktop: 64, default: 52 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'display-lg': {
    size: { mobile: 36, tablet: 42, desktop: 48, default: 38 },
    lineHeight: { mobile: 42, tablet: 48, desktop: 56, default: 44 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'display-md': {
    size: { mobile: 30, tablet: 36, desktop: 40, default: 32 },
    lineHeight: { mobile: 36, tablet: 42, desktop: 48, default: 38 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'display-sm': {
    size: { mobile: 26, tablet: 30, desktop: 36, default: 28 },
    lineHeight: { mobile: 32, tablet: 36, desktop: 44, default: 34 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  
  // Headline - Títulos principais
  'headline-xl': {
    size: { mobile: 28, tablet: 32, desktop: 36, default: 30 },
    lineHeight: { mobile: 34, tablet: 38, desktop: 44, default: 36 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'headline-lg': {
    size: { mobile: 26, tablet: 28, desktop: 32, default: 28 },
    lineHeight: { mobile: 32, tablet: 34, desktop: 40, default: 34 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'headline-md': {
    size: { mobile: 24, tablet: 24, desktop: 28, default: 26 },
    lineHeight: { mobile: 30, tablet: 30, desktop: 36, default: 32 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'headline-sm': {
    size: { mobile: 20, tablet: 22, desktop: 24, default: 22 },
    lineHeight: { mobile: 26, tablet: 28, desktop: 32, default: 28 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  
  // Title - Títulos de seções
  'title-lg': {
    size: { mobile: 20, tablet: 20, desktop: 22, default: 22 },
    lineHeight: { mobile: 26, tablet: 26, desktop: 28, default: 28 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'title-md': {
    size: { mobile: 20, tablet: 20, desktop: 22, default: 22 },
    lineHeight: { mobile: 28, tablet: 28, desktop: 30, default: 28 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  'title-sm': {
    size: { mobile: 18, tablet: 18, desktop: 20, default: 20 },
    lineHeight: { mobile: 26, tablet: 26, desktop: 28, default: 26 },
    fontWeight: '700',
    fontFamily: 'jakarta-bold' as const
  },
  
  // Subtitle - Subtítulos
  'subtitle-lg': {
    size: { mobile: 18, tablet: 18, desktop: 18, default: 18 },
    lineHeight: { mobile: 24, tablet: 24, desktop: 24, default: 24 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  'subtitle-md': {
    size: { mobile: 18, tablet: 18, desktop: 18, default: 18 },
    lineHeight: { mobile: 24, tablet: 24, desktop: 24, default: 24 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  'subtitle-sm': {
    size: { mobile: 16, tablet: 16, desktop: 16, default: 16 },
    lineHeight: { mobile: 22, tablet: 22, desktop: 22, default: 22 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  
  // Label - Rótulos
  'label-lg': {
    size: { mobile: 16, tablet: 16, desktop: 16, default: 16 },
    lineHeight: { mobile: 22, tablet: 22, desktop: 24, default: 24 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  'label-md': {
    size: { mobile: 16, tablet: 16, desktop: 16, default: 16 },
    lineHeight: { mobile: 22, tablet: 22, desktop: 22, default: 22 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  'label-sm': {
    size: { mobile: 14, tablet: 14, desktop: 14, default: 14 },
    lineHeight: { mobile: 20, tablet: 20, desktop: 20, default: 20 },
    fontWeight: '600',
    fontFamily: 'jakarta-semibold' as const
  },
  
  // Body - Texto de corpo
  'body-lg': {
    size: { mobile: 19, tablet: 18, desktop: 18, default: 19 },
    lineHeight: { mobile: 28, tablet: 26, desktop: 26, default: 28 },
    fontWeight: '400',
    fontFamily: 'jakarta-regular' as const
  },
  'body-md': {
    size: { mobile: 17, tablet: 16, desktop: 16, default: 17 },
    lineHeight: { mobile: 24, tablet: 22, desktop: 22, default: 24 },
    fontWeight: '400',
    fontFamily: 'jakarta-regular' as const
  },
  'body-sm': {
    size: { mobile: 13, tablet: 12, desktop: 12, default: 13 },
    lineHeight: { mobile: 20, tablet: 18, desktop: 18, default: 20 },
    fontWeight: '400',
    fontFamily: 'jakarta-regular' as const
  },
  'body-xs': {
    size: { mobile: 12, tablet: 11, desktop: 10, default: 12 },
    lineHeight: { mobile: 16, tablet: 15, desktop: 14, default: 16 },
    fontWeight: '400',
    fontFamily: 'jakarta-regular' as const
  },
  
  // Mono - Texto monoespaçado
  'mono-lg': {
    size: { mobile: 17, tablet: 16, desktop: 16, default: 17 },
    lineHeight: { mobile: 26, tablet: 24, desktop: 24, default: 26 },
    fontWeight: '400',
    fontFamily: 'mono-regular' as const
  },
  'mono-md': {
    size: { mobile: 15, tablet: 14, desktop: 14, default: 15 },
    lineHeight: { mobile: 22, tablet: 20, desktop: 20, default: 22 },
    fontWeight: '400',
    fontFamily: 'mono-regular' as const
  },
  'mono-sm': {
    size: { mobile: 13, tablet: 12, desktop: 12, default: 13 },
    lineHeight: { mobile: 20, tablet: 18, desktop: 18, default: 20 },
    fontWeight: '400',
    fontFamily: 'mono-regular' as const
  },
} as const;

// Mantém o sistema antigo para compatibilidade (valores fixos desktop)
export const fontSize = {
  // Display - Textos de grande destaque
  'display-xl': { size: '56px', lineHeight: '64px', fontWeight: '700' },
  'display-lg': { size: '48px', lineHeight: '56px', fontWeight: '700' },
  'display-md': { size: '40px', lineHeight: '48px', fontWeight: '700' },
  'display-sm': { size: '36px', lineHeight: '44px', fontWeight: '700' },
  
  // Headline - Títulos principais
  'headline-xl': { size: '36px', lineHeight: '44px', fontWeight: '700' },
  'headline-lg': { size: '32px', lineHeight: '40px', fontWeight: '700' },
  'headline-md': { size: '28px', lineHeight: '36px', fontWeight: '700' },
  'headline-sm': { size: '24px', lineHeight: '32px', fontWeight: '700' },
  
  // Title - Títulos de seções
  'title-lg': { size: '22px', lineHeight: '28px', fontWeight: '700' },
  'title-md': { size: '20px', lineHeight: '26px', fontWeight: '700' },
  'title-sm': { size: '18px', lineHeight: '24px', fontWeight: '700' },
  
  // Subtitle - Subtítulos
  'subtitle-lg': { size: '18px', lineHeight: '24px', fontWeight: '600' },
  'subtitle-md': { size: '16px', lineHeight: '22px', fontWeight: '600' },
  'subtitle-sm': { size: '14px', lineHeight: '20px', fontWeight: '600' },
  
  // Label - Rótulos
  'label-lg': { size: '16px', lineHeight: '24px', fontWeight: '600' },
  'label-md': { size: '14px', lineHeight: '20px', fontWeight: '600' },
  'label-sm': { size: '13px', lineHeight: '17px', fontWeight: '600' },
  
  // Body - Texto de corpo
  'body-lg': { size: '16px', lineHeight: '24px', fontWeight: '400' },
  'body-md': { size: '14px', lineHeight: '20px', fontWeight: '400' },
  'body-sm': { size: '12px', lineHeight: '18px', fontWeight: '400' },
  'body-xs': { size: '10px', lineHeight: '14px', fontWeight: '400' },
  
  // Mono - Texto monoespaçado
  'mono-lg': { size: '16px', lineHeight: '24px', fontWeight: '400', fontFamily: 'monospace' },
  'mono-md': { size: '14px', lineHeight: '20px', fontWeight: '400', fontFamily: 'monospace' },
  'mono-sm': { size: '12px', lineHeight: '18px', fontWeight: '400', fontFamily: 'monospace' },
} as const;

// Tipos para facilitar o uso
export type FontFamilyType = keyof typeof fontFamily;
export type FontSizeType = keyof typeof fontSize;
export type ResponsiveFontSizeType = keyof typeof responsiveFontSize;

// ================================
// FUNÇÕES UTILITÁRIAS RESPONSIVAS
// ================================

/**
 * Obtém o estilo tipográfico responsivo baseado na largura da tela
 * @param size - Tamanho tipográfico (ex: 'body-md', 'title-lg')
 * @param width - Largura atual da tela (obtida do useResponsive)
 * @returns Objeto com fontSize, lineHeight, fontWeight e fontFamily
 */
export function getResponsiveTypography(
  size: ResponsiveFontSizeType, 
  width: number
) {
  const config = responsiveFontSize[size];
  
  // Determina o breakpoint atual
  let fontSize: number;
  let lineHeight: number;
  
  if (isMobileWidth(width)) {
    fontSize = config.size.mobile;
    lineHeight = config.lineHeight.mobile;
  } else if (isTabletWidth(width)) {
    fontSize = config.size.tablet;
    lineHeight = config.lineHeight.tablet;
  } else if (isDesktopWidth(width)) {
    fontSize = config.size.desktop;
    lineHeight = config.lineHeight.desktop;
  } else {
    // Fallback para React Native
    fontSize = config.size.default;
    lineHeight = config.lineHeight.default;
  }
  // Aplica escala global dinâmica
  const scale = getTypographyScale();
  fontSize = fontSize * scale;
  lineHeight = lineHeight * scale;

  return {
    fontSize,
    lineHeight,
    fontWeight: config.fontWeight,
    fontFamily: config.fontFamily ? fontFamily[config.fontFamily] : fontFamily['jakarta-regular'],
  };
}

/**
 * Hook-like function que retorna uma função responsiva para ser usada com useResponsive
 * @param size - Tamanho tipográfico
 * @returns Função que aceita um objeto responsive e retorna o estilo atual
 */
export function createResponsiveTypography(size: ResponsiveFontSizeType) {
  return function(responsiveFunction: (options: {
    mobile?: any;
    tablet?: any; 
    desktop?: any;
    default: any;
  }) => any) {
    const config = responsiveFontSize[size];
    
    const scale = getTypographyScale();
    const fontSize = responsiveFunction({
      mobile: config.size.mobile * scale,
      tablet: config.size.tablet * scale,
      desktop: config.size.desktop * scale,
      default: config.size.default * scale,
    });
    
    const lineHeight = responsiveFunction({
      mobile: config.lineHeight.mobile * scale,
      tablet: config.lineHeight.tablet * scale,
      desktop: config.lineHeight.desktop * scale,
      default: config.lineHeight.default * scale,
    });
    
    return {
      fontSize,
      lineHeight,
      fontWeight: config.fontWeight,
      fontFamily: config.fontFamily ? fontFamily[config.fontFamily] : fontFamily['jakarta-regular'],
    };
  };
}

/**
 * Versão simplificada que retorna diretamente os valores responsivos
 * para usar com a função responsive() do useResponsive
 * @param size - Tamanho tipográfico
 * @returns Objeto com valores responsivos para fontSize e lineHeight
 */
export function getResponsiveValues(size: ResponsiveFontSizeType) {
  const config = responsiveFontSize[size];
  const scale = getTypographyScale();
  
  return {
    fontSize: {
      mobile: config.size.mobile * scale,
      tablet: config.size.tablet * scale,
      desktop: config.size.desktop * scale,
      default: config.size.default * scale,
    },
    lineHeight: {
      mobile: config.lineHeight.mobile * scale,
      tablet: config.lineHeight.tablet * scale,
      desktop: config.lineHeight.desktop * scale,
      default: config.lineHeight.default * scale,
    },
    fontWeight: config.fontWeight,
    fontFamily: config.fontFamily ? fontFamily[config.fontFamily] : fontFamily['jakarta-regular'],
  };
}

// Funções utilitárias legacy (mantidas para compatibilidade)
export function getFontStyle(size: FontSizeType) {
  return fontSize[size];
} 