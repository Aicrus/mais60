import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform, TouchableOpacity, Text, View, Modal, Pressable, ScrollView } from 'react-native';
import { ChevronUp, ChevronDown, Users, UserPlus, Plus, Github, HelpCircle, Cloud, LogOut, ChevronRight, Mail, MessageSquare, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
import { createPortal } from 'react-dom';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';
import { DropdownMenuOption, SubmenuOption, BaseDropdownMenuProps } from './types';

/**
 * @component DropdownMenu
 * @description Componente de menu dropdown genérico e responsivo com suporte a:
 * - Trigger customizável (botão, ícone, qualquer elemento)
 * - Submenus
 * - Tema claro/escuro automático
 * - Posicionamento inteligente
 * - Responsividade (iOS, Android, Web)
 * 
 * @example
 * // Uso básico com botão padrão
 * <DropdownMenu 
 *   buttonText="Menu" 
 *   options={menuOptions}
 *   onOptionSelect={(optionId) => console.log(optionId)} 
 * />
 * 
 * // Com trigger customizado (ícone)
 * <DropdownMenu 
 *   trigger={<TouchableOpacity><Bell size={20} /></TouchableOpacity>}
 *   options={menuOptions}
 *   onOptionSelect={(optionId) => console.log(optionId)} 
 * />
 */

export interface DropdownMenuProps extends BaseDropdownMenuProps {
  /** Elemento que vai disparar o menu (botão, ícone, etc.) - opcional */
  trigger?: React.ReactNode;
  /** Texto do botão padrão (usado se trigger não for fornecido) */
  buttonText?: string;
  /** Opções do menu */
  options: DropdownMenuOption[];
  /** Função chamada quando uma opção é selecionada */
  onOptionSelect?: (optionId: string) => void;
  /** Se o menu está desabilitado */
  disabled?: boolean;
  /** Altura máxima do dropdown */
  maxHeight?: number;
  /** Posição Z do dropdown */
  zIndex?: number;
  /** Callback quando o menu abre */
  onOpen?: () => void;
  /** Callback quando o menu fecha */
  onClose?: () => void;
  /** Largura do submenu (especialmente útil para mobile) */
  submenuWidth?: number;
  /** Título do menu (opcional) */
  title?: string;
}

// Função para obter as cores do theme
const getThemeColors = (isDark: boolean) => {
  return {
    'primary': isDark ? colors['primary-dark'] : colors['primary-light'],
    'primary-hover': isDark ? colors['primary-dark-hover'] : colors['primary-light-hover'],
    'bg-secondary': isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    'divider': isDark ? colors['divider-dark'] : colors['divider-light'],
    'text-primary': isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    'text-secondary': isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    'hover': isDark ? colors['hover-dark'] : colors['hover-light'],
  };
};

// Componente para renderizar o submenu
const SubmenuComponent = ({ 
  visible, 
  options, 
  onSelect, 
  onClose, 
  isDark, 
  position,
  submenuWidth 
}: {
  visible: boolean;
  options: SubmenuOption[];
  onSelect: (option: SubmenuOption) => void;
  onClose: () => void;
  isDark: boolean;
  position: { x: number; y: number };
  submenuWidth?: number;
}) => {
  const submenuRef = useRef<any>(null);
  const themeColors = getThemeColors(isDark);
  const { responsive } = useResponsive();
  const itemTypography = getResponsiveValues('body-md');

  // Detectar clique fora para fechar
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  // Calcular largura baseada na plataforma e propriedade customizada
  const getSubmenuWidth = () => {
    if (submenuWidth) {
      return submenuWidth;
    }
    // Largura padrão: menor no mobile, maior na web
    return Platform.OS === 'web' ? 140 : 120;
  };

  const submenuStyle = StyleSheet.create({
    container: {
      position: 'absolute',
      backgroundColor: isDark ? '#14181B' : '#FFFFFF',
      borderColor: isDark ? '#262D34' : '#E0E3E7',
      borderWidth: 1,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: 6,
      overflow: 'hidden',
      width: getSubmenuWidth(),
      zIndex: 2147483648,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    itemHovered: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    },
    itemText: {
      fontSize: responsive(itemTypography.fontSize),
      fontFamily: itemTypography.fontFamily,
      lineHeight: responsive(itemTypography.lineHeight),
      color: themeColors['text-primary'],
      fontWeight: '400',
      marginLeft: 8,
      flexShrink: 1, // Permite que o texto se ajuste à largura disponível
    }
  });

  const handleItemSelect = (option: SubmenuOption) => {
    option.action();
    onSelect(option);
    onClose();
  };

  // Componente de item do submenu com hover
  const SubmenuItem = ({ option, index }: { option: SubmenuOption; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

    return (
      <View key={option.id}>
        <TouchableOpacity
          style={[
            submenuStyle.item,
            isHovered && Platform.OS === 'web' && submenuStyle.itemHovered
          ]}
          onPress={() => handleItemSelect(option)}
          // @ts-ignore - Eventos de hover exclusivos para web
          onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
          onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
        >
          {option.icon}
          <Text style={submenuStyle.itemText}>
            {option.label}
          </Text>
        </TouchableOpacity>
        {/* Divisória apenas antes do "More..." */}
        {option.id === 'message' && (
          <View style={{
            height: 1,
            backgroundColor: isDark ? '#262D34' : '#E0E3E7',
            marginHorizontal: 10
          }} />
        )}
      </View>
    );
  };

  const SubmenuContent = () => (
    <Pressable
      style={[
        submenuStyle.container,
        Platform.OS === 'web' ? {
          position: 'fixed',
          top: position.y,
          left: position.x,
        } : {
          position: 'absolute',
          top: position.y,
          left: position.x,
        }
      ]}
      onPress={(e) => {
        // Impedir que o clique no submenu feche o menu principal
        e.stopPropagation();
      }}
      // @ts-ignore - Eventos de mouse para manter submenu aberto
      onMouseEnter={() => {
        // Manter submenu aberto quando mouse está sobre ele
      }}
      onMouseLeave={() => {
        // Fechar submenu quando mouse sai
        setTimeout(() => {
          onClose();
        }, 100);
      }}
    >
      <View ref={submenuRef}>
        {options.map((option, index) => (
          <SubmenuItem key={option.id} option={option} index={index} />
        ))}
      </View>
    </Pressable>
  );

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return createPortal(<SubmenuContent />, document.body);
  }
  
  return <SubmenuContent />;
};

// Componente para renderizar um item do menu
const MenuOptionItem = ({ 
  option, 
  onSelect, 
  isDark, 
  onSubmenuToggle,
  submenuVisible,
  submenuPosition 
}: {
  option: DropdownMenuOption;
  onSelect: (option: DropdownMenuOption) => void;
  isDark: boolean;
  onSubmenuToggle?: (option: DropdownMenuOption, position: { x: number; y: number }) => void;
  submenuVisible?: boolean;
  submenuPosition?: { x: number; y: number };
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<any>(null);
  const themeColors = getThemeColors(isDark);
  const { responsive } = useResponsive();
  const itemTypography = getResponsiveValues('body-md');
  const shortcutTypography = getResponsiveValues('body-sm');
  
  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
      
      // Se tem submenu, mostrar no hover
      if (option.hasSubmenu && onSubmenuToggle && itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        onSubmenuToggle(option, {
          x: rect.right + 2, // Reduzido de 8 para 2px para ficar mais próximo
          y: rect.top - 4    // Ajuste vertical para melhor alinhamento
        });
      } else if (onSubmenuToggle) {
        // Se não tem submenu, fechar qualquer submenu aberto
        onSubmenuToggle(option, { x: 0, y: 0 });
      }
    }
  };
  
  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
      // Se não tem submenu, não faz nada especial
      // O submenu será fechado pelo onMouseLeave do container principal
    }
  };

  const handlePress = () => {
    console.log('handlePress chamado para:', option.id, 'Platform:', Platform.OS, 'hasSubmenu:', !!option.hasSubmenu);
    
    if (option.hasSubmenu && Platform.OS !== 'web') {
      console.log('Mobile: Abrindo submenu para:', option.id);
      // No mobile, toggle submenu no clique
      if (onSubmenuToggle && itemRef.current) {
        itemRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          onSubmenuToggle(option, {
            x: pageX + width + 2, // Reduzido de 8 para 2px para ficar mais próximo
            y: pageY - 4          // Ajuste vertical para melhor alinhamento
          });
        });
      }
    } else if (!option.hasSubmenu && Platform.OS !== 'web') {
      console.log('Mobile: Fechando submenu e executando ação para:', option.id, 'onSubmenuToggle:', !!onSubmenuToggle);
      // No mobile: Se não tem submenu, fechar qualquer submenu aberto E executar a ação
      if (onSubmenuToggle) {
        onSubmenuToggle(option, { x: 0, y: 0 }); // Isso vai fechar submenu E executar ação
      } else {
        console.log('Fallback: executando diretamente para:', option.id);
        // Fallback: se não tem onSubmenuToggle, executa diretamente
        onSelect(option);
      }
    } else if (!option.hasSubmenu) {
      console.log('Web: executando ação para:', option.id);
      // Web: executa ação normal
      onSelect(option);
    }
  };
  
  const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: (isHovered || submenuVisible) && Platform.OS === 'web' 
        ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') 
        : 'transparent'
    },
    itemText: {
      fontSize: responsive(itemTypography.fontSize),
      fontFamily: itemTypography.fontFamily,
      lineHeight: responsive(itemTypography.lineHeight),
      color: themeColors['text-primary'],
      fontWeight: '400',
      flex: 1,
      marginLeft: 12, // Espaçamento direto do ícone
    },
    shortcutText: {
      fontSize: responsive(shortcutTypography.fontSize),
      fontFamily: shortcutTypography.fontFamily,
      lineHeight: responsive(shortcutTypography.lineHeight),
      color: themeColors['text-secondary'],
      marginRight: 8,
    }
  });
  
  return (
    <TouchableOpacity
      ref={itemRef}
      style={styles.itemContainer}
      onPress={handlePress}
      // @ts-ignore - Eventos de hover exclusivos para web
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      {option.icon}
      <Text style={styles.itemText}>
        {option.label}
      </Text>
      {option.shortcut && Platform.OS === 'web' && (
        <Text style={styles.shortcutText}>
          {option.shortcut}
        </Text>
      )}
      {option.hasArrow && (
        <ChevronRight size={14} color={themeColors['text-secondary']} />
      )}
    </TouchableOpacity>
  );
};

