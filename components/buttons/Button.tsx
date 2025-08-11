import React, { ReactNode, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, ColorType, getColorByMode } from '../../design-system/tokens/colors';
import { spacing } from '../../design-system/tokens/spacing';
import { borderRadius, BorderRadiusType, getBorderRadius } from '../../design-system/tokens/borders';
import { fontSize, fontFamily, FontSizeType, getFontStyle, getResponsiveValues } from '../../design-system/tokens/typography';

/**
 * @component Button
 * @description Componente de botão moderno e minimalista que suporta:
 * - Variantes: primary, destructive, outline, ghost, link
 * - Estado de carregamento com indicador visual
 * - Ícones: à esquerda, à direita ou botão de ícone
 * - Tema claro/escuro automático
 * - Responsividade
 * - Acessibilidade
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Botão primário
 * <Button variant="primary" onPress={() => console.log('Pressed')}>
 *   Botão Primário
 * </Button>
 * 
 * // Botão destrutivo
 * <Button variant="destructive" onPress={() => console.log('Pressed')}>
 *   Botão Destrutivo
 * </Button>
 * 
 * // Botão outline
 * <Button variant="outline" onPress={() => console.log('Pressed')}>
 *   Botão Outline
 * </Button>
 * 
 * // Botão ghost
 * <Button variant="ghost" onPress={() => console.log('Pressed')}>
 *   Botão Ghost
 * </Button>
 * 
 * // Botão link
 * <Button variant="link" onPress={() => console.log('Pressed')}>
 *   Botão Link
 * </Button>
 * 
 * // Botão com ícone à esquerda
 * <Button
 *   variant="primary"
 *   onPress={() => console.log('Pressed')}
 *   leftIcon={<Icon name="star" size={16} color="#FFFFFF" />}
 * >
 *   Com Ícone
 * </Button>
 * 
 * // Botão com ícone à direita
 * <Button
 *   variant="primary"
 *   onPress={() => console.log('Pressed')}
 *   rightIcon={<Icon name="chevron-right" size={16} color="#FFFFFF" />}
 * >
 *   Com Ícone
 * </Button>
 * 
 * // Botão de ícone
 * <Button variant="primary" onPress={() => console.log('Pressed')} isIconOnly>
 *   <Icon name="plus" size={16} color="#FFFFFF" />
 * </Button>
 * ```
 */

