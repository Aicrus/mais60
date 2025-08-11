import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Pressable, Platform, Dimensions, ScrollView, Text } from 'react-native';
import { Clock, DollarSign, Bell, ArrowUpRight } from 'lucide-react-native';
import { HoverableView } from '../effects/HoverableView';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { router } from 'expo-router';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';

/**
 * @component NotificationsMenu
 * @description Componente de menu de notificações que exibe uma lista de notificações
 * ao usuário. Possui uma animação suave de entrada e saída, e exibe notificações
 * com indicadores de leitura, ícones, títulos, descrições e timestamps.
 * 
 * As notificações são sensíveis ao tema atual da aplicação, adaptando suas cores
 * para modo claro ou escuro automaticamente.
 * 
 * Recursos:
 * - Animação de fade e deslizamento
 * - Indicador visual para notificações não lidas
 * - Efeitos hover nas notificações
 * - ScrollView para listar todas as notificações
 * - Compatibilidade com web e mobile
 * - Adaptação automática ao tema (claro/escuro)
 * - Posicionamento dinâmico próximo ao elemento que o invocou
 * - Bloqueio de scroll na página quando aberto (mantendo scroll interno)
 */

export interface NotificationItem {
  id: number | string;
  icon: any; // Componente do ícone
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface NotificationsMenuProps {
  /** Controla a visibilidade do menu */
  isVisible: boolean;
  /** Função chamada quando o usuário fecha o menu */
  onClose: () => void;
  /** Lista de notificações para exibir */
  notifications?: NotificationItem[];
  /** Texto do link no rodapé */
  viewAllText?: string;
  /** Função chamada quando o usuário clica no link de ver todas as notificações */
  onViewAll?: () => void;
  /** Título do menu de notificações */
  title?: string;
  /** Subtítulo do menu de notificações */
  subtitle?: string;
  /** Posição onde o menu deve ser exibido (coordenadas x, y) */
  position?: Position;
  /** Rota para navegar ao clicar em "Ver todas as notificações" */
  viewAllRoute?: string;
  /** Altura máxima da lista de notificações */
  maxHeight?: number;
}

// Notificações de exemplo para demonstração
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    icon: DollarSign,
    title: 'Nova transação recebida',
    description: 'Você recebeu uma transferência de R$ 1.500,00',
    time: '2 min atrás',
    isUnread: true,
  },
  {
    id: 2,
    icon: Bell,
    title: 'Lembrete de meta',
    description: 'Sua meta "Viagem para Europa" está próxima do prazo',
    time: '1 hora atrás',
    isUnread: true,
  },
  {
    id: 3,
    icon: ArrowUpRight,
    title: 'Limite do cartão atualizado',
    description: 'Seu limite foi aumentado para R$ 15.000,00',
    time: '3 horas atrás',
    isUnread: false,
  },
  {
    id: 4,
    icon: Clock,
    title: 'Fatura próxima do vencimento',
    description: 'Sua fatura vence em 3 dias',
    time: '5 horas atrás',
    isUnread: false,
  },
  {
    id: 5,
    icon: Bell,
    title: 'Novo recurso disponível',
    description: 'Agora você pode personalizar suas metas de investimento com mais opções',
    time: '1 dia atrás',
    isUnread: false,
  },
];