// Componente para Web - renderiza com posicionamento absoluto
const WebDropdownMenu = ({ 
  visible, 
  options, 
  onSelect, 
  onClose, 
  isDark,
  position,
  maxHeight,
  submenuWidth,
}: {
  visible: boolean;
  options: DropdownMenuOption[];
  onSelect: (option: DropdownMenuOption) => void;
  onClose: () => void;
  isDark: boolean;
  position: any;
  maxHeight: number;
  submenuWidth?: number;
}) => {
  const optionsRef = useRef<any>(null);
  const themeColors = getThemeColors(isDark);
  
  // Estados para controlar submenu
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuOptions, setSubmenuOptions] = useState<SubmenuOption[]>([]);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const [activeSubmenuOption, setActiveSubmenuOption] = useState<string | null>(null);
  
  // Detectar clique fora para fechar
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (event: MouseEvent) => {
        if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [onClose]);
  
  if (!visible) return null;
  
  const handleItemSelect = (option: DropdownMenuOption) => {
    if (!option.hasSubmenu) {
      option.action();
      onSelect(option);
      onClose();
    }
  };

  const handleSubmenuToggle = (option: DropdownMenuOption, pos: { x: number; y: number }) => {
    if (option.submenuOptions) {
      setSubmenuOptions(option.submenuOptions);
      setSubmenuPosition(pos);
      setSubmenuVisible(true);
      setActiveSubmenuOption(option.id);
      } else {
      // Se a opção não tem submenu, fechar qualquer submenu aberto
      setSubmenuVisible(false);
      setActiveSubmenuOption(null);
    }
  };

  const handleSubmenuClose = () => {
    setSubmenuVisible(false);
    setActiveSubmenuOption(null);
  };

  const handleSubmenuSelect = (submenuOption: SubmenuOption) => {
    console.log('Submenu option selected:', submenuOption.id);
    onClose(); // Fechar menu principal também
  };
  
  const getPositionStyle = () => {
    if (!position) {
      return {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        width: 240,
        maxHeight: maxHeight || 400,
        zIndex: 2147483647,
      };
    }
    
    if (position.openDown !== false) {
      return {
        position: 'fixed' as 'fixed',
        top: position.top || 0,
        left: position.left || 0,
        width: position.width || 240,
        maxHeight: maxHeight || 400,
        zIndex: 2147483647,
      };
    } else {
      return {
        position: 'fixed' as 'fixed',
        bottom: window.innerHeight - position.top,
        left: position.left || 0,
        width: position.width || 240,
        maxHeight: maxHeight || 400,
        zIndex: 2147483647,
      };
    }
  };
  
  const positionStyle = getPositionStyle();
  
  const dropdownStyle = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#14181B' : '#FFFFFF',
      borderColor: isDark ? '#262D34' : '#E0E3E7',
      borderWidth: 1,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    header: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors['divider'],
      backgroundColor: isDark ? '#1A1F23' : '#F8F9FA',
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors['text-primary'],
    },
    separator: {
      height: 1,
      backgroundColor: themeColors['divider'],
      marginVertical: 4,
    }
  });
  
  // Separar opções normais do logout
  const normalOptions = options.filter(opt => !opt.isSeparated);
  const separatedOptions = options.filter(opt => opt.isSeparated);
  
  const DropdownContent = () => (
    <>
      <Pressable 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2147483646,
          backgroundColor: 'transparent',
        }}
        onPress={onClose}
      />
      <View
        ref={optionsRef}
        style={[positionStyle, dropdownStyle.container]}
        // @ts-ignore - Eventos de mouse para controlar submenu
        onMouseLeave={() => {
          // Delay para permitir mover para o submenu
          setTimeout(() => {
            handleSubmenuClose();
          }, 150);
        }}
      >
        {/* Header */}
        <View style={dropdownStyle.header}>
          <Text style={dropdownStyle.headerText}>My Account</Text>
        </View>
        
        {/* Opções normais */}
        {normalOptions.map((option, index) => (
          <View key={option.id}>
            <MenuOptionItem
              option={option}
              onSelect={handleItemSelect}
              isDark={isDark}
              onSubmenuToggle={handleSubmenuToggle}
              submenuVisible={activeSubmenuOption === option.id}
              submenuPosition={submenuPosition}
            />

            {/* Divisória após New Team */}
            {option.id === 'newteam' && (
              <View style={{
                height: 1,
                backgroundColor: themeColors['divider'],
                marginVertical: 4,
              }} />
            )}
          </View>
        ))}
        
        {/* Separador se houver opções separadas */}
        {separatedOptions.length > 0 && (
          <View style={dropdownStyle.separator} />
        )}
        
        {/* Opções separadas (logout) */}
        {separatedOptions.map((option, index) => (
          <MenuOptionItem
            key={option.id}
            option={option}
                onSelect={handleItemSelect}
                isDark={isDark}
              />
        ))}
          </View>
      
      {/* Submenu */}
      <SubmenuComponent
        visible={submenuVisible}
        options={submenuOptions}
        onSelect={handleSubmenuSelect}
        onClose={handleSubmenuClose}
        isDark={isDark}
        position={submenuPosition}
        submenuWidth={submenuWidth}
      />
    </>
  );

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return createPortal(<DropdownContent />, document.body);
  }
  
  return <DropdownContent />;
};

