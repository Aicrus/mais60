import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Pressable, Platform, Dimensions, ViewStyle, Text } from 'react-native';
import { LogOut, Settings, Sun, Moon } from 'lucide-react-native';
import { HoverableView } from '../effects/HoverableView';
import { useTheme } from '../../hooks/DesignSystemContext';
import { LucideIcon } from 'lucide-react-native';
import { useAuth } from '../../contexts/auth';
import { router } from 'expo-router';
import { useResponsive } from '../../hooks/useResponsive';
import { createPortal } from 'react-dom';

/**
 * @component ProfileMenu
 * @description Componente de menu de perfil que exibe informações do usuário
 * e opções como configuração do tema e logout.
 * 
 * Recursos:
 * - Animação de fade e deslizamento
 * - Seleção de tema (claro, escuro, sistema)
 * - Efeitos hover nos itens do menu
 * - Compatibilidade com web e mobile
 * - Adaptação automática ao tema (claro/escuro)
 * - Posicionamento dinâmico próximo ao elemento que o invocou
 * - Portal para renderização no DOM (Web)
 */

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

export interface ProfileMenuProps {
  /** Controla a visibilidade do menu */
  isVisible: boolean;
  /** Função chamada quando o usuário fecha o menu */
  onClose: () => void;
  /** Função chamada para navegação entre rotas */
  onNavigate?: (route: string) => void;
  /** Posição onde o menu deve ser exibido (coordenadas x, y) */
  position?: { x: number, y: number };
}

// Importar cores diretamente do design system (mais confiável)
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';

