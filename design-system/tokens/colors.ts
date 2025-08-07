/**
 * SISTEMA DE CORES
 * ------------------------------
 * Define todas as cores disponíveis no sistema de design.
 * Organizado por temas (claro/escuro) e categorias.
 */

export const colors = {
  // ===== TEMA CLARO =====
  // Cores primárias - Tema Claro (Roxo Mais 60)
  'primary-light': '#430593',
  'primary-light-hover': '#360476',
  'primary-light-active': '#2A0359',
  
  // Cores secundárias - Tema Claro (Verde Mais 60)
  'secondary-light': '#27CC95',
  'secondary-light-hover': '#22B582',
  'secondary-light-active': '#1D9E6F',
  
  // Cores terciárias - Tema Claro (Coral Mais 60)
  'tertiary-light': '#FB5C3D',
  'tertiary-light-hover': '#EA4A2B',
  'tertiary-light-active': '#D9381A',
  
  // Cores quaternárias - Tema Claro (Azul Mais 60)
  'quaternary-light': '#06AAFC',
  'quaternary-light-hover': '#0596E3',
  'quaternary-light-active': '#0482CA',
  
  // Cores quinárias - Tema Claro (Amarelo Mais 60)
  'quinary-light': '#FFA300',
  'quinary-light-hover': '#E69200',
  'quinary-light-active': '#CC8100',
  
  // Cores neutras - Tema Claro (Cinza Claro Mais 60)
  'neutral-light': '#E8F3F5',
  'neutral-light-hover': '#D4E7EA',
  'neutral-light-active': '#C0DBDF',
  
  // Cores alternativas - Tema Claro
  'alternate-light': '#E0E3E7',
  
  // Cores de texto - Tema Claro
  'text-primary-light': '#14181B',
  'text-secondary-light': '#57636C',
  'text-tertiary-light': '#8B97A2',
  
  // Cores de fundo - Tema Claro
  'bg-primary-light': '#F7F8FA',
  'bg-secondary-light': '#FFFFFF',
  'bg-tertiary-light': '#F1F4F8',
  
  // Elementos de UI - Tema Claro
  'icon-light': '#57636C',
  'divider-light': '#E0E3E7',
  'hover-light': '#00000008',
  'active-light': '#00000012',
  
  // ===== TEMA ESCURO =====
  // Cores primárias - Tema Escuro (Roxo Mais 60 - versão escura)
  'primary-dark': '#6B46C1',
  'primary-dark-hover': '#7C3AED',
  'primary-dark-active': '#8B5CF6',
  
  // Cores secundárias - Tema Escuro (Verde Mais 60 - versão escura)
  'secondary-dark': '#10B981',
  'secondary-dark-hover': '#34D399',
  'secondary-dark-active': '#6EE7B7',
  
  // Cores terciárias - Tema Escuro (Coral Mais 60 - versão escura)
  'tertiary-dark': '#F87171',
  'tertiary-dark-hover': '#FCA5A5',
  'tertiary-dark-active': '#FECACA',
  
  // Cores quaternárias - Tema Escuro (Azul Mais 60 - versão escura)
  'quaternary-dark': '#3B82F6',
  'quaternary-dark-hover': '#60A5FA',
  'quaternary-dark-active': '#93C5FD',
  
  // Cores quinárias - Tema Escuro (Amarelo Mais 60 - versão escura)
  'quinary-dark': '#F59E0B',
  'quinary-dark-hover': '#FBBF24',
  'quinary-dark-active': '#FCD34D',
  
  // Cores neutras - Tema Escuro (Cinza Claro Mais 60 - versão escura)
  'neutral-dark': '#374151',
  'neutral-dark-hover': '#4B5563',
  'neutral-dark-active': '#6B7280',
  
  // Cores alternativas - Tema Escuro
  'alternate-dark': '#262D34',
  
  // Cores de texto - Tema Escuro
  'text-primary-dark': '#FFFFFF',
  'text-secondary-dark': '#95A1AC',
  'text-tertiary-dark': '#6B7280',
  
  // Cores de fundo - Tema Escuro
  'bg-primary-dark': '#1C1E26',
  'bg-secondary-dark': '#14181B',
  'bg-tertiary-dark': '#262D34',
  
  // Elementos de UI - Tema Escuro
  'icon-dark': '#95A1AC',
  'divider-dark': '#262D34',
  'hover-dark': '#FFFFFF08',
  'active-dark': '#FFFFFF12',
  
  // ===== FEEDBACK - TEMA CLARO =====
  // Sucesso - Tema Claro
  'success-bg-light': '#E7F7EE',
  'success-text-light': '#1B4332',
  'success-border-light': '#2D6A4F',
  'success-icon-light': '#059669',
  
  // Alerta - Tema Claro
  'warning-bg-light': '#FEF3C7',
  'warning-text-light': '#92400E',
  'warning-border-light': '#D97706',
  'warning-icon-light': '#F59E0B',
  
  // Erro - Tema Claro
  'error-bg-light': '#FEE2E2',
  'error-text-light': '#991B1B',
  'error-border-light': '#DC2626',
  'error-icon-light': '#EF4444',
  
  // Informação - Tema Claro
  'info-bg-light': '#E0F2FE',
  'info-text-light': '#075985',
  'info-border-light': '#0284C7',
  'info-icon-light': '#0EA5E9',
  
  // ===== FEEDBACK - TEMA ESCURO =====
  // Sucesso - Tema Escuro
  'success-bg-dark': '#064E3B',
  'success-text-dark': '#ECFDF5',
  'success-border-dark': '#059669',
  'success-icon-dark': '#10B981',
  
  // Alerta - Tema Escuro
  'warning-bg-dark': '#451A03',
  'warning-text-dark': '#FEF3C7',
  'warning-border-dark': '#D97706',
  'warning-icon-dark': '#FBBF24',
  
  // Erro - Tema Escuro
  'error-bg-dark': '#450A0A',
  'error-text-dark': '#FEE2E2',
  'error-border-dark': '#DC2626',
  'error-icon-dark': '#F87171',
  
  // Informação - Tema Escuro
  'info-bg-dark': '#082F49',
  'info-text-dark': '#E0F2FE',
  'info-border-dark': '#0284C7',
  'info-icon-dark': '#38BDF8',

  // CORES DE GRADIENTE
  'gradient-primary-start': '#4A6FA5',
  'gradient-primary-end': '#22D3EE',
  'gradient-secondary-start': '#4A6FA5',
  'gradient-secondary-end': '#D3545D',
  'gradient-tertiary-start': '#22D3EE',
  'gradient-tertiary-end': '#D3545D',
} as const;

// Tipos para facilitar o uso
export type ColorType = keyof typeof colors;

// Funções utilitárias
export function getColorByMode(colorBase: string, colorScheme: 'light' | 'dark'): string {
  const colorKey = `${colorBase}-${colorScheme}` as ColorType;
  return colors[colorKey] || '';
} 