export type ButtonVariant = 'primary' | 'destructive' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  /** Texto do botão ou children como ReactNode */
  children: ReactNode;
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Se o botão está em estado de carregamento */
  loading?: boolean;
  /** Mensagem exibida durante o carregamento */
  loadingText?: string;
  /** Cor do spinner de carregamento (se não especificado, usa a cor apropriada para a variante) */
  spinnerColor?: string;
  /** Se o botão está desabilitado */
  disabled?: boolean;
  /** Ícone exibido à esquerda do texto */
  leftIcon?: ReactNode;
  /** Ícone exibido à direita do texto */
  rightIcon?: ReactNode;
  /** Se o botão contém apenas um ícone (sem texto) */
  isIconOnly?: boolean;
  /** Função chamada quando o botão é pressionado */
  onPress: () => void;
  /** Estilos adicionais para o container do botão */
  style?: ViewStyle;
  /** Estilos adicionais para o texto do botão */
  textStyle?: TextStyle;
  /** ID para testes automatizados */
  testID?: string;
  /** Valor para acessibilidade */
  accessibilityLabel?: string;
  /** Largura total disponível */
  fullWidth?: boolean;
  /** Raio da borda do botão */
  borderRadius?: BorderRadiusType;
  /** Classe CSS para estilizar no web */
  className?: string;
  /** Cor de fundo quando hover (para web) */
  hoverColor?: string;
  /** Atributo aria-label para acessibilidade */
  'aria-label'?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  spinnerColor,
  disabled = false,
  leftIcon,
  rightIcon,
  isIconOnly = false,
  onPress,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  fullWidth = false,
  borderRadius,
  className = '',
  hoverColor,
  'aria-label': ariaLabel,
  ...rest
}: ButtonProps) => {
  // Obtém o tema atual e verifica se está no modo escuro
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Responsividade
  const { isMobile, responsive } = useResponsive();
  
  // Determina se o botão tem texto ou apenas ícone
  const hasText = !isIconOnly && children;
  
  // Função para obter a cor baseada no modo do tema
  const getThemeColor = (colorBase: string) => {
    return getColorByMode(colorBase, isDark ? 'dark' : 'light');
  };
  
  // Cores para os diferentes temas e variantes baseadas no nosso sistema de tema
  const colorScheme = {
    primary: {
      background: getThemeColor('primary'),
      backgroundHover: getThemeColor('primary-hover'),
      backgroundPressed: getThemeColor('primary-active'),
      text: '#FFFFFF',
      border: 'transparent',
      disabled: `${getThemeColor('primary')}80`, // 80 = 50% de opacidade
      disabledText: '#FFFFFF',
      textHover: undefined,
      textPressed: undefined,
      disabledBorder: undefined,
    },
    destructive: {
      background: getThemeColor('tertiary'),
      backgroundHover: getThemeColor('tertiary-hover'),
      backgroundPressed: getThemeColor('tertiary-active'),
      text: '#FFFFFF',
      border: 'transparent',
      disabled: `${getThemeColor('tertiary')}80`,
      disabledText: '#FFFFFF',
      textHover: undefined,
      textPressed: undefined,
      disabledBorder: undefined,
    },
    outline: {
      background: 'transparent',
      backgroundHover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      backgroundPressed: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: getThemeColor('text-primary'),
      border: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      disabled: 'transparent',
      disabledText: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      disabledBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textHover: undefined,
      textPressed: undefined,
    },
    ghost: {
      background: 'transparent',
      backgroundHover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      backgroundPressed: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: getThemeColor('text-primary'),
      border: 'transparent',
      disabled: 'transparent',
      disabledText: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      textHover: undefined,
      textPressed: undefined,
      disabledBorder: undefined,
    },
    link: {
      background: 'transparent',
      backgroundHover: 'transparent',
      backgroundPressed: 'transparent',
      text: getThemeColor('primary'),
      textHover: getThemeColor('primary-hover'),
      textPressed: getThemeColor('primary-active'),
      border: 'transparent',
      disabled: 'transparent',
      disabledText: `${getThemeColor('primary')}80`,
      disabledBorder: undefined,
    },
  };
  
  // Configurações de tipografia responsiva para cada tamanho
  const typographyConfigs = {
    xs: getResponsiveValues('body-sm'),
    sm: getResponsiveValues('body-md'),
    md: getResponsiveValues('body-lg'),
    lg: getResponsiveValues('subtitle-md'),
  };

  // Dimensões para os diferentes tamanhos
  const sizes = {
    xs: {
      height: isIconOnly ? Number(spacing['6'].replace('px', '')) : Number(spacing['7'].replace('px', '')),
      paddingHorizontal: isIconOnly ? 0 : Number(spacing['3'].replace('px', '')),
      typography: typographyConfigs.xs,
      iconSize: Number(spacing['3'].replace('px', '')),
      borderRadius: Number(getBorderRadius(borderRadius || 'xs').replace('px', '')),
      iconButtonDimension: Number(spacing['6'].replace('px', '')),
      spacing: 3, // 3px - bem próximo
    },
    sm: {
      height: isIconOnly ? Number(spacing['8'].replace('px', '')) : Number(spacing['9'].replace('px', '')),
      paddingHorizontal: isIconOnly ? 0 : Number(spacing['3.5'].replace('px', '')),
      typography: typographyConfigs.sm,
      iconSize: Number(spacing['3.5'].replace('px', '')),
      borderRadius: Number(getBorderRadius(borderRadius || 'sm').replace('px', '')),
      iconButtonDimension: Number(spacing['8'].replace('px', '')),
      spacing: 5, // 5px - bem próximo
    },
    md: {
      height: isIconOnly ? Number(spacing['10'].replace('px', '')) : 48,
      paddingHorizontal: isIconOnly ? 0 : Number(spacing['4'].replace('px', '')),
      typography: typographyConfigs.md,
      iconSize: Number(spacing['4'].replace('px', '')),
      borderRadius: Number(getBorderRadius(borderRadius || 'md').replace('px', '')),
      iconButtonDimension: Number(spacing['10'].replace('px', '')),
      spacing: 6, // 6px - bem próximo
    },
    lg: {
      height: isIconOnly ? Number(spacing['12'].replace('px', '')) : Number(spacing['14'].replace('px', '')),
      paddingHorizontal: isIconOnly ? 0 : Number(spacing['5'].replace('px', '')),
      typography: typographyConfigs.lg,
      iconSize: Number(spacing['5'].replace('px', '')),
      borderRadius: Number(getBorderRadius(borderRadius || 'lg').replace('px', '')),
      iconButtonDimension: Number(spacing['12'].replace('px', '')),
      spacing: 8, // 8px - bem próximo
    },
  };
  
  // Obtém configurações para o tamanho selecionado
  const sizeConfig = sizes[size];
  
  // Determina a cor do spinner baseada na variante
  const getSpinnerColor = () => {
    if (spinnerColor) return spinnerColor;
    
    if (variant === 'primary' || variant === 'destructive') {
      return '#FFFFFF'; // Branco para variantes com fundo colorido
    } else if (variant === 'link') {
      return colorScheme.link.text; // Cor do texto do link
    } else {
      return isDark ? '#FFFFFF' : '#14181B'; // Texto padrão
    }
  };

  // Gera os estilos do botão
  const getButtonStyles = (): ViewStyle => {
    const variantColors = colorScheme[variant];
    
    return {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      backgroundColor: disabled ? variantColors.disabled : variantColors.background,
      borderRadius: sizeConfig.borderRadius,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: disabled ? variantColors.disabledBorder : variantColors.border,
      opacity: loading ? 0.7 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: isIconOnly ? sizeConfig.iconButtonDimension : fullWidth ? '100%' : 'auto',
      minWidth: isIconOnly ? sizeConfig.iconButtonDimension : undefined,
      ...style,
    };
  };
  
  // Função para obter os estilos do texto
  const getTextStyles = (): TextStyle => {
    const sizeConfig = sizes[size];
    const variantColors = colorScheme[variant];
    const typography = sizeConfig.typography;

    return {
      color: disabled ? variantColors.disabledText : variantColors.text,
      fontSize: responsive(typography.fontSize),
      fontFamily: typography.fontFamily,
      fontWeight: typography.fontWeight as TextStyle['fontWeight'],
      lineHeight: responsive(typography.lineHeight),
      marginLeft: leftIcon && hasText ? sizeConfig.spacing : 0,
      marginRight: rightIcon && hasText ? sizeConfig.spacing : 0,
      ...textStyle,
    };
  };
  
  // Aplica estilos específicos para Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleElement = document.createElement('style');
      const buttonClass = `button-${variant}-${size}-${disabled ? 'disabled' : 'enabled'}`;
      
      // Obtém as cores dinâmicas do design system
      const primaryColor = getThemeColor('primary');
      const primaryHoverColor = getThemeColor('primary-hover');
      
      styleElement.textContent = `
        .${buttonClass}:hover:not(:disabled) {
          position: relative;
        }
        
        .${buttonClass}:hover:not(:disabled)::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: ${variant === 'link' ? 'transparent' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
          border-radius: inherit;
          pointer-events: none;
          transition: background-color 0.2s ease;
        }
        
        .button-link-${size}-enabled {
          text-decoration: underline;
          text-decoration-color: ${primaryColor} !important;
          text-underline-offset: 2px;
          transition: all 0.2s ease;
        }
        
        .button-link-${size}-enabled:hover:not(:disabled) {
          filter: brightness(0.85);
        }
        
        .${buttonClass}:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .${buttonClass}:active:not(:disabled) {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [variant, size, disabled, hoverColor, isDark]);
  
  // Renderiza o spinner de carregamento
  const renderSpinner = () => (
    <ActivityIndicator
      size={isIconOnly ? sizeConfig.iconSize : 'small'}
      color={spinnerColor || getSpinnerColor()}
    />
  );
  
  // Renderiza o conteúdo do botão
  const renderContent = () => {
    const sizeConfig = sizes[size];
    const typography = sizeConfig.typography;

    if (loading) {
      return (
        <>
          {renderSpinner()}
          {loadingText && (
            <Text
              style={{
                fontFamily: typography.fontFamily,
                color: colorScheme[variant].text,
                fontSize: responsive(typography.fontSize),
                fontWeight: typography.fontWeight as TextStyle['fontWeight'],
                lineHeight: responsive(typography.lineHeight),
                marginLeft: sizeConfig.spacing,
              }}
            >
              {loadingText}
            </Text>
          )}
        </>
      );
    }

    return (
      <>
        {leftIcon && (
          <View style={{ marginRight: hasText ? sizeConfig.spacing : 0 }}>
            {leftIcon}
          </View>
        )}
        {isIconOnly ? (
          children
        ) : (
          <Text
            style={{
              fontFamily: typography.fontFamily,
              color: colorScheme[variant].text,
              fontSize: responsive(typography.fontSize),
              fontWeight: typography.fontWeight as TextStyle['fontWeight'],
              lineHeight: responsive(typography.lineHeight),
            }}
          >
            {variant === 'link' && Platform.OS === 'web' ? (
              <span>{children}</span>
            ) : (
              children
            )}
          </Text>
        )}
        {rightIcon && (
          <View style={{ marginLeft: hasText ? sizeConfig.spacing : 0 }}>
            {rightIcon}
          </View>
        )}
      </>
    );
  };
  
  const buttonClass = `button-${variant}-${size}-${disabled ? 'disabled' : 'enabled'} ${className}`;
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
      testID={testID || `button-${variant}-${Math.random().toString(36).substr(2, 9)}`}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...(Platform.OS === 'web' ? { className: buttonClass } : {})}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}; 