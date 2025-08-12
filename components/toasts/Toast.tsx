import React, { useEffect, useMemo } from 'react';
import { 
  Animated, 
  Text, 
  View, 
  ViewStyle, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  useWindowDimensions,
  Pressable,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from '@gorhom/portal';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';

/**
 * @component Toast
 * @description Componente de notificação moderno e personalizável que suporta:
 * - Variantes: success, error, warning, info
 * - Posições: top, bottom, top-left, top-right, bottom-left, bottom-right
 * - Animações de entrada e saída
 * - Tema claro/escuro automático
 * - Opção de fechamento manual
 * - Tempo de exibição configurável
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Toast de sucesso no topo
 * <Toast
 *   visible={isVisible}
 *   type="success"
 *   position="top"
 *   message="Operação realizada com sucesso!"
 *   duration={3000}
 *   onHide={() => setIsVisible(false)}
 * />
 * 
 * // Toast de erro na parte inferior
 * <Toast
 *   visible={isVisible}
 *   type="error"
 *   position="bottom"
 *   message="Ocorreu um erro"
 *   description="Tente novamente mais tarde."
 *   duration={5000}
 *   onHide={() => setIsVisible(false)}
 * />
 * 
 * // Toast com botão de fechamento
 * <Toast
 *   visible={isVisible}
 *   type="info"
 *   position="top-right"
 *   message="Nova atualização disponível"
 *   closable={true}
 *   onHide={() => setIsVisible(false)}
 * />
 * ```
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 
  | 'top' 
  | 'bottom' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right';

/**
 * Nomes de posição formatados para exibição ao usuário
 */
export const ToastPositionLabels: Record<ToastPosition, string> = {
  'top': 'Top',
  'bottom': 'Bottom',
  'top-left': 'Top Left',
  'top-right': 'Top Right',
  'bottom-left': 'Bottom Left',
  'bottom-right': 'Bottom Right'
};

export interface ToastProps {
  /** Se o toast está visível */
  visible: boolean;
  /** Mensagem principal do toast */
  message: string;
  /** Descrição opcional (texto secundário) */
  description?: string;
  /** Tipo de toast que define a cor e ícone */
  type: ToastType;
  /** Posição do toast na tela */
  position?: ToastPosition;
  /** Duração em ms da exibição do toast (0 para não desaparecer) */
  duration?: number;
  /** Função chamada quando o toast é fechado */
  onHide: () => void;
  /** Se o toast pode ser fechado pelo usuário */
  closable?: boolean;
  /** Se o toast mostra uma barra de progresso */
  showProgressBar?: boolean;
  /** Estilos adicionais para o container do toast */
  style?: ViewStyle;
  /** ID para testes automatizados */
  testID?: string;
}

export function Toast({
  visible,
  message,
  description,
  type = 'info',
  position = 'bottom-right',
  duration = 3000,
  onHide,
  closable = false,
  showProgressBar = false,
  style,
  testID,
}: ToastProps) {
  const { currentTheme } = useTheme();
  const { responsive } = useResponsive();
  const isDark = currentTheme === 'dark';
  const opacity = React.useRef(new Animated.Value(0)).current;
  
  // Tipografia responsiva
  const messageTypography = getResponsiveValues('body-md');
  const descriptionTypography = getResponsiveValues('body-sm');
  const offset = React.useRef(new Animated.Value(position.includes('top') ? -20 : 20)).current;
  const progressAnim = React.useRef(new Animated.Value(1)).current;
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const isNative = Platform.OS !== 'web';
  const statusBarHeight = StatusBar.currentHeight || 0;
  const insets = useSafeAreaInsets();
  
  // A altura total da tela para posicionamento absoluto
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  // Simplifica a posição para ambientes nativos (só usando top e bottom)
  const getNativePosition = (): ToastPosition => {
    if (isNative) {
      if (position.includes('top')) {
        return 'top';
      } else {
        return 'bottom';
      }
    }
    return position;
  };
  
  const effectivePosition = isNative ? getNativePosition() : position;
  
  // Configurações visuais baseadas no tipo
  const toastConfig = useMemo(() => ({
    success: {
      backgroundColor: isDark ? 'bg-success-bg-dark' : 'bg-success-bg-light',
      textColor: isDark ? 'text-success-text-dark' : 'text-success-text-light',
      borderColor: 'border-gray-200 dark:border-gray-700',
      icon: () => <CheckCircle size={20} color={isDark ? colors['success-icon-dark'] : colors['success-icon-light']} />,
    },
    error: {
      backgroundColor: isDark ? 'bg-error-bg-dark' : 'bg-error-bg-light',
      textColor: isDark ? 'text-error-text-dark' : 'text-error-text-light',
      borderColor: 'border-gray-200 dark:border-gray-700',
      icon: () => <AlertCircle size={20} color={isDark ? colors['error-icon-dark'] : colors['error-icon-light']} />,
    },
    warning: {
      backgroundColor: isDark ? 'bg-warning-bg-dark' : 'bg-warning-bg-light',
      textColor: isDark ? 'text-warning-text-dark' : 'text-warning-text-light',
      borderColor: 'border-gray-200 dark:border-gray-700',
      icon: () => <AlertTriangle size={20} color={isDark ? colors['warning-icon-dark'] : colors['warning-icon-light']} />,
    },
    info: {
      backgroundColor: isDark ? 'bg-info-bg-dark' : 'bg-info-bg-light',
      textColor: isDark ? 'text-info-text-dark' : 'text-info-text-light',
      borderColor: 'border-gray-200 dark:border-gray-700',
      icon: () => <Info size={20} color={isDark ? colors['info-icon-dark'] : colors['info-icon-light']} />,
    },
  }), [isDark]);

  // Calcula posição baseada na prop position
  const getPositionStyle = (): ViewStyle => {
    // Em plataformas web, usamos posição fixa para evitar problemas com scroll
    // Em plataformas nativas, usamos position absolute com valores que colocam o toast sobre tudo
    const positionType = Platform.OS === 'web' ? 'fixed' : 'absolute';
    
    const basePositionStyle: ViewStyle = {
      position: positionType as any,
      zIndex: 9999,
      elevation: 9999, // Para Android
      width: isNative ? screenWidth * 0.9 : (isMobile ? '90%' : 400),
    };

    // No ambiente nativo, precisamos posicionar o componente de forma absoluta na tela inteira
    if (isNative) {
      // Centralizar horizontalmente
      basePositionStyle.left = screenWidth * 0.05; // 5% da largura da tela
      
      if (effectivePosition === 'top') {
        // Topo da tela, considerando a área segura
        basePositionStyle.top = insets.top + 10;
      } else {
        // Base da tela, considerando a área segura
        basePositionStyle.bottom = insets.bottom + 60; // Considerando a TabBar
      }
    } else {
      // Posições horizontais para web
      if (effectivePosition.includes('left')) {
        basePositionStyle.left = isMobile ? 16 : 24;
        basePositionStyle.right = 'auto';
      } else if (effectivePosition.includes('right')) {
        basePositionStyle.right = isMobile ? 16 : 24;
        basePositionStyle.left = 'auto';
      } else {
        // Centralizado
        basePositionStyle.left = isMobile ? '5%' : '50%';
        basePositionStyle.right = 'auto';
        basePositionStyle.marginLeft = isMobile ? 0 : -200; // metade da largura para centralizar
      }

      // Posições verticais para web
      if (effectivePosition.includes('top')) {
        basePositionStyle.top = isMobile ? 80 : 24;
        basePositionStyle.bottom = 'auto';
      } else {
        basePositionStyle.bottom = isMobile ? 80 : 24;
        basePositionStyle.top = 'auto';
      }
    }

    return basePositionStyle;
  };

  // Animações de entrada e saída
  useEffect(() => {
    if (visible) {
      // Reset initial position for animation
      offset.setValue(effectivePosition.includes('top') ? -20 : 20);
      progressAnim.setValue(1); // Reset progress animation
      
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Auto-hide after duration (if duration > 0)
      if (duration > 0) {
        // Animar a barra de progresso
        if (showProgressBar) {
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: false, // Não pode usar useNativeDriver para width
          }).start();
        }

        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, showProgressBar]);

  // Função para esconder o toast com animação
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: effectivePosition.includes('top') ? -20 : 20,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide();
    });
  };

  const handleClose = () => {
    hideToast();
  };

  // Função para renderizar a barra de progresso
  const renderProgressBar = () => {
    if (!showProgressBar || duration <= 0) return null;

    const progressBarColor = {
      success: isDark ? colors['success-icon-dark'] : colors['success-icon-light'],
      error: isDark ? colors['error-icon-dark'] : colors['error-icon-light'],
      warning: isDark ? colors['warning-icon-dark'] : colors['warning-icon-light'],
      info: isDark ? colors['info-icon-dark'] : colors['info-icon-light'],
    };
    
    return (
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: progressBarColor[type]
            }
          ]} 
        />
      </View>
    );
  };

  if (!visible) return null;

  const transformStyle = {
    transform: [{ translateY: offset }],
  };

  // Em plataformas nativas, vamos usar o Portal para garantir que o toast seja exibido corretamente
  if (isNative && visible) {
    // O conteúdo do Toast para ambiente nativo
    const toastContent = (
      <Animated.View
        testID={testID || `toast-${type}`}
        style={[
          { 
            position: 'absolute',
            width: screenWidth * 0.9,
            left: screenWidth * 0.05,
            zIndex: 9999,
            elevation: 9999,
            ...(effectivePosition === 'top' 
              ? { top: insets.top + 10 } 
              : { bottom: insets.bottom + 60 }),
            opacity,
            transform: [{ translateY: offset }]
          },
          style,
        ]}
      >
        <View 
          className={`${toastConfig[type].backgroundColor} border ${toastConfig[type].borderColor} rounded-lg overflow-hidden`}
          style={[styles.container, {
            shadowColor: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.2 : 0.1,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: isDark ? 0.5 : 0.7,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            backgroundColor: isDark ? 
              (type === 'success' ? colors['success-bg-dark'] : 
               type === 'error' ? colors['error-bg-dark'] : 
               type === 'warning' ? colors['warning-bg-dark'] : 
               colors['info-bg-dark']) : 
              (type === 'success' ? colors['success-bg-light'] : 
               type === 'error' ? colors['error-bg-light'] : 
               type === 'warning' ? colors['warning-bg-light'] : 
               colors['info-bg-light']),
          }]}
        >
          <View style={styles.contentContainer}>
            <View style={styles.iconContainer}>
              {toastConfig[type].icon()}
            </View>
            
            <View style={styles.textContainer}>
              <Text 
                className={`${toastConfig[type].textColor} font-jakarta-semibold`}
                style={[
                  styles.message,
                  {
                    fontSize: responsive(messageTypography.fontSize),
                    lineHeight: responsive(messageTypography.lineHeight),
                    fontFamily: messageTypography.fontFamily,
                  }
                ]}
                numberOfLines={2}
              >
                {message}
              </Text>
              
              {description ? (
              <Text 
                className={`${toastConfig[type].textColor} opacity-90 font-jakarta-regular`}
                style={[
                  styles.description,
                  {
                    fontSize: responsive(descriptionTypography.fontSize),
                    lineHeight: responsive(descriptionTypography.lineHeight),
                    fontFamily: descriptionTypography.fontFamily,
                  }
                ]}
                numberOfLines={3}
              >
                {description}
              </Text>
              ) : null}
            </View>
            
            {closable && (
              <Pressable 
                onPress={handleClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityLabel="Fechar notificação"
              >
                <X 
                  size={16} 
                  color={isDark ? 
                    (type === 'info' ? colors['info-icon-dark'] : 
                     type === 'success' ? colors['success-icon-dark'] : 
                     type === 'warning' ? colors['warning-icon-dark'] : 
                     colors['error-icon-dark']) : 
                    (type === 'info' ? colors['info-icon-light'] : 
                     type === 'success' ? colors['success-icon-light'] : 
                     type === 'warning' ? colors['warning-icon-light'] : 
                     colors['error-icon-light'])
                  } 
                />
              </Pressable>
            )}
          </View>
          {renderProgressBar()}
        </View>
      </Animated.View>
    );

    // Usar o Portal para renderizar o Toast fora da hierarquia atual
    return <Portal>{toastContent}</Portal>;
  }

  // No web, renderizamos em um portal para garantir que o Toast esteja fora de qualquer
  // container com scrolling ou com position: relative
  if (Platform.OS === 'web' && visible) {
    // Utilizamos React Portal em ambientes web para posicionar o Toast corretamente
    // Esta parte só é executada se react-dom estiver disponível (web)
    try {
      const ReactDOM = require('react-dom');
      const portalContainer = document.getElementById('toast-portal-container');
      
      if (!portalContainer) {
        const newPortalContainer = document.createElement('div');
        newPortalContainer.id = 'toast-portal-container';
        newPortalContainer.style.position = 'fixed';
        newPortalContainer.style.zIndex = '9999';
        newPortalContainer.style.pointerEvents = 'none';
        newPortalContainer.style.top = '0';
        newPortalContainer.style.left = '0';
        newPortalContainer.style.right = '0';
        newPortalContainer.style.bottom = '0';
        document.body.appendChild(newPortalContainer);
      }

      const toastContent = (
        <Animated.View
          testID={testID || `toast-${type}`}
          style={[
            getPositionStyle(),
            transformStyle,
            { opacity, pointerEvents: 'auto' as any },
            style,
          ]}
        >
          <View 
            className={`${toastConfig[type].backgroundColor} border ${toastConfig[type].borderColor} rounded-lg overflow-hidden`}
            style={[styles.container, {
              shadowColor: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.2 : 0.1,
              shadowRadius: 10,
              elevation: 10,
              borderWidth: isDark ? 0.5 : 0.7,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              backgroundColor: isDark ? 
                (type === 'success' ? colors['success-bg-dark'] : 
                 type === 'error' ? colors['error-bg-dark'] : 
                 type === 'warning' ? colors['warning-bg-dark'] : 
                 colors['info-bg-dark']) : 
                (type === 'success' ? colors['success-bg-light'] : 
                 type === 'error' ? colors['error-bg-light'] : 
                 type === 'warning' ? colors['warning-bg-light'] : 
                 colors['info-bg-light']),
            }]}
          >
            <View style={styles.contentContainer}>
              <View style={styles.iconContainer}>
                {toastConfig[type].icon()}
              </View>
              
              <View style={styles.textContainer}>
                <Text 
                  className={`${toastConfig[type].textColor} font-jakarta-semibold`}
                  style={[
                    styles.message,
                    {
                      fontSize: responsive(messageTypography.fontSize),
                      lineHeight: responsive(messageTypography.lineHeight),
                      fontFamily: messageTypography.fontFamily,
                    }
                  ]}
                  numberOfLines={2}
                >
                  {message}
                </Text>
                
                {description ? (
                  <Text 
                    className={`${toastConfig[type].textColor} opacity-90 font-jakarta-regular`}
                    style={[
                      styles.description,
                      {
                        fontSize: responsive(descriptionTypography.fontSize),
                        lineHeight: responsive(descriptionTypography.lineHeight),
                        fontFamily: descriptionTypography.fontFamily,
                      }
                    ]}
                    numberOfLines={3}
                  >
                    {description}
                  </Text>
                ) : null}
              </View>
              
              {closable && (
                <Pressable 
                  onPress={handleClose} 
                  style={styles.closeButton}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  accessibilityLabel="Fechar notificação"
                >
                  <X 
                    size={16} 
                    color={isDark ? 
                      (type === 'info' ? colors['info-icon-dark'] : 
                       type === 'success' ? colors['success-icon-dark'] : 
                       type === 'warning' ? colors['warning-icon-dark'] : 
                       colors['error-icon-dark']) : 
                      (type === 'info' ? colors['info-icon-light'] : 
                       type === 'success' ? colors['success-icon-light'] : 
                       type === 'warning' ? colors['warning-icon-light'] : 
                       colors['error-icon-light'])
                    } 
                  />
                </Pressable>
              )}
            </View>
            {renderProgressBar()}
          </View>
        </Animated.View>
      );

      const portalTarget = document.getElementById('toast-portal-container');
      if (portalTarget) {
        return ReactDOM.createPortal(toastContent, portalTarget);
      }
    } catch (e) {
      // Fallback para quando react-dom não estiver disponível
      console.log('React DOM not available, using standard rendering');
    }
  }

  // Fallback para casos onde não se aplica nem web nem nativo com configuração especial
  return (
    <Animated.View
      testID={testID || `toast-${type}`}
      style={[
        getPositionStyle(),
        transformStyle,
        { opacity },
        style,
      ]}
    >
      <View 
        className={`${toastConfig[type].backgroundColor} border ${toastConfig[type].borderColor} rounded-lg overflow-hidden`}
        style={[styles.container, {
          shadowColor: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 10,
          elevation: 10,
          borderWidth: isDark ? 0.5 : 0.7,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          backgroundColor: isDark ? 
            (type === 'success' ? colors['success-bg-dark'] : 
             type === 'error' ? colors['error-bg-dark'] : 
             type === 'warning' ? colors['warning-bg-dark'] : 
             colors['info-bg-dark']) : 
            (type === 'success' ? colors['success-bg-light'] : 
             type === 'error' ? colors['error-bg-light'] : 
             type === 'warning' ? colors['warning-bg-light'] : 
             colors['info-bg-light']),
        }]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            {toastConfig[type].icon()}
          </View>
          
          <View style={styles.textContainer}>
            <Text 
              className={`${toastConfig[type].textColor} font-jakarta-semibold`}
              style={[
                styles.message,
                {
                  fontSize: responsive(messageTypography.fontSize),
                  lineHeight: responsive(messageTypography.lineHeight),
                  fontFamily: messageTypography.fontFamily,
                }
              ]}
              numberOfLines={2}
            >
              {message}
            </Text>
            
            {description ? (
              <Text 
                className={`${toastConfig[type].textColor} opacity-90 font-jakarta-regular`}
                style={[
                  styles.description,
                  {
                    fontSize: responsive(descriptionTypography.fontSize),
                    lineHeight: responsive(descriptionTypography.lineHeight),
                    fontFamily: descriptionTypography.fontFamily,
                  }
                ]}
                numberOfLines={3}
              >
                {description}
              </Text>
            ) : null}
          </View>
          
          {closable && (
            <Pressable 
              onPress={handleClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityLabel="Fechar notificação"
            >
              <X 
                size={16} 
                color={isDark ? 
                  (type === 'info' ? colors['info-icon-dark'] : 
                   type === 'success' ? colors['success-icon-dark'] : 
                   type === 'warning' ? colors['warning-icon-dark'] : 
                   colors['error-icon-dark']) : 
                  (type === 'info' ? colors['info-icon-light'] : 
                   type === 'success' ? colors['success-icon-light'] : 
                   type === 'warning' ? colors['warning-icon-light'] : 
                   colors['error-icon-light'])
                } 
              />
            </Pressable>
          )}
        </View>
        {renderProgressBar()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 450,
    minHeight: 48,
    backdropFilter: Platform.OS === 'web' ? 'blur(8px)' : undefined,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontWeight: '600',
    marginTop: 0,
  },
  description: {
    marginTop: 4,
    opacity: 0.85,
  },
  closeButton: {
    padding: 4,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressBar: {
    height: '100%',
  },
}); 