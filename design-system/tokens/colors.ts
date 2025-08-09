/**
 * SISTEMA DE CORES
 * ------------------------------
 * Define todas as cores disponíveis no sistema de design.
 * Organizado por temas (claro/escuro) e categorias.
 */

export const colors = {
  // ===== PALETA DA MARCA (fixa) =====
  // Cores oficiais fornecidas pelo time de design. Usadas em botões, badges e elementos de destaque.
  'brand-purple': '#430593',
  'brand-green': '#27CC95',
  'brand-light': '#E8F3F5',
  'brand-coral': '#FB5C3D',
  'brand-blue': '#06AAFC',
  'brand-orange': '#FFA300',

  // ===== TEMA CLARO =====
  // Cores primárias - Tema Claro
  'primary-light': '#430593',
  'primary-light-hover': '#3A047F',
  'primary-light-active': '#32046F',
  
  // Cores secundárias - Tema Claro
  'secondary-light': '#27CC95',
  'secondary-light-hover': '#22B784',
  'secondary-light-active': '#1FA276',
  
  // Cores terciárias - Tema Claro
  'tertiary-light': '#FB5C3D',
  'tertiary-light-hover': '#FF6D52',
  'tertiary-light-active': '#E24F34',
  
  // Cores alternativas - Tema Claro
  'alternate-light': '#E8F3F5',
  
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
  // Cores primárias - Tema Escuro
  'primary-dark': '#6A2DCB',
  'primary-dark-hover': '#7A3CDA', 
  'primary-dark-active': '#5717A8',
  
  // Cores secundárias - Tema Escuro
  'secondary-dark': '#33E0A6',
  'secondary-dark-hover': '#44E6B0',
  'secondary-dark-active': '#2BD29A',
  
  // Cores terciárias - Tema Escuro
  'tertiary-dark': '#FF6D52',
  'tertiary-dark-hover': '#FF8068',
  'tertiary-dark-active': '#E95A41',
  
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