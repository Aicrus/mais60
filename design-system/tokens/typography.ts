/**
 * SISTEMA DE TIPOGRAFIA
 * ------------------------------
 * Define todas as configurações tipográficas do sistema de design.
 * Inclui famílias de fonte, tamanhos, pesos e alturas de linha.
 */

// Famílias de fonte disponíveis
export const fontFamily = {
  // Família Poppins (Principal para Mais 60 Saúde)
  'poppins-light': 'Poppins_300Light',
  'poppins-regular': 'Poppins_400Regular',
  'poppins-medium': 'Poppins_500Medium',
  'poppins-semibold': 'Poppins_600SemiBold',
  'poppins-bold': 'Poppins_700Bold',
  // Família Monospace
  'mono-regular': 'SpaceMono-Regular, monospace',
  // Mantém Jakarta Sans para compatibilidade (se necessário)
  // Redireciona as chaves "jakarta-*" para Poppins para unificação visual
  'jakarta-thin': 'Poppins_300Light',
  'jakarta-light': 'Poppins_300Light',
  'jakarta-regular': 'Poppins_400Regular',
  'jakarta-medium': 'Poppins_500Medium',
  'jakarta-semibold': 'Poppins_600SemiBold',
  'jakarta-bold': 'Poppins_700Bold',
  'jakarta-extrabold': 'Poppins_700Bold',
} as const;

// Configurações de tamanho de fonte e altura de linha
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
  'title-lg': { size: '22px', lineHeight: '30px', fontWeight: '700' },
  'title-md': { size: '20px', lineHeight: '28px', fontWeight: '700' },
  'title-sm': { size: '18px', lineHeight: '26px', fontWeight: '700' },
  
  // Subtitle - Subtítulos (um passo maiores para mobile)
  'subtitle-lg': { size: '20px', lineHeight: '28px', fontWeight: '600' },
  'subtitle-md': { size: '18px', lineHeight: '26px', fontWeight: '600' },
  'subtitle-sm': { size: '16px', lineHeight: '24px', fontWeight: '600' },
  
  // Label - Rótulos (um passo maiores)
  'label-lg': { size: '20px', lineHeight: '30px', fontWeight: '600' },
  'label-md': { size: '18px', lineHeight: '26px', fontWeight: '600' },
  'label-sm': { size: '16px', lineHeight: '24px', fontWeight: '600' },
  
  // Body - Texto de corpo (maiores por padrão para legibilidade geral)
  'body-lg': { size: '22px', lineHeight: '32px', fontWeight: '400' },
  'body-md': { size: '20px', lineHeight: '30px', fontWeight: '400' },
  'body-sm': { size: '18px', lineHeight: '28px', fontWeight: '400' },
  'body-xs': { size: '15px', lineHeight: '22px', fontWeight: '400' },
  
  // Mono - Texto monoespaçado
  'mono-lg': { size: '16px', lineHeight: '24px', fontWeight: '400', fontFamily: 'monospace' },
  'mono-md': { size: '14px', lineHeight: '20px', fontWeight: '400', fontFamily: 'monospace' },
  'mono-sm': { size: '12px', lineHeight: '18px', fontWeight: '400', fontFamily: 'monospace' },
} as const;

// Tipos para facilitar o uso
export type FontFamilyType = keyof typeof fontFamily;
export type FontSizeType = keyof typeof fontSize;

// Funções utilitárias
export function getFontStyle(size: FontSizeType) {
  return fontSize[size];
} 