import React, { useCallback, useEffect } from 'react';
import { Pressable, View, Platform, Text } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';

/**
 * Ícones para cada modo de tema
 */
const THEME_ICONS = {
  light: Sun,
  dark: Moon,
} as const;

/**
 * Tamanhos predefinidos para o componente
 */
export const THEME_SELECTOR_SIZES = {
  sm: {
    buttonWidth: 28,
    height: 28,
    iconSize: 14,
  },
  md: {
    buttonWidth: 32,
    height: 32,
    iconSize: 16,
  },
  lg: {
    buttonWidth: 40,
    height: 40,
    iconSize: 20,
  },
  xl: {
    buttonWidth: 48,
    height: 48,
    iconSize: 22,
  },
} as const;

/**
 * Estilos visuais predefinidos
 */
export const THEME_SELECTOR_VARIANTS = {
  default: 'default',
  pill: 'pill',
  minimal: 'minimal',
  labeled: 'labeled',
  toggle: 'toggle',
  single: 'single', // Botão único para alternar temas
} as const;

/**
 * Configurações específicas para cada plataforma com ajustes para evitar overshooting
 */
const SPRING_CONFIG = Platform.select({
  web: {
    damping: 20,
    stiffness: 180,
    overshootClamping: true,
  },
  default: {
    damping: 25,
    stiffness: 250,
    mass: 0.5,
    overshootClamping: true,
  },
});

export type ThemeSelectorSize = keyof typeof THEME_SELECTOR_SIZES;
export type ThemeSelectorVariant = keyof typeof THEME_SELECTOR_VARIANTS;

export interface ThemeSelectorProps {
  className?: string;
  size?: ThemeSelectorSize;
  variant?: ThemeSelectorVariant;
  showLabels?: boolean;
  showLabelsOnlyForTwoModes?: boolean; // placeholder para manter compatibilidade, não usado
  transparentSingle?: boolean;
  iconOnly?: boolean; // Nova prop para mostrar apenas o ícone sem fundo e sem borda
  customColors?: {
    background?: string;
    sliderBackground?: string;
    activeIconColor?: string;
    inactiveIconColor?: string;
    textColor?: string;
    activeTextColor?: string;
  };
}

/**
 * Calcula a posição inicial do slider com base no modo atual e opções disponíveis
 */
const getInitialPosition = (mode: 'light' | 'dark') => (mode === 'light' ? 0 : 1);

/**
 * Obtém a etiqueta baseada no modo
 */
const getLabel = (mode: 'light' | 'dark') => {
  switch(mode) {
    case 'light': return 'Claro';
    case 'dark': return 'Escuro';
  }
};

/**
 * ThemeSelector - Componente para alternar entre temas claro, escuro e sistema
 * 
 * Este componente oferece uma interface elegante e altamente personalizável para
 * permitir que os usuários alternem entre temas claro, escuro ou sistema.
 * 
 * @param className - Classes CSS personalizadas (via tailwind ou styled-components)
 * @param size - Tamanho do seletor (sm, md, lg, xl)
 * @param variant - Estilo visual (default, pill, minimal, labeled, toggle, single)
 * @param showLabels - Exibe texto junto aos ícones (para variant="labeled")
 * @param showSystemOption - Exibe a opção de seguir o tema do sistema
 * @param transparentSingle - Fundo transparente para variant="single"
 * @param iconOnly - Mostra apenas o ícone sem fundo e sem borda (para variant="single")
 * @param customColors - Objeto para personalizar cores
 * 
 * @returns Componente ThemeSelector renderizado
 */
