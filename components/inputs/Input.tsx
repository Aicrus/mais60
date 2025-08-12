import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Platform, Keyboard, PanResponder, GestureResponderEvent, PanResponderGestureState, Modal, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { Eye, EyeOff, Search, X, Plus, Minus, ChevronUp, ChevronDown, AlertCircle, Calendar } from 'lucide-react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, ColorType } from '../../design-system/tokens/colors';
import { spacing } from '../../design-system/tokens/spacing';
import { borderRadius, getBorderRadius } from '../../design-system/tokens/borders';
import { fontSize, fontFamily, getResponsiveValues } from '../../design-system/tokens/typography';
import { opacity, getOpacity, shadows, getShadow, getShadowColor } from '../../design-system/tokens/effects';

/**
 * @component Input
 * @description Componente de entrada de texto altamente personalizável que suporta:
 * - Vários formatos: texto simples, senha, pesquisa, número, email
 * - Máscaras: CPF, CNPJ, telefone, CEP, moeda
 * - Tema claro/escuro automático
 * - Responsividade
 * - Estados: erro, desabilitado, foco
 * - Três variações de label: acima, sem label, flutuante
 * - Três variações visuais: outline, underline, none
 * - Label flutuante: sempre transparente + padding automático para evitar sobreposição
 * - Affix: texto/ícone no final do input (funcionalidade avançada)
 * - Acessibilidade e personalização
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Input com label acima (padrão)
 * <Input 
 *   value={texto} 
 *   onChangeText={setTexto} 
 *   label="Nome" 
 *   placeholder="Digite seu nome" 
 *   labelVariant="above"
 * />
 * 
 * // Input sem label
 * <Input 
 *   value={texto} 
 *   onChangeText={setTexto} 
 *   placeholder="Digite seu nome"
 *   labelVariant="none"
 * />
 * 
 * // Input com label flutuante (Material Design) - Sempre transparente + padding automático
 * <Input 
 *   value={texto} 
 *   onChangeText={setTexto} 
 *   label="Nome" 
 *   labelVariant="floating"
 *   containerBackgroundColor={corDoContainerPai} // Opcional - detecta automaticamente se não fornecido
 * />
 * 
 * // Input com máscara de CPF
 * <Input 
 *   value={cpf} 
 *   onChangeText={setCpf} 
 *   label="CPF" 
 *   mask="cpf" 
 *   keyboardType="numeric" 
 * />
 * 
 * // Input de senha
 * <Input 
 *   value={senha} 
 *   onChangeText={setSenha} 
 *   type="password" 
 *   label="Senha" 
 * />
 * 
 * // Input de busca
 * <Input 
 *   value={busca} 
 *   onChangeText={setBusca} 
 *   type="search" 
 *   onClear={() => setBusca('')} 
 * />
 * 
 * // Input com variante underline
 * <Input 
 *   value={texto} 
 *   onChangeText={setTexto} 
 *   label="Email" 
 *   variant="underline"
 *   type="email"
 * />
 * 
 * // Input sem borda (variant="none")
 * <Input 
 *   value={texto} 
 *   onChangeText={setTexto} 
 *   placeholder="Digite algo..." 
 *   variant="none"
 * />
 * 
 * // Input com affix (texto no final)
 * <Input 
 *   value={peso} 
 *   onChangeText={setPeso} 
 *   label="Peso" 
 *   rightAffix="kg"
 *   type="number"
 * />
 * 
 * // Input desabilitado
 * <Input 
 *   value="Campo desabilitado" 
 *   onChangeText={() => {}} 
 *   label="Status" 
 *   disabled={true}
 * />
 * 

 * ```
 */

export interface InputProps {
  /** Valor atual do input */
  value: string;
  /** Função chamada quando o valor muda */
  onChangeText: (text: string) => void;
  /** Texto exibido quando o input está vazio */
  placeholder?: string;
  /** Rótulo exibido acima do input */
  label?: string;
  /** Variação do label: 'above' (padrão), 'none' (sem label), 'floating' (Material Design) */
  labelVariant?: 'above' | 'none' | 'floating';
  /** Variação visual do input: 'outline' (borda completa), 'underline' (só embaixo), 'none' (sem borda) */
  variant?: 'outline' | 'underline' | 'none';
  /** Se o input deve ter background transparente (sem cor de fundo) */
  transparent?: boolean;
  /** Cor de fundo do container onde o Input está posicionado (opcional - por padrão usa a mesma cor do input. Usado para o background do label flutuante criar efeito notched) */
  containerBackgroundColor?: string;
  /** Mensagem de erro exibida abaixo do input */
  error?: string;
  /** Se o input está desabilitado */
  disabled?: boolean;
  /** Tipo de input - determina o comportamento e ícones */
  type?: 'text' | 'password' | 'search' | 'number' | 'email' | 'date' | 'time';
  /** Máscara aplicada ao texto digitado */
  mask?: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'currency' | 'date' | 'none';
  /** Número máximo de caracteres permitidos */
  maxLength?: number;
  /** Como capitalizar o texto automaticamente */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Se deve corrigir o texto automaticamente */
  autoCorrect?: boolean;
  /** Sugestão de preenchimento automático (web) */
  autoComplete?: string;
  /** Tipo de teclado exibido */
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  /** Tipo de botão de retorno no teclado */
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  /** Função chamada ao pressionar o botão de retorno */
  onSubmitEditing?: () => void;
  /** Função chamada quando o input recebe foco */
  onFocus?: () => void;
  /** Função chamada quando o input perde foco */
  onBlur?: () => void;
  /** Se o input deve permitir múltiplas linhas */
  multiline?: boolean;
  /** Número de linhas visíveis quando multiline=true */
  numberOfLines?: number;
  /** Função chamada quando o botão de limpar é pressionado */
  onClear?: () => void;

  /** Texto ou componente a ser exibido no final do input (affix) */
  rightAffix?: string | React.ReactNode;
  /** Função chamada quando o affix é pressionado */
  onRightAffixPress?: () => void;
  /** Estilo personalizado para o texto do affix */
  rightAffixStyle?: any;

