import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

// Importar tokens diretamente do design system
import { colors } from '../design-system/tokens/colors';
import { spacing } from '../design-system/tokens/spacing';
import { fontSize as fontSizes, fontFamily, setTypographyScale, getTypographyScale } from '../design-system/tokens/typography';
import { borderRadius } from '../design-system/tokens/borders';
import { boxShadow, opacity, zIndex, transitionDuration } from '../design-system/tokens/effects';

// Tipos básicos mantidos
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface DesignSystemContextType {
  // Estados do tema
  themeMode: ThemeMode;
  currentTheme: ColorScheme;
  // Funções de controle
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  // Tokens do design system
  colors: typeof colors;
  spacing: typeof spacing;
  fontSize: typeof fontSizes;
  fontFamily: typeof fontFamily;
  borderRadius: typeof borderRadius;
  boxShadow: typeof boxShadow;
  opacity: typeof opacity;
  zIndex: typeof zIndex;
  transitionDuration: typeof transitionDuration;
  // Funções utilitárias
  getThemedValue: <T>(lightValue: T, darkValue: T) => T;
  getColorByMode: (colorBase: string, colorScheme?: ColorScheme) => string;
  // Acessibilidade
  accessibility: {
    fontScale: 'normal' | 'grande' | 'muito-grande';
    contrast: 'normal' | 'alto';
    sound: 'com' | 'sem';
  };
  setAccessibility: (prefs: Partial<DesignSystemContextType['accessibility']>) => void;
  // Força re-render global quando a escala muda (atualiza rapidamente as telas)
  typographyVersion: number;
  applyFontScale: (level: 'normal' | 'grande' | 'muito-grande') => void;
  // Helpers
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  // Estado para o modo do tema (light/dark/system)
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  // Estado para o tema do dispositivo
  const [systemTheme, setSystemTheme] = useState<ColorScheme>(Appearance.getColorScheme() || 'light');
  const [isLoading, setIsLoading] = useState(true);
  // Preferências de acessibilidade
  const [accessibility, setAccessibilityState] = useState<{
    fontScale: 'normal' | 'grande' | 'muito-grande';
    contrast: 'normal' | 'alto';
    sound: 'com' | 'sem';
  }>({ fontScale: 'normal', contrast: 'normal', sound: 'com' });
  const ACCESS_STORAGE_KEY = '@app_accessibility';
  const [typographyVersion, setTypographyVersion] = useState(0);

  // Carrega o tema salvo quando o app inicia
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        console.log('🎨 Tema salvo carregado:', savedTheme);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme as ThemeMode)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
        // Carrega acessibilidade
        const savedAccess = await AsyncStorage.getItem(ACCESS_STORAGE_KEY);
        if (savedAccess) {
          try {
            const parsed = JSON.parse(savedAccess);
            if (parsed.fontScale === 'grande') setTypographyScale(1.00);
            else if (parsed.fontScale === 'muito-grande') setTypographyScale(1.15);
            else setTypographyScale(0.90);
            setAccessibilityState({
              fontScale: parsed.fontScale ?? 'normal',
              contrast: parsed.contrast ?? 'normal',
              sound: parsed.sound ?? 'com',
            });
          } catch {}
        } else {
          // Sem preferências salvas, considere 'normal' levemente menor que o base
          setTypographyScale(0.90);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, []);

  // Monitora mudanças no tema do sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const newTheme = colorScheme || 'light';
      console.log('🔄 Tema do sistema mudou para:', newTheme);
      setSystemTheme(newTheme as ColorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Função para alterar o modo do tema
  const setThemeMode = async (mode: ThemeMode) => {
    console.log('🎨 Alterando modo do tema para:', mode);
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // Atualiza e persiste acessibilidade
  const setAccessibility = async (prefs: Partial<typeof accessibility>) => {
    const next = { ...accessibility, ...prefs };
    setAccessibilityState(next);
    try {
      await AsyncStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Erro ao salvar acessibilidade:', e);
    }
    // Aplica escala tipográfica global
    if (prefs.fontScale) {
      if (prefs.fontScale === 'grande') setTypographyScale(1.00);
      else if (prefs.fontScale === 'muito-grande') setTypographyScale(1.15);
      else setTypographyScale(0.90);
      // Força re-render global
      setTypographyVersion((v) => v + 1);
    }
  };

  const applyFontScale = (level: 'normal' | 'grande' | 'muito-grande') => {
    setAccessibility({ fontScale: level });
  };

  // Função para alternar entre os temas
  const toggleTheme = () => {
    const newMode: ThemeMode = 
      themeMode === 'light' ? 'dark' : 
      themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
  };

  // Determina o tema atual baseado no modo e tema do sistema
  const currentTheme: ColorScheme = themeMode === 'system' ? systemTheme : (themeMode as ColorScheme);
  
  // Função utilitária para obter valores baseados no tema
  const getThemed = <T,>(lightValue: T, darkValue: T): T => {
    return currentTheme === 'dark' ? darkValue : lightValue;
  };

  // Helpers para verificar o estado do tema
  const isDark = currentTheme === 'dark';
  const isLight = currentTheme === 'light';
  const isSystem = themeMode === 'system';

  // Log para debug
  useEffect(() => {
    console.log('📱 Estado do tema:', {
      themeMode,
      systemTheme,
      currentTheme,
      isDark,
      isLight,
      isSystem
    });
  }, [themeMode, systemTheme, currentTheme]);

  if (isLoading) {
    return null;
  }

  return (
    <DesignSystemContext.Provider
      value={{
        // Estados
        themeMode,
        currentTheme,
        // Funções de controle
        setThemeMode,
        toggleTheme,
        // Tokens do design system
        colors,
        spacing,
        fontSize: fontSizes,
        fontFamily,
        borderRadius,
        boxShadow,
        opacity,
        zIndex,
        transitionDuration,
        // Funções utilitárias
        getThemedValue: getThemed,
         getColorByMode: (colorBase: string, colorScheme?: ColorScheme) => {
          const scheme = colorScheme || currentTheme;
          const colorKey = `${colorBase}-${scheme}` as keyof typeof colors;
          return colors[colorKey] || '';
        },
        // Acessibilidade
        accessibility,
        setAccessibility,
        typographyVersion,
        applyFontScale,
        // Helpers
        isDark,
        isLight,
        isSystem,
      }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

// Alias para manter compatibilidade
export const useTheme = useDesignSystem; 