export function ThemeSelector({ 
  className = '',
  size = 'md',
  variant = 'default',
  showLabels = false,
  transparentSingle = false,
  iconOnly = false,
  customColors = {}
}: ThemeSelectorProps) {
  const { themeMode, setThemeMode, currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Obter dimensões com base no tamanho selecionado
  const { buttonWidth: baseButtonWidth, height: baseHeight, iconSize: baseIconSize } = THEME_SELECTOR_SIZES[size];
  
  // Ajustes específicos para variantes
  const buttonWidth = variant === 'labeled' && showLabels 
    ? Math.floor(baseButtonWidth * 1.6) // Mais largo para acomodar rótulos
    : baseButtonWidth;
    
  const height = variant === 'labeled' && showLabels
    ? Math.floor(baseHeight * 1.2) // Um pouco mais alto para acomodar rótulos
    : baseHeight;
    
  const iconSize = variant === 'labeled' && showLabels
    ? Math.floor(baseIconSize * 0.9) // Ícones um pouco menores com rótulos
    : baseIconSize;
  
  // Para o estilo single, diminuir um pouco o tamanho para ficar mais clean
  const singleSizeMultiplier = 0.85; // 15% menor
  const singleButtonWidth = variant === 'single' 
    ? Math.floor(baseButtonWidth * singleSizeMultiplier)
    : buttonWidth;
  const singleHeight = variant === 'single' 
    ? Math.floor(baseHeight * singleSizeMultiplier)
    : height;
  const singleIconSize = variant === 'single' 
    ? iconOnly ? Math.floor(baseIconSize * 1.2) : Math.floor(baseIconSize * singleSizeMultiplier)
    : iconSize;
    
  const padding = Math.max(2, Math.floor(buttonWidth * 0.05)); // Padding proporcional
  
  // Apenas dois modos disponíveis
  const availableModes = ['light', 'dark'] as const;
    
  // No caso do toggle, só usar 'light' e 'dark'
  const toggleModes = ['light', 'dark'] as const;
  
  // Calcular largura do container
  const containerWidth = variant === 'toggle'
    ? buttonWidth * 2
    : variant === 'single'
      ? singleButtonWidth
      : buttonWidth * availableModes.length + padding * 2;
  
  // Calcular raio de borda com base na variante
  const getBorderRadius = () => {
    switch (variant) {
      case 'pill':
        return height / 2;
      case 'minimal':
        return 4;
      case 'toggle':
        return height / 2;
      case 'single':
        return singleHeight / 2; // Single é redondo como o pill
      default:
        return 6; // default e labeled
    }
  };
  
  const borderRadius = getBorderRadius();
  
  // Configurar cores com base no tema atual e customizações
  const backgroundColors = {
    default: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'],
    pill: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'],
    minimal: 'transparent',
    labeled: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'],
    toggle: isDark ? colors['bg-secondary-dark'] : colors['bg-tertiary-light'],
    single: isDark ? colors['bg-secondary-dark'] : colors['bg-tertiary-light'],
  };
  
  const sliderColors = {
    default: isDark ? colors['primary-dark'] : colors['primary-light'],
    pill: isDark ? colors['primary-dark'] : colors['primary-light'],
    minimal: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    labeled: isDark ? colors['primary-dark'] : colors['primary-light'],
    toggle: isDark ? colors['primary-dark'] : colors['primary-light'],
    single: isDark ? colors['primary-dark'] : colors['primary-light'],
  };
  
  const activeTextColors = {
    default: colors['text-primary-dark'],
    pill: colors['text-primary-dark'],
    minimal: isDark ? colors['primary-dark'] : colors['primary-light'],
    labeled: colors['text-primary-dark'],
    toggle: colors['text-primary-dark'],
    single: colors['text-primary-dark'],
  };
  
  const textColors = {
    default: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    pill: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    minimal: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    labeled: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    toggle: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    single: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
  };
  
  const backgroundColor = customColors.background || backgroundColors[variant];
  const sliderBackgroundColor = customColors.sliderBackground || sliderColors[variant];
  const activeTextColor = customColors.activeTextColor || activeTextColors[variant];
  const textColor = customColors.textColor || textColors[variant];
  
  // Função para obter a cor do ícone com base no modo
  const getIconColor = (mode: 'light' | 'dark') => {
    // Para variantes com slider que cobre o ícone (default, pill, labeled, toggle)
    if (mode === themeMode) {
      if (variant === 'minimal') {
        // Para minimal, usar apenas a cor primária
        return isDark ? colors['primary-dark'] : colors['primary-light'];
      } else if (variant === 'single') {
        // Para single: se for iconOnly, usar cor primária, caso contrário branco
        if (iconOnly) {
          return isDark ? colors['primary-dark'] : colors['primary-light'];
        } else if (transparentSingle) {
          return isDark ? colors['primary-dark'] : colors['primary-light'];
        } else {
          return colors['text-primary-dark'];
        }
      } else {
        // Para variantes com slider (default, pill, labeled, toggle), usar branco
        return colors['text-primary-dark'];
      }
    }
    
    // Ícones não selecionados são semi-transparentes
    return isDark ? colors['text-primary-dark'] + '80' : colors['text-primary-light'] + '80';
  };
  
  // Configurar posição inicial e animação
  const targetPosition = useSharedValue(getInitialPosition(themeMode));
  
  // Atualiza a posição alvo quando o themeMode muda
  useEffect(() => {
    targetPosition.value = getInitialPosition(themeMode);
  }, [themeMode]);
  
  // Valor derivado para garantir que a animação fique dentro dos limites
  const clampedTranslateX = useDerivedValue(() => {
    const targetX = targetPosition.value * buttonWidth;
    // Anima para a posição alvo com spring
    return withSpring(targetX, SPRING_CONFIG);
  });

  const handlePress = useCallback((mode: 'light' | 'dark') => {
    if (mode === themeMode) return; // Evita animações desnecessárias
    setThemeMode(mode);
  }, [setThemeMode, themeMode]);

  // Função específica para o estilo "single" que alterna entre claro e escuro
  const handleSinglePress = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  const animatedSliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: clampedTranslateX.value }],
    };
  });

  const renderSlider = () => {
    // Não renderizar o slider para a variante minimal
    if (variant === 'minimal') {
      return null;
    }
    
    return (
      <Animated.View 
        className="absolute rounded-md"
        style={[
          {
            position: 'absolute',
            width: buttonWidth - Math.max(1, Math.floor(buttonWidth * 0.03)),
            height: height - Math.max(4, Math.floor(height * 0.12)),
            borderRadius: variant === 'pill' || variant === 'toggle' ? height / 2 : 4,
            zIndex: 0,
            left: padding + Math.floor(buttonWidth * 0.01),
            top: Math.max(2, Math.floor(height * 0.06)),
            backgroundColor: sliderBackgroundColor,
            shadowColor: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 1,
          },
          animatedSliderStyle,
        ]} 
      />
    );
  };

  // Estilo single - botão único para alternar entre claro/escuro
  if (variant === 'single') {
    // Versão apenas ícone (sem fundo e sem borda)
    if (iconOnly) {
      return (
        <View className={`${className}`}>
          <Pressable
            style={{
              width: singleButtonWidth,
              height: singleHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleSinglePress}
          >
            {themeMode === 'light' ? (
              <Sun
                size={singleIconSize}
                color={isDark ? colors['primary-dark'] : colors['primary-light']}
                strokeWidth={1.5}
              />
            ) : (
              <Moon
                size={singleIconSize}
                color={isDark ? colors['primary-dark'] : colors['primary-light']}
                strokeWidth={1.5}
              />
            )}
          </Pressable>
        </View>
      );
    }
    
    // Versão com fundo transparente ou colorido
    return (
      <View className={`${className}`}>
        <Pressable
          style={{
            width: singleButtonWidth,
            height: singleHeight,
            borderRadius: singleHeight / 2,
            backgroundColor: transparentSingle 
              ? 'transparent' 
              : isDark ? colors['primary-dark'] : colors['primary-light'],
            alignItems: 'center',
            justifyContent: 'center',
            ...(transparentSingle && {
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            }),
            shadowColor: transparentSingle ? 'transparent' : isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: transparentSingle ? 0 : 0.1,
            shadowRadius: transparentSingle ? 0 : 2,
            elevation: transparentSingle ? 0 : 2,
          }}
          onPress={handleSinglePress}
        >
          {themeMode === 'light' ? (
            <Sun
              size={singleIconSize}
              color={transparentSingle 
                ? (isDark ? colors['primary-dark'] : colors['primary-light']) 
                : colors['text-primary-dark']
              }
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              size={singleIconSize}
              color={transparentSingle 
                ? (isDark ? colors['primary-dark'] : colors['primary-light']) 
                : colors['text-primary-dark']
              }
              strokeWidth={1.5}
            />
          )}
        </Pressable>
      </View>
    );
  }

  // Renderiza o estilo toggle (apenas dois estados)
  if (variant === 'toggle') {
    return (
      <View className={`${className}`}>
        <View 
          style={{
            width: buttonWidth * 2,
            height: height,
            backgroundColor,
            borderRadius: height / 2,
            padding: 2,
            position: 'relative',
          }}
        >
          <Animated.View 
            style={[
              {
                position: 'absolute',
                width: buttonWidth - 4,
                height: height - 4,
                borderRadius: height / 2,
                backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'],
                top: 2,
                left: 2,
                zIndex: 0,
              },
              {
                transform: [{ translateX: themeMode === 'dark' ? buttonWidth : 0 }],
              }
            ]} 
          />
          <View className="flex-row h-full">
            <Pressable
              style={{ 
                width: buttonWidth, 
                height: height - 4,
                justifyContent: 'center', 
                alignItems: 'center', 
                zIndex: 1,
              }}
              onPress={() => setThemeMode('light')}
            >
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Sun
                  size={iconSize}
                  color={themeMode === 'light' ? colors['text-primary-dark'] : isDark ? colors['text-primary-dark'] : colors['text-secondary-light']}
                  strokeWidth={1.5}
                />
              </View>
            </Pressable>
            <Pressable
              style={{ 
                width: buttonWidth, 
                height: height - 4,
                justifyContent: 'center', 
                alignItems: 'center', 
                zIndex: 1,
              }}
              onPress={() => setThemeMode('dark')}
            >
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Moon
                  size={iconSize}
                  color={themeMode === 'dark' ? colors['text-primary-dark'] : isDark ? colors['text-primary-dark'] : colors['text-secondary-light']}
                  strokeWidth={1.5}
                />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Renderização para outros estilos (default, pill, minimal, labeled)
  return (
    <View className={`${className}`}>
      <View 
        className={`flex-row rounded-md relative items-center`}
        style={[
          { 
            flexDirection: 'row',
            borderRadius,
            padding,
            position: 'relative',
            width: containerWidth,
            height,
            backgroundColor,
            ...(variant === 'minimal' && {
              borderWidth: 0,
              borderColor: 'transparent',
            }),
          },
        ]}>
        {renderSlider()}
        
        {availableModes.map((mode, index) => {
          const isActive = mode === themeMode;
          const IconComponent = THEME_ICONS[mode];
          
          return (
            <Pressable
              key={mode}
              className={`items-center justify-center z-10 ${
                variant === 'pill' 
                  ? index === 0 
                    ? 'rounded-l-full' 
                    : index === availableModes.length - 1 
                      ? 'rounded-r-full' 
                      : '' 
                  : index === 0 
                    ? 'rounded-l-md' 
                    : index === availableModes.length - 1 
                      ? 'rounded-r-md' 
                      : ''
              }`}
              style={{
                width: buttonWidth,
                height: height - 2, // Pequeno ajuste para alinhar com o container
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: variant === 'labeled' && showLabels ? 0 : Math.floor(buttonWidth * 0.02),
              }}
              onPress={() => handlePress(mode)}>
              <IconComponent
                size={iconSize}
                color={getIconColor(mode)}
                strokeWidth={1.5}
                style={variant === 'labeled' && showLabels ? { marginBottom: 4 } : null}
              />
              
              {variant === 'labeled' && showLabels && (
                <Text
                  className="text-center"
                  style={{
                    fontSize: Math.max(7, Math.floor(buttonWidth * 0.22)),
                    lineHeight: Math.max(9, Math.floor(buttonWidth * 0.26)),
                    color: getIconColor(mode),
                    opacity: mode === themeMode ? 1 : 0.8,
                    fontWeight: isActive ? '500' : '400',
                  }}
                >
                  {getLabel(mode)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}