// Componente para Mobile - usa Modal
const MobileDropdownMenu = ({ 
  visible, 
  options, 
  onSelect, 
  onClose, 
  isDark,
  maxHeight,
  position,
  submenuWidth,
}: {
  visible: boolean;
  options: DropdownMenuOption[];
  onSelect: (option: DropdownMenuOption) => void;
  onClose: () => void;
  isDark: boolean;
  maxHeight: number;
  position: any;
  submenuWidth?: number;
}) => {
  const themeColors = getThemeColors(isDark);
  
  // Estados para controlar submenu
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuOptions, setSubmenuOptions] = useState<SubmenuOption[]>([]);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  
  const handleItemSelect = (option: DropdownMenuOption) => {
    if (!option.hasSubmenu) {
      option.action();
      onSelect(option);
      onClose();
    }
  };

  const handleSubmenuToggle = (option: DropdownMenuOption, pos: { x: number; y: number }) => {
    console.log('🔍 handleSubmenuToggle chamado para:', option.id, 'hasSubmenu:', !!option.submenuOptions);
    
    if (option.submenuOptions) {
      console.log('✅ Abrindo submenu para:', option.id);
      setSubmenuOptions(option.submenuOptions);
      setSubmenuPosition(pos);
      setSubmenuVisible(true);
    } else {
      console.log('🎯 Fechando submenu e executando ação para:', option.id);
      // Se a opção não tem submenu, fechar qualquer submenu aberto E executar a ação
      setSubmenuVisible(false);
      // Executar a ação da opção clicada
      option.action();
      onSelect(option);
      onClose(); // Fechar o menu principal também
    }
  };

  const handleSubmenuClose = () => {
    setSubmenuVisible(false);
  };

  const handleSubmenuSelect = (submenuOption: SubmenuOption) => {
    console.log('Submenu option selected:', submenuOption.id);
    onClose(); // Fechar menu principal também
  };
  
  const handlePressOutside = () => {
    // Se o submenu está visível, apenas fechar o submenu
    if (submenuVisible) {
      setSubmenuVisible(false);
    } else {
      // Se não há submenu, fechar o menu principal
      setTimeout(() => {
        onClose();
      }, 50);
    }
  };
  
  const dropdownStyle = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    container: {
      position: 'absolute',
      backgroundColor: isDark ? '#14181B' : '#FFFFFF',
      borderColor: isDark ? '#262D34' : '#E0E3E7',
      maxHeight: maxHeight || 400,
      width: position?.width || '90%',
      marginHorizontal: 16,
      left: position?.left - 16 || 0,
      ...(position?.openDown 
        ? { top: position?.top || 100 } 
        : { bottom: position?.bottom || 100 }),
      borderWidth: 1,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
    },
    header: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors['divider'],
      backgroundColor: isDark ? '#1A1F23' : '#F8F9FA',
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors['text-primary'],
    },
    separator: {
      height: 1,
      backgroundColor: themeColors['divider'],
      marginVertical: 4,
    }
  });
  
  // Separar opções normais do logout
  const normalOptions = options.filter(opt => !opt.isSeparated);
  const separatedOptions = options.filter(opt => opt.isSeparated);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable 
        style={dropdownStyle.overlay}
        onPress={handlePressOutside}
      >
        <View style={dropdownStyle.container}>
          {/* Header */}
          <View style={dropdownStyle.header}>
            <Text style={dropdownStyle.headerText}>My Account</Text>
          </View>
          
          <ScrollView nestedScrollEnabled={true}>
            {/* Opções normais */}
            {normalOptions.map((option, index) => (
              <View key={option.id}>
                <MenuOptionItem
                  option={option}
                  onSelect={handleItemSelect}
                  isDark={isDark}
                  onSubmenuToggle={handleSubmenuToggle}
                />

                {/* Divisória após New Team */}
                {option.id === 'newteam' && (
                  <View style={{
                    height: 1,
                    backgroundColor: themeColors['divider'],
                    marginVertical: 4,
                  }} />
              )}
            </View>
            ))}
            
            {/* Separador se houver opções separadas */}
            {separatedOptions.length > 0 && (
              <View style={dropdownStyle.separator} />
            )}
            
            {/* Opções separadas (logout) */}
            {separatedOptions.map((option, index) => (
              <MenuOptionItem
                key={option.id}
                option={option}
                    onSelect={handleItemSelect}
                    isDark={isDark}
                onSubmenuToggle={handleSubmenuToggle}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Submenu renderizado no mesmo Modal */}
        {submenuVisible && (
          <SubmenuComponent
            visible={submenuVisible}
            options={submenuOptions}
            onSelect={handleSubmenuSelect}
            onClose={handleSubmenuClose}
            isDark={isDark}
            position={submenuPosition}
            submenuWidth={submenuWidth}
          />
        )}
      </Pressable>
    </Modal>
  );
};

