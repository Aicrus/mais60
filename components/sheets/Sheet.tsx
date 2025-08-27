import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, Platform, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';

export type SheetPosition = 'top' | 'right' | 'bottom' | 'left';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  position?: SheetPosition;
  children?: React.ReactNode;
  overlayOpacity?: number;
  height?: number | string;
  width?: number | string;
  borderRadius?: number;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  animationDuration?: number;
  useSafeArea?: boolean;
  testID?: string;
  contentContainerStyle?: any;
}

/**
 * Componente Sheet - Modal deslizante que pode ser aberto de qualquer direção.
 * 
 * Características:
 * - Compatível com temas claro/escuro
 * - Responsivo para todos os dispositivos e breakpoints
 * - Suporta abertura de 4 direções: top, right, bottom, left
 * - Animações suaves de abertura e fechamento
 * - Safe Area para dispositivos com notch/island
 * - Overlay personalizável
 * 
 * @example
 * // Exemplo básico de uso:
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Button onPress={() => setIsOpen(true)}>
 *   Abrir Sheet
 * </Button>
 * 
 * <Sheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   position="bottom"
 *   showCloseButton={true}
 * >
 *   <View style={{ padding: 16 }}>
 *     <Text>Conteúdo do Sheet</Text>
 *   </View>
 * </Sheet>
 */
