/**
 * SISTEMA DE ESPAÇAMENTO
 * ------------------------------
 * Define todas as medidas de espaçamento do sistema de design.
 * Inclui valores em pixels e aliases semânticos.
 */

export const spacing = {
  // Valores em pixels
  '0': '0px',
  'px': '1px',
  
  // Extra pequenos (2-6px)
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  
  // Pequenos (8-12px)
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  
  // Médios (14-20px)
  '3.5': '14px',
  '4': '16px',
  '5': '20px',
  
  // Grandes (24-40px)
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
  
  // Extra grandes (44-64px)
  '11': '44px',
  '12': '48px',
  '13': '52px',
  '15': '60px',
  '14': '56px',
  '16': '64px',
  
  // Enormes (72-128px)
  '18': '72px',
  '20': '80px',
  '24': '96px',
  '28': '112px',
  '32': '128px',
  
  // Gigantes (144-384px)
  '36': '144px',
  '40': '160px',
  '44': '176px',
  '48': '192px',
  '52': '208px',
  '56': '224px',
  '60': '240px',
  '64': '256px',
  '72': '288px',
  '80': '320px',
  '96': '384px',
  
  // Aliases semânticos (para facilitar o uso)
  'xxxs': '2px',  // 0.5
  'xxs': '4px',   // 1
  'xs': '8px',    // 2
  'sm': '12px',   // 3
  'md': '16px',   // 4
  'lg': '24px',   // 6
  'xl': '32px',   // 8
  '2xl': '48px',  // 12
  '3xl': '64px',  // 16
  '4xl': '80px',  // 20
  '5xl': '96px',  // 24
  '6xl': '128px', // 32
} as const;

// Tipos para facilitar o uso
export type SpacingType = keyof typeof spacing;

// Funções utilitárias
export function getSpacing(size: SpacingType): string {
  return spacing[size];
}

// Funções de conveniência para diferentes tipos de espaçamento
export const space = {
  padding: (size: SpacingType) => ({ padding: spacing[size] }),
  paddingX: (size: SpacingType) => ({ paddingHorizontal: spacing[size] }),
  paddingY: (size: SpacingType) => ({ paddingVertical: spacing[size] }),
  margin: (size: SpacingType) => ({ margin: spacing[size] }),
  marginX: (size: SpacingType) => ({ marginHorizontal: spacing[size] }),
  marginY: (size: SpacingType) => ({ marginVertical: spacing[size] }),
  gap: (size: SpacingType) => ({ gap: spacing[size] }),
} as const; 