export const DropdownMenu = ({
  trigger,
  buttonText = 'Open',
  options,
  onOptionSelect,
  disabled = false,
  maxHeight = 400,
  zIndex = 9999,
  onOpen,
  onClose,
  submenuWidth,
  title,
}: DropdownMenuProps) => {
  const { isMobile } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<any>(null);
  
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const themeColors = getThemeColors(isDark);
  
  const [position, setPosition] = useState<{
    top?: number;
    left: number;
    width: number;
    bottom?: number;
    openDown?: boolean;
  }>({ top: 0, left: 0, width: 0 });
  
  // Calcular posição quando abrir
  useEffect(() => {
    if (Platform.OS === 'web' && isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const openDown = rect.bottom + maxHeight <= viewportHeight || rect.top < maxHeight;
      const spacing = 4;
      
      requestAnimationFrame(() => {
        if (openDown) {
          setPosition({
            top: rect.bottom + spacing + window.scrollY,
            left: rect.left + window.scrollX,
            width: 240, // Largura fixa como na imagem
            openDown: true
          });
        } else {
          setPosition({
            top: rect.top - spacing + window.scrollY,
            left: rect.left + window.scrollX,
            width: 240, // Largura fixa como na imagem
            openDown: false
          });
        }
      });
    }
  }, [isOpen, maxHeight]);
  
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
      
      if (isOpen) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        
        return () => {
          document.body.style.overflow = originalStyle.overflow;
          document.body.style.position = originalStyle.position;
          document.body.style.top = originalStyle.top;
          document.body.style.width = originalStyle.width;
          document.body.style.height = originalStyle.height;
          document.body.style.paddingRight = originalStyle.paddingRight;
          
          window.scrollTo(0, scrollY);
        };
      }
    }
  }, [isOpen]);
  
  // Chamar callbacks externos
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen, onOpen, onClose]);
  
  const handleToggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        if (Platform.OS !== 'web' && selectRef.current) {
          selectRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            const { height: windowHeight } = require('react-native').Dimensions.get('window');
            const spaceBelow = windowHeight - (pageY + height);
            const openDown = spaceBelow >= maxHeight || pageY < maxHeight;
            const spacing = 4;
            
            if (openDown) {
              setPosition({
                top: pageY + height + spacing,
                left: pageX,
                width: 240, // Largura fixa como na imagem
                bottom: undefined,
                openDown: true
              });
            } else {
              setPosition({
                top: undefined,
                bottom: windowHeight - pageY + spacing,
                left: pageX,
                width: 240, // Largura fixa como na imagem
                openDown: false
              });
            }
            });
          }
        }
      setIsOpen(!isOpen);
    }
  };
  
  const handleOptionSelect = (option: DropdownMenuOption) => {
    onOptionSelect?.(option.id);
  };
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  const buttonStyle = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? '#262D34' : '#E0E3E7',
      backgroundColor: isDark ? '#14181B' : '#FFFFFF',
      borderRadius: 6,
      minHeight: 40,
      width: 100, // Botão mais compacto como na imagem
    },
    text: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#14181B',
      fontWeight: '400',
      textAlign: 'center',
    },
  });

  return (
    <View style={{ position: 'relative' }}>
      {trigger ? (
        // Trigger customizado
        <TouchableOpacity
          ref={selectRef}
          onPress={handleToggleDropdown}
          disabled={disabled}
          style={disabled ? { opacity: 0.5 } : {}}
        >
          {trigger}
        </TouchableOpacity>
      ) : (
        // Botão padrão - apenas texto centralizado
        <TouchableOpacity
          ref={selectRef}
          onPress={handleToggleDropdown}
          style={[
            buttonStyle.container,
            disabled ? { opacity: 0.5 } : {}
          ]}
          disabled={disabled}
        >
          <Text style={buttonStyle.text}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Dropdown no mobile */}
      {Platform.OS !== 'web' && (
        <MobileDropdownMenu
          visible={isOpen}
          options={options}
          onSelect={handleOptionSelect}
          onClose={handleClose}
          isDark={isDark}
          maxHeight={maxHeight}
          position={position}
          submenuWidth={submenuWidth}
        />
      )}
      
      {/* Dropdown na web */}
      {Platform.OS === 'web' && (
        <WebDropdownMenu
          visible={isOpen}
          options={options}
          onSelect={handleOptionSelect}
          onClose={handleClose}
          isDark={isDark}
          position={position}
          maxHeight={maxHeight}
          submenuWidth={submenuWidth}
        />
      )}
    </View>
  );
};