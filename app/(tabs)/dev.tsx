import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Image, Platform, useWindowDimensions, Pressable, Dimensions, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { useResponsive } from '../../hooks/useResponsive';
// Importar tokens do sistema de design
import { 
  colors as designColors, 
  spacing as designSpacing, 
  borderRadius as designBorderRadius,
  boxShadow as designBoxShadow,
  shadows as designShadows,
  opacity as designOpacity,
  zIndex as designZIndex,
  transitionDuration as designTransitionDuration,
  fontFamily as designFontFamily,
  fontSize as designFontSize,
  responsiveFontSize,
  getResponsiveTypography,
  getResponsiveValues,
  breakpoints as designBreakpoints,
  responsiveSpacing as designResponsiveSpacing
} from '../../design-system';
import { Input } from '@/components/inputs/Input';
import { Select } from '@/components/dropdowns/Select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, FAQAccordion, SettingsAccordion, InfoAccordion } from '@/components/accordions/Accordion';

// Função para obter as cores do tailwind.config.js
const getTailwindConfig = () => {
  try {
    // Importando dinamicamente o tailwind.config.js
    const tailwindConfig = require('../../tailwind.config.js');
    return tailwindConfig.theme.extend.colors;
  } catch (error) {
    console.error('Erro ao carregar tailwind.config.js:', error);
    return {};
  }
};