  /** Componente de ícone personalizado para exibir à direita do input */
  rightIcon?: React.ComponentType;
  /** Função chamada quando o ícone à direita é pressionado */
  onRightIconPress?: () => void;
  /** ID para testes automatizados */
  testID?: string;
  /** Estilo personalizado para o container do input */
  style?: any;
  /** Estilo personalizado para o texto do input */
  inputStyle?: any;
  /** Se o input deve receber foco automaticamente ao ser renderizado */
  autoFocus?: boolean;
  /** Valor mínimo (para type="number") */
  min?: number;
  /** Valor máximo (para type="number") */
  max?: number;
  /** Incremento/decremento (para type="number") */
  step?: number;
  /** Se deve mostrar botões de incremento/decremento (para type="number") */
  showNumberControls?: boolean;

  /** Função chamada quando o ícone de calendário é pressionado (para type="date") */
  onCalendarPress?: () => void;
  /** Função chamada quando o ícone/recurso de hora é pressionado (para type="time") */
  onTimePress?: () => void;

  /** Se o input deve ser redimensionável (funciona em todas as plataformas quando multiline=true) */
  resizable?: boolean;
  /** Altura mínima para inputs redimensionáveis */
  minHeight?: number;
  /** Altura máxima para inputs redimensionáveis */
  maxHeight?: number;
  /** Função para desativar o scroll do container pai (necessário para redimensionamento no nativo) */
  setScrollEnabled?: (enabled: boolean) => void;
}