export function ProfileMenu({ 
  isVisible, 
  onClose, 
  onNavigate,
  position
}: ProfileMenuProps) {
  const { currentTheme, themeMode, setThemeMode } = useTheme();
  const { session, signOut } = useAuth();
  const { isMobile, responsive } = useResponsive();
  const isDark = currentTheme === 'dark';
  
  // Tipografia responsiva
  const nameTypography = getResponsiveValues('body-md');
  const emailTypography = getResponsiveValues('body-sm');
  const sectionTitleTypography = getResponsiveValues('body-sm');
  const themeTextTypography = getResponsiveValues('body-xs');
  const menuItemTypography = getResponsiveValues('body-md');
  
  // Valores de animação
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  
  // Mapeamento de cores dinâmico usando o design system
  const themeColors = {
    'primary': isDark ? colors['primary-dark'] : colors['primary-light'],
    'primary-hover': isDark ? colors['primary-dark-hover'] : colors['primary-light-hover'],
    'primary-active': isDark ? colors['primary-dark-active'] : colors['primary-light-active'],
    'bg-secondary': isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    'divider': isDark ? colors['divider-dark'] : colors['divider-light'],
    'text-primary': isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    'text-secondary': isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    'text-tertiary': isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
  };

  // Executa animação quando a visibilidade muda
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 10,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Bloquear scroll da página quando dropdown está aberto (web)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const originalStyle = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        height: document.body.style.height,
        paddingRight: document.body.style.paddingRight
      };
      
      const scrollY = window.scrollY;
      
      if (isVisible) {
        // Salvar a posição atual de scroll
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        
        // Prevenir o salto causado pelo scrollbar desaparecendo
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        
        return () => {
          // Restaurar o estilo original
          document.body.style.overflow = originalStyle.overflow;
          document.body.style.position = originalStyle.position;
          document.body.style.top = originalStyle.top;
          document.body.style.width = originalStyle.width;
          document.body.style.height = originalStyle.height;
          document.body.style.paddingRight = originalStyle.paddingRight;
          
          // Restaurar a posição de scroll
          window.scrollTo(0, scrollY);
        };
      }
    }
  }, [isVisible]);

  // Adicionar estilos para garantir que elementos com position:fixed não sejam cortados
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        /* Garantir que elementos com position:fixed não sejam cortados */
        *, *::before, *::after {
          transform-style: preserve-3d;
        }
        
        /* Garantir que elementos com position:fixed tenham o maior z-index possível */
        body > [style*="position: fixed"] {
          z-index: 2147483647 !important;
          isolation: isolate;
        }
        
        /* Estilos para menu de perfil */
        [data-profile-menu="true"] {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!isVisible) return null;

  const MenuItem = ({ icon: Icon, label, onClick, color = themeColors['text-primary'] }: MenuItemProps) => (
    <HoverableView
      style={styles.menuItem}
      onPress={onClick}
      hoverScale={1.01}
    >
      <Icon size={18} color={color} strokeWidth={1.5} />
      <Text style={[styles.menuItemText, { color: themeColors['text-primary'] }]}>{label}</Text>
    </HoverableView>
  );

  const getThemeOptionStyle = (isSelected: boolean): ViewStyle => ({
    ...styles.themeOption,
    ...(isSelected ? { backgroundColor: themeColors['primary'] + '15' } : {})
  });

  // Determinar a posição com base nas coordenadas fornecidas
  const getPositionStyle = () => {
    if (position && Platform.OS === 'web') {
      // Se temos uma posição definida pelo usuário e estamos na web
      const windowWidth = Dimensions.get('window').width;
      const menuWidth = isMobile ? Math.min(220, windowWidth * 0.85) : 220;
      
      // Calcular posição horizontal mantendo o menu dentro da tela
      const leftPosition = Math.max(16, Math.min(position.x - (menuWidth / 2), windowWidth - menuWidth - 16));
      
      // Altura definida para a viewport
      const windowHeight = window.innerHeight;
      
      // Define valores para posicionamento
      const spacingDown = 5;
      
      // Calcula se o menu cabe abaixo da posição
      const menuHeight = 320; // Altura aproximada do menu
      const spaceBelow = windowHeight - position.y;
      const fitsBelow = spaceBelow >= (menuHeight + spacingDown);
      
      if (fitsBelow) {
        // O menu cabe abaixo do botão
        return {
          position: 'fixed' as 'fixed',
          top: position.y + spacingDown,
          left: leftPosition,
          zIndex: 2147483647,
        };
      } else {
        // O menu não cabe abaixo, então vamos posicioná-lo acima
        const spacingUp = 5;
        
        // Posição Y acima do elemento
        const topPosition = Math.max(16, position.y - menuHeight - spacingUp);
        
        return {
          position: 'fixed' as 'fixed',
          top: topPosition,
          left: leftPosition,
          zIndex: 2147483647,
        };
      }
    }
    
    // Posicionamento para ambiente nativo (posições fixas conforme especificação)
    // Ou posição padrão para web sem position
    return Platform.select({
      web: {
        position: 'fixed' as 'fixed',
        top: 60,
        right: 20,
        zIndex: 2147483647,
      },
      default: {
        position: 'absolute' as 'absolute',
        right: 16,
        width: 200,
        top: -10,
        zIndex: 2147483647,
      }
    });
  };

  // Estilos responsivos para posicionamento no mobile vs web
  const responsiveStyles = {
    overlay: {
      ...Platform.select({
        web: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2147483646,
          backgroundColor: 'transparent'
        },
        default: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          zIndex: 2147483646,
          backgroundColor: 'transparent'
        }
      }) as any
    },
    container: getPositionStyle() as any
  };
  
  // Componente interno que será renderizado
  const MenuContent = () => (
    <View style={{ 
      position: Platform.OS === 'web' ? 'fixed' : 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 9999 
    }}>
      {/* Overlay para fechar o menu ao clicar fora */}
      <Pressable
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
        onPress={onClose}
      />
      
      {/* Menu de perfil */}
      <View style={Platform.OS !== 'web' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        backgroundColor: 'transparent',
      } : {}}>
        <Animated.View
          style={[
            styles.container,
            responsiveStyles.container,
            {
              backgroundColor: themeColors['bg-secondary'],
              borderColor: themeColors['divider'],
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
              width: isMobile ? (Platform.OS === 'web' ? '85%' : 200) : 220,
              maxWidth: Platform.OS === 'web' ? 220 : undefined,
            },
          ]}
          data-profile-menu="true"
        >
          {/* Cabeçalho do Perfil */}
          <View style={styles.profileHeader}>
            <Text style={[
              styles.name, 
              { 
                color: themeColors['text-primary'],
                fontSize: responsive(nameTypography.fontSize),
                fontFamily: nameTypography.fontFamily,
              }
            ]}>
              {session?.user?.user_metadata?.display_name || session?.user?.user_metadata?.name || 'Usuário'}
            </Text>
            <Text style={[
              styles.email, 
              { 
                color: themeColors['text-secondary'],
                fontSize: responsive(emailTypography.fontSize),
                fontFamily: emailTypography.fontFamily,
              }
            ]}>
              {session?.user?.email || 'email@exemplo.com'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors['divider'] }]} />

          {/* Opções de Tema (apenas Claro/Escuro) */}
          <View style={styles.themeSection}>
            <Text style={[styles.sectionTitle, { color: themeColors['text-primary'] }]}>Tema</Text>
            <View style={styles.themeOptions}>
              <HoverableView
                style={getThemeOptionStyle(themeMode === 'light')}
                onPress={() => setThemeMode('light')}
              >
                <Sun size={16} color={themeMode === 'light' ? themeColors['primary'] : themeColors['text-primary']} />
                <Text style={[
                  styles.themeText,
                  { color: themeMode === 'light' ? themeColors['primary'] : themeColors['text-primary'] }
                ]}>Claro</Text>
              </HoverableView>

              <HoverableView
                style={getThemeOptionStyle(themeMode === 'dark')}
                onPress={() => setThemeMode('dark')}
              >
                <Moon size={16} color={themeMode === 'dark' ? themeColors['primary'] : themeColors['text-primary']} />
                <Text style={[
                  styles.themeText,
                  { color: themeMode === 'dark' ? themeColors['primary'] : themeColors['text-primary'] }
                ]}>Escuro</Text>
              </HoverableView>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors['divider'] }]} />

          {/* Menu Items */}
          <MenuItem
            icon={Settings}
            label="Configurações"
            onClick={() => {
              if (onNavigate) {
                onNavigate('/config');
                onClose();
              } else {
                router.push('/config' as any);
                onClose();
              }
            }}
          />
          <MenuItem
            icon={LogOut}
            label="Sair"
            onClick={handleLogout}
            color={themeColors['primary']}
          />
        </Animated.View>
      </View>
    </View>
  );

  // Usando createPortal para renderizar diretamente no body (apenas web)
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return createPortal(
      <MenuContent />,
      document.body
    );
  }
  
  // Renderização normal para plataformas não-web
  return <MenuContent />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
  },
  profileHeader: {
    padding: 12,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    opacity: 0.7,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  themeSection: {
    padding: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 4,
    paddingTop: 8,
    borderRadius: 8,
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  themeText: {
    // fontSize aplicado dinamicamente no componente
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  menuItemText: {
    // fontSize aplicado dinamicamente no componente
  },
}); 