// Cores compatíveis com o formato anterior
const colors = {
  primary: {
    main: '#892CDC',
    light: '#3D5C8C',
    dark: '#C13636',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#22D',
    light: '#06B6',
    dark: '#2C3E',
    contrastText: '#FFFFFF',
  },
  gray: {
    '50': '#F9FAFB',
    '100': '#F3F4F6',
    '200': '#E5E7EB',
    '300': '#D1D5DB',
    '400': '#9CA3AF',
    '500': '#6B7280',
    '600': '#4B5563',
    '700': '#374151',
    '800': '#1F2937',
    '900': '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  error: {
    main: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#ECFDF5',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#3B82F6',
    light: '#EFF6FF',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
};

import { Button } from '@/components/buttons/Button';
import { Mail, Plus, ChevronRight, Type, ChevronDown, ChevronsUpDown, Square, Settings, AlertCircle, Info, CheckCircle, AlertTriangle, X, Bell, MessageSquare, Sun, SunMoon, MousePointer, Move, Palette, Layout, ArrowUpDown, MoreHorizontal, Zap, Shapes, MoonIcon, Lightbulb, Rocket } from 'lucide-react-native';
import { Toast, ToastPositionLabels } from '@/components/toasts/Toast';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { HoverableView } from '@/components/effects/HoverableView';
import { GradientView } from '@/components/effects/GradientView';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/tables/DataTable';
import { Checkbox } from '@/components/checkboxes/Checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import Sheet from '@/components/sheets/Sheet';
import type { SheetPosition } from '@/components/sheets/Sheet';
import { DateInput } from '@/components/datepickers/DateInput';
import { TimeInput } from '@/components/datepickers/TimeInput';
import { Keyboard } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { DropdownMenu } from '@/components/dropdowns/DropdownMenu';
import { TeamMenu } from '@/components/menus/TeamMenu';
import { NotificationsMenu } from '@/components/menus/NotificationsMenu';
import { ProfileMenu } from '@/components/menus/ProfileMenu';

// Definir tipos para os componentes disponíveis
type ComponentType = 'input' | 'select' | 'accordion' | 'button' | 'designSystem' | 'toast' | 'themeSelector' | 'hoverableView' | 'gradientView' | 'dropdownMenu' | 'pageContainer' | 'dataTable' | 'sheet' | null;

// Exemplo de DataTable com configuração Supabase simplificada
// O DataTable agora gera as colunas automaticamente com base nos dados retornados

// Exemplo de DataTable com configuração Supabase simplificada
// Agora toda a lógica está dentro do próprio componente DataTable

// Componente que ajusta automaticamente a cor do texto baseado no estado hover + ativo
const SmartTextHoverableView = ({ text, ...props }: { text: string } & Omit<React.ComponentProps<typeof HoverableView>, 'children'>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Determinar a cor do texto baseada no estado
  const getTextColor = () => {
    if (props.isActive && props.activeBackgroundColor && !isHovered) {
      // Quando ativo com cor de fundo e SEM hover, usar texto branco
      return 'text-white';
    } else if (props.isActive && props.activeBackgroundColor && isHovered && !props.disableHoverWhenActive) {
      // Quando ativo + hover (remove fundo), usar texto primary
      return isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    } else if (props.isActive && !props.activeBackgroundColor) {
      // Quando ativo sem cor de fundo específica
      return isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    } else {
      // Estado normal
      return isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    }
  };

  return (
    <HoverableView 
      {...props}
      onHoverStateChange={(hovered) => {
        setIsHovered(hovered);
        if (props.onHoverStateChange) {
          props.onHoverStateChange(hovered);
        }
      }}
    >
      <Text className={getTextColor()}>{text}</Text>
    </HoverableView>
  );
};

export default function DevPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [activeComponent, setActiveComponent] = useState<ComponentType>('designSystem');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [toastPosition, setToastPosition] = useState<'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top');
  const [toastClosable, setToastClosable] = useState(false);
  const [toastProgressBar, setToastProgressBar] = useState(true);
  const { width } = useWindowDimensions();
  const { currentBreakpoint, isMobile, isTablet, isDesktop, responsive } = useResponsive();
  
  // HoverableView estados de exemplo
  const [activeItem, setActiveItem] = useState<number | null>(null);
  
  // Estados para tipografia responsiva
  const [typographyActiveTab, setTypographyActiveTab] = useState<'current' | 'mobile' | 'tablet' | 'desktop'>('current');
  
  // Estados separados para cada exemplo de Input
  const [inputBasico, setInputBasico] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [inputErro, setInputErro] = useState('');
  const [inputBusca, setInputBusca] = useState('');
  const [inputMascara, setInputMascara] = useState('');

  const [inputNumerico, setInputNumerico] = useState('0');
  const [inputRedimensionavel, setInputRedimensionavel] = useState('');
  
  // Estados para os três tipos de label
  const [inputLabelAcima, setInputLabelAcima] = useState('');
  const [inputSemLabel, setInputSemLabel] = useState('');
  const [inputLabelFlutuante, setInputLabelFlutuante] = useState('');
  
  // Estados para as novas variantes visuais
  const [inputOutline, setInputOutline] = useState('');
  const [inputUnderline, setInputUnderline] = useState('');
  const [inputNone, setInputNone] = useState('');
  const [inputAffix, setInputAffix] = useState('50');
  const [inputTransparente, setInputTransparente] = useState('');
  
  // Estados separados para cada exemplo de Select
  // Estados separados para cada exemplo de Select
  const [selectBasico, setSelectBasico] = useState('');
  const [selectBusca, setSelectBusca] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [selectSupabaseNome, setSelectSupabaseNome] = useState('');
  
  // Estado para armazenar usuários do Supabase para Select
  const [supabaseUsersForSelect, setSupabaseUsersForSelect] = useState<any[]>([]);
  
  // Converter usuários do Supabase para o formato de opções do Select (usando o campo nome)
  const supabaseNomeOptions = useMemo(() => {
    return supabaseUsersForSelect.map(user => ({
      value: user.nome,
      label: user.nome
    }));
  }, [supabaseUsersForSelect]);
  
  // Notificações - estados
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsPosition, setNotificationsPosition] = useState({ x: 0, y: 0 });
  
  // ProfileMenu - estados
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); 
  const profileButtonRef = useRef<View>(null);
  const [profileButtonPosition, setProfileButtonPosition] = useState({ x: 0, y: 0 });
  
  // Cards - estados específicos para a seção de Cards
  const [profileVisible, setProfileVisible] = useState(false);
  const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 });
  const profileCardButtonRef = useRef<View>(null);
  
  // Estado para o menu de notificações na UI
  const [notificationsMenuVisible, setNotificationsMenuVisible] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 200, y: 100 }); // Posição fixa para demonstração
  
  // Refs
  const notificationsButtonRef = useRef<View>(null);
  const secondButtonRef = useRef<View | null>(null);
  const [activeButtonRef, setActiveButtonRef] = useState<React.RefObject<View | null> | null>(null);
  
  // Verifica se estamos em ambiente móvel/nativo
  const isNative = Platform.OS !== 'web';
  
  // Efeito para converter activeComponent 'cards' para 'dropdownMenu'
  useEffect(() => {
    if ((activeComponent as string) === 'cards') {
      setActiveComponent('dropdownMenu');
    }
  }, [activeComponent]);
  
  // Ajusta posição do toast para ambiente nativo
  useEffect(() => {
    if (isNative) {
      // Em ambiente nativo, apenas 'top' e 'bottom' são posições válidas
      if (!['top', 'bottom'].includes(toastPosition)) {
        setToastPosition('top');
      }
    }
  }, [isNative, toastPosition]);
  
  // Validar email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Selecionar o primeiro componente automaticamente quando mudar para a seção de componentes
  // Cores do tema atual
  const bgPrimary = isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light';
  const bgSecondary = isDark ? 'bg-bg-secondary-dark' : 'bg-bg-secondary-light';
  const bgTertiary = isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light';
  const textPrimary = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
  const textSecondary = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  const border = isDark ? 'border-divider-dark' : 'border-divider-light';
  
  // Opções para o componente Select
  const selectOptions = [
    { value: 'option1', label: 'Opção 1' },
    { value: 'option2', label: 'Opção 2' },
    { value: 'option3', label: 'Opção 3' },
    { value: 'option4', label: 'Opção 4' },
    { value: 'option5', label: 'Opção 5' },
    { value: 'option8', label: 'Opção 8' },
    { value: 'option10', label: 'Opção 10' },
    { value: 'option_sp', label: 'São Paulo' },
    { value: 'option_rj', label: 'Rio de Janeiro' },
    { value: 'option_bh', label: 'Belo Horizonte' },
    { value: 'option_test', label: 'Teste de Busca' },
  ];
  
  // Componentes disponíveis
  const availableComponents = [
    { id: 'designSystem', name: 'Design System', icon: 'Settings' },
    { id: 'input', name: 'Input', icon: 'Type' },
    { id: 'select', name: 'Select', icon: 'ChevronDown' },
    { id: 'accordion', name: 'Accordion', icon: 'ChevronsUpDown' },
    { id: 'button', name: 'Button', icon: 'Square' },
    { id: 'toast', name: 'Toast', icon: 'Bell' },
    { id: 'themeSelector', name: 'Theme Selector', icon: 'SunMoon' },
    { id: 'hoverableView', name: 'Hoverable View', icon: 'MousePointer' },
    { id: 'gradientView', name: 'Gradient View', icon: 'Palette' },
    { id: 'dropdownMenu', name: 'Dropdown Menu', icon: 'MessageSquare' },
    { id: 'pageContainer', name: 'Page Container', icon: 'Layout' },
    { id: 'dataTable', name: 'Data Table', icon: 'Settings' },
    { id: 'sheet', name: 'Sheet', icon: 'Move' },
  ];
  
  // Função para renderizar o ícone correto
  const renderIcon = (iconName: string) => {
    const iconColor = isDark ? '#FFFFFF' : '#57636C'; // Branco para modo escuro, cor original para claro
    
    switch (iconName) {
      case 'Type':
        return <Type strokeWidth={1.5} color={iconColor} />;
      case 'ChevronDown':
        return <ChevronDown strokeWidth={1.5} color={iconColor} />;
      case 'ChevronsUpDown':
        return <ChevronsUpDown strokeWidth={1.5} color={iconColor} />;
      case 'Square':
        return <Square strokeWidth={1.5} color={iconColor} />;
      case 'Settings':
        return <Settings strokeWidth={1.5} color={iconColor} />;
      case 'Bell':
        return <Bell strokeWidth={1.5} color={iconColor} />;
      case 'MessageSquare':
        return <MessageSquare strokeWidth={1.5} color={iconColor} />;
      case 'Sun':
        return <Sun strokeWidth={1.5} color={iconColor} />;
      case 'SunMoon':
        return <SunMoon strokeWidth={1.5} color={iconColor} />;
      case 'MousePointer':
        return <MousePointer strokeWidth={1.5} color={iconColor} />;
      case 'Palette':
        return <Palette strokeWidth={1.5} color={iconColor} />;
      case 'Layout':
        return <Layout strokeWidth={1.5} color={iconColor} />;
      case 'Move':
        return <Move strokeWidth={1.5} color={iconColor} />;
      default:
        return <Settings strokeWidth={1.5} color={iconColor} />;
    }
  };
  
  // Estado para controlar o scroll da página
  const [scrollEnabled, setScrollEnabled] = useState(true);
  
  // Função para impedir o scroll com debounce
  const handleScrollEnabled = useCallback((enabled: boolean) => {
    // Se estiver desabilitando o scroll, fazer imediatamente
    if (!enabled) {
      setScrollEnabled(false);
      
      // No Android e iOS, usar código mais agressivo para bloquear o scroll
      if (Platform.OS !== 'web') {
        // Forçar o foco no elemento redimensionável para evitar scroll
        Keyboard.dismiss();
      }
      return;
    }
    
    // Quando reabilitar, aguardar um tempo substancial para evitar conflitos de scroll
    setTimeout(() => {
      setScrollEnabled(true);
    }, 1500); // Aumentado para 1.5 segundos para garantir que o scroll não seja ativado acidentalmente
  }, []);
  
  // Função para renderizar o conteúdo do componente selecionado
  const renderComponentContent = () => {
    if (!activeComponent) {
      return (
        <View className="p-lg">
          <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-md`}>
            Selecione um componente
          </Text>
          <Text className={`text-body-md ${textSecondary} mb-lg`}>
            Escolha um componente da lista ao lado para ver exemplos e documentação.
          </Text>
        </View>
      );
    }

    switch (activeComponent) {
      case 'input':
        return renderInputComponent();
      case 'select':
        return renderSelectComponent();
      case 'accordion':
        return renderAccordionComponent();
      case 'button':
        return renderButtonComponent();
      case 'designSystem':
        return renderDesignSystem();
      case 'toast':
        return renderToastComponent();
      case 'themeSelector':
        return renderThemeSelectorComponent();
      case 'hoverableView':
        return renderHoverableViewComponent();
      case 'gradientView':
        return renderGradientViewComponent();
      case 'dropdownMenu':
        return renderDropdownMenuComponent();
      case 'pageContainer':
        return renderPageContainerComponent();
      case 'dataTable':
        return renderDataTableComponent();
      case 'sheet':
        return renderSheetComponent();
      default:
        return null;
    }
  };
  
  // Função para renderizar o componente Input e seus exemplos
  const renderInputComponent = () => {
    return (
      <ScrollView 
        className="p-lg" 
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: 60 }} // Adiciona espaço extra ao final
        showsVerticalScrollIndicator={true}
      >

        
        {/* Layout responsivo otimizado para todos os breakpoints */}
            <View className="mb-md">
          <View className="flex-row items-center mb-xs">
            <View className="w-1 h-8 bg-primary-light dark:bg-primary-dark rounded-full mr-sm" />
            <Text className={`text-title-md font-jakarta-semibold ${textPrimary}`}>
              Input
              </Text>
            </View>
          <Text className={`text-body-sm ${textSecondary} mb-md`}>
            Componente para entrada de texto com <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">validação automática</Text>, máscaras, tipos especiais e design system nativo.
              </Text>
          
          {/* Quick Stats - Responsivo */}
          <View 
            className={responsive({ mobile: "flex-col", tablet: "flex-row items-center", desktop: "flex-row items-center", default: "flex-col" })}
            style={{ 
              gap: responsive({ mobile: 6, tablet: 12, desktop: 16, default: 6 }),
              marginTop: 4
            }}
          >
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>9+ tipos especiais</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>3 variantes de label</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>Auto-validação</Text>
            </View>
          </View>
            </View>
            
        {/* Primeira linha de exemplos - Formulário e Tipos */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }),
          marginBottom: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Formulário de Cadastro */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
            <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Formulário de Cadastro
              </Text>
            </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Demonstração prática • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Validação automática</Text>
              </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Input
              value={inputBasico}
              onChangeText={setInputBasico}
                  placeholder="Seu nome completo"
                  label="Nome"
                  labelVariant="above"
                />
            <Input
              value={inputErro}
              onChangeText={setInputErro}
              placeholder="seu@email.com"
              label="Email"
              type="email"
              keyboardType="email-address"
                  error={inputErro.length > 0 && !isValidEmail(inputErro) ? "Não parece um e-mail válido" : ""}
            />
                <Input
                  value={inputSenha}
                  onChangeText={setInputSenha}
                  placeholder="Mínimo 8 caracteres"
                  label="Senha"
                  type="password"
                />
              </View>
            </View>
          </View>

          {/* Tipos Especiais */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Tipos Especiais
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Máscaras e controles • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Seletores nativos</Text>
            </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Input
              value={inputBusca}
              onChangeText={setInputBusca}
                  placeholder="Buscar produtos..."
              type="search"
              onClear={() => setInputBusca('')}
            />
            <Input
              value={inputMascara}
              onChangeText={setInputMascara}
              placeholder="000.000.000-00"
              label="CPF"
              mask="cpf"
              keyboardType="numeric"
            />
            <Input
              value={inputNumerico}
              onChangeText={setInputNumerico}
              type="number"
              label="Quantidade"
              placeholder="0"
              keyboardType="numeric"
              min={0}
              step={1}
              showNumberControls={true}
            />
              </View>
            </View>
          </View>
        </View>

        {/* Segunda linha - Variantes de Label e Código */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Variantes de Label */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Variantes e Estados
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Labels, bordas e estados • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Todas as variações</Text>
            </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Input
                  value={inputLabelAcima}
                  onChangeText={setInputLabelAcima}
                  placeholder="Label acima (padrão)"
                  label="Nome completo"
                  labelVariant="above"
                />
                <Input
                  value={inputSemLabel}
                  onChangeText={setInputSemLabel}
                  placeholder="Sem label, apenas placeholder"
                  labelVariant="none"
                />
                <Input
                  value={inputLabelFlutuante}
                  onChangeText={setInputLabelFlutuante}
                  label="Email corporativo"
                  labelVariant="floating"
                />
                
                {/* Separador visual */}
                <View className={`h-px ${isDark ? 'bg-divider-dark' : 'bg-divider-light'} my-xs`} />
                
                {/* Variantes visuais */}
                <Input
                  value={inputOutline}
                  onChangeText={setInputOutline}
                  placeholder="Borda completa (padrão)"
                  label="Input Outline"
                  variant="outline"
                />
                <Input
                  value={inputUnderline}
                  onChangeText={setInputUnderline}
                  placeholder="Apenas linha embaixo"
                  label="Input Underline"
                  variant="underline"
                />
                <Input
                  value={inputNone}
                  onChangeText={setInputNone}
                  placeholder="Sem borda"
                  label="Input None"
                  variant="none"
                />
                
                {/* Separador visual */}
                <View className={`h-px ${isDark ? 'bg-divider-dark' : 'bg-divider-light'} my-xs`} />
                
                {/* Estados especiais */}
                <Input
                  value="Campo desabilitado (não editável)"
                  onChangeText={() => {}} // Função vazia para não permitir edição
                  label="Campo Desabilitado"
                  disabled={true}
                />
                <Input
                  value={inputAffix}
                  onChangeText={setInputAffix}
                  placeholder="Digite o peso"
                  label="Peso corporal"
                  type="number"
                  rightAffix="kg"
                />
                <Input
                  value={inputTransparente}
                  onChangeText={setInputTransparente}
                  placeholder="Sem cor de fundo"
                  label="Input Transparente"
                  transparent={true}
                />
            </View>
          </View>
        </View>

          {/* Código de Exemplo */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-error-icon-light dark:bg-error-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Implementação Rápida
        </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Código limpo e direto
               </Text>
             </View>
             
              <View className={`${bgTertiary} rounded-lg ${responsive({ mobile: 'p-xs', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`}>
                <Text className={`text-mono-sm font-mono-regular leading-relaxed ${textSecondary}`}>
                  <Text className="text-info-icon-light dark:text-info-icon-dark">import</Text> {'{'}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark"> Input </Text>
                  {'}'} <Text className="text-info-icon-light dark:text-info-icon-dark">from</Text> <Text className="text-success-icon-light dark:text-success-icon-dark">'@/components'</Text>
                  {'\n\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<Input'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">value</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{email}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">onChangeText</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{setEmail}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">label</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">"Email"</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">type</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">"email"</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">error</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{!isValid && "Email inválido"}'}</Text>
                  {'\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'/>'}</Text>
               </Text>
             </View>
            </View>
            </View>
          </View>
          
        {/* Terceira linha - Texto Redimensionável */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }),
          marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Texto Redimensionável */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Texto Redimensionável
              </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Redimensiona verticalmente • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Compatível com todas as plataformas</Text>
               </Text>
             </View>
             
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
                <Input
                  value={inputRedimensionavel}
                  onChangeText={setInputRedimensionavel}
                  placeholder="Digite um texto longo aqui... Este input permite redimensionamento vertical."
                  label="Texto redimensionável"
                  multiline={true}
                  numberOfLines={3}
                  resizable={true}
                  minHeight={80}
                  maxHeight={300}
                  setScrollEnabled={handleScrollEnabled}
                />
                <View className={`${bgTertiary} rounded-md p-xs`}>
                  <Text className={`text-body-xs ${textSecondary}`}>
                    <Text className="font-jakarta-bold">Dica:</Text> Arraste o indicador no canto inferior direito para redimensionar.
                    {Platform.OS !== 'web' 
                      ? ' No ambiente nativo, funciona com gestos nativos.' 
                      : ' No navegador, use a área de redimensionamento padrão ou o indicador customizado.'}
               </Text>
                </View>
              </View>
            </View>
             </View>
             
          {/* Recursos Avançados */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Recursos Avançados
               </Text>
             </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Funcionalidades especiais do design system
               </Text>
             </View>
             
              <View className={`${bgTertiary} rounded-lg ${responsive({ mobile: 'p-xs', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`}>
                <View style={{ gap: 4 }}>
                  <Text className={`text-body-sm ${textSecondary}`}>
                    • <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">Acessibilidade total</Text> com suporte a screen readers
               </Text>
                  <Text className={`text-body-sm ${textSecondary}`}>
                    • <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">Adaptação automática</Text> ao tema do sistema
               </Text>
                  <Text className={`text-body-sm ${textSecondary}`}>
                    • <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">Responsividade nativa</Text> em todos os breakpoints
               </Text>
                  <Text className={`text-body-sm ${textSecondary}`}>
                    • <Text className="text-error-icon-light dark:text-error-icon-dark font-jakarta-medium">Performance otimizada</Text> com animações nativas
               </Text>
                </View>
              </View>
            </View>
             </View>
          </View>
          
        {/* Quick Usage Guide - Espaçamento consistente */}
        <View 
          className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })} mb-md border-l-4 border-primary-light dark:border-primary-dark`}
          style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}
        >
          <View className="flex-row items-center mb-xs">
            <Lightbulb size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs" />
            <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
              Como funciona?
              </Text>
            </View>
          <Text className={`text-body-sm ${textSecondary}`}>
            Digite nos <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">campos acima</Text> para testar diferentes funcionalidades. <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">Email</Text> valida automaticamente, <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">CPF</Text> aplica máscara, <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">label flutuante</Text> anima suavemente.
              </Text>
          </View>
          


        {/* Recursos e API */}
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="flex-row items-center mb-sm">
            <View className={`w-1 h-6 ${isDark ? 'bg-primary-dark' : 'bg-primary-light'} rounded-full mr-sm`} />
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary}`}>
              Recursos e API
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Tipos suportados</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">text</Text> - Texto simples
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">password</Text> - Senha com toggle de visibilidade
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">search</Text> - Busca com ícone e botão limpar
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">number</Text> - Numérico com controles opcionais
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">email</Text> - Email com validação automática
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Máscaras disponíveis</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">cpf</Text> - 000.000.000-00
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">cnpj</Text> - 00.000.000/0000-00
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">phone</Text> - (00) 00000-0000
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">cep</Text> - 00000-000
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">currency</Text> - R$ 0.000,00
              </Text>
            </View>
            
            <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Variantes de label</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Padrão</Text> - Label acima do campo
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Sem label</Text> - Apenas placeholder
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Flutuante</Text> - Label que anima para cima
              </Text>
            </View>
          </View>
          
        
        {/* Dica Pro */}
        <View className={`${isDark ? 'bg-success-bg-dark' : 'bg-success-bg-light'} rounded-lg p-md border ${isDark ? 'border-success-border-dark' : 'border-success-border-light'}`} style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}>
          <View className="flex-row items-start">
            <Rocket size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs mt-0.5" />
            <View className="flex-1">
              <Text className={`text-body-lg font-jakarta-bold ${textPrimary} mb-xs`}>
                Dica Pro
               </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
                Para <Text className="font-jakarta-medium text-primary-light dark:text-primary-dark">data e hora</Text>, use os componentes especializados <Text className="font-jakarta-medium text-info-icon-light dark:text-info-icon-dark">DateInput</Text> e <Text className="font-jakarta-medium text-warning-icon-light dark:text-warning-icon-dark">TimeInput</Text> da pasta <Text className="font-jakarta-medium">@/datepickers</Text> que oferecem calendários nativos. As <Text className="font-jakarta-medium text-info-icon-light dark:text-info-icon-dark">variantes visuais</Text> funcionam com todos os tipos de input.
        </Text>
          </View>
          </View>
        </View>
      </ScrollView>
    );
  };
  
  // Função para renderizar o componente Select e seus exemplos
  const renderSelectComponent = () => {
    return (
      <ScrollView 
        className="p-lg" 
        contentContainerStyle={{ paddingBottom: 60 }} // Adiciona espaço extra ao final
        showsVerticalScrollIndicator={true}
      >

        
        {/* Layout responsivo otimizado para todos os breakpoints */}
            <View className="mb-md">
          <View className="flex-row items-center mb-xs">
            <View className="w-1 h-8 bg-primary-light dark:bg-primary-dark rounded-full mr-sm" />
            <Text className={`text-title-md font-jakarta-semibold ${textPrimary}`}>
              Select
              </Text>
            </View>
          <Text className={`text-body-sm ${textSecondary} mb-md`}>
            Componente dropdown inteligente com <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">posicionamento automático</Text>, busca avançada e integração direta com Supabase.
              </Text>
          
          {/* Quick Stats - Responsivo */}
          <View 
            className={responsive({ mobile: "flex-col", tablet: "flex-row items-center", desktop: "flex-row items-center", default: "flex-col" })}
            style={{ 
              gap: responsive({ mobile: 6, tablet: 12, desktop: 16, default: 6 }),
              marginTop: 4
            }}
          >
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>Seleção única/múltipla</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>Busca inteligente</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>Integração Supabase</Text>
            </View>
          </View>
            </View>
            
        {/* Primeira linha de exemplos - Básico e Busca */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }),
          marginBottom: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Select Básico */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
            <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Seleção Básica
              </Text>
            </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Interface intuitiva • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Animações suaves</Text>
              </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Select
              options={selectOptions}
              value={selectBasico}
              setValue={setSelectBasico}
                  placeholder="Selecione uma cidade"
                  label="Cidade de origem"
                />
            <Select
              options={selectOptions}
              value={selectBusca}
              setValue={setSelectBusca}
              placeholder="Digite para pesquisar"
              label="Busca inteligente"
              searchable={true}
            />
              </View>
            </View>
          </View>

          {/* Select Múltiplo */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Seleção Múltipla
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Múltiplas opções • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Contagem automática</Text>
            </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Select
              options={selectOptions}
              value={multiSelect}
              setValue={setMultiSelect as any}
              placeholder="Selecione várias cidades"
              label="Destinos favoritos"
              multiple={true}
              searchable={true}
            />
              </View>
            </View>
          </View>
        </View>

        {/* Segunda linha - Integração Supabase e Código */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Integração Supabase */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Integração Direta
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Conecta direto ao Supabase • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">Zero configuração</Text>
            </Text>
          </View>
          
              <View style={{ gap: responsive({ mobile: 8, tablet: 10, desktop: 12, default: 8 }) }}>
            <Select
              value={selectSupabaseNome}
              setValue={setSelectSupabaseNome}
              placeholder="Carregando usuários..."
              label="Usuário da Academia"
              searchable={true}
              supabaseTable="usersAicrusAcademy"
              supabaseColumn="nome"
              supabaseOrderBy="nome"
              supabaseAscending={true}
            />
            
            <View className={`${bgTertiary} rounded-md p-xs`}>
              <Text className={`text-body-xs ${textSecondary}`}>
                <Text className="font-jakarta-bold">Dica:</Text> Dados carregados automaticamente da tabela Supabase. Busca funciona em tempo real.
              </Text>
            </View>
              </View>
            </View>
          </View>

          {/* Código de Exemplo */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-error-icon-light dark:bg-error-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Implementação Rápida
        </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  API simples e intuitiva
               </Text>
             </View>
             
              <View className={`${bgTertiary} rounded-lg ${responsive({ mobile: 'p-xs', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`}>
                <Text className={`text-mono-sm font-mono-regular leading-relaxed ${textSecondary}`}>
                  <Text className="text-info-icon-light dark:text-info-icon-dark">import</Text> {'{'}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark"> Select </Text>
                  {'}'} <Text className="text-info-icon-light dark:text-info-icon-dark">from</Text> <Text className="text-success-icon-light dark:text-success-icon-dark">'@/components'</Text>
                  {'\n\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<Select'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">options</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{cities}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">value</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{selectedCity}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">setValue</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{setSelectedCity}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">searchable</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{true}'}</Text>
                  {'\n  '}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark">multiple</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">{'{false}'}</Text>
                  {'\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'/>'}</Text>
               </Text>
             </View>
            </View>
            </View>
          </View>
          
        {/* Quick Usage Guide - Espaçamento consistente */}
        <View 
          className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })} mb-md border-l-4 border-primary-light dark:border-primary-dark`}
          style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}
        >
          <View className="flex-row items-center mb-xs">
            <Lightbulb size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs" />
            <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
              Como funciona?
              </Text>
            </View>
          <Text className={`text-body-sm ${textSecondary}`}>
            Teste os <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">selects acima</Text> para ver diferentes funcionalidades. <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">Busca</Text> filtra em tempo real, <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">múltipla seleção</Text> conta automaticamente, <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">Supabase</Text> carrega dados direto do banco.
              </Text>
          </View>
          


        {/* Recursos e API */}
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="flex-row items-center mb-sm">
            <View className={`w-1 h-6 ${isDark ? 'bg-primary-dark' : 'bg-primary-light'} rounded-full mr-sm`} />
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary}`}>
              Recursos e API
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Funcionalidades principais</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Seleção única/múltipla</Text> - Flexibilidade total
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Busca inteligente</Text> - Ignora acentos e maiúsculas
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Posicionamento automático</Text> - Abre para cima/baixo
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Interface adaptativa</Text> - Modal no mobile, dropdown na web
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Integração Supabase</Text> - Conecta direto ao banco
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Props principais</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">options</Text> - Array de {'{value, label}'}
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">value/setValue</Text> - Estado controlado
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">multiple</Text> - Seleção múltipla
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">searchable</Text> - Campo de busca
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">disabled</Text> - Estado desabilitado
              </Text>
            </View>
            
            <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Integração Supabase</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">supabaseTable</Text> - Nome da tabela
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">supabaseColumn</Text> - Coluna para valor/label
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">supabaseOrderBy</Text> - Coluna para ordenação
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">supabaseAscending</Text> - Ordem crescente/decrescente
              </Text>
                         </View>
           </View>
          
        
        {/* Dica Pro */}
        <View className={`${isDark ? 'bg-success-bg-dark' : 'bg-success-bg-light'} rounded-lg p-md border ${isDark ? 'border-success-border-dark' : 'border-success-border-light'}`} style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}>
          <View className="flex-row items-start">
            <Rocket size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs mt-0.5" />
            <View className="flex-1">
              <Text className={`text-body-lg font-jakarta-bold ${textPrimary} mb-xs`}>
                Dica Pro
               </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
                Para <Text className="font-jakarta-medium text-primary-light dark:text-primary-dark">listas grandes</Text>, combine <Text className="font-jakarta-medium text-info-icon-light dark:text-info-icon-dark">searchable</Text> com <Text className="font-jakarta-medium text-warning-icon-light dark:text-warning-icon-dark">integração Supabase</Text> para carregamento otimizado. Use <Text className="font-jakarta-medium text-success-icon-light dark:text-success-icon-dark">multiple</Text> para seleções complexas e <Text className="font-jakarta-medium text-error-icon-light dark:text-error-icon-dark">disabled</Text> para controle de estado.
        </Text>
          </View>
          </View>
        </View>

       </ScrollView>
    );
  };
  
  // Função para renderizar o componente Accordion e seus exemplos
  const renderAccordionComponent = () => {
    return (
      <ScrollView 
        className="p-lg" 
        contentContainerStyle={{ paddingBottom: 60 }} // Adiciona espaço extra ao final
        showsVerticalScrollIndicator={true}
      >
        {/* Layout responsivo otimizado para todos os breakpoints */}
            <View className="mb-md">
          <View className="flex-row items-center mb-xs">
            <View className="w-1 h-8 bg-primary-light dark:bg-primary-dark rounded-full mr-sm" />
            <Text className={`text-title-md font-jakarta-semibold ${textPrimary}`}>
              Accordion
              </Text>
            </View>
          <Text className={`text-body-sm ${textSecondary} mb-md`}>
            Componente expansível moderno com <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">animações 60fps</Text>, cores do design system e pré-configurações elegantes.
              </Text>
          
          {/* Quick Stats - Responsivo */}
          <View 
            className={responsive({ mobile: "flex-col", tablet: "flex-row items-center", desktop: "flex-row items-center", default: "flex-col" })}
            style={{ 
              gap: responsive({ mobile: 6, tablet: 12, desktop: 16, default: 6 }),
              marginTop: 4
            }}
          >
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>3 pré-configurações</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>TypeScript</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-xs" />
              <Text className={`text-body-sm ${textSecondary}`}>60fps</Text>
            </View>
          </View>
            </View>
            
        {/* Primeira linha de exemplos - FAQ e Settings */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }),
          marginBottom: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* FAQ Example */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-success-icon-light dark:bg-success-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    FAQ
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Apenas uma resposta visível • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">type="single"</Text>
                </Text>
              </View>
              
              <FAQAccordion>
                <AccordionItem value="q1">
                  <AccordionTrigger>Como implementar autenticação segura?</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      Implementação biométrica com <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">Touch ID e Face ID</Text> no iOS, <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">BiometricPrompt API</Text> no Android. Inclui fallbacks seguros e criptografia AES-256.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Estratégia de cache offline?</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      Arquitetura <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">cache-first</Text> com AsyncStorage, SQLite e Redux Persist. Sincronização inteligente em background.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              </FAQAccordion>
            </View>
          </View>

          {/* Settings Example */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-info-icon-light dark:bg-info-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Settings
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Múltiplas seções abertas • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">type="multiple"</Text>
                </Text>
              </View>
              
              <SettingsAccordion>
                <AccordionItem value="account">
                  <AccordionTrigger>Configurações de Conta</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      Perfil, <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">notificações push</Text>, autenticação 2FA e backup automático de dados.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="privacy">
                  <AccordionTrigger>Privacidade e Segurança</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      Controle de <Text className="text-error-icon-light dark:text-error-icon-dark font-jakarta-medium">visibilidade</Text>, bloqueio biométrico e gestão de sessões ativas.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              </SettingsAccordion>
            </View>
          </View>
        </View>

        {/* Segunda linha de exemplos - Info e Code */}
        <View style={{
          flexDirection: responsive({ mobile: 'column', tablet: 'row', desktop: 'row', default: 'column' }),
          gap: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 })
        }}>
          {/* Info Example */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-warning-icon-light dark:bg-warning-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Info
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  Sempre uma seção aberta • <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">collapsible={false}</Text>
                </Text>
              </View>
              
              <InfoAccordion defaultOpen="tech">
                <AccordionItem value="tech">
                  <AccordionTrigger>Especificações Técnicas</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">React Native Reanimated 3</Text> a 60fps. TypeScript strict mode. Suporte Web, iOS e Android. <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">WCAG 2.1 AA</Text> compliant.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="usage">
                  <AccordionTrigger>Como Implementar</AccordionTrigger>
                  <AccordionContent>
                    <Text className={`text-body-sm ${textSecondary}`}>
                      Importe <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">FAQAccordion</Text>, <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">SettingsAccordion</Text> ou <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">InfoAccordion</Text>. Design system automático.
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              </InfoAccordion>
            </View>
          </View>

          {/* Code Example Card */}
          <View style={{ 
            flex: responsive({ mobile: undefined, tablet: 1, desktop: 1, default: undefined }), 
            width: responsive({ mobile: '100%', tablet: undefined, desktop: undefined, default: '100%' })
          }}>
            <View className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`} style={{ borderWidth: 1, borderColor: isDark ? designColors['divider-dark'] : designColors['divider-light'] }}>
              <View className="mb-md">
                <View className="flex-row items-center mb-xs">
                  <View className="w-2 h-2 bg-error-icon-light dark:bg-error-icon-dark rounded-full mr-sm" />
                  <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
                    Implementação Rápida
                  </Text>
                </View>
                <Text className={`text-body-sm ${textSecondary} mb-md`}>
                  API simples e intuitiva
                </Text>
              </View>
              
              <View className={`${bgTertiary} rounded-lg ${responsive({ mobile: 'p-xs', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })}`}>
                <Text className={`text-mono-sm font-mono-regular leading-relaxed ${textSecondary}`}>
                  <Text className="text-info-icon-light dark:text-info-icon-dark">import</Text> {'{'}
                  <Text className="text-warning-icon-light dark:text-warning-icon-dark"> FAQAccordion </Text>
                  {'}'} <Text className="text-info-icon-light dark:text-info-icon-dark">from</Text> <Text className="text-success-icon-light dark:text-success-icon-dark">'@/components'</Text>
                  {'\n\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<FAQAccordion>'}</Text>
                  {'\n  '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<AccordionItem'}</Text> <Text className="text-warning-icon-light dark:text-warning-icon-dark">value</Text>=<Text className="text-success-icon-light dark:text-success-icon-dark">"item-1"</Text><Text className="text-error-icon-light dark:text-error-icon-dark">{'>'}</Text>
                  {'\n    '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<AccordionTrigger>'}</Text>
                  {'\n      '}Título
                  {'\n    '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'</AccordionTrigger>'}</Text>
                  {'\n    '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'<AccordionContent>'}</Text>
                  {'\n      '}Conteúdo
                  {'\n    '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'</AccordionContent>'}</Text>
                  {'\n  '}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'</AccordionItem>'}</Text>
                  {'\n'}
                  <Text className="text-error-icon-light dark:text-error-icon-dark">{'</FAQAccordion>'}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Quick Usage Guide - Espaçamento consistente */}
        <View 
          className={`${bgSecondary} rounded-xl ${responsive({ mobile: 'p-sm', tablet: 'p-sm', desktop: 'p-md', default: 'p-sm' })} mb-md border-l-4 border-primary-light dark:border-primary-dark`}
          style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}
        >
          <View className="flex-row items-center mb-xs">
            <Lightbulb size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs" />
            <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>
              Como funciona?
          </Text>
          </View>
          <Text className={`text-body-sm ${textSecondary}`}>
            Clique nos <Text className="text-primary-light dark:text-primary-dark font-jakarta-medium">títulos acima</Text> para expandir/recolher o conteúdo. Cada exemplo demonstra um comportamento diferente: <Text className="text-success-icon-light dark:text-success-icon-dark font-jakarta-medium">FAQ</Text> (apenas um aberto), <Text className="text-info-icon-light dark:text-info-icon-dark font-jakarta-medium">Settings</Text> (vários abertos), <Text className="text-warning-icon-light dark:text-warning-icon-dark font-jakarta-medium">Info</Text> (sempre um aberto).
          </Text>
        </View>

        {/* Recursos e API */}
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="flex-row items-center mb-sm">
            <View className={`w-1 h-6 ${isDark ? 'bg-primary-dark' : 'bg-primary-light'} rounded-full mr-sm`} />
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary}`}>
              Recursos e API
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Funcionalidades principais</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">React Native Reanimated 3</Text> - Animações 60fps nativas
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">TypeScript completo</Text> - Tipagem e IntelliSense
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Tema automático</Text> - Cores adaptativas light/dark
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Pré-configurações</Text> - FAQ, Settings e Info
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">Acessibilidade</Text> - WCAG 2.1 AA compliant
              </Text>
            </View>
            
          <View className="mb-md">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Props principais</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">type</Text> - "single" | "multiple"
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">collapsible</Text> - Permite fechar todos
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">defaultValue</Text> - Items iniciais abertos
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">children</Text> - AccordionItem components
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">onValueChange</Text> - Callback de mudança
              </Text>
            </View>
            
            <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary} mb-xs`}>Pré-configurações disponíveis</Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">FAQAccordion</Text> - type="single" + collapsible
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">SettingsAccordion</Text> - type="multiple"
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
              • <Text className="font-jakarta-medium">InfoAccordion</Text> - type="single" sem collapsible
              </Text>
            </View>
          </View>
          
        
        {/* Dica Pro */}
        <View className={`${isDark ? 'bg-success-bg-dark' : 'bg-success-bg-light'} rounded-lg p-md border ${isDark ? 'border-success-border-dark' : 'border-success-border-light'}`} style={{ marginTop: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }) }}>
          <View className="flex-row items-start">
            <Rocket size={responsive({ mobile: 14, tablet: 14, desktop: 16, default: 14 })} color={isDark ? '#10B981' : '#059669'} className="mr-xs mt-0.5" />
            <View className="flex-1">
              <Text className={`text-body-lg font-jakarta-bold ${textPrimary} mb-xs`}>
                Dica Pro
               </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
                Use <Text className="font-jakarta-medium text-primary-light dark:text-primary-dark">defaultValue</Text> para controlar quais items iniciam abertos. Combine com <Text className="font-jakarta-medium text-info-icon-light dark:text-info-icon-dark">onValueChange</Text> para criar experiências guiadas. As <Text className="font-jakarta-medium text-success-icon-light dark:text-success-icon-dark">pré-configurações</Text> cobrem 90% dos casos de uso.
        </Text>
          </View>
          </View>
        </View>

      </ScrollView>
    );
  };
  
  const renderButtonComponent = () => {
    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente Button
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O Button é um componente altamente personalizável para ações interativas, oferecendo
          diversas variantes, estados e opções de personalização. Ele mantém uma experiência visual
          e interativa consistente em todas as plataformas.
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
          
          {/* Variantes básicas */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Variantes de Botão</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              <Button variant="primary" onPress={() => {}}>
                Primary
              </Button>
              <Button variant="destructive" onPress={() => {}}>
                Destructive
              </Button>
              <Button variant="outline" onPress={() => {}}>
                Outline
              </Button>
              <Button variant="ghost" onPress={() => {}}>
                Ghost
              </Button>
              <Button variant="link" onPress={() => {}}>
                Link
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Principais variantes visuais disponíveis para uso em diferentes contextos.
            </Text>
          </View>
          
          {/* Tamanhos */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Tamanhos</Text>
            <View className="flex-row flex-wrap items-center gap-sm mb-sm">
              <Button size="xs" variant="primary" onPress={() => {}}>
                Extra pequeno
              </Button>
              <Button size="sm" variant="primary" onPress={() => {}}>
                Pequeno
              </Button>
              <Button size="md" variant="primary" onPress={() => {}}>
                Médio (padrão)
              </Button>
              <Button size="lg" variant="primary" onPress={() => {}}>
                Grande
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Botões em diferentes tamanhos para se adequar a diversas necessidades de UI.
            </Text>
          </View>
          
          {/* Botões com ícones */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Botões com Ícones</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              <Button 
                variant="primary" 
                leftIcon={<Mail size={16} strokeWidth={1.5} color="#FFFFFF" />}
                onPress={() => {}}
                size="md"
              >
                Ícone à esquerda
              </Button>
              <Button 
                variant="outline" 
                rightIcon={<ChevronRight size={16} strokeWidth={1.5} color={isDark ? "#FFFFFF" : "#14181B"} />}
                onPress={() => {}}
                size="md"
              >
                Ícone à direita
              </Button>
              <Button 
                variant="ghost" 
                isIconOnly
                onPress={() => {}}
                size="md"
              >
                <Plus size={16} strokeWidth={1.5} color={isDark ? "#FFFFFF" : "#14181B"} />
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Botões podem incluir ícones à esquerda, à direita ou serem compostos apenas por um ícone.
            </Text>
          </View>

          {/* Botões Favicon (Circulares) */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Botões Favicon (Circulares)</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              {/* Primary */}
              <Button 
                variant="primary" 
                isIconOnly
                onPress={() => {}}
                size="md"
                style={{ borderRadius: 50 }}
              >
                <Plus size={16} strokeWidth={2} color="#FFFFFF" />
              </Button>
              
              {/* Outline */}
              <Button 
                variant="outline" 
                isIconOnly
                onPress={() => {}}
                size="md"
                style={{ borderRadius: 50 }}
              >
                <Plus size={16} strokeWidth={2} color={isDark ? "#FFFFFF" : "#14181B"} />
              </Button>
              
              {/* Ghost */}
              <Button 
                variant="ghost" 
                isIconOnly
                onPress={() => {}}
                size="md"
                style={{ borderRadius: 50 }}
              >
                <Plus size={16} strokeWidth={2} color={isDark ? "#FFFFFF" : "#14181B"} />
              </Button>
              
              {/* Destructive */}
              <Button 
                variant="destructive" 
                isIconOnly
                onPress={() => {}}
                size="md"
                style={{ borderRadius: 50 }}
              >
                <Plus size={16} strokeWidth={2} color="#FFFFFF" />
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Botões circulares tipo favicon com ícone +, disponíveis em todas as variantes para diferentes contextos.
            </Text>
          </View>
          
          {/* Estados do botão */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Estados</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              <Button 
                variant="primary" 
                onPress={() => {}}
              >
                Normal
              </Button>
              <Button 
                variant="primary" 
                onPress={() => {}}
                disabled
              >
                Desabilitado
              </Button>
              <Button 
                variant="primary" 
                onPress={() => {}}
                loading
              >
                Carregando
              </Button>
              <Button 
                variant="primary" 
                onPress={() => {}}
                loading
                loadingText="Aguarde..."
              >
                Com texto
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Botões em diferentes estados: normal, desabilitado e carregamento.
            </Text>
          </View>
          
          {/* Seção com Exemplo prático e Botão com loading lado a lado */}
          <View className="mb-lg">
            <View className={`flex-row ${isMobile ? 'flex-col' : ''} gap-md`}>
              {/* Exemplo prático */}
              <View className={`${isMobile ? 'mb-md' : 'flex-1'}`}>
                <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Exemplo prático</Text>
                <View className="mb-sm">
                  <Button 
                    variant="primary" 
                    leftIcon={<Mail size={16} strokeWidth={1.5} color="#FFFFFF" />}
                    onPress={() => {}}
                    fullWidth
                    size="md"
                  >
                    Login with Email
                  </Button>
                </View>
                <Text className={`text-body-sm ${textSecondary} mt-xs`}>
                  Botão de login com largura total e ícone, ilustrando um caso de uso comum.
                </Text>
              </View>
              
              {/* Botão de loading */}
              <View className={`${isMobile ? '' : 'flex-1'}`}>
                <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Botão com loading</Text>
                <View className="mb-sm">
                  <Button 
                    variant="primary" 
                    onPress={() => {}}
                    loading
                    loadingText="Please wait"
                  >
                    Please wait
                  </Button>
                </View>
                <Text className={`text-body-sm ${textSecondary} mt-xs`}>
                  Botão em estado de carregamento com texto informativo para o usuário.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O Button oferece diversas características para atender diferentes necessidades:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Variantes</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Primary, Destructive, Outline, Ghost, Link</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tamanhos</Text>
            <Text className={`text-body-sm ${textSecondary}`}>xs, sm, md, lg para diferentes necessidades de UI</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema adaptativo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Adapta-se automaticamente a temas claros e escuros</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Acessibilidade</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Compatível com leitores de tela e navegação por teclado</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Estados</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Normal, Disabled, Loading com feedback visual adequado</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Ícones</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Suporte a ícones à esquerda, à direita ou botão de ícone</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Propriedades
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O componente Button possui diversas propriedades para personalização:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>children</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Texto do botão ou conteúdo React</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>variant</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Estilo visual ('primary', 'destructive', 'outline', 'ghost', 'link')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>size</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Tamanho do botão ('xs', 'sm', 'md', 'lg')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>loading</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o botão está em estado de carregamento (boolean)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>loadingText</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Texto exibido durante o carregamento (string)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>disabled</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o botão está desabilitado (boolean)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>leftIcon / rightIcon</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Ícones exibidos à esquerda/direita do texto (ReactNode)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>isIconOnly</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o botão contém apenas um ícone (boolean)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>onPress</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Função chamada quando o botão é pressionado</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>fullWidth</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o botão deve ocupar toda a largura disponível (boolean)</Text>
          </View>
          
          <Text className={`text-body-sm ${textSecondary} mt-md`}>
            E outras propriedades para personalização completa do componente...
          </Text>
        </View>
      </View>
    );
  };

  const renderDesignSystem = () => {
    return (
      <ScrollView className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: isMobile ? 120 : 0 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`p-lg`}>
          {/* Título da seção */}
          <Text className={`text-headline-lg font-jakarta-bold ${textPrimary} mb-md`}>
            Design System
          </Text>
          <Text className={`text-body-md ${textSecondary} mb-xl`}>
            Configuração dinâmica do sistema de design do projeto. Todas as informações são carregadas diretamente dos tokens de design em tempo real.
          </Text>
          
          {/* Resumo da configuração atual */}
          <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>Resumo da Configuração</Text>
            <View className="flex-row flex-wrap gap-md">
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Cores: {Object.keys(designColors).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>Incluindo variações de tema</Text>
              </View>
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Espaçamentos: {Object.keys(designSpacing).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>Aliases semânticos + valores</Text>
              </View>
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tipografia: {Object.keys(designFontSize).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>Escalas completas de texto</Text>
              </View>
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Breakpoints: {Object.keys(designBreakpoints).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>Para responsividade</Text>
              </View>
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Border Radius: {Object.keys(designBorderRadius).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>De none até full</Text>
              </View>
              <View className="flex-1 min-w-[200px]">
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Efeitos: {Object.keys(designBoxShadow).length + Object.keys(designShadows).length + Object.keys(designOpacity).length + Object.keys(designZIndex).length + Object.keys(designTransitionDuration).length}</Text>
                <Text className={`text-body-sm ${textSecondary}`}>Sombras, opacidade, z-index, transições</Text>
              </View>
            </View>
          </View>

          {/* Seção de Cores */}
          <SectionTitle title="Cores" textColor={textPrimary} />

          {/* Paleta da Marca */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Paleta da Marca</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            <DynamicColorCard 
              name="Brand Purple" 
              colorValue={designColors['brand-purple']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Brand Green" 
              colorValue={designColors['brand-green']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Brand Light" 
              colorValue={designColors['brand-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Brand Coral" 
              colorValue={designColors['brand-coral']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Brand Blue" 
              colorValue={designColors['brand-blue']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Brand Orange" 
              colorValue={designColors['brand-orange']} 
              textColor={textPrimary} 
            />
          </View>

          {/* Cores Primárias - Light/Dark theme */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Cores Primárias</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            <DynamicColorCard 
              name="Primary" 
              colorValue={isDark ? designColors['primary-dark'] : designColors['primary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Primary Hover" 
              colorValue={isDark ? designColors['primary-dark-hover'] : designColors['primary-light-hover']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Primary Active" 
              colorValue={isDark ? designColors['primary-dark-active'] : designColors['primary-light-active']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Secondary" 
              colorValue={isDark ? designColors['secondary-dark'] : designColors['secondary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Secondary Hover" 
              colorValue={isDark ? designColors['secondary-dark-hover'] : designColors['secondary-light-hover']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Secondary Active" 
              colorValue={isDark ? designColors['secondary-dark-active'] : designColors['secondary-light-active']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Tertiary" 
              colorValue={isDark ? designColors['tertiary-dark'] : designColors['tertiary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Tertiary Hover" 
              colorValue={isDark ? designColors['tertiary-dark-hover'] : designColors['tertiary-light-hover']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Tertiary Active" 
              colorValue={isDark ? designColors['tertiary-dark-active'] : designColors['tertiary-light-active']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Alternate" 
              colorValue={isDark ? designColors['alternate-dark'] : designColors['alternate-light']} 
              textColor={textPrimary} 
            />
          </View>
          
          {/* Cores de Texto */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Texto</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            <DynamicColorCard 
              name="Text Primary" 
              colorValue={isDark ? designColors['text-primary-dark'] : designColors['text-primary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Text Secondary" 
              colorValue={isDark ? designColors['text-secondary-dark'] : designColors['text-secondary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Text Tertiary" 
              colorValue={isDark ? designColors['text-tertiary-dark'] : designColors['text-tertiary-light']} 
              textColor={textPrimary} 
            />
          </View>
          
          {/* Cores de Background */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Background</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            <DynamicColorCard 
              name="BG Primary" 
              colorValue={isDark ? designColors['bg-primary-dark'] : designColors['bg-primary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="BG Secondary" 
              colorValue={isDark ? designColors['bg-secondary-dark'] : designColors['bg-secondary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="BG Tertiary" 
              colorValue={isDark ? designColors['bg-tertiary-dark'] : designColors['bg-tertiary-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Icon" 
              colorValue={isDark ? designColors['icon-dark'] : designColors['icon-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Divider" 
              colorValue={isDark ? designColors['divider-dark'] : designColors['divider-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Hover" 
              colorValue={isDark ? designColors['hover-dark'] : designColors['hover-light']} 
              textColor={textPrimary} 
            />
            <DynamicColorCard 
              name="Active" 
              colorValue={isDark ? designColors['active-dark'] : designColors['active-light']} 
              textColor={textPrimary} 
            />
          </View>
          
          {/* Cores de Feedback */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Feedback</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            {/* Success */}
            <View className="mb-sm">
              <Text className={`text-subtitle-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Sucesso</Text>
              <View className="flex-row flex-wrap gap-sm">
                <DynamicColorCard 
                  name="Success BG" 
                  colorValue={isDark ? designColors['success-bg-dark'] : designColors['success-bg-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Success Text" 
                  colorValue={isDark ? designColors['success-text-dark'] : designColors['success-text-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Success Border" 
                  colorValue={isDark ? designColors['success-border-dark'] : designColors['success-border-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Success Icon" 
                  colorValue={isDark ? designColors['success-icon-dark'] : designColors['success-icon-light']} 
                  textColor={textPrimary} 
                />
              </View>
            </View>
            
            {/* Warning */}
            <View className="mb-sm">
              <Text className={`text-subtitle-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Alerta</Text>
              <View className="flex-row flex-wrap gap-sm">
                <DynamicColorCard 
                  name="Warning BG" 
                  colorValue={isDark ? designColors['warning-bg-dark'] : designColors['warning-bg-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Warning Text" 
                  colorValue={isDark ? designColors['warning-text-dark'] : designColors['warning-text-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Warning Border" 
                  colorValue={isDark ? designColors['warning-border-dark'] : designColors['warning-border-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Warning Icon" 
                  colorValue={isDark ? designColors['warning-icon-dark'] : designColors['warning-icon-light']} 
                  textColor={textPrimary} 
                />
              </View>
            </View>
            
            {/* Error */}
            <View className="mb-sm">
              <Text className={`text-subtitle-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Erro</Text>
              <View className="flex-row flex-wrap gap-sm">
                <DynamicColorCard 
                  name="Error BG" 
                  colorValue={isDark ? designColors['error-bg-dark'] : designColors['error-bg-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Error Text" 
                  colorValue={isDark ? designColors['error-text-dark'] : designColors['error-text-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Error Border" 
                  colorValue={isDark ? designColors['error-border-dark'] : designColors['error-border-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Error Icon" 
                  colorValue={isDark ? designColors['error-icon-dark'] : designColors['error-icon-light']} 
                  textColor={textPrimary} 
                />
              </View>
            </View>
            
            {/* Info */}
            <View className="mb-sm">
              <Text className={`text-subtitle-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Informação</Text>
              <View className="flex-row flex-wrap gap-sm">
                <DynamicColorCard 
                  name="Info BG" 
                  colorValue={isDark ? designColors['info-bg-dark'] : designColors['info-bg-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Info Text" 
                  colorValue={isDark ? designColors['info-text-dark'] : designColors['info-text-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Info Border" 
                  colorValue={isDark ? designColors['info-border-dark'] : designColors['info-border-light']} 
                  textColor={textPrimary} 
                />
                <DynamicColorCard 
                  name="Info Icon" 
                  colorValue={isDark ? designColors['info-icon-dark'] : designColors['info-icon-light']} 
                  textColor={textPrimary} 
                />
              </View>
            </View>
          </View>
          
          {/* Seção de Tipografia */}
          <SectionTitle title="Tipografia" textColor={textPrimary} />
          
          {/* Tipografia responsiva */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Sistema Responsivo</Text>
          <Text className={`text-body-md ${textSecondary} mb-md`}>
            A tipografia se adapta automaticamente ao breakpoint. Visualize como cada tamanho aparece em diferentes dispositivos.
          </Text>
          
          {/* Breakpoint atual */}
          <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>
                  Breakpoint Atual: {currentBreakpoint}
                </Text>
                <Text className={`text-body-sm ${textSecondary}`}>
                  Largura: {width}px
                </Text>
              </View>
              <View className={`px-sm py-xs rounded ${isDark ? 'bg-primary-dark/20' : 'bg-primary-light/20'}`}>
                <Text className={`text-body-xs font-jakarta-medium`} style={{ 
                  color: isDark ? designColors['primary-dark'] : designColors['primary-light'] 
                }}>
                  Responsivo
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs para alternar breakpoints (só aparece no desktop) */}
          {isDesktop && (
            <View className="mb-lg">
              <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>
                Visualizar em diferentes breakpoints:
              </Text>
              <View className="flex-row flex-wrap gap-xs">
                {[
                  { key: 'current', label: 'Desktop (Atual)', width: width },
                  { key: 'tablet', label: 'Tablet', width: 800 },
                  { key: 'mobile', label: 'Mobile', width: 360 }
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setTypographyActiveTab(tab.key as any)}
                    className={`px-md py-sm rounded-md border ${
                      typographyActiveTab === tab.key
                        ? (isDark ? 'bg-primary-dark/20 border-primary-dark' : 'bg-primary-light/20 border-primary-light')
                        : `border-divider-${isDark ? 'dark' : 'light'}`
                    }`}
                  >
                    <Text className={`text-body-sm font-jakarta-medium ${
                      typographyActiveTab === tab.key 
                        ? (isDark ? 'text-primary-dark' : 'text-primary-light')
                        : textSecondary
                    }`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Preview da tipografia responsiva */}
          <View className={`${bgSecondary} rounded-lg p-lg mb-lg`}>
            <View className="flex-row items-center justify-between mb-md">
              <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary}`}>
                Preview Responsivo
              </Text>
              <Text className={`text-body-xs ${textSecondary}`}>
                {(() => {
                  if (!isDesktop) return `${width}px`;
                  switch (typographyActiveTab) {
                    case 'mobile': return '360px (Mobile)';
                    case 'tablet': return '800px (Tablet)';
                    case 'desktop': 
                    case 'current': 
                    default: return `${width}px (Desktop)`;
                  }
                })()}
              </Text>
            </View>
            
            {/* Lista de todos os tamanhos responsivos */}
            {Object.entries(responsiveFontSize).map(([key, config]) => {
              // Determina a largura para simulação
              const simulatedWidth = (() => {
                if (!isDesktop) return width;
                switch (typographyActiveTab) {
                  case 'mobile': return 360;
                  case 'tablet': return 800;
                  case 'desktop':
                  case 'current':
                  default: return width;
                }
              })();
              
              const typography = getResponsiveTypography(key as any, simulatedWidth);
              
              return (
                <View key={key} className="mb-md">
                  <Text 
                    className={textPrimary}
                    style={{
                      fontSize: typography.fontSize,
                      lineHeight: typography.lineHeight,
                      fontWeight: typography.fontWeight as any,
                      fontFamily: typography.fontFamily,
                      marginBottom: 4
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                  </Text>
                  
                  {/* Informações técnicas */}
                  <Text className={`text-body-xs ${textSecondary} opacity-70 mb-xs`}>
                    Atual: {typography.fontSize}px/{typography.lineHeight}px • Weight: {typography.fontWeight}
                  </Text>
                  
                  {/* Valores para todos os breakpoints */}
                  <View className="flex-row flex-wrap gap-xs">
                    <Text className={`text-body-xs ${textSecondary} px-xs py-1 rounded ${
                      isDesktop && (typographyActiveTab === 'desktop' || typographyActiveTab === 'current') 
                        ? (isDark ? 'bg-primary-dark/20' : 'bg-primary-light/20') 
                        : (isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light')
                    }`}>
                      D: {config.size.desktop}px
                    </Text>
                    <Text className={`text-body-xs ${textSecondary} px-xs py-1 rounded ${
                      (!isDesktop && isTablet) || (isDesktop && typographyActiveTab === 'tablet') 
                        ? (isDark ? 'bg-primary-dark/20' : 'bg-primary-light/20') 
                        : (isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light')
                    }`}>
                      T: {config.size.tablet}px
                    </Text>
                    <Text className={`text-body-xs ${textSecondary} px-xs py-1 rounded ${
                      (!isDesktop && isMobile) || (isDesktop && typographyActiveTab === 'mobile') 
                        ? (isDark ? 'bg-primary-dark/20' : 'bg-primary-light/20') 
                        : (isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light')
                    }`}>
                      M: {config.size.mobile}px
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Pesos disponíveis da fonte */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Pesos disponíveis da fonte</Text>
          <View className="flex-row flex-wrap gap-md mb-lg">
            <Text className={`text-body-lg font-jakarta-thin ${textPrimary}`}>Thin (200)</Text>
            <Text className={`text-body-lg font-jakarta-light ${textPrimary}`}>Light (300)</Text>
            <Text className={`text-body-lg font-jakarta-regular ${textPrimary}`}>Regular (400)</Text>
            <Text className={`text-body-lg font-jakarta-medium ${textPrimary}`}>Medium (500)</Text>
            <Text className={`text-body-lg font-jakarta-semibold ${textPrimary}`}>SemiBold (600)</Text>
            <Text className={`text-body-lg font-jakarta-bold ${textPrimary}`}>Bold (700)</Text>
            <Text className={`text-body-lg font-jakarta-extrabold ${textPrimary}`}>ExtraBold (800)</Text>
          </View>
          
          {/* Fonte monoespaçada */}
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Fonte monoespaçada</Text>
          <Text className={`text-body-lg font-mono-regular ${textPrimary} mb-xl`}>Space Mono Regular (para código)</Text>
          
          {/* Seção de Breakpoints */}
          <SectionTitle title="Breakpoints" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Breakpoint Atual</Text>
            <View className={`p-lg rounded-lg ${bgTertiary} mb-lg flex-row items-center justify-between`}>
              <View>
                <Text className={`text-display-sm font-jakarta-bold ${textPrimary}`}>
                  {currentBreakpoint}
                </Text>
                <Text className={`text-body-lg font-jakarta-medium ${textSecondary}`}>
                  Largura atual: {width}px
                </Text>
              </View>
              
              <View className={`h-24 w-24 rounded-full items-center justify-center`} style={{ backgroundColor: isDark ? designColors['primary-dark'] + '33' : designColors['primary-light'] + '33' }}>
                <Text className={`text-display-md font-jakarta-bold`} style={{ color: isDark ? designColors['primary-dark'] : designColors['primary-light'] }}>
                  {currentBreakpoint.charAt(0)}
                </Text>
              </View>
            </View>
            
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Intervalos de Breakpoints (Dinâmicos)</Text>
            <View className={`${bgTertiary} p-md rounded-lg`}>
              {Object.entries(designBreakpoints).map(([key, value], index) => {
                const nextBreakpoint = Object.values(designBreakpoints)[index + 1];
                const isLast = index === Object.entries(designBreakpoints).length - 1;
                const colorIndex = index % 3;
                let bgColor;
                
                if (colorIndex === 0) {
                  bgColor = isDark ? designColors['primary-dark'] : designColors['primary-light'];
                } else if (colorIndex === 1) {
                  bgColor = isDark ? designColors['secondary-dark'] : designColors['secondary-light'];
                } else {
                  bgColor = isDark ? designColors['tertiary-dark'] : designColors['tertiary-light'];
                }
                
                return (
                  <View key={key} className="flex-row items-center mb-sm">
                    <View className="h-3 w-3 rounded-full mr-xs" style={{ backgroundColor: bgColor }} />
                    <Text className={`text-body-md font-jakarta-medium ${textPrimary}`}>
                      {key}: {isLast ? `${value}px ou mais` : `${index === 0 ? '0' : Object.values(designBreakpoints)[index - 1] + 'px'} a ${value - 1}px`}
                    </Text>
                    <Text className={`text-body-sm ${textSecondary} ml-auto`}>{value}px</Text>
                  </View>
                );
              })}
            </View>
            
            {/* Espaçamento responsivo dinâmico */}
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md mt-lg`}>Espaçamento Responsivo</Text>
            <View className={`${bgTertiary} p-md rounded-lg`}>
              <View className="flex-row items-center mb-sm">
                <Text className={`text-body-md font-jakarta-medium ${textPrimary} flex-1`}>Page Padding atual:</Text>
                <Text className={`text-body-sm ${textSecondary}`}>{designResponsiveSpacing.getPagePadding(width)}px</Text>
              </View>
              <View className="flex-row items-center">
                <Text className={`text-body-md font-jakarta-medium ${textPrimary} flex-1`}>Gap atual:</Text>
                <Text className={`text-body-sm ${textSecondary}`}>{designResponsiveSpacing.getGap(width)}px</Text>
              </View>
            </View>
          </View>
          
          {/* Seção de Espaçamentos */}
          <SectionTitle title="Espaçamentos" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>Configuração Dinâmica de Espaçamentos</Text>
            <Text className={`text-body-md ${textSecondary} mb-lg`}>
              Todos os valores são carregados diretamente dos tokens de design. Total: {Object.keys(designSpacing).length} tokens.
            </Text>
            
            {/* Mostrar todos os espaçamentos dinamicamente, agrupados */}
            {[
              { 
                title: 'Aliases Semânticos', 
                keys: ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
                color: isDark ? designColors['primary-dark'] : designColors['primary-light']
              },
              { 
                title: 'Extra Pequenos/Pequenos (0-20px)', 
                keys: ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5'],
                color: isDark ? designColors['secondary-dark'] : designColors['secondary-light']
              },
              { 
                title: 'Médios (24-64px)', 
                keys: ['6', '7', '8', '9', '10', '11', '12', '14', '16'],
                color: isDark ? designColors['tertiary-dark'] : designColors['tertiary-light']
              }
            ].map((group, groupIndex) => (
              <View key={groupIndex} className="mb-lg">
                <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>{group.title}</Text>
                <View className="flex-row flex-wrap mb-lg">
                  {group.keys.map(key => {
                    const value = designSpacing[key as keyof typeof designSpacing];
                    return value ? (
                      <DynamicSpacingExample 
                        key={key}
                        name={key} 
                        value={value} 
                        bgColor={group.color} 
                        textColor={textPrimary} 
                      />
                    ) : null;
                  })}
                </View>
              </View>
            ))}
            
            {/* Mostrar grandes e gigantes apenas em telas maiores */}
            {!isMobile && (
              <>
                {[
                  { 
                    title: 'Grandes (72-128px)', 
                    keys: ['18', '20', '24', '28', '32'],
                    color: isDark ? designColors['primary-dark'] + '88' : designColors['primary-light'] + '88'
                  },
                  { 
                    title: 'Gigantes (144-384px)', 
                    keys: ['36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'],
                    color: isDark ? designColors['secondary-dark'] + '88' : designColors['secondary-light'] + '88'
                  }
                ].map((group, groupIndex) => (
                  <View key={groupIndex} className="mb-lg">
                    <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>{group.title}</Text>
                    <View className="flex-row flex-wrap mb-lg">
                      {group.keys.map(key => {
                        const value = designSpacing[key as keyof typeof designSpacing];
                        return value ? (
                          <DynamicSpacingExample 
                            key={key}
                            name={key} 
                            value={value} 
                            bgColor={group.color} 
                            textColor={textPrimary} 
                          />
                        ) : null;
                      })}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
          
          {/* Seção de Border Radius */}
          <SectionTitle title="Border Radius" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              Todos os raios de borda disponíveis: {Object.keys(designBorderRadius).length} opções
            </Text>
            <View className="flex-row flex-wrap gap-md">
              {Object.entries(designBorderRadius).map(([name, value]) => (
                <DynamicBorderRadiusExample 
                  key={name}
                  name={name} 
                  value={value} 
                  bgColor={isDark ? designColors['primary-dark'] : designColors['primary-light']} 
                  textColor={textPrimary} 
                />
              ))}
            </View>
          </View>
          
          {/* Seção de Sombras */}
          <SectionTitle title="Sombras" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              Sombras dinâmicas dos tokens de design. Total: {Object.keys(designBoxShadow).length} opções
            </Text>

                          {/* 1. Direção da Sombra */}
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Direção da Sombra</Text>
            <Text className={`text-body-sm ${textSecondary} mb-md`}>
              Indica de onde vem a luz e para onde vai a sombra
            </Text>
            <View className="grid grid-cols-2 md:grid-cols-3 gap-md mb-xl">
              {(['shadow-down', 'shadow-up', 'shadow-left', 'shadow-right', 'shadow-around', 'shadow-all'] as const).map((name) => (
                <DynamicShadowExample 
                  key={name}
                  name={name.replace('shadow-', '')} 
                  shadowValue={designBoxShadow[name]}
                  textColor={textPrimary} 
                  bgColor={bgTertiary} 
                />
              ))}
            </View>

            {/* 2. Intensidade / Elevação */}
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Intensidade / Elevação</Text>
            <Text className={`text-body-sm ${textSecondary} mb-md`}>
              Inspirado nos níveis de elevação do Material Design
            </Text>
            <View className="grid grid-cols-2 md:grid-cols-3 gap-md mb-xl">
              {(['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'] as const).map((name) => (
                <DynamicShadowExample 
                  key={name}
                  name={name.replace('shadow-', '')} 
                  shadowValue={designBoxShadow[name]}
                  textColor={textPrimary} 
                  bgColor={bgTertiary} 
                />
              ))}
            </View>

            {/* 3. Tipos Especiais */}
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Tipos Especiais</Text>
            <Text className={`text-body-sm ${textSecondary} mb-md`}>
              Casos específicos e efeitos únicos
            </Text>
            <View className="grid grid-cols-2 md:grid-cols-3 gap-md mb-xl">
              {(['shadow-inner', 'shadow-float', 'shadow-glow', 'shadow-none'] as const).map((name) => (
                <DynamicShadowExample 
                  key={name}
                  name={name.replace('shadow-', '')} 
                  shadowValue={designBoxShadow[name]}
                  textColor={textPrimary} 
                  bgColor={bgTertiary} 
                />
              ))}
            </View>

            {/* 4. Componentes Específicos */}
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Componentes Específicos</Text>
            <Text className={`text-body-sm ${textSecondary} mb-md`}>
              Sombras otimizadas para casos de uso comuns
            </Text>
            <View className="grid grid-cols-2 md:grid-cols-3 gap-md">
              {(['shadow-card', 'shadow-button', 'shadow-dropdown', 'shadow-modal', 'shadow-popover'] as const).map((name) => (
                <DynamicShadowExample 
                  key={name}
                  name={name.replace('shadow-', '')} 
                  shadowValue={designBoxShadow[name]}
                  textColor={textPrimary} 
                  bgColor={bgTertiary} 
                />
              ))}
            </View>
          </View>
          
          {/* Seção de Sombras Inteligentes (NOVO SISTEMA) */}
          <SectionTitle title="🧠 Sombras Inteligentes" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              🎯 <Text className="font-jakarta-bold">Novo Sistema de Sombras:</Text> Sempre escuras em ambos os temas! 
              Total: {Object.keys(designShadows).length} tipos inteligentes
            </Text>
            
            <View className={`p-sm rounded-md mb-md ${isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light'}`}>
                              <View className="flex-row items-start mb-xs">
                  <Lightbulb size={14} color={isDark ? '#10B981' : '#059669'} style={{ marginRight: 4, marginTop: 1 }} />
              <Text className={`text-body-sm ${textSecondary} mb-xs`}>
                    <Text className="font-jakarta-bold">Conceito:</Text> As sombras são sempre escuras (#000000) mas 
                com intensidades diferentes para cada tema:
              </Text>
                </View>
              <Text className={`text-body-sm ${textSecondary}`}>
                • <Text className="font-jakarta-bold">Tema claro:</Text> Sombras mais sutis (menor opacidade)
              </Text>
              <Text className={`text-body-sm ${textSecondary}`}>
                • <Text className="font-jakarta-bold">Tema escuro:</Text> Sombras mais intensas (maior opacidade)
              </Text>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {Object.entries(designShadows).map(([name, shadowConfig]) => (
                <View 
                  key={name}
                  className={`${bgTertiary} rounded-md p-md border border-divider-light/dark`}
                >
                  <Text className={`text-label-sm font-jakarta-bold ${textPrimary} mb-sm`}>
                    {name}
                  </Text>
                  
                  {/* Demonstração visual da sombra */}
                  <View className="mb-sm">
                    <View 
                      style={{
                        width: '100%',
                        height: 60,
                        backgroundColor: isDark ? designColors['bg-primary-dark'] : designColors['bg-primary-light'],
                        borderRadius: 8,
                        shadowColor: shadowConfig.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.3 : 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text className={`text-body-sm ${textSecondary}`}>
                        Exemplo visual
                      </Text>
                    </View>
                  </View>
                  
                  {/* Informações técnicas */}
                  <View className="space-y-1">
                    <Text className={`text-body-xs ${textSecondary}`}>
                      <Text className="font-jakarta-medium">Cor:</Text> {shadowConfig.color}
                    </Text>
                    <Text className={`text-body-xs ${textSecondary}`}>
                      <Text className="font-jakarta-medium">Claro:</Text> {shadowConfig.light}
                    </Text>
                    <Text className={`text-body-xs ${textSecondary}`}>
                      <Text className="font-jakarta-medium">Escuro:</Text> {shadowConfig.dark}
                    </Text>
                  </View>
                  
                  {/* Botão para copiar */}
                  <View className="mt-sm">
                    <TouchableOpacity
                      onPress={() => {
                        const code = `getShadow('${name}', '${isDark ? 'dark' : 'light'}')`;
                        // Aqui você pode implementar a lógica de cópia
                        console.log('Copiado:', code);
                      }}
                      className={`p-2 rounded-md ${isDark ? 'bg-bg-secondary-dark' : 'bg-bg-secondary-light'}`}
                    >
                      <Text className={`text-body-xs ${textSecondary} text-center`}>
                        Copiar código
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            
            <View className={`mt-md p-sm rounded-md ${isDark ? 'bg-primary-dark/10' : 'bg-primary-light/10'} border border-primary-light/dark`}>
                              <View className="flex-row items-start mb-xs">
                  <Rocket size={14} color={isDark ? '#10B981' : '#059669'} style={{ marginRight: 4, marginTop: 1 }} />
              <Text className={`text-body-sm ${textSecondary} mb-xs`}>
                    <Text className="font-jakarta-bold">Como usar:</Text>
              </Text>
                </View>
              <Text className={`text-body-xs font-mono ${textSecondary}`}>
                {`import { getShadow, getShadowColor } from '@/design-system/tokens/effects';`}
              </Text>
              <Text className={`text-body-xs font-mono ${textSecondary}`}>
                {`shadowColor: getShadowColor('input'), // Sempre #000000`}
              </Text>
              <Text className={`text-body-xs font-mono ${textSecondary}`}>
                {`boxShadow: getShadow('input', '${isDark ? 'dark' : 'light'}'), // Intensidade automática`}
              </Text>
            </View>
          </View>
          
          {/* Seção de Opacidade */}
          <SectionTitle title="Opacidade" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              Valores de opacidade dinâmicos dos tokens de design. Total: {Object.keys(designOpacity).length} opções
            </Text>
            <View className="grid grid-cols-3 md:grid-cols-6 gap-md">
              {Object.entries(designOpacity).map(([name, value]) => (
                <DynamicOpacityExample 
                  key={name}
                  name={name} 
                  value={value} 
                  bgColor={isDark ? designColors['primary-dark'] : designColors['primary-light']} 
                  textColor={textPrimary} 
                />
              ))}
            </View>
          </View>
          
          {/* Seção de z-index */}
          <SectionTitle title="Z-Index" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              Valores de z-index dinâmicos dos tokens de design. Total: {Object.keys(designZIndex).length} opções
            </Text>
            <View className="grid grid-cols-3 md:grid-cols-6 gap-md">
              {Object.entries(designZIndex).map(([name, value]) => (
                <ValueDisplay 
                  key={name}
                  name={name} 
                  value={String(value)} 
                  textColor={textPrimary} 
                />
              ))}
            </View>
          </View>
          
          {/* Seção de Tempos de Transição */}
          <SectionTitle title="Tempos de Transição" textColor={textPrimary} />
          
          <View className={`${bgSecondary} rounded-lg p-lg mb-xl`}>
            <Text className={`text-body-md ${textSecondary} mb-md`}>
              Tempos de transição dinâmicos dos tokens de design. Total: {Object.keys(designTransitionDuration).length} opções
            </Text>
            <View className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {Object.entries(designTransitionDuration).map(([name, value]) => (
                <ValueDisplay 
                  key={name}
                  name={name} 
                  value={value} 
                  textColor={textPrimary} 
                />
              ))}
            </View>
          </View>
          
        </View>
      </ScrollView>
    );
  };

  const renderToastComponent = () => {
    const showToast = (type: 'success' | 'error' | 'info' | 'warning') => {
      // Primeiro esconde qualquer toast visível
      setToastVisible(false);
      
      // Pequeno atraso para garantir que o estado anterior seja processado
      setTimeout(() => {
        setToastType(type);
        setToastVisible(true);
      }, 100);
    };

    // Verifica se estamos em ambiente móvel/nativo - removido pois já existe no escopo global
    const mobilePositions = ['top', 'bottom'];

    return (
      <View className="p-lg">
        <Toast
          visible={toastVisible}
          type={toastType}
          position={toastPosition}
          message={`Toast de ${toastType === 'success' ? 'sucesso' : 
                          toastType === 'error' ? 'erro' : 
                          toastType === 'warning' ? 'alerta' : 'informação'}`}
          description={`Este é um exemplo de toast do tipo ${toastType}, posicionado na posição ${ToastPositionLabels[toastPosition]}.`}
          closable={toastClosable}
          showProgressBar={toastProgressBar}
          duration={10000} // Aumentando a duração para testes
          onHide={() => setToastVisible(false)}
        />

        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente Toast
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O Toast é um componente de notificação que fornece feedback contextual aos usuários.
          Suporta diferentes tipos, posições e opções de personalização, mantendo uma experiência
          consistente em todas as plataformas.
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
          
          {/* Tipos de Toast */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Tipos de Toast</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              <Button 
                variant="primary" 
                onPress={() => showToast('success')}
                leftIcon={<CheckCircle size={16} strokeWidth={1.5} color="#FFFFFF" />}
              >
                Sucesso
              </Button>
              <Button 
                variant="destructive" 
                onPress={() => showToast('error')}
                leftIcon={<AlertCircle size={16} strokeWidth={1.5} color="#FFFFFF" />}
              >
                Erro
              </Button>
              <Button 
                variant="outline" 
                onPress={() => showToast('warning')}
                leftIcon={<AlertTriangle size={16} strokeWidth={1.5} color={isDark ? "#FFFFFF" : "#14181B"} />}
              >
                Alerta
              </Button>
              <Button 
                variant="ghost" 
                onPress={() => showToast('info')}
                leftIcon={<Info size={16} strokeWidth={1.5} color={isDark ? "#FFFFFF" : "#14181B"} />}
              >
                Informação
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Diferentes tipos de Toast para diferentes contextos de feedback.
            </Text>
          </View>
          
          {/* Posições */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Posições</Text>
            {isNative ? (
              // Em dispositivos nativos, mostramos apenas top e bottom
              <View className="flex-row flex-wrap gap-sm mb-sm">
                <Button 
                  variant={toastPosition === 'top' ? "primary" : "outline"} 
                  onPress={() => {
                    setToastPosition('top');
                    showToast(toastType);
                  }}
                  size="sm"
                >
                  {ToastPositionLabels['top']}
                </Button>
                <Button 
                  variant={toastPosition === 'bottom' ? "primary" : "outline"} 
                  onPress={() => {
                    setToastPosition('bottom');
                    showToast(toastType);
                  }}
                  size="sm"
                >
                  {ToastPositionLabels['bottom']}
                </Button>
                <Text className={`text-body-sm ${textSecondary} mt-sm`}>
                  Em dispositivos móveis, o Toast é exibido apenas nas posições superior e inferior.
                </Text>
              </View>
            ) : (
              // Na web, mostramos todas as opções de posição
              <View className="flex-row flex-wrap gap-sm mb-sm">
                <View className="flex-col gap-sm mr-sm">
                  <Text className={`text-body-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Topo</Text>
                  <Button 
                    variant={toastPosition === 'top' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('top');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['top']}
                  </Button>
                  <Button 
                    variant={toastPosition === 'top-left' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('top-left');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['top-left']}
                  </Button>
                  <Button 
                    variant={toastPosition === 'top-right' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('top-right');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['top-right']}
                  </Button>
                </View>
                <View className="flex-col gap-sm">
                  <Text className={`text-body-sm font-jakarta-semibold ${textPrimary} mb-xs`}>Base</Text>
                  <Button 
                    variant={toastPosition === 'bottom' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('bottom');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['bottom']}
                  </Button>
                  <Button 
                    variant={toastPosition === 'bottom-left' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('bottom-left');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['bottom-left']}
                  </Button>
                  <Button 
                    variant={toastPosition === 'bottom-right' ? "primary" : "outline"} 
                    onPress={() => {
                      setToastPosition('bottom-right');
                      showToast(toastType);
                    }}
                    size="sm"
                  >
                    {ToastPositionLabels['bottom-right']}
                  </Button>
                </View>
              </View>
            )}
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              {isNative 
                ? "Em dispositivos móveis, o Toast é posicionado no topo (acima da StatusBar) ou na parte inferior (acima da TabBar)."
                : "O Toast pode ser posicionado em diferentes áreas da tela, incluindo todos os cantos."
              }
            </Text>
          </View>
          
          {/* Opções */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Opções</Text>
            <View className="flex-row flex-wrap gap-sm mb-sm">
              <Button 
                variant={toastClosable ? "primary" : "outline"} 
                onPress={() => {
                  setToastClosable(!toastClosable);
                  showToast(toastType);
                }}
              >
                {toastClosable ? "Com botão de fechar" : "Sem botão de fechar"}
              </Button>

              <Button 
                variant={toastProgressBar ? "primary" : "outline"} 
                onPress={() => {
                  setToastProgressBar(!toastProgressBar);
                  showToast(toastType);
                }}
              >
                {toastProgressBar ? "Com barra de progresso" : "Sem barra de progresso"}
              </Button>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              O Toast pode ter um botão de fechamento, barra de progresso e outras opções de personalização.
            </Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O Toast oferece diversas características para atender diferentes necessidades:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tipos</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Success, Error, Warning, Info para diferentes contextos</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Posições</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Flexibilidade para posicionamento em seis posições diferentes: ${Object.values(ToastPositionLabels).join(', ')}</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Animações</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Animações suaves de entrada e saída</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Personalização</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Título, descrição e opções de fechamento</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema adaptativo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Adapta-se automaticamente a temas claros e escuros</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Responsividade</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Layout responsivo para diferentes tamanhos de tela</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Propriedades
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O componente Toast possui diversas propriedades para personalização:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>visible</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o toast está visível (boolean)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>type</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Tipo de toast ('success', 'error', 'warning', 'info')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>position</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Posição na tela ('top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>message</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Mensagem principal do toast (string)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>description</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Descrição opcional para detalhes adicionais (string)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>duration</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Tempo de exibição em ms (0 para não desaparecer automaticamente)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>closable</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se o toast possui botão de fechamento (boolean)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>onHide</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Função chamada quando o toast é fechado (callback)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>showProgressBar</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se deve mostrar a barra de progresso (boolean)</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Uso
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          Exemplo de implementação com useToast hook para gerenciar os estados:
        </Text>
        
        <View className={`bg-bg-tertiary-${isDark ? 'dark' : 'light'} rounded-lg p-md mb-lg`}>
          <Text className={`text-mono-md font-mono-regular ${textPrimary}`}>
{`// Usando o hook useToast
const { showToast } = useToast();

// Mostrar um toast de sucesso
showToast({
  type: 'success',
  message: 'Operação concluída',
  description: 'Os dados foram salvos com sucesso.',
  showProgressBar: true
});

// Mostrar um toast de erro com mais duração
showToast({
  type: 'error',
  message: 'Erro ao processar',
  description: 'Tente novamente mais tarde.',
  duration: 6000,
  position: 'bottom',
  showProgressBar: true
});`}
          </Text>
        </View>
      </View>
    );
  };

  const renderThemeSelectorComponent = () => {
    // Para verificar se estamos em ambiente móvel/nativo ou desktop
    const isNative = Platform.OS !== 'web';
    const isMobile = width < 768;
    const isSmallScreen = isNative || isMobile;

    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente Theme Selector
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O Theme Selector é um componente interativo que permite alternar entre os modos de tema
          (claro, escuro e sistema) com animações suaves e feedback visual.
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
          
          {/* Tamanhos diferentes */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Diferentes tamanhos</Text>
            {isSmallScreen ? (
              // Em dispositivos móveis e nativos, mostrar apenas o tamanho pequeno (sm)
              <View className="flex-row space-x-lg items-center">
                <ThemeSelector size="sm" />
                <Text className={`text-body-sm ${textSecondary} ml-sm`}>
                  Tamanho SM (recomendado para mobile)
                </Text>
              </View>
            ) : (
              // Em tablets e desktop, mostrar todos os tamanhos
              <View className="flex-row space-x-lg items-center">
                <ThemeSelector size="sm" />
                <ThemeSelector size="md" />
                <ThemeSelector size="lg" />
                <ThemeSelector size="xl" />
              </View>
            )}
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              {isSmallScreen 
                ? "Em dispositivos móveis, recomendamos usar apenas o tamanho pequeno (sm)."
                : "Tamanhos disponíveis: sm, md (padrão), lg, xl"}
            </Text>
          </View>

          {/* Variante pill */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Estilo pill (arredondado)</Text>
            <ThemeSelector variant="pill" size={isSmallScreen ? "sm" : "md"} />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão com cantos completamente arredondados.
            </Text>
          </View>
          
          {/* Variante minimal */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Estilo minimal (sem fundo)</Text>
            <ThemeSelector variant="minimal" size={isSmallScreen ? "sm" : "md"} />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão minimalista sem fundo ou slider.
            </Text>
          </View>

          {/* Exemplo com rótulos */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Com rótulos integrados</Text>
            <ThemeSelector variant="labeled" showLabels={true} size={isSmallScreen ? "sm" : "lg"} />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão com rótulos abaixo dos ícones para melhor compreensão.
            </Text>
          </View>

          {/* Estilo toggle */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Alternância simples (toggle)</Text>
            <ThemeSelector variant="toggle" size={isSmallScreen ? "sm" : "lg"} />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão simplificada para alternar entre claro e escuro.
            </Text>
          </View>

          {/* Estilo Single */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Botão único</Text>
            <View className="flex-row items-center space-x-lg">
              <ThemeSelector variant="single" size={isSmallScreen ? "sm" : "md"} />
              <ThemeSelector variant="single" size={isSmallScreen ? "sm" : "md"} transparentSingle={true} />
              <ThemeSelector variant="single" size={isSmallScreen ? "sm" : "md"} iconOnly={true} />
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Um único botão que alterna entre temas ao ser clicado. Versões com fundo colorido (esquerda), transparente com borda (centro) e apenas ícone sem fundo/borda (direita).
            </Text>
          </View>

          {/* Sem opção de sistema */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Apenas dois modos (Claro/Escuro)</Text>
            <ThemeSelector size={isSmallScreen ? "sm" : "md"} />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão com apenas dois modos (claro/escuro).
            </Text>
          </View>
          
          {/* Exemplo com cores personalizadas */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Cores personalizadas</Text>
            <ThemeSelector 
              customColors={{
                background: isDark ? '#2A2D3A' : '#E8EAED',
                sliderBackground: isDark ? '#6C5CE7' : '#6C5CE7',
                activeIconColor: '#FFFFFF',
              }} 
              size={isSmallScreen ? "sm" : "md"}
            />
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Customização completa de cores.
            </Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>transparentSingle</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Tornar o botão único (single) transparente (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>iconOnly</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Mostrar apenas o ícone sem fundo e sem borda (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>customColors</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Objeto para personalização das cores (background, sliderBackground, activeIconColor, inactiveIconColor)</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O Theme Selector oferece diversas características para uma experiência de usuário fluida:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Animações suaves</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Transições animadas entre os modos de tema</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema adaptativo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Adapta-se automaticamente ao tema atual</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Ícones intuitivos</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Representação visual clara de cada modo de tema</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Responsividade</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Funciona igualmente bem em todas as plataformas</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Variantes de estilo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Diferentes estilos visuais para adaptação ao design</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tamanhos múltiplos</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Opções de tamanho para diferentes contextos</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Propriedades
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O componente Theme Selector possui as seguintes propriedades:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>className</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Classes adicionais para personalização (string)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>size</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Tamanho do componente: 'sm', 'md', 'lg', 'xl' (padrão: 'md')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>variant</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Estilo visual: 'default', 'pill', 'minimal', 'labeled', 'toggle', 'single' (padrão: 'default')</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>showLabels</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Exibir rótulos para os modos (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Opções disponíveis</Text>
            <Text className={`text-body-sm ${textSecondary}`}>O seletor agora oferece apenas Claro e Escuro.</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>customColors</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Objeto para personalização das cores (background, sliderBackground, activeIconColor, inactiveIconColor)</Text>
          </View>
        </View>
      </View>
    );
  };

  // Função para renderizar o componente HoverableView e seus exemplos
  const renderHoverableViewComponent = () => {
    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente HoverableView
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O HoverableView é um componente para criar elementos interativos com efeitos de hover 
          personalizáveis. Melhora a experiência do usuário ao fornecer feedback visual quando 
          o cursor do mouse passa sobre o elemento.
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
          
          {/* Exemplo básico */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Hover básico</Text>
            <HoverableView className="p-md rounded-md border border-divider-light">
              <Text className={`${textPrimary}`}>Passe o mouse sobre este elemento</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Versão básica com efeito de hover padrão (apenas cor de fundo alterada).
            </Text>
          </View>
          
          {/* Exemplo com elemento desabilitado mas com hover */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Hover em elemento desabilitado</Text>
            <HoverableView 
              className="p-md rounded-md border border-divider-light"
              disabled={true}
              allowHoverWhenDisabled={true}
            >
              <Text className={`${textPrimary}`}>Elemento desabilitado com efeito de hover</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Este elemento está desabilitado para clique (cursor é uma seta), mas ainda mostra efeito visual de hover.
            </Text>
          </View>
          
          {/* Exemplo com múltiplos efeitos - igual ao básico, mas com escala */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Combinação de efeitos</Text>
            <HoverableView 
              className="p-md rounded-md border border-divider-light"
              hoverScale={1.02}
            >
              <Text className={`${textPrimary}`}>Básico + efeito de escala</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Adiciona um sutil efeito de escala ao hover básico.
            </Text>
          </View>
          
          {/* Exemplo com escala */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Efeito de escala</Text>
            <HoverableView 
              className="p-md rounded-md border border-divider-light"
              hoverScale={1.05}
              disableHoverBackground={true}
            >
              <Text className={`${textPrimary}`}>Efeito de escala (zoom) no hover</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Efeito de escala (zoom) quando o cursor passa sobre o elemento, sem alteração de cor.
            </Text>
          </View>
          
          {/* Exemplo com movimento */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Efeito de movimento</Text>
            <HoverableView 
              className="p-md rounded-md border border-divider-light"
              hoverTranslateX={8}
              hoverTranslateY={0}
              disableHoverBackground={false}
              hoverColor={isDark ? designColors['hover-dark'] : designColors['hover-light']}
            >
              <View className="flex-row items-center">
                <Text className={`${textPrimary} mr-xs`}>Movimento horizontal</Text>
                <ChevronRight size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              </View>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              O elemento se move horizontalmente e muda sutilmente a cor de fundo.
            </Text>
          </View>
          
          {/* Exemplo de estado ativo */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Estado ativo</Text>
            <View className="flex-row flex-wrap">
              {[1, 2, 3].map((item) => (
                <HoverableView 
                  key={item}
                  className="p-md rounded-md m-xs"
                  isActive={activeItem === item}
                  activeBackgroundColor={activeItem === item ? (isDark ? designColors['primary-dark'] : designColors['primary-light']) : undefined}
                  disableHoverWhenActive={true}
                  onPress={() => setActiveItem(item)}
                >
                  <Text className={activeItem === item ? 'text-white' : textPrimary}>Item {item}</Text>
                </HoverableView>
              ))}
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Os itens têm estados ativos quando selecionados. Clique em um item para ativá-lo.
              O efeito de hover é desativado quando o item está ativo (disableHoverWhenActive=true).
            </Text>
          </View>
          
          {/* Exemplo com cores personalizadas */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Cores personalizadas</Text>
            <HoverableView 
              className="p-md rounded-md"
              backgroundColor={isDark ? designColors['info-bg-dark'] : designColors['info-bg-light']}
              hoverColor={isDark ? designColors['success-bg-dark'] : designColors['success-bg-light']}
            >
              <Text className={isDark ? 'text-info-text-dark' : 'text-info-text-light'}>Cores personalizadas para hover</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Estado normal: azul (info) → Hover: verde (success). Demonstra cores personalizadas diferentes.
            </Text>
          </View>
          
          {/* Hover sem animações */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Hover sem animações</Text>
            <HoverableView 
              className="p-md rounded-md border border-divider-light"
              disableAnimation={true}
              hoverColor={isDark ? designColors['hover-dark'] : designColors['hover-light']}
            >
              <Text className={`${textPrimary}`}>Mesmo que o básico, mas sem animação</Text>
            </HoverableView>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Igual ao Hover básico, mas sem as animações suaves na transição.
            </Text>
          </View>
          
          {/* Exemplo com e sem disableHoverWhenActive */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Efeito hover em itens ativos</Text>
            <View className="flex-row flex-wrap">
              <View className="mr-md mb-md flex-1">
                <Text className={`text-body-sm ${textSecondary} mb-xs`}>Com disableHoverWhenActive=true:</Text>
                <SmartTextHoverableView 
                  className="p-md rounded-md"
                  isActive={true}
                  activeBackgroundColor={isDark ? designColors['primary-dark'] : designColors['primary-light']}
                  disableHoverWhenActive={true}
                  text="Item ativo sem efeito hover"
                />
              </View>
              
              <View className="mr-md mb-md flex-1">
                <Text className={`text-body-sm ${textSecondary} mb-xs`}>Com disableHoverWhenActive=false:</Text>
                <SmartTextHoverableView 
                  className="p-md rounded-md"
                  isActive={true}
                  activeBackgroundColor={isDark ? designColors['primary-dark'] : designColors['primary-light']}
                  disableHoverWhenActive={false}
                  text="Item ativo com efeito hover"
                />
              </View>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              A propriedade disableHoverWhenActive controla se o efeito hover deve ser aplicado em itens que já estão em estado ativo.
            </Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O HoverableView oferece diversas características para melhorar a interatividade:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Efeitos visuais</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Escala, movimento, rotação e elevação</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Transições suaves</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Animações configuráveis com duração personalizada</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Compatibilidade</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Funciona em todas as plataformas (efeitos completos na web)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema adaptativo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Cores adaptadas automaticamente ao tema atual</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Propriedades
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O componente HoverableView possui as seguintes propriedades:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>hoverScale</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Escala ao passar o mouse (number, padrão: 1 - sem escala)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>hoverTranslateX</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Movimento horizontal em px ao passar o mouse (number, padrão: 0)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>hoverTranslateY</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Movimento vertical em px ao passar o mouse (number, padrão: 0)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>hoverRotate</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Rotação em graus ao passar o mouse (number, padrão: 0)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>hoverOpacity</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Opacidade ao passar o mouse (number, 0 a 1)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>disableHoverBackground</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Desativa a mudança de cor de fundo (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>disableAnimation</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Desativa todas as animações (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>animationDuration</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Duração da animação em ms (number, padrão: 200)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>isActive</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Estado ativo do elemento (boolean, padrão: false)</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>backgroundColor/hoverColor/activeColor</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Cores personalizadas para os diferentes estados</Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>onHoverStateChange</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Callback quando o estado de hover muda (function)</Text>
          </View>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Uso com Tailwind
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O componente suporta a propriedade className para estilização com Tailwind CSS:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-body-sm font-mono ${textSecondary}`}>
            {`<HoverableView className="p-4 rounded-md bg-primary-light">\n  <Text>Conteúdo com estilo Tailwind</Text>\n</HoverableView>`}
          </Text>
        </View>
      </View>
    );
  };

  // Função para renderizar o componente GradientView e seus exemplos
  const renderGradientViewComponent = () => {
    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente GradientView
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O GradientView é um componente universal que funciona tanto na web quanto no nativo.
          Oferece gradientes predefinidos, direções automáticas, suporte a 3 cores e
          adaptação completa aos temas claro/escuro.
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
          

          
          {/* Gradientes fade */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Gradientes fade (cor forte para suave)</Text>
            <View className="flex-row flex-wrap gap-md mb-md">
              <GradientView
                type="primary-fade"
                style={{ height: 80, width: 192, borderRadius: 8 }}
              >
                <Text className="text-white text-subtitle-sm font-jakarta-semibold p-md">Primário Fade</Text>
              </GradientView>
              
              <GradientView
                type="secondary-fade"
                style={{ height: 80, width: 192, borderRadius: 8 }}
              >
                <Text className="text-white text-subtitle-sm font-jakarta-semibold p-md">Secundário Fade</Text>
              </GradientView>
              
              <GradientView
                type="tertiary-fade"
                style={{ height: 80, width: 192, borderRadius: 8 }}
              >
                <Text className="text-white text-subtitle-sm font-jakarta-semibold p-md">Terciário Fade</Text>
              </GradientView>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Gradientes que começam com a cor forte e terminam com a mesma cor mais suave. Ideal para botões ativos e destaques com efeito gradiente sutil.
            </Text>
          </View>

          {/* Gradientes decorativos */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Gradientes decorativos</Text>
            <View className="flex-row flex-wrap gap-md mb-md">
              <GradientView
                type="sunset"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Sunset</Text>
              </GradientView>
              
              <GradientView
                type="ocean"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Ocean</Text>
              </GradientView>
              
              <GradientView
                type="forest"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Forest</Text>
              </GradientView>

              <GradientView
                type="purple-pink"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Purple Pink</Text>
              </GradientView>

              <GradientView
                type="orange-red"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Orange Red</Text>
              </GradientView>

              <GradientView
                type="blue-green"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Blue Green</Text>
              </GradientView>

              <GradientView
                type="warm"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Warm</Text>
              </GradientView>

              <GradientView
                type="cool"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Cool</Text>
              </GradientView>

              <GradientView
                type="rainbow"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Rainbow</Text>
              </GradientView>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Gradientes decorativos predefinidos para elementos visuais especiais. Adaptam-se automaticamente ao tema claro/escuro.
            </Text>
          </View>
          

          
          {/* Gradientes com direções pré-configuradas */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Direções pré-configuradas</Text>
            <View className="flex-row flex-wrap gap-md mb-md">
              <GradientView
                type="vertical-sunset"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Vertical Sunset</Text>
              </GradientView>
              
              <GradientView
                type="diagonal-ocean"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Diagonal Ocean</Text>
              </GradientView>
              
              <GradientView
                type="horizontal-forest"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Horizontal Forest</Text>
              </GradientView>

              <GradientView
                type="radial-warm"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Radial Warm</Text>
              </GradientView>

              <GradientView
                type="vertical-cool"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Vertical Cool</Text>
              </GradientView>

              <GradientView
                type="diagonal-rainbow"
                style={{ height: 80, width: 120, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Diagonal Rainbow</Text>
              </GradientView>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Gradientes com direções específicas já pré-configuradas no componente.
            </Text>
          </View>

          {/* Gradientes com 3 cores */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Gradientes com 3 cores</Text>
            <View className="flex-row flex-wrap gap-md mb-md">
              <GradientView
                type="triple-sunset"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Triple Sunset</Text>
              </GradientView>
              
              <GradientView
                type="triple-ocean"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Triple Ocean</Text>
              </GradientView>
              
              <GradientView
                type="triple-forest"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Triple Forest</Text>
              </GradientView>

              <GradientView
                type="triple-rainbow"
                style={{ height: 80, width: 140, borderRadius: 8 }}
              >
                <Text className="text-white text-body-sm font-jakarta-semibold p-sm">Triple Rainbow</Text>
              </GradientView>
            </View>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Gradientes com 3 cores para efeitos mais complexos e transições suaves.
            </Text>
          </View>
        </View>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>API</Text>
          
          <View className="mb-md">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Propriedades</Text>
            <View className="border border-divider-light dark:border-divider-dark rounded-md overflow-hidden">
              <View className="flex-row py-xs">
                <Text className={`text-body-sm font-jakarta-semibold ${textPrimary} w-1/4 px-sm`}>Prop</Text>
                <Text className={`text-body-sm font-jakarta-semibold ${textPrimary} w-1/4 px-sm`}>Tipo</Text>
                <Text className={`text-body-sm font-jakarta-semibold ${textPrimary} w-2/4 px-sm`}>Descrição</Text>
              </View>
              
              <View className="flex-row py-xs bg-divider-light/20 dark:bg-divider-dark/20">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>type</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>GradientType</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Tipos: 'primary-fade', 'secondary-fade', 'tertiary-fade', 'sunset', 'ocean', 'forest', 'vertical-sunset', 'diagonal-ocean', 'horizontal-forest', 'triple-sunset', 'triple-ocean', 'triple-forest' e mais...</Text>
              </View>
              
              <View className="flex-row py-xs">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>colors</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>[string, string, string?]</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Array com 2 ou 3 cores para gradiente personalizado</Text>
              </View>
              
              <View className="flex-row py-xs bg-divider-light/20 dark:bg-divider-dark/20">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>start</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>{"{ x: number, y: number }"}</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Ponto inicial do gradiente (apenas nativo)</Text>
              </View>
              
              <View className="flex-row py-xs">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>end</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>{"{ x: number, y: number }"}</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Ponto final do gradiente (apenas nativo)</Text>
              </View>
              
              <View className="flex-row py-xs bg-divider-light/20 dark:bg-divider-dark/20">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>style</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>ViewStyle</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Estilo personalizado para o componente</Text>
              </View>
              
              <View className="flex-row py-xs">
                <Text className={`text-body-sm ${textPrimary} w-1/4 px-sm`}>children</Text>
                <Text className={`text-body-sm font-mono-regular ${textPrimary} w-1/4 px-sm`}>ReactNode</Text>
                <Text className={`text-body-sm ${textPrimary} w-2/4 px-sm`}>Conteúdo a ser renderizado dentro do gradiente</Text>
              </View>
            </View>
          </View>
          
          <View className="mb-md">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Exemplo de uso</Text>
            <View className={`bg-bg-tertiary-light dark:bg-bg-tertiary-dark p-sm rounded-md mb-sm`}>
              <Text className={`text-mono-sm font-mono-regular text-text-primary-light dark:text-text-primary-dark`}>
                {`import { GradientView } from '@/components/effects/GradientView';

// Gradiente fade (cor forte para suave)
<GradientView type="primary-fade" style={{ height: 80, width: 200 }}>
  <Text style={{ color: 'white' }}>Gradiente Fade</Text>
</GradientView>

// Gradiente decorativo
<GradientView type="sunset" style={{ height: 80, width: 200 }}>
  <Text style={{ color: 'white' }}>Gradiente Decorativo</Text>
</GradientView>

// Gradiente com direção pré-configurada
<GradientView type="vertical-sunset" style={{ height: 80, width: 200 }}>
  <Text style={{ color: 'white' }}>Vertical Sunset</Text>
</GradientView>

// Gradiente com 3 cores
<GradientView type="triple-ocean" style={{ height: 80, width: 200 }}>
  <Text style={{ color: 'white' }}>Triple Ocean</Text>
</GradientView>

// Gradiente personalizado com cores customizadas
<GradientView 
  type="custom"
  colors={['#FF5733', '#FFC300', '#28A745']}
  style={{ height: 80, width: 200 }}
>
  <Text style={{ color: 'white' }}>Gradiente Personalizado</Text>
</GradientView>

// Direção personalizada (sobrescreve pré-configuração)
<GradientView 
  type="ocean"
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={{ height: 80, width: 200 }}
>
  <Text style={{ color: 'white' }}>Direção Customizada</Text>
</GradientView>`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Estado específico para o menu de notificações
  
  // Constantes para z-index, garantindo a hierarquia correta
  const Z_INDEX = {
    CONTENT: 1,
    BACKDROP: 2000,
    NOTIFICATION_MENU: 4000
  };
  
  // Adicionar useFocusEffect para fechar menu quando a tela perde foco
  useFocusEffect(
    useCallback(() => {
      // Não abrir o menu automaticamente
      
      return () => {
        // Quando a tela perde foco, fechamos o menu de notificações
        if (notificationsMenuVisible) {
          setNotificationsMenuVisible(false);
        }
      };
    }, [notificationsMenuVisible])
  );
  
  // Efeito adicional para observar mudanças de rota (útil para navegação programática)
  useEffect(() => {
    const handleRouteChange = () => {
      if (notificationsMenuVisible) {
        setNotificationsMenuVisible(false);
      }
    };
  
    // Adicionar event listener para o evento de navegação
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
    }
  
    return () => {
      // Limpar event listener
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChange);
      }
    };
  }, [notificationsMenuVisible]);
  
  // Renderiza o backdrop transparente para capturar cliques
  const renderBackdrop = () => {
    if (notificationsMenuVisible) {
      return (
        <Pressable
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            ...(Platform.OS === 'web' ? {} : {
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
            }),
            zIndex: Z_INDEX.BACKDROP,
            backgroundColor: 'transparent'
          } as any}
          onPress={() => setNotificationsMenuVisible(false)}
        />
      );
    }
    
    return null;
  };
  
  // Modificar a função renderNotificationsMenuComponent para usar posicionamento próximo ao botão
  const renderNotificationsMenuComponent = () => {
    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Menu de Notificações - Implementação Completa
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          Esta é uma demonstração completa do menu de notificações com todas as melhorias implementadas:
          overlay transparente em toda a tela, posicionamento contextual e fechamento automático ao navegar.
        </Text>
  
        {/* Botão para abrir o menu de notificações */}
        <View className="mb-lg">
          <Button
            variant="primary"
            style={{ width: 250, alignSelf: 'flex-start' }}
            onPress={() => {
              // Capturar a posição do clique para posicionar o menu
              if (Platform.OS === 'web') {
                // Para web, usar coordenadas fixas perto do botão
                setClickPosition({
                  x: Dimensions.get('window').width > 768 ? 300 : 200,
                  y: 200,
                });
              } else {
                // Para dispositivos móveis, posicionar o menu na parte superior
                setClickPosition({
                  x: Dimensions.get('window').width / 2,
                  y: 100,
                });
              }
              // Abrir o menu
              setNotificationsMenuVisible(true);
            }}
            rightIcon={<Bell size={16} color="#FFFFFF" />}
          >
            Abrir Menu de Notificações
          </Button>
        </View>
  
        {/* Renderizar backdrop transparente */}
        {renderBackdrop()}
  
        {/* Renderizar menu de notificações com z-index alto */}
        {notificationsMenuVisible && (
          <View 
            style={Platform.OS === 'web' ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: Z_INDEX.NOTIFICATION_MENU,
              pointerEvents: 'none'
            } : undefined}
          >
            <View style={{ pointerEvents: 'auto' }}>
              <NotificationsMenu
                isVisible={true}
                onClose={() => setNotificationsMenuVisible(false)}
                title="Notificações"
                subtitle="Últimas atualizações"
                position={{ x: 100, y: 100 }}
              />
            </View>
          </View>
        )}
  
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>
            Técnicas Implementadas:
          </Text>
  
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>1. Overlay transparente em toda a tela</Text>
            <Text className={`text-body-sm ${textSecondary}`}>
              Implementamos um Pressable transparente que cobre toda a viewport,
              permitindo fechar o menu ao clicar em qualquer lugar fora dele, sem escurecer o conteúdo.
            </Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>2. Z-Index hierárquico</Text>
            <Text className={`text-body-sm ${textSecondary}`}>
              Definimos valores de z-index específicos para garantir a ordem correta:
              Conteúdo (1) → Backdrop (2000) → Menu (4000)
            </Text>
          </View>
          
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>3. Posicionamento fixo</Text>
            <Text className={`text-body-sm ${textSecondary}`}>
              Usamos position: fixed na web e position: absolute no mobile,
              com coordenadas específicas para garantir que o menu apareça no local correto.
            </Text>
          </View>
  
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>4. Estratégia PointerEvents</Text>
            <Text className={`text-body-sm ${textSecondary}`}>
              Usamos pointerEvents: 'none' no container e pointerEvents: 'auto' no menu
              para permitir interação com o menu enquanto o resto do overlay captura cliques.
            </Text>
          </View>
  
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>5. Fechamento automático</Text>
            <Text className={`text-body-sm ${textSecondary}`}>
              O menu fecha automaticamente quando:
              - O usuário clica fora do menu (no overlay transparente)
              - O usuário navega para outra tela (useFocusEffect)
              - A janela é redimensionada (event listener de resize)
            </Text>
          </View>
        </View>
  
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Implementação no código
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          Trecho de código mostrando como implementar o menu de notificações:
        </Text>
        
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className="font-mono text-xs" style={{ color: textPrimary.includes('dark') ? '#E5E7EB' : '#374151' }}>
{`// 1. Definir z-index com valores altos
const Z_INDEX = {
  CONTENT: 1,
  BACKDROP: 2000,
  NOTIFICATION_MENU: 4000
};

// 2. Detectar quando a tela perde foco (para fechar o menu)
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    // Código ao ganhar foco
    return () => {
      // Quando a tela perde foco, fechar o menu
      if (isNotificationsMenuOpen) {
        setIsNotificationsMenuOpen(false);
      }
    };
  }, [isNotificationsMenuOpen])
);

// 3. Renderizar overlay transparente em toda a tela
const renderBackdrop = () => {
  if (isNotificationsMenuOpen) {
    return (
      <Pressable
        style={{
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', // Garante cobertura total na web
          height: '100vh',
          zIndex: Z_INDEX.BACKDROP,
          backgroundColor: 'transparent'
        }}
        onPress={() => setIsNotificationsMenuOpen(false)}
      />
    );
  }
  return null;
};

// 4. Renderizar o menu com z-index mais alto
{isNotificationsMenuOpen && (
  <View 
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: Z_INDEX.NOTIFICATION_MENU,
      pointerEvents: 'none' // Permite clicar através deste container
    }}
  >
    <View style={{ pointerEvents: 'auto' }}> {/* Apenas o menu recebe eventos */}
      <NotificationsMenu
        isVisible={true}
        onClose={() => setIsNotificationsMenuOpen(false)}
        position={clickPosition}
      />
    </View>
  </View>
)}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderProfileMenuComponent = () => {
    const handleProfileClick = () => {
      if (profileButtonRef.current && Platform.OS === 'web') {
        // @ts-ignore - API DOM específica para web
        const rect = profileButtonRef.current.getBoundingClientRect?.();
        if (rect) {
          // Posiciona o menu abaixo e à direita do botão
          setProfileButtonPosition({
            x: rect.right,
            y: rect.bottom
          });
        }
      }
      setProfileMenuOpen(!profileMenuOpen);
    };

    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente ProfileMenu
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          O ProfileMenu é um componente que exibe informações do usuário e opções como configuração de tema e logout.
        </Text>

        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Demonstração:</Text>
          
          <View className="flex-row items-center mb-lg">
            <View ref={profileButtonRef}>
              <Pressable
                onPress={handleProfileClick}
                className="bg-primary-light dark:bg-primary-dark py-2 px-4 rounded-md"
              >
                <Text className="text-white font-jakarta-medium">
                  Abrir menu de perfil
                </Text>
              </Pressable>
            </View>
            <Text className={`text-body-sm ${textSecondary} ml-md`}>
              Clique para abrir o menu de perfil
            </Text>
          </View>
          
          <Text className={`text-body-sm ${textSecondary} mt-xs`}>
            O menu de perfil exibe informações do usuário, opções de tema e função de logout.
          </Text>
        </View>
        
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O ProfileMenu oferece diversas características para uma experiência de usuário fluida:
        </Text>
        
        <View className="flex-row flex-wrap">
          <View className={`mr-md mb-md p-sm rounded-md ${bgTertiary} w-1/2 flex-grow basis-60`}>
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Informações do usuário</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Exibe nome e email do usuário logado.</Text>
          </View>
          
          <View className={`mr-md mb-md p-sm rounded-md ${bgTertiary} w-1/2 flex-grow basis-60`}>
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Seleção de tema</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Permite escolher entre tema claro, escuro ou sistema.</Text>
          </View>
          
          <View className={`mr-md mb-md p-sm rounded-md ${bgTertiary} w-1/2 flex-grow basis-60`}>
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Animações suaves</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Apresenta animações de entrada e saída para uma experiência fluida.</Text>
          </View>
          
          <View className={`mr-md mb-md p-sm rounded-md ${bgTertiary} w-1/2 flex-grow basis-60`}>
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-xs`}>Posicionamento inteligente</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Posiciona-se automaticamente próximo ao elemento que o invocou.</Text>
          </View>
        </View>
        
        {profileMenuOpen && (
          <ProfileMenu
            isVisible={true}
            onClose={() => setProfileMenuOpen(false)}
            position={profileButtonPosition}
          />
        )}
      </View>
    );
  };

  // Componente para mostrar o breakpoint atual
  const BreakpointIndicator = () => {
    return (
      <View className={`self-end mr-md mt-md py-xs px-md rounded-md ${isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light'}`}>
        <Text className={`text-body-sm text-center ${textSecondary}`}>
          Breakpoint: {currentBreakpoint} ({width}px)
        </Text>
      </View>
    );
  };

  // Função para renderizar os Dropdown Menus (NotificationsMenu e ProfileMenu)
  const renderDropdownMenuComponent = () => {
    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Dropdown Menu - Três Menus Disponíveis
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          Testando os três menus específicos: TeamMenu, NotificationsMenu e ProfileMenu.
        </Text>

        {/* Team Menu */}
        <View className={`${bgSecondary} rounded-lg p-md mb-md`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>
            Team Menu
          </Text>
          
          <TeamMenu
            buttonText="Team"
            onTeamOptionSelect={(optionId) => {
              console.log('Team option:', optionId);
              alert(`Team option: ${optionId}`);
            }}
            onInviteSubmenuSelect={(optionId) => {
              console.log('Invite submenu:', optionId);
              alert(`Invite submenu: ${optionId}`);
            }}
            onOptionSelect={(optionId) => {
              console.log('Team - Opção selecionada:', optionId);
            }}
            onOpen={() => console.log('Team menu aberto')}
            onClose={() => console.log('Team menu fechado')}
          />
          
          <Text className={`text-body-sm ${textSecondary} mt-md`}>
            Menu de equipe com opções: Team, Invite users (submenu: email, message, more), New Team, GitHub, Support, API e Log out.
          </Text>
        </View>

        {/* Notifications Menu */}
        <View className={`${bgSecondary} rounded-lg p-md mb-md`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>
            Notifications Menu
          </Text>
          
          <NotificationsMenu
            isVisible={true}
            onClose={() => setNotificationsMenuVisible(false)}
            title="Menu de Notificações"
            subtitle="Demonstração do componente"
          />
          
          <Text className={`text-body-sm ${textSecondary} mt-md`}>
            Menu de notificações com opções: All, Unread, Mentions (submenu: mark_read, delete, more), Settings, Archive e Clear All.
          </Text>
        </View>

        {/* Profile Menu */}
        <View className={`${bgSecondary} rounded-lg p-md`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-md`}>
            Profile Menu
          </Text>
          
          <ProfileMenu
            isVisible={true}
            onClose={() => console.log('Profile menu fechado')}
          />
          
          <Text className={`text-body-sm ${textSecondary} mt-md`}>
            Menu de perfil com opções: View Profile, Edit Profile (submenu: edit_info, change_photo, more), Settings, Security, Billing, Help e Log out.
          </Text>
        </View>
      </View>
    );
  };

  // Mova isso para fora da função renderPageContainerComponent
  function HomeStyleCards({ 
    bgClass = '', 
    bgPrimaryClass = '', 
    isMobile = false, 
    isTablet = false, 
    layout = '4x2' // Opções: '4x2', '4x2-wide-sidebar', '3x2', '3x1', '2x2', 'single'
  }) {
    const cardClass = `${bgClass} rounded-lg`;
    
    // Definir layouts com base nos parâmetros passados
    let topCards: number[] = [];
    let bottomCards: number[] = [];
    
    // Layout principal 4x2
    if (layout === '4x2') {
      topCards = [1, 2, 3, 4];
      bottomCards = [1, 2];
    } 
    // Layout principal 4x2 para sidebar larga (tablet também fica 2x2)
    else if (layout === '4x2-wide-sidebar') {
      topCards = [1, 2, 3, 4];
      bottomCards = [1, 2];
    }
    // Layout principal 3x2 (3 cards em cima, 2 embaixo)
    else if (layout === '3x2') {
      topCards = [1, 2, 3];
      bottomCards = [1, 2];
    } 
    // Layout principal 3x1 (3 cards em cima, 1 embaixo ocupando toda largura)
    else if (layout === '3x1') {
      topCards = [1, 2, 3];
      bottomCards = [1];
    }
    // Layout principal 2x2
    else if (layout === '2x2') {
      topCards = [1, 2];
      bottomCards = [1, 2];
    }
    // Layout single (apenas um card)
    else if (layout === 'single') {
      topCards = [];
      bottomCards = [1];
    }
    
    // Card vazio reutilizável
    const EmptyCard = ({ height, className = '', style }: { height?: number, className?: string, style?: any }) => (
      <View className={`${cardClass} ${className}`} style={[style, height ? { height } : {}]} />
    );

    // Função para calcular o estilo flexbox baseado no layout
    const getTopCardsStyle = () => {
      if (layout === '4x2' && isMobile) {
        // Para 4x2 apenas no mobile: permite quebra de linha (2x2)
        return {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: 16,
          marginBottom: 16,
        };
      }
      
      if (layout === '4x2-wide-sidebar' && (isMobile || isTablet)) {
        // Para 4x2-wide-sidebar no mobile e tablet: permite quebra de linha (2x2)
        return {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: 16,
          marginBottom: 16,
        };
      }
      
      // Para tablet e desktop: uma linha só
      return {
        flexDirection: 'row' as const,
        gap: 16,
        marginBottom: 16,
      };
    };

    const getCardStyle = (cardIndex: number, isTopCard: boolean) => {
      if (isTopCard && layout === '4x2' && isMobile) {
        // Para 4x2 apenas no mobile: 2 cards por linha
        return { flex: 1, minWidth: '45%' };
      }
      
      if (isTopCard && layout === '4x2-wide-sidebar' && (isMobile || isTablet)) {
        // Para 4x2-wide-sidebar no mobile e tablet: 2 cards por linha
        return { flex: 1, minWidth: '45%' };
      }
      
      // Para tablet e desktop: compartilham igualmente o espaço
      return { flex: 1 };
    };
    
    return (
      <View style={{ minHeight: 400, flex: 1, flexDirection: 'column' }} className={`p-4 rounded-lg ${bgPrimaryClass}`}>
        {/* Cards superiores */}
        {topCards.length > 0 && (
          <View style={getTopCardsStyle()}>
            {topCards.map(index => (
              <EmptyCard 
                key={`top-${index}`} 
                height={140} 
                style={getCardStyle(index, true)}
              />
            ))}
          </View>
        )}
        
        {/* Cards inferiores */}
        <View style={{
          flexDirection: (layout === '4x2-wide-sidebar' && (isMobile || isTablet)) || (layout === '4x2' && isMobile) ? 'column' : 'row',
          gap: 16,
          flex: 1,
          minHeight: (layout === '4x2-wide-sidebar' && (isMobile || isTablet)) || (layout === '4x2' && isMobile) ? 200 : 300
        }}>
          {bottomCards.map(index => (
            <EmptyCard 
              key={`bottom-${index}`} 
              className="flex-1" 
              style={getCardStyle(index, false)}
            />
          ))}
        </View>
      </View>
    );
  }

  const renderPageContainerComponent = () => {
    const bgSecondary = isDark ? 'bg-bg-secondary-dark' : 'bg-bg-secondary-light';
    const bgPrimary = isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light';
    const textPrimary = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const textSecondary = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
    const borderColor = isDark ? 'border-divider-dark' : 'border-divider-light';
    
    // Aqui usamos as variáveis já disponíveis no escopo do componente principal
    const screenWidth = Dimensions.get('window').width;
    const _isMobile = screenWidth < 768;
    const _isTablet = screenWidth >= 768 && screenWidth < 1024;

    return (
      <View className="p-lg">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Componente PageContainer
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          Componente responsável por gerenciar os espaçamentos e layout padrão da aplicação.
          É transparente por padrão e oferece diversas opções de customização.
        </Text>

        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos de Layouts:</Text>

          {/* Removi o exemplo "Container Básico" por ser desnecessário */}

          {/* Layout Dashboard 4x2 */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Layout Dashboard 4x2</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="4x2"
              />
            </PageContainer>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Layout Dashboard 4x2: Responsivo - Web/Tablet: 4 cards em 1 linha + 2 inferiores. Mobile: 4 cards em 2 linhas (2x2) + 2 inferiores.
            </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View style={{ flex: 1, flexDirection: 'column' }}>\n    {/* Cards superiores - 4 cards responsivos */}\n    <View style={{\n      flexDirection: 'row',\n      flexWrap: isMobile ? 'wrap' : 'nowrap',\n      gap: 16,\n      marginBottom: 16\n    }}>\n      <Card1 height={140} style={{\n        flex: 1,\n        ...(isMobile ? { minWidth: '45%' } : {})\n      }} />\n      <Card2 height={140} style={{\n        flex: 1,\n        ...(isMobile ? { minWidth: '45%' } : {})\n      }} />\n      <Card3 height={140} style={{\n        flex: 1,\n        ...(isMobile ? { minWidth: '45%' } : {})\n      }} />\n      <Card4 height={140} style={{\n        flex: 1,\n        ...(isMobile ? { minWidth: '45%' } : {})\n      }} />\n    </View>\n    {/* Cards inferiores - 2 cards */}\n    <View style={{\n      flexDirection: isMobile ? 'column' : 'row',\n      gap: 16,\n      flex: 1\n    }}>\n      <Card5 style={{ flex: 1 }} />\n      <Card6 style={{ flex: 1 }} />\n    </View>\n  </View>\n</PageContainer>`}
              </Text>
            </View>
                    </View>
          
          {/* Layout Dashboard 4x2 para Sidebar Larga */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Layout Dashboard 4x2 (Sidebar Larga)</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="4x2-wide-sidebar"
              />
            </PageContainer>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Layout Dashboard 4x2 otimizado para sidebar larga: Web: 4 cards em 1 linha + 2 inferiores. Tablet/Mobile: 4 cards em 2 linhas (2x2) + 2 inferiores. Ideal quando a sidebar permanece sempre com largura completa.
            </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View style={{ flex: 1, flexDirection: 'column' }}>\n    {/* Cards superiores - 4 cards responsivos */}\n    <View style={{\n      flexDirection: 'row',\n      flexWrap: (isMobile || isTablet) ? 'wrap' : 'nowrap',\n      gap: 16,\n      marginBottom: 16\n    }}>\n      <Card1 height={140} style={{\n        flex: 1,\n        ...((isMobile || isTablet) ? { minWidth: '45%' } : {})\n      }} />\n      <Card2 height={140} style={{\n        flex: 1,\n        ...((isMobile || isTablet) ? { minWidth: '45%' } : {})\n      }} />\n      <Card3 height={140} style={{\n        flex: 1,\n        ...((isMobile || isTablet) ? { minWidth: '45%' } : {})\n      }} />\n      <Card4 height={140} style={{\n        flex: 1,\n        ...((isMobile || isTablet) ? { minWidth: '45%' } : {})\n      }} />\n    </View>\n    {/* Cards inferiores - 2 cards */}\n    <View style={{\n      flexDirection: (isMobile || isTablet) ? 'column' : 'row',\n      gap: 16,\n      flex: 1\n    }}>\n      <Card5 style={{ flex: 1 }} />\n      <Card6 style={{ flex: 1 }} />\n    </View>\n  </View>\n</PageContainer>`}
              </Text>
            </View>
          </View>
          
          {/* Layout Dashboard 3x2 */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Layout Dashboard 3x2</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="3x2"
              />
            </PageContainer>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Layout com 3 cards superiores (compartilhando igualmente o espaço) e 2 cards inferiores. Sem quebra de linha.
            </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                                 {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View style={{ flex: 1, flexDirection: 'column' }}>\n    {/* Cards superiores - 3 cards compartilhando igualmente o espaço */}\n    <View style={{\n      flexDirection: 'row',\n      gap: 16,\n      marginBottom: 16\n    }}>\n      <Card1 height={140} style={{ flex: 1 }} />\n      <Card2 height={140} style={{ flex: 1 }} />\n      <Card3 height={140} style={{ flex: 1 }} />\n    </View>\n    {/* Cards inferiores - 2 cards */}\n    <View style={{\n      flexDirection: 'row',\n      gap: 16,\n      flex: 1\n    }}>\n      <Card4 style={{ flex: 1 }} />\n      <Card5 style={{ flex: 1 }} />\n    </View>\n  </View>\n</PageContainer>`}
              </Text>
            </View>
          </View>

          {/* Layout Dashboard 3x1 */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Layout Dashboard 3x1</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="3x1"
              />
            </PageContainer>
                                      <Text className={`text-body-sm ${textSecondary} mt-xs`}>
                Layout com 3 cards superiores (compartilhando igualmente o espaço) e 1 card inferior ocupando toda a largura. Sem quebra de linha.
             </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                                 {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View style={{ flex: 1, flexDirection: 'column' }}>\n    {/* Cards superiores - 3 cards compartilhando igualmente o espaço */}\n    <View style={{\n      flexDirection: 'row',\n      gap: 16,\n      marginBottom: 16\n    }}>\n      <Card1 height={140} style={{ flex: 1 }} />\n      <Card2 height={140} style={{ flex: 1 }} />\n      <Card3 height={140} style={{ flex: 1 }} />\n    </View>\n    {/* Card inferior - 1 card ocupando toda largura */}\n    <View style={{ flex: 1 }}>\n      <Card4 style={{ flex: 1 }} />\n    </View>\n  </View>\n</PageContainer>`}
              </Text>
            </View>
          </View>

          {/* Layout Dashboard 2x2 */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Layout Dashboard 2x2</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="2x2"
              />
            </PageContainer>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Layout com 2 cards superiores (compartilhando igualmente o espaço) e 2 cards inferiores. Sem quebra de linha.
            </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View style={{ flex: 1, flexDirection: 'column' }}>\n    {/* Cards superiores - 2 cards compartilhando igualmente o espaço */}\n    <View style={{\n      flexDirection: 'row',\n      gap: 16,\n      marginBottom: 16\n    }}>\n      <Card1 height={140} style={{ flex: 1 }} />\n      <Card2 height={140} style={{ flex: 1 }} />\n    </View>\n    {/* Cards inferiores - 2 cards */}\n    <View style={{\n      flexDirection: 'row',\n      gap: 16,\n      flex: 1\n    }}>\n      <Card3 style={{ flex: 1 }} />\n      <Card4 style={{ flex: 1 }} />\n    </View>\n  </View>\n</PageContainer>`}
              </Text>
            </View>
          </View>

          {/* Layout Container Único */}
          <View className="mb-lg">
            <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>Container Único</Text>
            <PageContainer>
              <HomeStyleCards 
                bgClass={bgSecondary}
                bgPrimaryClass={bgPrimary}
                isMobile={_isMobile} 
                isTablet={_isTablet}
                layout="single"
              />
            </PageContainer>
            <Text className={`text-body-sm ${textSecondary} mt-xs`}>
              Layout com apenas um card principal.
            </Text>
            <View className={`mt-2 p-2 rounded-md border ${borderColor}`}>
              <Text className={`text-mono-sm ${textPrimary}`}>
                {`// Código pronto para usar (compatível com nativo):\n<PageContainer>\n  <View className={\`\${bgSecondary} rounded-lg flex-1\`} style={{ minHeight: 400 }}>\n    {/* Conteúdo do card único */}\n  </View>\n</PageContainer>`}
              </Text>
            </View>
          </View>
        </View>

        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Características e Customização
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-md`}>
          O PageContainer oferece diversas possibilidades de customização:
        </Text>

        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Transparência</Text>
            <Text className={`text-body-sm ${textSecondary}`}>O container é transparente por padrão, permitindo definir qualquer cor de fundo</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Espaçamentos Customizáveis</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Padding lateral, superior e inferior podem ser customizados</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Responsividade</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Adapta-se automaticamente para desktop, tablet e mobile</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Suporte a Sidebar</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Ajusta o layout quando há uma sidebar presente (propriedade withSidebar)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Suporte a Header</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Adiciona margem superior apropriada (propriedade withHeader)</Text>
          </View>
        </View>

        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Propriedades Disponíveis
        </Text>
        <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>children</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Conteúdo do container (obrigatório)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>withSidebar</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se deve considerar espaço para sidebar (boolean, default: true)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>withHeader</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Se deve considerar espaço para header (boolean, default: true)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>sidebarWidth</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Largura da sidebar em pixels (number, default: 250 ou 65 para tablet)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>headerHeight</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Altura do header em pixels (number, default: 64)</Text>
          </View>

          <View className="mb-sm">
            <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>style</Text>
            <Text className={`text-body-sm ${textSecondary}`}>Estilos adicionais para o container (ViewStyle)</Text>
          </View>
        </View>

        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
          Exemplos de Código
        </Text>
        <View className={`${bgSecondary} rounded-lg p-md`}>
          <Text className={`text-mono-sm ${textPrimary}`}>
            {`// Modo Padrão\n<PageContainer>\n  {/* seu conteúdo */}\n</PageContainer>`}
          </Text>
          <View className={`my-md border-t ${borderColor}`} />
          <Text className={`text-mono-sm ${textPrimary}`}>
            {`// Com Header e Sidebar\n<PageContainer\n  withHeader\n  withSidebar\n  sidebarWidth={250}\n>\n  {/* seu conteúdo */}\n</PageContainer>`}
          </Text>
          <View className={`my-md border-t ${borderColor}`} />
          <Text className={`text-mono-sm ${textPrimary}`}>
            {`// Layout Dashboard (4x2) Responsivo\nconst getTopCardsStyle = () => {\n  if (isMobile || isTablet) {\n    return {\n      flexDirection: 'row',\n      flexWrap: 'wrap',\n      justifyContent: 'space-between',\n      gap: 16, marginBottom: 16\n    };\n  }\n  return { flexDirection: 'row', gap: 16, marginBottom: 16 };\n};\n\nconst getCardStyle = (index, isTopCard) => {\n  if (isTopCard && (isMobile || isTablet)) {\n    return Platform.OS === 'web'\n      ? { flex: 1, flexBasis: '48%', maxWidth: '48%', minWidth: '48%' }\n      : { flex: 1, maxWidth: '48%', minWidth: '45%' };\n  }\n  return { flex: 1 };\n};\n\n<View style={getTopCardsStyle()}>\n  {cards.map((card, index) => (\n    <Card key={index} style={getCardStyle(index, true)} />\n  ))}\n</View>`}
          </Text>
        </View>
      </View>
    );
  };

  const renderDataTableComponent = () => {
    // Define o tipo de dados para a tabela
    type Payment = {
      id: string;
      amount: number;
      status: "pending" | "processing" | "success" | "failed";
      email: string;
    };

    // Dados de exemplo
    const exampleData: Payment[] = [
      {
        id: "m5gr84i9",
        amount: 316,
        status: "success",
        email: "ken99@example.com",
      },
      {
        id: "3u1reuv4",
        amount: 242,
        status: "success",
        email: "Abe45@example.com",
      },
      {
        id: "derv1ws0",
        amount: 837,
        status: "processing",
        email: "Monserrat44@example.com",
      },
      {
        id: "5kma53ae",
        amount: 874,
        status: "success",
        email: "Silas22@example.com",
      },
      {
        id: "bhqecj4p",
        amount: 721,
        status: "failed",
        email: "carmella@example.com",
      },
    ];

    // Definição das colunas
    const columns: ColumnDef<Payment>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <View>
            <Text className={`capitalize ${textPrimary}`}>{row.getValue("status")}</Text>
          </View>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <TouchableOpacity
              className="flex-row items-center gap-1"
              onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <Text className={textPrimary}>Email</Text>
              <ArrowUpDown size={16} color={isDark ? '#E5E7EB' : '#374151'} />
            </TouchableOpacity>
          );
        },
        cell: ({ row }) => (
          <View>
            <Text className={`lowercase ${textPrimary}`}>{row.getValue("email")}</Text>
          </View>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <View className="items-end w-full"><Text className={`${textPrimary}`}>Valor</Text></View>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));

          // Formatar o valor como monetário em BRL
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);

          return (
            <View className="items-end">
              <Text className={`font-medium ${textPrimary}`}>{formatted}</Text>
            </View>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: () => (
          <View className="items-center justify-center">
            <TouchableOpacity className="p-1">
              <MoreHorizontal size={16} color={isDark ? '#E5E7EB' : '#374151'} />
            </TouchableOpacity>
          </View>
        ),
      },
    ];

    return (
      <View className="flex-1 p-4">
        <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-md`}>
          Data Table
        </Text>
        <Text className={`text-body-md ${textSecondary} mb-lg`}>
          Componente de tabela de dados com integração Supabase opcional. Suporta ordenação, filtros, seleção, paginação e efeitos de hover.
          {'\n\n'}• <Text className={`font-medium ${textPrimary}`}>Colunas obrigatórias</Text>: Você define quais colunas mostrar e como formatá-las
          {'\n'}• <Text className={`font-medium ${textPrimary}`}>Dados locais ou Supabase</Text>: Funciona com array de dados ou conexão direta ao Supabase
          {'\n'}• <Text className={`font-medium ${textPrimary}`}>Tratamento de erros</Text>: Mostra mensagens apropriadas quando Supabase falha
          {'\n'}• <Text className={`font-medium ${textPrimary}`}>Scroll automático</Text>: Ativa scroll horizontal quando conteúdo não cabe na tela
        </Text>

        {/* Exemplo Básico - Seleção apenas com Checkbox */}
        <View className={`p-5 rounded-lg mb-6 ${bgSecondary}`}>
          <Text className={`text-subtitle-md font-jakarta-medium ${textPrimary} mb-2`}>
            Exemplo 1: Seleção Apenas por Checkbox (padrão)
          </Text>
          <Text className={`text-body-sm ${textSecondary} mb-4`}>
            Neste exemplo, linhas só podem ser selecionadas usando os checkboxes.
            O efeito de hover nas linhas continua funcionando visualmente ao passar o mouse.
          </Text>
          <DataTable 
            data={exampleData}
            columns={columns}
            enableRowSelection
            enableSorting
            enableFiltering
            enablePagination
            searchPlaceholder="Filtrar emails..."
            // enableRowClick false é o padrão
            hoverableRowProps={{
              hoverScale: 1, 
              hoverTranslateY: 0,
              animationDuration: 150,
              disableHoverBackground: false
            }}
          />
        </View>

        {/* Exemplo com seleção ao clicar na linha */}
        <View className={`p-5 rounded-lg mb-6 ${bgSecondary}`}>
          <Text className={`text-subtitle-md font-jakarta-medium ${textPrimary} mb-2`}>
            Exemplo 2: Seleção ao Clicar na Linha
          </Text>
          <Text className={`text-body-sm ${textSecondary} mb-4`}>
            Neste exemplo, as linhas podem ser selecionadas clicando em qualquer parte da linha.
          </Text>
          <DataTable 
            data={exampleData}
            columns={columns}
            enableRowSelection
            enableRowClick
            enableSorting
            enableFiltering
            enablePagination
            searchPlaceholder="Filtrar emails..."
            hoverableRowProps={{
              hoverScale: 1,
              hoverTranslateY: 0,
              animationDuration: 150,
              disableHoverBackground: false
            }}
          />
        </View>

        {/* Exemplo com dados do Supabase */}
        <View className={`p-5 rounded-lg mb-6 ${bgSecondary}`}>
          <Text className={`text-subtitle-md font-jakarta-medium ${textPrimary} mb-2`}>
            Exemplo 3: Integração com Supabase
          </Text>
          <Text className={`text-body-sm ${textSecondary} mb-4`}>
            Conecta diretamente à tabela 'usersAicrusAcademy' do Supabase. Você controla:
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Quais campos buscar</Text>: Via 'select' (ex: apenas id, nome, email)
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Como mostrar</Text>: Customizar nome da coluna e formatação
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Tratamento de erro</Text>: Se tabela não existir, mostra mensagem apropriada
          </Text>

          <View className="mb-4 border border-gray-200 dark:border-gray-700 p-3 rounded-md">
            <Text className={`text-mono-sm ${textPrimary}`}>
              {`// Exemplo de customização:`}
            </Text>
            <Text className={`text-mono-sm ${textPrimary} mt-1`}>
              {`{\n  accessorKey: "created_at", // Campo original\n  header: () => <Text>Criado em</Text>, // Nome customizado\n  cell: ({ row }) => formatDate(row.getValue("created_at")), // Formatação\n  meta: { headerText: 'Criado em' } // Nome no dropdown\n}`}
            </Text>
          </View>
          
          <DataTable 
            columns={[
              {
                id: "select",
                header: ({ table }) => (
                  <Checkbox
                    checked={
                      table.getIsAllPageRowsSelected() ||
                      (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Selecionar todos"
                  />
                ),
                cell: ({ row }) => (
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Selecionar linha"
                  />
                ),
                enableSorting: false,
                enableHiding: false,
              },
              {
                accessorKey: "id",
                header: ({ column }) => (
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    <Text className={textPrimary}>ID</Text>
                    <ArrowUpDown size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                  </TouchableOpacity>
                ),
                cell: ({ row }) => (
                  <Text className={textPrimary}>{row.getValue("id")}</Text>
                ),
                meta: {
                  headerText: 'ID'
                }
              },
              {
                accessorKey: "created_at",
                header: ({ column }) => (
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    <Text className={textPrimary}>Criado em</Text>
                    <ArrowUpDown size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                  </TouchableOpacity>
                ),
                cell: ({ row }) => {
                  const date = new Date(row.getValue("created_at"));
                  const formatted = date.toLocaleString('pt-BR');
                  return <Text className={textPrimary}>{formatted}</Text>;
                },
                meta: {
                  headerText: 'Criado em'
                }
              },
              {
                accessorKey: "nome",
                header: ({ column }) => (
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    <Text className={textPrimary}>Nome</Text>
                    <ArrowUpDown size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                  </TouchableOpacity>
                ),
                cell: ({ row }) => (
                  <Text className={textPrimary}>{row.getValue("nome")}</Text>
                ),
                meta: {
                  headerText: 'Nome'
                }
              },
              {
                accessorKey: "email",
                header: ({ column }) => (
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    <Text className={textPrimary}>Email</Text>
                    <ArrowUpDown size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                  </TouchableOpacity>
                ),
                cell: ({ row }) => (
                  <Text className={`lowercase ${textPrimary}`}>{row.getValue("email")}</Text>
                ),
                meta: {
                  headerText: 'Email'
                }
              },
              {
                id: "actions",
                enableHiding: false,
                cell: () => (
                  <View className="items-center justify-center">
                    <TouchableOpacity className="p-1">
                      <MoreHorizontal size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                    </TouchableOpacity>
                  </View>
                ),
              },
            ]}
            supabaseConfig={{
              client: supabase,
              table: 'usersAicrusAcademy',
              select: 'id, created_at, nome, email', // Removido idCustomerAsaas como exemplo
              orderBy: { column: 'created_at', ascending: false }
            }}
            enableRowSelection
            enableSorting
            enableFiltering
            enablePagination
            searchPlaceholder="Filtrar por nome ou email..."
            hoverableRowProps={{
              hoverScale: 1,
              hoverTranslateY: 0,
              animationDuration: 150,
              disableHoverBackground: false
            }}
          />
        </View>

        {/* Seção de Funcionalidades */}
        <View className={`p-5 rounded-lg mb-6 ${bgSecondary}`}>
          <Text className={`text-subtitle-md font-jakarta-medium ${textPrimary} mb-2`}>
            Como Usar o DataTable
          </Text>
          
          <Text className={`text-body-sm font-medium ${textPrimary} mb-2`}>
            1. Com dados locais:
          </Text>
          <View className="mb-4 border border-gray-200 dark:border-gray-700 p-3 rounded-md">
            <Text className={`text-mono-sm ${textPrimary}`}>
              {`<DataTable \n  data={meusDados} \n  columns={minhasColunas}\n  enableSorting\n  enableFiltering\n/>`}
            </Text>
          </View>

          <Text className={`text-body-sm font-medium ${textPrimary} mb-2`}>
            2. Com Supabase:
          </Text>
          <View className="mb-4 border border-gray-200 dark:border-gray-700 p-3 rounded-md">
            <Text className={`text-mono-sm ${textPrimary}`}>
              {`<DataTable \n  columns={minhasColunas} // OBRIGATÓRIO\n  supabaseConfig={{\n    client: supabase,\n    table: 'usuarios',\n    select: 'id, nome, email', // Só os campos que quer\n    orderBy: { column: 'created_at', ascending: false }\n  }}\n/>`}
            </Text>
          </View>

          <Text className={`text-body-sm font-medium ${textPrimary} mb-2`}>
            ⚠️ Pontos importantes:
          </Text>
          <Text className={`text-body-sm ${textSecondary} mb-4`}>
            • <Text className={`font-medium ${textPrimary}`}>Colunas são obrigatórias</Text>: Sempre defina o array 'columns'
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Escolha os campos</Text>: Use 'select' para trazer só o que precisa
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Erros automáticos</Text>: Se tabela não existir, mostra mensagem de erro
            {'\n'}• <Text className={`font-medium ${textPrimary}`}>Scroll responsivo</Text>: Ativa automaticamente quando conteúdo não cabe
          </Text>
        </View>

        <View className={`p-5 rounded-lg mb-6 ${bgSecondary}`}>
          <Text className={`text-subtitle-md font-jakarta-medium ${textPrimary} mb-2`}>
            Propriedades do Componente
          </Text>
          <View className="mb-4">
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Prop</Text>
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Tipo</Text>
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Descrição</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>data</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Array</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Dados para exibir na tabela</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>columns</Text>
              <Text className={`w-1/3 ${textSecondary}`}>ColumnDef[]</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Definições das colunas</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>enableSorting</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Habilita ordenação</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>enableFiltering</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Habilita filtros</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>enablePagination</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Habilita paginação</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>enableRowSelection</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Habilita seleção de linhas</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>enableRowClick</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Permite selecionar ao clicar na linha inteira</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>hoverableRowProps</Text>
              <Text className={`w-1/3 ${textSecondary}`}>object</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Configurações de efeito hover</Text>
            </View>
          </View>
          
          <Text className={`text-subtitle-sm font-jakarta-medium ${textPrimary} mt-4 mb-2`}>
            Opções de hoverableRowProps
          </Text>
          <View className="mb-4">
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Prop</Text>
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Tipo</Text>
              <Text className={`w-1/3 font-medium ${textPrimary}`}>Descrição</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>hoverScale</Text>
              <Text className={`w-1/3 ${textSecondary}`}>number</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Escala ao passar o mouse (ex: 1.01)</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>hoverTranslateY</Text>
              <Text className={`w-1/3 ${textSecondary}`}>number</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Deslocamento vertical (ex: -2 para elevar)</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>animationDuration</Text>
              <Text className={`w-1/3 ${textSecondary}`}>number</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Duração da animação em ms (ex: 200)</Text>
            </View>
            
            <View className="flex-row py-2 border-b border-gray-200 dark:border-gray-700">
              <Text className={`w-1/3 ${textPrimary}`}>disableHoverBackground</Text>
              <Text className={`w-1/3 ${textSecondary}`}>boolean</Text>
              <Text className={`w-1/3 ${textSecondary}`}>Desabilita mudança de cor de fundo</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSheetComponent = () => {
    // Ao invés de declarar hooks diretamente aqui, retornamos um componente que declara os hooks
    return (
      <SheetExampleContent />
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Dev',
          headerShown: true,
          headerTintColor: currentTheme === 'dark' ? '#FFFFFF' : '#14181B',
          headerStyle: {
            backgroundColor: currentTheme === 'dark' ? '#1C1E26' : '#F7F8FA',
          }
        }} 
      />
      
      <View className={`flex-1 ${bgPrimary}`}>
        <Stack.Screen
          options={{
            title: "Desenvolvimento",
            headerShown: false,
          }}
        />
        
        <View className="flex-1">
          {isMobile ? (
            // Layout para dispositivos móveis com botões compactos no topo
            <View className="flex-1">
              {/* Navegação compacta para dispositivos móveis */}
              <View className={`border-b ${border} py-1 ${bgSecondary}`}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  {availableComponents.map((component) => (
                    <Pressable
                      key={component.id}
                      onPress={() => setActiveComponent(component.id as 'input' | 'select' | 'accordion' | 'button' | 'designSystem' | 'toast' | 'themeSelector' | 'hoverableView' | 'gradientView' | 'dropdownMenu' | 'pageContainer')}
                      className={`mr-2 px-3 py-1 rounded-md ${
                        activeComponent === component.id
                          ? isDark
                            ? 'bg-primary-dark'
                            : 'bg-primary-light'
                          : isDark 
                            ? 'bg-bg-tertiary-dark' 
                            : 'bg-bg-secondary-light'
                      }`}
                      style={{ 
                        height: 32,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Text
                        className={`${
                          activeComponent === component.id
                            ? 'text-white'
                            : textPrimary
                        } text-body-sm font-jakarta-medium`}
                      >
                        {component.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              
              {/* Conteúdo do componente em um ScrollView isolado */}
              <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                  flexGrow: 1,
                  paddingBottom: 120 
                }}
              >
                {renderComponentContent()}
              </ScrollView>
            </View>
          ) : (
            // Layout para desktop com sidebar lateral - versão moderna e elegante
            <View className="flex-row flex-1">
              {/* Lista de componentes - sidebar mais fina e elegante */}
              <View className={`w-[220px] border-r ${border} bg-opacity-50 ${bgSecondary}`}>
                <View className="py-md px-md">
                  <Text className={`text-title-sm font-jakarta-bold ${textPrimary} mb-xs px-xs`}>
                    Componentes
                  </Text>
                  
                  <View className="flex-col overflow-y-auto max-h-[calc(100vh-80px)]" 
                        style={Platform.OS === 'web' ? { 
                          // @ts-ignore - Estas propriedades são específicas para web
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none' 
                        } : {}}>
                    {availableComponents.map((component) => {
                      // Substituir a importação dinâmica pela nossa função renderIcon
                      const isComponentActive = activeComponent === component.id;
                      return (
                        <HoverableView
                          key={component.id}
                          onPress={() => setActiveComponent(component.id as 'input' | 'select' | 'accordion' | 'button' | 'designSystem' | 'toast' | 'themeSelector' | 'hoverableView' | 'gradientView' | 'dropdownMenu' | 'pageContainer')}
                          className={`flex-row items-center py-xs px-xs my-[2px] rounded-md`}
                          style={isComponentActive ? {
                            borderWidth: 1,
                            borderColor: isDark 
                              ? `${designColors['primary-dark']}30` 
                              : `${designColors['primary-light']}30`
                          } : {}}
                          isActive={isComponentActive}
                          animationDuration={150}
                          activeBackgroundColor={undefined}
                          hoverColor={isDark ? designColors['hover-dark'] : designColors['hover-light']}
                        >
                          <View
                            className={`w-8 h-8 rounded-md mr-sm items-center justify-center ${
                              isComponentActive
                                ? isDark 
                                  ? 'bg-bg-tertiary-dark' 
                                  : 'bg-bg-tertiary-light'
                                : isDark 
                                  ? 'bg-bg-tertiary-dark' 
                                  : 'bg-bg-tertiary-light'
                            }`}
                          >
                            {renderIcon(component.icon)}
                          </View>
                          <Text
                            className={`${
                              isComponentActive
                                ? isDark
                                  ? 'text-primary-dark font-jakarta-semibold'
                                  : 'text-primary-light font-jakarta-semibold'
                                : textSecondary
                            } text-body-sm`}
                          >
                            {component.name}
                          </Text>
                        </HoverableView>
                      );
                    })}
                  </View>
                </View>
              </View>
              
              {/* Conteúdo do componente */}
              <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                style={Platform.OS === 'web' ? { 
                  // @ts-ignore - Estas propriedades são específicas para web
                  scrollbarWidth: 'thin', 
                  scrollbarColor: isDark ? '#3B4252 transparent' : '#E2E8F0 transparent' 
                } : {}}
              >
                {renderComponentContent()}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

// Tipos
interface SectionTitleProps {
  title: string;
  textColor: string;
}

interface ColorCardProps {
  name: string;
  color: string;
  textColor: string;
}

interface SpacingExampleProps {
  size: string;
  bgColor: string;
  textColor: string;
  value?: string;
}

interface BorderRadiusExampleProps {
  name: string;
  value: string;
  bgColor: string;
  textColor: string;
}

interface ShadowExampleProps {
  name: string;
  shadow: string;
  textColor: string;
  bgColor: string;
}

interface OpacityExampleProps {
  name: string;
  value: string;
  bgColor: string;
  textColor: string;
}

interface ValueDisplayProps {
  name: string;
  value: string;
  textColor: string;
}

// Componentes auxiliares
const SectionTitle = ({ title, textColor }: SectionTitleProps) => (
  <View className="mb-md">
    <Text className={`text-headline-sm font-jakarta-bold ${textColor}`}>{title}</Text>
    <View className="h-[1px] bg-divider-light dark:bg-divider-dark mt-xs" />
  </View>
);

const ColorCard = ({ name, color, textColor }: ColorCardProps) => (
  <View className="mb-sm">
    <View className={`${color} w-16 h-16 rounded-md mb-xs`} />
    <Text className={`text-label-sm ${textColor}`}>{name}</Text>
  </View>
);

// Componente para mostrar cores dinâmicas dos tokens
interface DynamicColorCardProps {
  name: string;
  colorValue: string;
  textColor: string;
}

const DynamicColorCard = ({ name, colorValue, textColor }: DynamicColorCardProps) => (
  <View className="mb-sm">
    <View 
      className="w-16 h-16 rounded-md mb-xs" 
      style={{ backgroundColor: colorValue }}
    />
    <Text className={`text-label-sm ${textColor}`}>{name}</Text>
    <Text className={`text-body-xs ${textColor} opacity-60`}>{colorValue}</Text>
  </View>
);

// Componente para mostrar espaçamentos dinâmicos dos tokens
interface DynamicSpacingExampleProps {
  name: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const DynamicSpacingExample = ({ name, value, bgColor, textColor }: DynamicSpacingExampleProps) => {
  const numericValue = parseInt(value.replace('px', ''));
  return (
    <View className="items-center mr-md mb-md">
      <View 
        className="h-8" 
        style={{ 
          width: Math.max(numericValue, 4), // Mínimo de 4px para visibilidade
          backgroundColor: bgColor 
        }} 
      />
      <Text className={`text-label-sm ${textColor} mt-xs`}>{name}</Text>
      <Text className={`text-body-xs ${textColor} opacity-60`}>{value}</Text>
    </View>
  );
};

// Componente para mostrar border radius dinâmicos dos tokens
interface DynamicBorderRadiusExampleProps {
  name: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const DynamicBorderRadiusExample = ({ name, value, bgColor, textColor }: DynamicBorderRadiusExampleProps) => {
  return (
    <View className="items-center mr-md mb-md">
      <View 
        className="h-20 w-20 flex items-center justify-center mb-xs" 
        style={{ 
          backgroundColor: bgColor,
          borderRadius: name === "full" ? 9999 : parseInt(value.replace(/[^0-9]/g, '') || '0') 
        }}
      >
        <Text className="text-white text-label-sm">{value}</Text>
      </View>
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
      <Text className={`text-body-xs ${textColor} opacity-60`}>{value}</Text>
    </View>
  );
};

// Componente para mostrar sombras dinâmicas dos tokens
interface DynamicShadowExampleProps {
  name: string;
  shadowValue: string;
  textColor: string;
  bgColor: string;
}

const DynamicShadowExample = ({ name, shadowValue, textColor, bgColor }: DynamicShadowExampleProps) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Para modo escuro, vamos criar sombras mais visíveis
  const getEnhancedShadow = (originalShadow: string): string => {
    if (!isDark) return originalShadow;
    
    // No modo escuro, usar um cinza escuro para as sombras
    const darkGray = '68, 68, 68'; // RGB para um cinza escuro
    
    if (originalShadow === 'none') return 'none';
    
    return originalShadow.replace(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/g, (_, opacity) => {
      // Aumenta a opacidade para o modo escuro
      const darkOpacity = Math.min(parseFloat(opacity) * 3.5, 0.6);
      return `rgba(${darkGray}, ${darkOpacity})`;
    });
  };

  return (
    <View className="items-center mb-md">
      <View 
        className={`h-20 w-full rounded-md flex items-center justify-center mb-xs`}
        style={{
          backgroundColor: isDark ? designColors['bg-secondary-dark'] : designColors['bg-secondary-light'],
          // Aplicar a sombra diretamente do valor do token
          ...Platform.select({
            web: {
              boxShadow: getEnhancedShadow(shadowValue)
            },
            default: {
              // Para React Native, usar valores específicos baseados no tema
              shadowColor: isDark ? '#444444' : '#000000', // Cinza escuro no modo escuro
              shadowOffset: { width: 0, height: name === 'none' ? 0 : 2 },
              shadowOpacity: isDark ? 0.45 : 0.1, // Maior opacidade no modo escuro
              shadowRadius: name === 'none' ? 0 : isDark ? 6 : 4, // Raio maior no modo escuro
              elevation: name === 'none' ? 0 : isDark ? 4 : 3, // Elevação maior no modo escuro
            }
          })
        }}
      >
        <Text className={`text-body-sm ${textColor}`}>{name}</Text>
      </View>
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
      <Text className={`text-body-xs ${textColor} opacity-60`}>
        {isDark ? getEnhancedShadow(shadowValue) : shadowValue}
      </Text>
    </View>
  );
};

// Componente para mostrar opacidade dinâmica dos tokens
interface DynamicOpacityExampleProps {
  name: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const DynamicOpacityExample = ({ name, value, bgColor, textColor }: DynamicOpacityExampleProps) => {
  const opacityValue = parseFloat(value);
  
  return (
    <View className="items-center mb-md">
      <View 
        className="h-12 w-full rounded-md mb-xs"
        style={{ 
          backgroundColor: bgColor,
          opacity: opacityValue 
        }}
      />
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
      <Text className={`text-body-xs ${textColor} opacity-60`}>{value}</Text>
    </View>
  );
};

const SpacingExample = ({ size, bgColor, textColor, value }: SpacingExampleProps) => {
  return (
    <View className="items-center mr-md mb-md">
      <View className={`${bgColor} h-8`} style={{ width: parseInt(size.replace(/[^0-9]/g, '') || '4') * 4 }} />
      <Text className={`text-label-sm ${textColor} mt-xs`}>{size}</Text>
      {value && <Text className={`text-body-xs ${textColor} opacity-60`}>{value}</Text>}
    </View>
  );
};

const BorderRadiusExample = ({ name, value, bgColor, textColor }: BorderRadiusExampleProps) => {
  return (
    <View className="items-center mr-md mb-md">
      <View 
        className={`${bgColor} h-20 w-20 flex items-center justify-center mb-xs`} 
        style={{ borderRadius: name === "full" ? 9999 : parseInt(value.replace(/[^0-9]/g, '') || '0') }}
      >
        <Text className={`text-white text-label-sm`}>{value}</Text>
      </View>
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
    </View>
  );
};

const ShadowExample = ({ name, shadow, textColor, bgColor }: ShadowExampleProps) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  return (
    <View className="items-center mb-md">
      <View className={`${bgColor} ${shadow} h-20 w-full rounded-md flex items-center justify-center mb-xs`}>
        <Text className={`text-body-sm ${textColor}`}>shadow-{name}</Text>
      </View>
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
    </View>
  );
};

const OpacityExample = ({ name, value, bgColor, textColor }: OpacityExampleProps) => {
  // Convertemos o nome (string) para um número para poder aplicar diretamente como estilo
  const opacityValue = parseFloat(value);
  
  return (
    <View className="items-center mb-md">
      <View 
        className={`${bgColor} h-12 w-full rounded-md mb-xs`} 
        style={{ opacity: opacityValue }}
      />
      <Text className={`text-label-sm ${textColor}`}>{name}</Text>
      <Text className={`text-body-xs ${textColor} opacity-60`}>{value}</Text>
    </View>
  );
};

const ValueDisplay = ({ name, value, textColor }: ValueDisplayProps) => {
  return (
    <View className="items-center mb-md p-xs border border-divider-light dark:border-divider-dark rounded-md">
      <Text className={`text-body-md font-jakarta-semibold ${textColor}`}>{name}</Text>
      <Text className={`text-body-sm ${textColor} opacity-70`}>{value}</Text>
    </View>
  );
};

// Adicionar componente para botão de copiar
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  const handleCopy = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Renderiza apenas na web
  if (Platform.OS !== 'web') return null;
  
  return (
    <Pressable 
      onPress={handleCopy}
      className={`absolute top-2 right-2 p-1 rounded-md ${copied ? 'bg-success-bg-light' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <Text className={`text-xs ${copied ? 'text-success-text-light' : isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
        {copied ? 'Copiado!' : 'Copiar'}
      </Text>
    </Pressable>
  );
}

// Componente para o conteúdo de exemplo do Sheet
const SheetExampleContent: React.FC = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { currentBreakpoint } = useResponsive();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<SheetPosition>('bottom');

  // Cores do tema atual
  const bgPrimary = isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light';
  const bgSecondary = isDark ? 'bg-bg-secondary-dark' : 'bg-bg-secondary-light';
  const bgTertiary = isDark ? 'bg-bg-tertiary-dark' : 'bg-bg-tertiary-light';
  const textPrimary = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
  const textSecondary = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  
  return (
    <View className="p-lg">
      <Text className={`text-headline-sm font-jakarta-bold ${textPrimary} mb-sm`}>
        Componente Sheet
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-lg`}>
        O Sheet é um componente que permite exibir conteúdo em uma janela modal deslizando de qualquer direção.
        Disponível em todos os dispositivos e breakpoints.
      </Text>
      
      <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
        <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-lg`}>Exemplos:</Text>
        
        <View className="flex-row flex-wrap gap-sm justify-center mb-lg">
          {/* Grid 2x2 para os botões de direção */}
          <View className="flex flex-row flex-wrap justify-center" style={{ width: 310 }}>
            <View style={{ width: 150, margin: 2 }}>
              <Button
                onPress={() => {
                  setCurrentSheet('top');
                  setSheetVisible(true);
                }}
                variant="outline"
                size="md"
                style={{ width: '100%' }}
                testID="button-sheet-top"
              >
                top
              </Button>
            </View>
            
            <View style={{ width: 150, margin: 2 }}>
              <Button
                onPress={() => {
                  setCurrentSheet('right');
                  setSheetVisible(true);
                }}
                variant="outline"
                size="md"
                style={{ width: '100%' }}
                testID="button-sheet-right"
              >
                right
              </Button>
            </View>
            
            <View style={{ width: 150, margin: 2 }}>
              <Button
                onPress={() => {
                  setCurrentSheet('bottom');
                  setSheetVisible(true);
                }}
                variant="outline"
                size="md"
                style={{ width: '100%' }}
                testID="button-sheet-bottom"
              >
                bottom
              </Button>
            </View>
            
            <View style={{ width: 150, margin: 2 }}>
              <Button
                onPress={() => {
                  setCurrentSheet('left');
                  setSheetVisible(true);
                }}
                variant="outline"
                size="md"
                style={{ width: '100%' }}
                testID="button-sheet-left"
              >
                left
              </Button>
            </View>
          </View>
        </View>
        
        <Text className={`text-subtitle-sm font-jakarta-bold ${textPrimary} mb-sm`}>
          Escolha a direção do Sheet
        </Text>
        <Text className={`text-body-sm ${textSecondary} mt-xs`}>
          O Sheet pode abrir de qualquer uma das quatro direções em todos os dispositivos e breakpoints
        </Text>
      </View>
      
      {/* Sheet Component */}
      <Sheet
        isOpen={sheetVisible}
        onClose={() => setSheetVisible(false)}
        position={currentSheet}
        borderRadius={16}
        closeOnOverlayClick={true}
        showCloseButton={true}
        overlayOpacity={0.5}
        animationDuration={300}
        useSafeArea={true} // Adiciona área de segurança para dispositivos com notch/island
      >
        {/* Conteúdo de exemplo para o Sheet */}
        <View className="p-md">
          <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
            Sheet {currentSheet}
          </Text>
          <Text className={`text-body-md ${textSecondary} mb-md`}>
            Este componente adapta-se automaticamente ao tema claro/escuro do sistema.
            O fundo e o botão de fechamento mudam de acordo com o tema.
          </Text>
          <View className={`${bgSecondary} rounded-lg p-md mb-md`}>
            <Text className={`text-body-sm ${textSecondary}`}>
              O Sheet é um componente versátil que pode ser aberto em qualquer direção.
              É ideal para mostrar informações contextuais sem interromper o fluxo principal do aplicativo.
            </Text>
          </View>
          <Button
            onPress={() => setSheetVisible(false)}
            variant="primary"
            size="md"
            style={{ width: '100%' }}
          >
            Fechar
          </Button>
        </View>
      </Sheet>
      
      <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
        Características
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-md`}>
        O Sheet oferece diversas características para uma experiência de usuário fluida:
      </Text>
      
      <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Responsivo</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Adapta-se automaticamente ao tamanho da tela</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Animação Suave</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Transições fluidas para uma melhor experiência do usuário</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Overlay Personalizável</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Controle da opacidade do overlay de fundo</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Múltiplas Direções</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Em desktop, o Sheet pode abrir de qualquer direção (top, right, bottom, left)</Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema Adaptativo</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Cores se adaptam automaticamente aos temas claro, escuro ou configuração do sistema</Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Safe Area</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Padding de segurança automático para dispositivos com notch/island (iOS) e também para web</Text>
        </View>
      </View>
      
      <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
        Propriedades
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-lg`}>
        O componente Sheet possui as seguintes propriedades:
      </Text>
      
      <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>isOpen</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Se o Sheet está visível (boolean)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>onClose</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Função chamada quando o Sheet é fechado (callback)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>position</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Posição do Sheet ('top', 'right', 'bottom', 'left')</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>height</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Altura do Sheet (padrão: 350px para top/bottom)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>width</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Largura do Sheet (padrão: 350px para left/right)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>borderRadius</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Raio da borda do Sheet (number)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>closeOnOverlayClick</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Se o Sheet deve fechar ao clicar no overlay (boolean)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>showCloseButton</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Se deve mostrar o botão de fechar (boolean)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>overlayOpacity</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Opacidade do overlay (number)</Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>animationDuration</Text>
          <Text className={`text-body-sm ${textSecondary}`}>Duração da animação em ms (number)</Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>useSafeArea</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            Adiciona área de segurança para dispositivos com notch/island e web (boolean, padrão: true)
          </Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>contentContainerStyle</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            Estilos adicionais para o container de conteúdo (object)
          </Text>
        </View>
      </View>
      
      <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
        Tamanhos padrão por dispositivo
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-md`}>
        O Sheet se adapta automaticamente ao tipo de dispositivo:
      </Text>
      
      <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Dispositivos Nativos (iOS/Android)</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - top/bottom: altura de 450 (numérico){'\n'}
            - left/right: largura de 280 (numérico){'\n'}
            - Área de segurança: padding de 10px para telas com notch/island
          </Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Desktop (Web)</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - top/bottom: altura de 380px, largura de 100%{'\n'}
            - left/right: largura de 300px, altura de 100%{'\n'}
            - Área de segurança: padding de 20px para melhor visualização
          </Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Mobile/Tablet (Web)</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - top/bottom: altura de 450px, largura de 100%{'\n'}
            - left/right: largura de 280px, altura de 100%{'\n'}
            - Área de segurança: padding de 20px para melhor visualização
          </Text>
        </View>
        
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Personalizando tamanhos</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - Você pode sobrescrever os tamanhos padrão usando as props height e width{'\n'}
            - Para ambientes web, use valores com 'px' (ex: height="500px"){'\n'}
            - Para ambientes nativos, use valores numéricos (ex: height={500}){'\n'}
            - Na web, você também pode usar porcentagens (ex: width="50%")
          </Text>
        </View>
      </View>
      
      <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
        Uso
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-md`}>
        Exemplo de implementação do Sheet:
      </Text>
      
      <View className={`bg-bg-tertiary-${isDark ? 'dark' : 'light'} rounded-lg p-md mb-lg`}>
        <Text className={`text-mono-md font-mono-regular ${textPrimary}`}>
{`// Importar o componente
import Sheet from '@/components/sheets/Sheet';

// Estado para controlar a visibilidade
const [isOpen, setIsOpen] = useState(false);

// Renderização
<Sheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  position="bottom"
  showCloseButton={true}
  borderRadius={16}
  overlayOpacity={0.5}
>
  {/* 
   * O conteúdo será exibido com as cores corretas 
   * de acordo com o tema do sistema (claro/escuro)
   */}
  <View style={{ padding: 16 }}>
    {(() => {
      const t = getResponsiveValues('title-sm');
      const s = {
        fontSize: responsive(t.fontSize),
        lineHeight: responsive(t.lineHeight),
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight as any,
        marginBottom: 12,
      } as const;
      return (
        <Text style={s}>
          Título do Sheet
        </Text>
      );
    })()}
    <Text style={{ marginBottom: 16 }}>
      Este é um exemplo de conteúdo que você pode incluir no Sheet.
      O componente já gerencia automaticamente os temas claro/escuro.
    </Text>
    <Button onPress={() => setIsOpen(false)}>
      Fechar Sheet
    </Button>
  </View>
</Sheet>

// Botão para abrir o Sheet
<Button
  title="Abrir Sheet"
  onPress={() => setIsOpen(true)}
/>`}
        </Text>
      </View>

      <Text className={`text-subtitle-md font-jakarta-bold ${textPrimary} mb-sm`}>
        Temas
      </Text>
      <Text className={`text-body-md ${textSecondary} mb-md`}>
        O Sheet adapta-se automaticamente aos temas claro, escuro e configuração do sistema:
      </Text>
      
      <View className={`${bgSecondary} rounded-lg p-md mb-lg`}>
        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema Claro</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - Background: branco{'\n'}
            - Botão de fechar: cinza claro com ícone escuro{'\n'}
            - Funciona automaticamente, sem configuração adicional{'\n'}
          </Text>
        </View>

        <View className="mb-sm">
          <Text className={`text-label-md font-jakarta-bold ${textPrimary}`}>Tema Escuro</Text>
          <Text className={`text-body-sm ${textSecondary}`}>
            - Background: cinza escuro{'\n'}
            - Botão de fechar: cinza médio com ícone claro{'\n'}
            - Funciona automaticamente, sem configuração adicional{'\n'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Função que chama o componente sem declarar hooks diretamente
const renderSheetComponent = () => {
  // Ao invés de declarar hooks diretamente aqui, retornamos um componente que declara os hooks
  return (
    <SheetExampleContent />
  );
};