export const Input = ({
  value,
  onChangeText,
  placeholder = '',
  label,
  labelVariant = 'above',
  variant = 'outline',
  transparent = false,
  containerBackgroundColor,
  error,
  disabled = false,
  type = 'text',
  mask = 'none',
  maxLength,
  autoCapitalize = 'none',
  autoCorrect = true,
  autoComplete,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  onFocus,
  onBlur,
  multiline = false,
  numberOfLines = 1,
  onClear,

  rightAffix,
  onRightAffixPress,
  rightAffixStyle,
  rightIcon,
  onRightIconPress,
  testID,
  style,
  inputStyle,
  autoFocus = false,
  min,
  max,
  step = 1,
  showNumberControls = false,
  resizable = false,
  minHeight = 38,
  maxHeight = 200,
  setScrollEnabled,
  onCalendarPress,
}: InputProps) => {
  // Estado para controlar visibilidade da senha
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Estado para controlar foco
  const [isFocused, setIsFocused] = useState(false);
  
  // Estado para controlar altura do input (para multiline)
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);
  
  // Animação para o label flutuante usando react-native-reanimated
  const labelAnimation = useSharedValue(value || isFocused ? 1 : 0);
  
  // Verificar se o label deve estar "flutuando" (em cima)
  const shouldFloat = (value && value.length > 0) || isFocused;
  
  // Referência ao input nativo para web
  const inputRef = useRef<TextInput>(null);
  
  // Referência ao input number nativo HTML5 para web 
  const nativeNumberInputRef = useRef<HTMLInputElement>(null);
  
  // Tema atual
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Obter cores do design system
  const getThemeColor = (baseColor: string): string => {
    const darkKey = `${baseColor}-dark` as ColorType;
    const lightKey = `${baseColor}-light` as ColorType;
    return isDark ? colors[darkKey] : colors[lightKey];
  };
  
  // Responsividade
  const { isMobile, responsive } = useResponsive();
  
  // Verificar se estamos na plataforma web
  const isWeb = Platform.OS === 'web';
  
  // Estado para controlar altura do input no nativo quando redimensionável
  const [nativeInputHeight, setNativeInputHeight] = useState(multiline ? minHeight : 38);
  
  // Ref para armazenar a posição inicial do toque para redimensionamento
  const touchStartY = useRef(0);
  
  
  
  // Função para detectar se uma cor é clara ou escura
  const isLightColor = (color: string): boolean => {
    if (!color) return true; // Default para claro se não tiver cor
    
    // Remove # se existir
    color = color.replace('#', '');
    
    // Converte RGB/RGBA para valores numéricos
    let r: number, g: number, b: number;
    
    if (color.length === 3) {
      // Formato #RGB
      r = parseInt(color[0] + color[0], 16);
      g = parseInt(color[1] + color[1], 16);
      b = parseInt(color[2] + color[2], 16);
    } else if (color.length === 6) {
      // Formato #RRGGBB
      r = parseInt(color.substr(0, 2), 16);
      g = parseInt(color.substr(2, 2), 16);
      b = parseInt(color.substr(4, 2), 16);
    } else if (color.startsWith('rgb')) {
      // Formato rgb() ou rgba()
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return true; // Default para claro
      }
    } else {
      return true; // Default para claro se formato não reconhecido
    }
    
    // Fórmula para calcular luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna true se a cor for clara (luminância > 0.5)
    return luminance > 0.5;
  };

  // Função para obter a cor do texto baseada no fundo (para label flutuante)
  const getTextColorForFloating = (): string => {
    // Se temos containerBackgroundColor definido, usar ele para determinar a cor
    if (containerBackgroundColor) {
      return isLightColor(containerBackgroundColor) 
      ? (colors['text-primary-light']) 
      : (colors['text-primary-dark']);
    }
    
    // Se não, usar o sistema de cores do tema
    return isDark ? colors['text-primary-dark'] : colors['text-primary-light'];
  };

  // Função para obter a cor de fundo dinâmica do label flutuante (sempre igual ao input)
  const getFloatingLabelBackground = (): string => {
    // Sempre usar a mesma cor de fundo do input para consistência visual
    return getInputBackgroundColor();
  };

  // Função para obter a cor de fundo do input
  const getInputBackgroundColor = (): string => {
    // Se transparent=true, sempre transparente
    if (transparent) {
      return 'transparent';
    }
    
    // Se estiver desabilitado, usar cor específica
    if (disabled) {
      return isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'];
    }
    
    // Para todos os inputs, usar a mesma cor de fundo
    // Usando bg-primary que é a cor padrão dos inputs
    return isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'];
  };

  // Função para obter estilos baseados na variante
  const getVariantStyles = () => {
    const borderColor = error 
      ? isDark ? colors['error-border-dark'] : colors['error-border-light']
      : isFocused
        ? isDark ? colors['primary-dark'] : colors['primary-light']
        : isDark ? colors['divider-dark'] : colors['divider-light'];

    switch (variant) {
      case 'outline':
        return {
          borderWidth: 1,
          borderColor,
          borderRadius: Number(getBorderRadius('md').replace('px', '')),
        };
      
      case 'underline':
        return {
          borderWidth: 0,
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
          borderRadius: 0,
        };
      
      case 'none':
        return {
          borderWidth: 0,
          borderColor: 'transparent',
          borderRadius: Number(getBorderRadius('md').replace('px', '')),
        };
      
      default:
        return {
          borderWidth: 1,
          borderColor,
          borderRadius: Number(getBorderRadius('md').replace('px', '')),
        };
    }
  };
  
  // Função para desabilitar o scroll do componente pai durante o redimensionamento
  const disableParentScroll = () => {
    if (setScrollEnabled && !isWeb) {
      setScrollEnabled(false);
    }
  };

  // Função para reabilitar o scroll do componente pai após o redimensionamento
  const enableParentScroll = () => {
    if (setScrollEnabled && !isWeb) {
      setScrollEnabled(true);
    }
  };
  
  // Configurar PanResponder para manipular gestos de redimensionamento no nativo
  const panResponder = useRef(
    PanResponder.create({
      // Capturar qualquer toque que comece na área da alça de redimensionamento
      onStartShouldSetPanResponder: () => true,
      // Capturar movimentos mesmo que outro componente já tenha capturado
      onStartShouldSetPanResponderCapture: () => true,
      // Também capturar movimentos novos que começaram em outro lugar
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Somente responder a movimentos verticais significativos
        return Math.abs(gestureState.dy) > 2;
      },
      // Capturar todos os movimentos durante o redimensionamento com alta prioridade
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Somente para movimentos verticais significativos
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        // Armazena posição inicial do toque
        touchStartY.current = evt.nativeEvent.pageY;
        
        // Impede o scroll nativo da página
        if (Platform.OS === 'web') {
          document.body.style.overflow = 'hidden';
        } else {
          // Desativa o scroll de forma enfática
          disableParentScroll();
          Keyboard.dismiss(); // Garantir que o teclado esteja fechado para foco total no redimensionamento
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!resizable || !multiline) return;
        
        // Previne o evento de scroll padrão
        evt.preventDefault?.();
        
        // Previne que o evento se propague para outros manipuladores
        evt.stopPropagation?.();
        
        // Calcula a nova altura com base no movimento do dedo
        const newHeight = nativeInputHeight + gestureState.dy;
        
        // Aplica limites mínimo e máximo
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setNativeInputHeight(newHeight);
        }
        
        // Retorna true para indicar que o evento foi consumido
        return true;
      },
      onPanResponderRelease: () => {
        // Reseta a posição inicial
        touchStartY.current = 0;
        
        // Restaura o scroll nativo da página
        if (Platform.OS === 'web') {
          document.body.style.overflow = '';
        } else {
          // Atrasa ligeiramente a reativação do scroll para evitar conflitos
          setTimeout(() => {
            enableParentScroll();
          }, 100);
        }
      },
      onPanResponderTerminate: () => {
        // Restaura o scroll nativo da página caso o gesto seja interrompido
        if (Platform.OS === 'web') {
          document.body.style.overflow = '';
        } else {
          enableParentScroll();
        }
      },
      // Não ceder o responder a outros componentes
      onPanResponderTerminationRequest: () => false
    })
  ).current;
  
  // Configurações compartilhadas para garantir consistência absoluta
  const placeholderTypography = getResponsiveValues('body-md'); // Usando body-md para placeholder
  const sharedPlaceholderConfig = {
    fontSize: responsive(placeholderTypography.fontSize),
    fontFamily: placeholderTypography.fontFamily,
    lineHeight: responsive(placeholderTypography.lineHeight),
    color: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light']
  };

  // Estilo do container do input
  const labelBaseFontSize = Number(fontSize['label-sm'].size.replace('px', ''));
  const labelBaseLineHeight = Number(fontSize['label-sm'].lineHeight.replace('px', ''));
  const labelAndroidLineHeight = labelBaseFontSize + 6; // Dá respiro extra no Android para evitar corte

  const containerStyle = StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: error ? Number(spacing['1'].replace('px', '')) : 0,
      // Padding extra no topo para label flutuante (evita sobreposição)
      paddingTop: labelVariant === 'floating' ? Number(spacing['2'].replace('px', '')) : 0,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      ...getVariantStyles(), // Aplicar estilos da variante
      backgroundColor: getInputBackgroundColor(), // Cor de fundo baseada na prop transparent
      minHeight: Platform.OS === 'web' 
        ? Number(spacing['10'].replace('px', '')) // 40px na web
        : Number(spacing['12'].replace('px', '')), // 48px no nativo (bom como está)
      paddingHorizontal: Number(spacing['3'].replace('px', '')),
      // Sombra inteligente do design system (sempre escura)
      shadowColor: getShadowColor('input'),
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDark ? 0.2 : 0.05, // Mais intensa no escuro
      shadowRadius: 2,
      elevation: 1,
    },

    inputStyle: {
      flex: 1,
      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
      fontSize: sharedPlaceholderConfig.fontSize, // Exato mesmo tamanho
      fontFamily: sharedPlaceholderConfig.fontFamily, // Exato mesmo peso
      // Configuração unificada com ajustes específicos por plataforma
      paddingVertical: Number(spacing['3'].replace('px', '')), // 12px para ambos
      height: multiline ? undefined : Platform.OS === 'web'
        ? Number(spacing['10'].replace('px', '')) // 40px na web
        : Number(spacing['12'].replace('px', '')), // 48px no nativo
      textAlignVertical: multiline ? 'top' : 'center',
      // Ajustes específicos para nativo
      ...(Platform.OS !== 'web' ? {
        // No Android, habilitar includeFontPadding e aumentar o lineHeight para evitar corte do placeholder
        includeFontPadding: Platform.OS === 'android' ? true : false,
        // lineHeight seguro: pelo menos 1.25x do fontSize ou o lineHeight base, o que for maior
        lineHeight: Platform.OS === 'android' 
          ? Math.max(Math.round(sharedPlaceholderConfig.fontSize * 1.25), sharedPlaceholderConfig.lineHeight)
          : sharedPlaceholderConfig.lineHeight,
        // Desloca o texto um pouco mais para BAIXO no Android
        paddingTop: Platform.OS === 'android' 
          ? Number(spacing['3'].replace('px', '')) + 2 
          : Number(spacing['3'].replace('px', '')) - 1,
        paddingBottom: Platform.OS === 'android' 
          ? Number(spacing['3'].replace('px', '')) - 2 
          : Number(spacing['3'].replace('px', '')) + 1,
      } : {
        // Web mantém configuração padrão
        lineHeight: sharedPlaceholderConfig.lineHeight,
      }),
      ...(Platform.OS === 'ios' && multiline ? { paddingTop: Number(spacing['2.5'].replace('px', '')) } : {}),
    },

    searchIcon: {
      padding: Number(spacing['1'].replace('px', '')),
      marginRight: Number(spacing['2'].replace('px', '')),
      marginLeft: -2,
    },
    iconContainer: {
      padding: Number(spacing['1.5'].replace('px', '')),
      borderRadius: Number(getBorderRadius('sm').replace('px', '')),
    },
    // Label acima (padrão)
    labelStyle: {
      fontSize: labelBaseFontSize, // 13px
      lineHeight: Platform.OS === 'android' ? labelAndroidLineHeight : labelBaseLineHeight, // +respiro no Android
      fontFamily: fontFamily['jakarta-semibold'], // Peso 600 - fontWeight: '600'
      marginBottom: Platform.OS === 'android' 
        ? Number(spacing['2'].replace('px', '')) 
        : Number(spacing['1.5'].replace('px', '')),
      ...(Platform.OS === 'android' ? { paddingTop: 1 } : {}),
      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], // text-primary-light/dark
    },
    // Label flutuante
    floatingLabel: {
      position: 'absolute',
      left: Number(spacing['3'].replace('px', '')),
      // Calcular posição inicial considerando o line-height do label para ficar alinhado
      top: (() => {
        const lineHeightOffset = (Number(fontSize['label-sm'].lineHeight.replace('px', '')) - Number(fontSize['label-sm'].size.replace('px', ''))) / 2;
        
        // Padronizado para ambas as plataformas
        return Number(spacing['3'].replace('px', '')) + 1 - lineHeightOffset;
      })(),
      backgroundColor: 'transparent',
      paddingHorizontal: 0, // Sem padding inicial - só quando flutuando
      // EXATAMENTE o mesmo estilo do placeholder (usando configuração compartilhada)
      fontSize: sharedPlaceholderConfig.fontSize, // Exato mesmo tamanho (13px)
      fontFamily: sharedPlaceholderConfig.fontFamily, // Exato mesmo peso (jakarta-regular)
      lineHeight: sharedPlaceholderConfig.lineHeight, // Exato mesmo lineHeight
      zIndex: 1,
      // CORREÇÃO: Permite clique através do label (não bloqueia o TextInput)
      // Web usa pointerEvents, nativo usa uma abordagem diferente
      ...(Platform.OS === 'web' ? { pointerEvents: 'none' } : {}),
    },
    errorText: {
      fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
      lineHeight: Number(fontSize['body-sm'].lineHeight.replace('px', '')),
      fontFamily: fontFamily['jakarta-regular'],
      color: isDark ? colors['error-icon-dark'] : colors['error-icon-light'], // Mesma cor do ícone
      flex: 1, // Para ocupar o espaço restante ao lado do ícone
    },
    numberControlsContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: Number(spacing['6'].replace('px', '')),
      borderTopRightRadius: Number(getBorderRadius('md').replace('px', '')),
      borderBottomRightRadius: Number(getBorderRadius('md').replace('px', '')),
      overflow: 'hidden',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
      borderLeftWidth: 1,
      borderLeftColor: isDark ? colors['divider-dark'] : colors['divider-light'],
    },
    numberControlButton: {
      height: '50%',
      width: Number(spacing['6'].replace('px', '')),
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberControlButtonUp: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors['divider-dark'] : colors['divider-light'],
    },
    numberControlButtonDown: {
      borderTopWidth: 0,
    },
  });
  
  // Função para aplicar máscara
  const applyMask = (text: string): string => {
    if (!text) return '';
    
    // Implementação básica de algumas máscaras
    switch (mask) {
      case 'cpf':
        // Remove caracteres não numéricos
        text = text.replace(/\D/g, '');
        // Limita a 11 dígitos (CPF completo)
        text = text.substring(0, 11);
        // Aplica máscara de CPF: 000.000.000-00
        text = text.replace(/(\d{3})(\d)/, '$1.$2');
        text = text.replace(/(\d{3})(\d)/, '$1.$2');
        text = text.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return text;
        
      case 'cnpj':
        // Remove caracteres não numéricos
        text = text.replace(/\D/g, '');
        // Limita a 14 dígitos (CNPJ completo)
        text = text.substring(0, 14);
        // Aplica máscara de CNPJ: 00.000.000/0000-00
        text = text.replace(/(\d{2})(\d)/, '$1.$2');
        text = text.replace(/(\d{3})(\d)/, '$1.$2');
        text = text.replace(/(\d{3})(\d)/, '$1/$2');
        text = text.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        return text;
        
      case 'phone':
        // Remove caracteres não numéricos
        text = text.replace(/\D/g, '');
        // Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
        if (text.length > 10) {
          // Celular: (00) 00000-0000
          text = text.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
          // Fixo: (00) 0000-0000
          text = text.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        }
        return text.substring(0, 15);
        
        
      case 'cep':
        // Remove caracteres não numéricos
        text = text.replace(/\D/g, '');
        // Aplica máscara de CEP: 00000-000
        text = text.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        return text.substring(0, 9);
        
      case 'currency':
        // Remove tudo exceto números e ponto
        text = text.replace(/[^\d.]/g, '');
        
        // Converte para número e formata
        const number = parseFloat(text);
        if (isNaN(number)) return 'R$ 0,00';
        
        // Formata para moeda brasileira
        return `R$ ${number.toFixed(2).replace('.', ',')}`;
        
      case 'date':
        // Remove caracteres não numéricos
        text = text.replace(/\D/g, '');
        // Limita a 8 dígitos (ddmmaaaa)
        text = text.substring(0, 8);
        // Aplica máscara de data: dd/mm/aaaa
        text = text.replace(/(\d{2})(\d)/, '$1/$2');
        text = text.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
        return text;
        
      default:
        return text;
    }
  };
  
  // Função para lidar com mudança de texto
  const handleChangeText = (text: string) => {
    if (mask !== 'none') {
      // Aplica máscara se necessário
      text = applyMask(text);
    }
    
    onChangeText(text);
  };
  
  // Alterna visibilidade da senha
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  // Lidar com foco
  const handleFocus = () => {
    // Se estiver desabilitado, não permitir foco
    if (disabled) {
      inputRef.current?.blur(); // Remove o foco imediatamente
      return;
    }
    
    setIsFocused(true);
    
    // Animar label para posição flutuante se for o tipo floating
    if (labelVariant === 'floating') {
      labelAnimation.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
    
    onFocus && onFocus();
  };
  
  // Lidar com perda de foco
  const handleBlur = () => {
    setIsFocused(false);
    
    // Animar label de volta se não houver valor e for o tipo floating
    if (labelVariant === 'floating' && !value) {
      labelAnimation.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
    
    onBlur && onBlur();
  };
  
  // Limpar o campo
  const handleClear = () => {
    onChangeText('');
    onClear && onClear();
    // Focar no input após limpar
    inputRef.current?.focus();
  };
  
  // Função para lidar com clique no ícone direito personalizado
  const handleRightIconPress = () => {
    if (onRightIconPress) {
      onRightIconPress();
    }
  };
  

  
  // Função para abrir o input number nativo para web
  const focusNumberInput = () => {
    if (isWeb && type === 'number' && nativeNumberInputRef.current) {
      nativeNumberInputRef.current.focus();
    }
  };
  

  
  // Função para lidar com mudança no input number nativo HTML5
  const handleWebNativeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value;
    onChangeText(numValue);
  };
  
  // Função para lidar com incremento e decremento para inputs numéricos
  const handleIncrement = () => {
    if (type !== 'number') return;
    
    // Converte o valor atual para número
    let numValue = value ? parseFloat(value) : 0;
    
    // Incrementa pelo valor do step
    numValue += step;
    
    // Verifica o valor máximo
    if (max !== undefined && numValue > max) {
      numValue = max;
    }
    
    // Formata o valor de volta para string
    onChangeText(numValue.toString());
  };
  
  const handleDecrement = () => {
    if (type !== 'number') return;
    
    // Converte o valor atual para número
    let numValue = value ? parseFloat(value) : 0;
    
    // Decrementa pelo valor do step
    numValue -= step;
    
    // Verifica o valor mínimo
    if (min !== undefined && numValue < min) {
      numValue = min;
    }
    
    // Formata o valor de volta para string
    onChangeText(numValue.toString());
  };
  
  // Determinar tipo seguro de teclado
  const getKeyboardType = () => {
    if (keyboardType !== 'default') return keyboardType;
    
    // Definir tipo de teclado com base no mask ou type
    if (mask === 'cpf' || mask === 'cnpj' || mask === 'phone' || mask === 'cep' || mask === 'currency' || mask === 'date') {
      return 'numeric';
    }
    
    if (type === 'number') return 'numeric';
    if (type === 'email') return 'email-address';
    if (type === 'date' || type === 'time') return 'numeric';
    
    return 'default';
  };
  
  // Função para lidar com mudanças no tamanho do conteúdo (para multiline)
  const handleContentSizeChange = (event: any) => {
    if (multiline) {
      if (isWeb) {
        setInputHeight(event.nativeEvent.contentSize.height);
      } else if (!resizable) {
        // No nativo, só ajusta automaticamente se não for redimensionável
        setInputHeight(event.nativeEvent.contentSize.height);
      }
    }
  };
  
  // Adicionar estilos de hover para web
  useEffect(() => {
    if (isWeb) {
      const style = document.createElement('style');
      style.textContent = `
        /* Estilos para o input */
        [data-input-container="true"] {
          transition: all 0.2s ease-in-out;
        }
        
        [data-input-container="true"]:hover:not([data-disabled="true"]) {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: ${isDark ? colors['primary-dark'] : colors['primary-light']};
          transition: all 0.2s ease-in-out;
        }
        
        [data-input-container="true"]:focus-within:not([data-disabled="true"]) {
          box-shadow: 0 0 0 2px ${isDark ? colors['primary-dark'] + '40' : colors['primary-light'] + '40'};
          transition: all 0.2s ease-in-out;
        }
        
        /* Estilo para os ícones */
        [data-input-icon="true"] {
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        
        [data-input-icon="true"]:hover {
          background-color: ${isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light']};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        /* Remover highlight/seleção azul padrão nos navegadores */
        input:focus,
        textarea:focus {
          outline: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
          -moz-box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
        
        /* Remover cor de seleção padrão (azul) */
        input::selection,
        textarea::selection {
          background-color: rgba(128, 128, 128, 0.2) !important;
          color: inherit !important;
        }
        
        /* Prevenir seleção em inputs desabilitados */
        input:disabled,
        textarea:disabled {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
          cursor: not-allowed !important;
        }
        
        [data-input-container="true"][data-disabled="true"] {
          pointer-events: none !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }
        
        /* Estilo para controles numéricos */
        [data-input-number-control] {
          transition: all 0.2s ease;
        }
        
        [data-input-number-control]:hover:not(:disabled) {
          background-color: ${getThemeColor('divider')};
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.2s ease;
        }
        
        [data-input-number-control]:active:not(:disabled) {
          background-color: ${getThemeColor('primary')};
          transform: scale(0.98);
          transition: all 0.1s ease;
        }
        
        /* Estilos para o input numérico nativo do HTML5 */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
          height: 38px;
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
        }
        
        /* Cor normal para os elementos do número (igual aos outros inputs) */
        input[type="number"] {
          color: ${isDark ? colors['text-primary-dark'] : colors['text-primary-light']};
        }
        
        /* Hack para aplicar cores neutras no spinner */
        :root {
          accent-color: ${isDark ? colors['text-secondary-dark'] : colors['text-secondary-light']} !important;
          --number-spinner-color: ${isDark ? colors['text-secondary-dark'] : colors['text-secondary-light']} !important;
        }
        
        /* Adiciona suporte a cores neutras no spinner */
        @supports (accent-color: ${isDark ? colors['text-secondary-dark'] : colors['text-secondary-light']}) {
          input[type="number"] {
            accent-color: ${isDark ? colors['text-secondary-dark'] : colors['text-secondary-light']};
          }
        }
        
        /* Estilos específicos para tema escuro */
        ${isDark ? `
          input[type="number"]::-webkit-inner-spin-button {
            filter: invert(0.8);
          }
        ` : ''}
        
        /* Container para o input number nativo */
        [data-number-input-container] {
          position: relative;
        }
        
        .native-number-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 1;
          background: transparent;
          border: none;
          color: ${isDark ? colors['text-primary-dark'] : colors['text-primary-light']};
          font-size: 14px;
          padding: 8px 25px 8px 12px;
          z-index: 1;
          border-radius: 6px;
        }
        
        /* Estilos para input redimensionável */
        textarea.resizable {
          resize: vertical;
          min-height: ${minHeight}px;
          max-height: ${maxHeight}px;
          overflow-y: auto;
          padding-bottom: 16px; /* Espaço para o indicador de redimensionamento */
          text-align-vertical: top !important;
        }
        
        /* Container para inputs redimensionáveis */
        [data-input-container][data-multiline="true"] {
          position: relative;
          overflow: visible;
        }
        
        /* Ícone de redimensionamento visível (semelhante ao nativo) */
        [data-resize-handle] {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          display: flex;
          justify-content: center;
          alignItems: 'center';
          zIndex: 10;
          pointer-events: auto;
          cursor: nw-resize;
        }
        
        /* Não esconda o redimensionador nativo, apenas estilize o nosso ícone por cima */
        textarea::-webkit-resizer {
          background-color: transparent;
        }
        
        /* Efeito notched para label flutuante na web */
        [data-label-variant="floating"]:focus-within {
          border-top: none;
        }
        
        [data-label-variant="floating"]:focus-within::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: calc(100% - ${Number(spacing['3'].replace('px', '')) - 2}px);
          height: 1.5px;
          background-color: ${isDark ? colors['primary-dark'] : colors['primary-light']};
          z-index: 1;
        }
        
        [data-label-variant="floating"]:focus-within::after {
          content: '';
          position: absolute;
          top: 0;
          left: calc(${Number(spacing['3'].replace('px', '')) - 2}px + var(--label-width, 80px));
          right: 0;
          height: 1.5px;
          background-color: ${isDark ? colors['primary-dark'] : colors['primary-light']};
          z-index: 1;
        }
        
        /* Versão para quando há valor no input mas não está em foco */
        [data-label-variant="floating"][data-has-value="true"] {
          border-top: none;
        }
        
        [data-label-variant="floating"][data-has-value="true"]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: calc(100% - ${Number(spacing['3'].replace('px', '')) - 2}px);
          height: 1px;
          background-color: ${isDark ? colors['divider-dark'] : colors['divider-light']};
          z-index: 1;
        }
        
        [data-label-variant="floating"][data-has-value="true"]::after {
          content: '';
          position: absolute;
          top: 0;
          left: calc(${Number(spacing['3'].replace('px', '')) - 2}px + var(--label-width, 80px));
          right: 0;
          height: 1px;
          background-color: ${isDark ? colors['divider-dark'] : colors['divider-light']};
          z-index: 1;
        }
      `;
      document.head.appendChild(style);
      
      // Adicionando prevenção de scroll quando o cursor estiver sobre o input numérico
      const handleWheel = (e: WheelEvent) => {
        // Verifica se o alvo do evento é um input do tipo number ou está dentro de um container de input number
        const target = e.target as HTMLElement;
        const isNumberInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number';
        const isInNumberInputContainer = target.closest('[data-number-input-container]') !== null;
        
        if (isNumberInput || isInNumberInputContainer) {
          // Previne o scroll da página
          e.preventDefault();
          
          // Encontra o input numérico
          let inputElement: HTMLInputElement | null = null;
          if (isNumberInput) {
            inputElement = target as HTMLInputElement;
          } else if (isInNumberInputContainer) {
            inputElement = target.closest('[data-number-input-container]')?.querySelector('input[type="number"]') || null;
          }
          
          if (inputElement) {
            // Obtém os valores atuais
            const currentValue = parseFloat(inputElement.value) || 0;
            const step = parseFloat(inputElement.step) || 1;
            const min = inputElement.min !== '' ? parseFloat(inputElement.min) : undefined;
            const max = inputElement.max !== '' ? parseFloat(inputElement.max) : undefined;
            
            // Determina a direção do scroll (negativo = para cima = aumentar valor)
            let newValue = currentValue;
            if (e.deltaY < 0) {
              // Scroll para cima, aumenta o valor
              newValue = currentValue + step;
              if (max !== undefined && newValue > max) newValue = max;
            } else {
              // Scroll para baixo, diminui o valor
              newValue = currentValue - step;
              if (min !== undefined && newValue < min) newValue = min;
            }
            
            // Atualiza o valor do input
            inputElement.value = newValue.toString();
            
            // Dispara um evento de change para que React e outros frameworks detectem a mudança
            const event = new Event('change', { bubbles: true });
            inputElement.dispatchEvent(event);
            
            // Se tiver um evento de input, também dispara
            const inputEvent = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(inputEvent);
          }
        }
      };
      
      // Adiciona o listener em modo de captura para garantir que ele é executado antes do comportamento padrão
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      
      return () => {
        document.head.removeChild(style);
        document.removeEventListener('wheel', handleWheel, { capture: true });
      };
    }
  }, [isDark, minHeight, maxHeight]);

  // Efeito para garantir que o texto comece no topo em inputs multilinhas
  useEffect(() => {
    if (multiline && inputRef.current) {
      // Forçar o alinhamento vertical no topo no iOS/Android
      if (Platform.OS !== 'web') {
        const node = inputRef.current;
        if (node) {
          // Forçar re-render para garantir que o textAlignVertical seja aplicado
          setTimeout(() => {
            const currentSelection = node.props?.selection;
            node.setNativeProps({
              style: { textAlignVertical: 'top' },
              selection: currentSelection
            });
          }, 50);
        }
      }
    }
  }, [multiline]);
  
  // Função para garantir que o texto comece no topo em inputs multilinhas
  const initInputLayout = () => {
    if (multiline && inputRef.current && Platform.OS !== 'web') {
      // Garante que o texto comece no topo
      inputRef.current.setNativeProps({
        style: { textAlignVertical: 'top' }
      });
    }
  };
  
  // Executar inicialização após a montagem
  useEffect(() => {
    // Chamar a função de inicialização
    if (multiline && inputRef.current && Platform.OS !== 'web') {
      // Garante que o texto comece no topo
      inputRef.current.setNativeProps({
        style: { textAlignVertical: 'top' }
      });
    }
  }, [multiline]);
  
  // Efeito para controlar a animação do label baseada no valor (apenas para floating)
  useEffect(() => {
    if (labelVariant === 'floating') {
      if (value.length > 0 || isFocused) {
        labelAnimation.value = withTiming(1, {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
      } else {
        labelAnimation.value = withTiming(0, {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
      }
    }
  }, [value, isFocused, labelVariant]);

  // Estilo animado para o label flutuante
  const animatedLabelStyle = useAnimatedStyle(() => {
    'worklet';
    // Calcular a posição inicial considerando o line-height do label
    const lineHeightOffset = (Number(fontSize['label-sm'].lineHeight.replace('px', '')) - Number(fontSize['label-sm'].size.replace('px', ''))) / 2;
    
    // Posição inicial com ajuste sutil para nativo
    const baseTop = Number(spacing['3'].replace('px', '')) + 1 - lineHeightOffset;
    const initialTop = Platform.OS === 'web' ? baseTop : baseTop + 2; // +2px no nativo para descer um pouquinho
    
    const labelSize = sharedPlaceholderConfig.fontSize; // EXATO mesmo tamanho do placeholder quando dentro
    const floatingLabelSize = Number(fontSize['label-sm'].size.replace('px', '')); // 13px quando flutuando
    
    return {
      top: interpolate(labelAnimation.value, [0, 1], [initialTop, -10]), // Da posição inicial ajustada para cima
      fontSize: interpolate(labelAnimation.value, [0, 1], [labelSize, floatingLabelSize]), // De 13px para 13px (mantém o tamanho)
      // Removido opacity para manter mesma intensidade do placeholder
      // opacity: interpolate(labelAnimation.value, [0, 1], [0.6, 1]),
    };
  });

  // Funções auxiliares para o calendário


  return (
    <View style={[containerStyle.container, style]}>
      {/* Label acima (variant="above") */}
      {label && labelVariant === 'above' && (
        <Text style={containerStyle.labelStyle}>{label}</Text>
      )}
      
      {/* Container do input com label flutuante ou normal */}
      <View style={{ position: 'relative' }}>
        {/* Label flutuante animado (variant="floating") */}
        {label && labelVariant === 'floating' && (
          <>
            <Animated.Text
              style={[
                containerStyle.floatingLabel,
                animatedLabelStyle,
                {
                  // Cor do texto: Label flutuante inteligente
                  color: shouldFloat 
                    ? (isDark ? colors['text-primary-dark'] : colors['text-primary-light']) // text-primary quando flutuando (novo padrão)
                    : (isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light']), // EXATA mesma cor do placeholder quando não flutuando (perfeito como estava)
                  // Adiciona cor de fundo quando flutuando para criar efeito notched
                  backgroundColor: shouldFloat ? getFloatingLabelBackground() : 'transparent',
                  paddingHorizontal: shouldFloat ? 4 : 0,
                }
              ]}
              {...(isWeb ? { 
                'data-floating-label': 'true',
                'data-floating': shouldFloat ? 'true' : 'false'
              } : {})}
            >
              {label}
            </Animated.Text>
            
            {/* TouchableOpacity invisível para capturar cliques no nativo */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'transparent',
                  zIndex: 2, // Acima do label
                }}
                onPress={() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                activeOpacity={1} // Sem feedback visual
              />
            )}
          </>
        )}


        
        <View 
          style={[
            containerStyle.inputContainer,
            disabled ? { opacity: 0.6 } : {},
            type === 'number' && showNumberControls && !isWeb ? { paddingRight: 32 } : {},
            multiline && { minHeight: minHeight },
            !isWeb && multiline && resizable ? { height: nativeInputHeight } : {},
            multiline ? { alignItems: 'flex-start' } : {}
          ]}
          {...(isWeb ? {
            'data-input-container': 'true',
            'data-disabled': disabled ? 'true' : 'false',
            'data-multiline': multiline ? 'true' : 'false',
            'data-label-variant': labelVariant,
            'data-has-value': value.length > 0 ? 'true' : 'false',
            ...(type === 'number' ? { 'data-number-input-container': 'true' } : {})
          } : {})}
          onLayout={() => {
            if (multiline && inputRef.current && Platform.OS !== 'web') {
              inputRef.current.setNativeProps({
                style: { textAlignVertical: 'top' }
              });
            }
          }}
        >
          {/* Ícone de pesquisa para type="search" */}
          {type === 'search' && (
            <View style={containerStyle.searchIcon}>
              <Search 
                size={16} 
                color={getThemeColor('text-secondary')} 
              />
            </View>
          )}
          
          {/* Input numérico nativo HTML5 para web */}
          {isWeb && type === 'number' && showNumberControls && (
            <input
              ref={nativeNumberInputRef}
              type="number"
              className="native-number-input"
              onChange={handleWebNativeNumberChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={value || ''}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              placeholder={labelVariant === 'floating' ? '' : placeholder}
            />
          )}
          
          {/* Texto original mascarado para type="number" no web */}
          {isWeb && type === 'number' && showNumberControls ? (
            <View style={{ opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
                          <TextInput
              ref={inputRef}
              style={[
                containerStyle.inputStyle, 
                inputStyle,
                { height: multiline ? inputHeight : undefined }
              ]}
              value={value}
              onChangeText={handleChangeText}
              placeholder={labelVariant === 'floating' ? '' : placeholder}
              placeholderTextColor={sharedPlaceholderConfig.color}
              editable={!disabled}
              keyboardType={getKeyboardType()}
              onFocus={handleFocus}
              onBlur={handleBlur}
              selectionColor={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            />
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              style={[
                containerStyle.inputStyle, 
                inputStyle,
                { height: multiline ? inputHeight : undefined },
                // Adiciona estilos para redimensionamento se necessário
                isWeb && multiline && resizable ? {
                  minHeight: minHeight,
                  maxHeight: maxHeight,
                  height: 'auto'
                } : {},
                // Garante que o texto comece no topo em inputs multilinhas
                multiline ? { textAlignVertical: 'top' } : {}
              ]}
              value={value}
              onChangeText={handleChangeText}
              placeholder={labelVariant === 'floating' ? '' : placeholder}
              placeholderTextColor={sharedPlaceholderConfig.color}
              editable={!disabled}
              secureTextEntry={type === 'password' && !passwordVisible}
              keyboardType={getKeyboardType()}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              // @ts-ignore - Para compatibilidade web
              autoComplete={autoComplete}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength={maxLength}
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : 1}
              testID={testID}
              // Cor de seleção elegante baseada na cor primária
              selectionColor={isDark ? colors['primary-dark'] + '60' : colors['primary-light'] + '60'}
              autoFocus={autoFocus}
              onContentSizeChange={handleContentSizeChange}

              // Para web, adiciona suporte à redimensionamento
              {...(isWeb && multiline && resizable ? {
                className: 'resizable'
              } : {})}
              // Garante que o texto comece no topo - IMPORTANTE: esta propriedade precisa ser definida por último
              textAlignVertical={multiline ? 'top' : 'center'}
            />
          )}
        
        {/* Ícone personalizado à direita */}
        {rightIcon && (
          <TouchableOpacity 
            onPress={handleRightIconPress}
            style={containerStyle.iconContainer}
            {...(isWeb ? { 'data-input-icon': 'true' } : {})}
            disabled={disabled}
          >
            {React.createElement(rightIcon)}
          </TouchableOpacity>
        )}
        
        {/* Right Affix (texto/componente no final) */}
        {rightAffix && (
          <TouchableOpacity 
            onPress={onRightAffixPress}
            style={[
              {
                paddingHorizontal: Number(spacing['2'].replace('px', '')),
                justifyContent: 'center',
                alignItems: 'center',
              },
              rightAffixStyle
            ]}
            {...(isWeb ? { 'data-input-affix': 'true' } : {})}
            disabled={disabled || !onRightAffixPress}
            activeOpacity={onRightAffixPress ? 0.6 : 1}
          >
            {typeof rightAffix === 'string' ? (
              <Text style={{
                fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
                fontFamily: fontFamily['jakarta-medium'],
                color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
              }}>
                {rightAffix}
              </Text>
            ) : (
              rightAffix
            )}
          </TouchableOpacity>
        )}
        
        {/* Botão para limpar input quando houver valor e não for disabled */}
        {value.length > 0 && !disabled && onClear && (
          <TouchableOpacity 
            onPress={handleClear}
            style={containerStyle.iconContainer}
            {...(isWeb ? { 'data-input-icon': 'true' } : {})}
          >
            <X 
              size={16} 
              color={getThemeColor('text-secondary')} 
            />
          </TouchableOpacity>
        )}
        
        {/* Ícone de calendário para tipo date */}
        {type === 'date' && onCalendarPress && (
          <TouchableOpacity 
            onPress={onCalendarPress}
            style={containerStyle.iconContainer}
            {...(isWeb ? { 'data-input-icon': 'true' } : {})}
            disabled={disabled}
          >
            <Calendar 
              size={16} 
              color={getThemeColor('text-secondary')} 
            />
          </TouchableOpacity>
        )}
        
        {/* Botão de mostrar/esconder senha */}
        {type === 'password' && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={containerStyle.iconContainer}
            {...(isWeb ? { 'data-input-icon': 'true' } : {})}
            disabled={disabled}
          >
            {passwordVisible ? (
              <EyeOff 
                size={16} 
                color={getThemeColor('text-secondary')} 
              />
            ) : (
              <Eye 
                size={16} 
                color={getThemeColor('text-secondary')} 
              />
            )}
          </TouchableOpacity>
        )}
        
        {/* Controles verticais para input numérico (apenas no NATIVO) */}
        {type === 'number' && showNumberControls && !isWeb && (
          <View style={containerStyle.numberControlsContainer}>
            <TouchableOpacity 
              onPress={handleIncrement}
              style={[containerStyle.numberControlButton, containerStyle.numberControlButtonUp]}
              disabled={disabled || (max !== undefined && value ? parseFloat(value) >= max : false)}
              activeOpacity={0.6}
            >
              <ChevronUp 
                size={12} 
                color={getThemeColor('text-secondary')} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDecrement}
              style={[containerStyle.numberControlButton, containerStyle.numberControlButtonDown]}
              disabled={disabled || (min !== undefined && value ? parseFloat(value) <= min : false)}
              activeOpacity={0.6}
            >
              <ChevronDown 
                size={12} 
                color={getThemeColor('text-secondary')} 
              />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Indicador de redimensionamento para web (similar ao nativo) */}
        {isWeb && multiline && resizable && (
          <View 
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 18,
              height: 18,
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            {...(isWeb ? { 'data-resize-handle': 'true' } : {})}
          >
            {/* Usando o mesmo indicador visual do nativo */}
            <View style={{
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={{
                width: 12,
                height: 1.5,
                backgroundColor: getThemeColor('divider'),
                marginBottom: 1.5,
                transform: [{ rotate: '-45deg' }, { translateX: 1 }],
              }} />
              <View style={{
                width: 9,
                height: 1.5,
                backgroundColor: getThemeColor('divider'),
                marginBottom: 1.5,
                transform: [{ rotate: '-45deg' }],
              }} />
              <View style={{
                width: 6,
                height: 1.5,
                backgroundColor: getThemeColor('divider'),
                transform: [{ rotate: '-45deg' }, { translateX: -1 }],
              }} />
            </View>
          </View>
        )}
        
        {/* Alça de redimensionamento para textarea (no React Native) */}
        {!isWeb && multiline && resizable && (
          <View 
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32, 
              height: 32,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              paddingRight: 4,
              paddingBottom: 4,
              zIndex: 100,
            }}
            {...panResponder.panHandlers}
            hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            {/* Três linhas diagonais como indicador de redimensionamento */}
            <View style={{
              width: 10,
              height: 10,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}>
              <View style={{
                width: 10,
                height: 1,
                backgroundColor: getThemeColor('divider'),
                marginBottom: 2,
                transform: [{ rotate: '-45deg' }, { translateX: 1 }],
              }} />
              <View style={{
                width: 7,
                height: 1,
                backgroundColor: getThemeColor('divider'),
                marginBottom: 2,
                transform: [{ rotate: '-45deg' }],
              }} />
              <View style={{
                width: 4,
                height: 1,
                backgroundColor: getThemeColor('divider'),
                transform: [{ rotate: '-45deg' }, { translateX: -1 }],
              }} />
            </View>
          </View>
        )}
        </View>
      </View>
      
      {/* Mensagem de erro */}
      {error && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Number(spacing['1'].replace('px', '')),
        }}>
          <AlertCircle 
            size={14} 
            color={isDark ? colors['error-icon-dark'] : colors['error-icon-light']}
            style={{ marginRight: Number(spacing['1'].replace('px', '')) }}
          />
          <Text style={containerStyle.errorText}>{error}</Text>
        </View>
      )}
      

      

    </View>
  );
}; 