const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  position = 'bottom',
  children,
  overlayOpacity = 0.5,
  height,
  width,
  borderRadius = 16,
  closeOnOverlayClick = true,
  showCloseButton = true,
  animationDuration = 300,
  useSafeArea = true,
  testID,
  contentContainerStyle,
}) => {
  // Usando o hook useTheme do contexto de tema da aplicação
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Responsividade
  const { responsive } = useResponsive();
  
  // Tipografia responsiva
  const buttonTypography = getResponsiveValues('body-md');
  
  // Usando cores diretamente do design system
  
  // Valores de padding para diferentes plataformas
  const webPadding = 20;
  const nativePadding = 10;
  
  const animation = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [dimensions, setDimensions] = useState({ width: windowWidth, height: windowHeight });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription.remove();
  }, []);

  // Verifica se estamos em um dispositivo móvel ou tablet baseado na largura da tela
  const isMobileOrTablet = Platform.OS !== 'web' || dimensions.width < 768;

  // Define valores padrão com base no tipo de dispositivo
  const getDefaultSize = () => {
    if (Platform.OS !== 'web') {
      // Valores para dispositivos nativos (iOS/Android)
      return {
        top: 450,
        bottom: 450,
        left: 280,
        right: 280
      };
    } else if (isMobileOrTablet) {
      // Valores para web mobile/tablet
      return {
        top: '450px',
        bottom: '450px',
        left: '280px',
        right: '280px'
      };
    } else {
      // Valores para web desktop
      return {
        top: '380px',
        bottom: '380px',
        left: '300px',
        right: '300px'
      };
    }
  };

  // Usar sempre a posição original, sem forçar 'bottom' em dispositivos móveis
  const finalPosition = position;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => {
        // Só esconde o modal depois que a animação de fechamento terminar
        setVisible(false);
      });
    }
  }, [isOpen, animation, animationDuration]);

  // Configurações de animação e estilo com base na posição
  const getAnimatedStyle = () => {
    const translateValue = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [getInitialTranslate(), 0],
    });

    const animationStyle = {
      top: finalPosition === 'top' ? { transform: [{ translateY: translateValue }] } : undefined,
      bottom: finalPosition === 'bottom' ? { transform: [{ translateY: translateValue }] } : undefined,
      left: finalPosition === 'left' ? { transform: [{ translateX: translateValue }] } : undefined,
      right: finalPosition === 'right' ? { transform: [{ translateX: translateValue }] } : undefined,
    };

    return animationStyle[finalPosition];
  };

  const getInitialTranslate = () => {
    switch (finalPosition) {
      case 'top':
        return -1000;
      case 'bottom':
        return 1000;
      case 'left':
        return -1000;
      case 'right':
        return 1000;
      default:
        return 0;
    }
  };

  // Estilo do container com base na posição
  const getContainerStyle = () => {
    const isVertical = finalPosition === 'top' || finalPosition === 'bottom';
    const isHorizontal = finalPosition === 'left' || finalPosition === 'right';
    const defaultSizes = getDefaultSize();

    // Valores padrão baseados na posição e tipo de dispositivo
    const containerStyle: any = {
      width: isVertical ? '100%' : (width || defaultSizes[finalPosition]),
      height: isHorizontal ? '100%' : (height || defaultSizes[finalPosition]),
    };

    // Convertemos strings com 'px' para números em ambientes nativos
    if (Platform.OS !== 'web') {
      if (typeof containerStyle.width === 'string' && containerStyle.width.endsWith('px')) {
        containerStyle.width = parseFloat(containerStyle.width);
      }
      if (typeof containerStyle.height === 'string' && containerStyle.height.endsWith('px')) {
        containerStyle.height = parseFloat(containerStyle.height);
      }
    }

    // Ajustes de borda baseados na posição
    switch (finalPosition) {
      case 'top':
        containerStyle.borderBottomLeftRadius = borderRadius;
        containerStyle.borderBottomRightRadius = borderRadius;
        break;
      case 'bottom':
        containerStyle.borderTopLeftRadius = borderRadius;
        containerStyle.borderTopRightRadius = borderRadius;
        break;
      case 'left':
        containerStyle.borderTopRightRadius = borderRadius;
        containerStyle.borderBottomRightRadius = borderRadius;
        break;
      case 'right':
        containerStyle.borderTopLeftRadius = borderRadius;
        containerStyle.borderBottomLeftRadius = borderRadius;
        break;
      default:
        break;
    }

    return containerStyle;
  };

  const getPositionStyle = () => {
    switch (finalPosition) {
      case 'top':
        return styles.topContainer;
      case 'right':
        return styles.rightContainer;
      case 'bottom':
        return styles.bottomContainer;
      case 'left':
        return styles.leftContainer;
      default:
        return styles.bottomContainer;
    }
  };

  const overlayAnimatedStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, overlayOpacity],
    }),
  };

  // Define o padding de segurança para dispositivos com notch/island
  const getSafeAreaPadding = () => {
    if (!useSafeArea) {
      return {};
    }

    // Aplicar padding tanto para dispositivos nativos quanto para web
    switch (finalPosition) {
      case 'top':
        return { paddingTop: Platform.OS === 'web' ? webPadding : nativePadding };
      case 'bottom':
        // Para a posição bottom, vamos garantir que o padding seja suficiente
        // Em dispositivos iOS com notch na parte inferior, isso é especialmente importante
        return { 
          paddingBottom: Platform.OS === 'web' 
            ? webPadding * 2 // Dobrar o padding para web
            : (isIOS ? nativePadding * 4 : nativePadding * 2) // Padding muito maior para iOS
        };
      case 'left':
      case 'right':
        return { paddingTop: Platform.OS === 'web' ? webPadding : nativePadding };
      default:
        return {};
    }
  };

  // Obtenha as cores baseadas no tema atual
  const getThemeColors = () => {
    return {
      background: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
      text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
      closeButtonBackground: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'],
      closeButtonText: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
      contentBackground: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light'],
    };
  };

  const themeColors = getThemeColors();

  // Verificar se estamos no iOS
  const isIOS = Platform.OS === 'ios';

  // Se não estiver visível nem aberto, não renderize nada
  if (!visible && !isOpen) return null;

  // Renderiza o conteúdo com SafeAreaView se useSafeArea estiver ativado
  const renderContent = () => {
    const safeAreaPadding = getSafeAreaPadding();
    
    // Para a posição 'bottom', aplicar o padding diretamente na View
    const contentStyle = [
      { flex: 1 },
      safeAreaPadding,
      contentContainerStyle
    ];
    
    // Limpamos os ajustes extras de padding pois já estão na função getSafeAreaPadding
    
    const contentWrapper = (
      <View style={contentStyle}>
        {showCloseButton && (
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: themeColors.closeButtonBackground,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }
            ]}
            onPress={onClose}
            testID={`${testID}-close-button`}
          >
            <Text style={[
              styles.closeButtonText,
              {
                color: themeColors.closeButtonText,
                fontSize: responsive(buttonTypography.fontSize),
                fontFamily: buttonTypography.fontFamily,
                lineHeight: responsive(buttonTypography.lineHeight),
              }
            ]}>✕</Text>
          </TouchableOpacity>
        )}
        {children}
      </View>
    );
    
    // Em plataformas nativas, usar SafeAreaView
    if (useSafeArea && Platform.OS !== 'web') {
      // No iOS, usamos o SafeAreaView para todas as posições
      if (isIOS) {
        // Para bottom no iOS, garantimos paddingBottom mesmo com o SafeAreaView
        if (finalPosition === 'bottom') {
          return (
            <KeyboardAvoidingView 
              style={{ flex: 1 }} 
              behavior={isIOS ? "padding" : undefined}
              keyboardVerticalOffset={10}
            >
              <SafeAreaView style={{ flex: 1 }}>
                <View style={[contentStyle, { paddingBottom: nativePadding * 5 }]}>
                  {showCloseButton && (
                    <TouchableOpacity
                      style={[
                        styles.closeButton,
                        {
                          backgroundColor: themeColors.closeButtonBackground,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 4,
                          elevation: 5,
                        }
                      ]}
                      onPress={onClose}
                      testID={`${testID}-close-button`}
                    >
                      <Text style={[
                        styles.closeButtonText,
                        {
                          color: themeColors.closeButtonText,
                          fontSize: responsive(buttonTypography.fontSize),
                          fontFamily: buttonTypography.fontFamily,
                          lineHeight: responsive(buttonTypography.lineHeight),
                        }
                      ]}>✕</Text>
                    </TouchableOpacity>
                  )}
                  {children}
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          );
        }
      }
      return <SafeAreaView style={{ flex: 1 }}>{contentWrapper}</SafeAreaView>;
    }
    
    return contentWrapper;
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
      testID={testID}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[styles.overlay, overlayAnimatedStyle]}
          testID={`${testID}-overlay`}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={closeOnOverlayClick ? onClose : undefined}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            getPositionStyle(),
            getContainerStyle(),
            getAnimatedStyle(),
            {
              backgroundColor: themeColors.background,
            },
          ]}
          testID={`${testID}-content`}
        >
          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  overlayTouchable: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    overflow: 'hidden',
  },
  topContainer: {
    top: 0,
    left: 0,
    right: 0,
  },
  rightContainer: {
    top: 0,
    right: 0,
    bottom: 0,
  },
  bottomContainer: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  leftContainer: {
    top: 0,
    left: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
});

export default Sheet; 