export function NotificationsMenu({ 
  isVisible, 
  onClose,
  notifications = DEFAULT_NOTIFICATIONS,
  viewAllText = "Ver todas as notificações",
  onViewAll,
  title = "Notificações",
  subtitle = "Últimas atualizações",
  position,
  viewAllRoute = '/notificacoes',
  maxHeight = 320
}: NotificationsMenuProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { isMobile, responsive } = useResponsive();
  
  // Tipografia responsiva
  const titleTypography = getResponsiveValues('body-md');
  const subtitleTypography = getResponsiveValues('body-sm');
  const notificationTitleTypography = getResponsiveValues('body-md');
  const notificationTimeTypography = getResponsiveValues('body-xs');
  const notificationDescTypography = getResponsiveValues('body-sm');
  const viewAllTypography = getResponsiveValues('body-md');
  
  // Valores de animação
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  
  // Ref para a lista de notificações
  const scrollViewRef = useRef<ScrollView>(null);

  // Cores para o tema atual
  const themeColors = {
    primary: isDark ? colors['primary-dark'] : colors['primary-light'],
    secondaryBackground: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    textTertiary: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
  };

  // Função para lidar com o clique em "Ver todas as notificações"
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (viewAllRoute) {
      // Navegação para a rota especificada
      router.push(viewAllRoute as any);
    }
    onClose();
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
  
  // Adicionar estilos CSS para web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = `notifications-menu-styles-${Math.random().toString(36).substr(2, 9)}`;
      const style = document.createElement('style');
      style.id = styleId;
      
      style.textContent = `
        /* Garantir que elementos com position:fixed não sejam cortados */
        *, *::before, *::after {
          transform-style: preserve-3d;
        }
        
        /* Garantir que o menu tenha o maior z-index possível */
        [data-notifications-menu="true"] {
          z-index: 2147483647 !important;
          isolation: isolate;
        }

        /* Customização do scrollbar dentro do menu */
        [data-notifications-content="true"]::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        [data-notifications-content="true"]::-webkit-scrollbar-track {
          background: transparent;
        }
        
        [data-notifications-content="true"]::-webkit-scrollbar-thumb {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
          border-radius: 3px;
        }
      `;
      
      document.head.appendChild(style);
      
      return () => {
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
      };
    }
  }, [isDark]);

  // Determinar a posição com base nas coordenadas fornecidas
  const getPositionStyle = () => {
    if (position && Platform.OS === 'web') {
      const menuWidth = 320;
      
      // Ajuste para posicionamento consistente em todos os breakpoints
      return {
        position: 'fixed' as 'fixed',
        top: position.y + 1, // Mesma altura do ProfileMenu
        right: 60, // Mais para a esquerda
        width: isMobile ? '90%' : menuWidth,
        maxWidth: menuWidth,
        zIndex: 4000,
      };
    }
    
    // Posicionamento padrão para mobile ou quando não há position
    return Platform.select({
      web: {
        position: 'fixed' as 'fixed',
        top: 60,
        right: 48, // Mais para a esquerda
        width: isMobile ? '90%' : 320,
        maxWidth: 320,
        zIndex: 4000,
      },
      default: {
        position: 'absolute' as 'absolute',
        right: 16,
        top: -10,
        width: 320,
        zIndex: 4000,
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
          zIndex: 3999,
          backgroundColor: 'transparent'
        },
        default: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          zIndex: 3999,
          backgroundColor: 'transparent'
        }
      }) as any
    },
    container: getPositionStyle() as any
  };

  // Não renderiza nada se não estiver visível
  if (!isVisible) return null;

  return (
    <View style={{ 
      position: Platform.OS === 'web' ? 'fixed' : 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 3999
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
      
      {/* Menu de notificações */}
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
              backgroundColor: themeColors.secondaryBackground,
              borderColor: themeColors.divider,
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
              ...(Platform.OS === 'web' && { 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
              }),
            },
          ]}
          data-notifications-menu="true"
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
          </View>

          {/* Divisor */}
          <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

          {/* Lista de notificações */}
          <ScrollView 
            ref={scrollViewRef}
            style={[styles.notificationsList, { maxHeight }]}
            showsVerticalScrollIndicator={false}
            data-notifications-content="true"
            nestedScrollEnabled={true}
          >
            {notifications.map((notification) => {
              // Definir o estilo de background diretamente
              const itemStyle = {
                ...styles.notificationItem,
                backgroundColor: notification.isUnread ? themeColors.primary + '08' : 'transparent',
              };
              
              return (
                <HoverableView
                  key={notification.id}
                  style={itemStyle}
                  hoverScale={1.01}
                >
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: themeColors.primary + '15' }
                  ]}>
                    <notification.icon
                      size={16}
                      color={themeColors.primary}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[
                        styles.notificationTitle, 
                        { color: themeColors.textPrimary }
                      ]}>
                        {notification.title}
                      </Text>
                      <Text style={[
                        styles.notificationTime, 
                        { color: themeColors.textTertiary }
                      ]}>
                        {notification.time}
                      </Text>
                    </View>
                    <Text style={[
                      styles.notificationDescription, 
                      { color: themeColors.textSecondary }
                    ]}>
                      {notification.description}
                    </Text>
                  </View>
                  {notification.isUnread && (
                    <View style={[
                      styles.unreadDot,
                      { backgroundColor: themeColors.primary }
                    ]} />
                  )}
                </HoverableView>
              );
            })}
          </ScrollView>

          {/* Divisor */}
          <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

          {/* Rodapé */}
          <HoverableView 
            style={styles.footer} 
            hoverScale={1.01}
            onPress={handleViewAll}
          >
            <Text style={[
              styles.viewAll, 
              { color: themeColors.primary }
            ]}>
              {viewAllText}
            </Text>
          </HoverableView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  header: {
    padding: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  notificationsList: {
    ...Platform.select({
      web: {
        overflowY: 'auto',
        overflowX: 'hidden',
      },
      default: {
        paddingHorizontal: 1,
      }
    }),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    position: 'relative',
    width: '100%',
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {
        backgroundColor: 'transparent', 
      },
    }),
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  notificationTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    opacity: 0.5,
  },
  notificationDescription: {
    opacity: 0.8,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
      },
      default: {
        maxWidth: '100%',
      }
    }) as any,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
  },
  viewAll: {
    textAlign: 'center',
    padding: 8,
    fontFamily: 'Poppins_500Medium',
  },
}); 