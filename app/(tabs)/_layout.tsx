import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Home as HomeIcon, Code as CodeIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useResponsive } from '../../hooks/useResponsive';
import { HapticTab } from '@/components/HapticTab';

// Definindo cores baseadas no tema dinamicamente
const getThemeColors = (isDark: boolean) => ({
  activeTabColor: isDark ? '#4A6FA5' : '#892CDC', // primary-dark / primary-light
  inactiveTabColor: isDark ? '#95A1AC' : '#57636C', // text-tertiary-dark / text-secondary-light
  tabBackgroundColor: isDark 
    ? '#14181B' // bg-secondary-dark sem transparência
    : '#FFFFFF', // bg-secondary-light sem transparência
  tabBorderColor: isDark 
    ? '#262D34' // divider-dark sem transparência
    : '#E0E3E7' // divider-light sem transparência
});

/**
 * Estrutura base simplificada para o TabsLayout
 */
export default function TabsLayout() {
  const { currentTheme } = useTheme();
  const { 
    isMobile, 
    width, 
    currentBreakpoint 
  } = useResponsive();
  
  const isDark = currentTheme === 'dark';
  const { activeTabColor, inactiveTabColor, tabBackgroundColor, tabBorderColor } = getThemeColors(isDark);

  // Log para debug apenas uma vez quando o componente é montado
  useEffect(() => {
    console.log(`[Tabs] Status inicial: ${isMobile ? 'Visível' : 'Oculto'} (${width}px / ${currentBreakpoint})`);
  }, []);

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTabColor,
          tabBarInactiveTintColor: inactiveTabColor,
          headerShown: false,
          tabBarLabelPosition: 'below-icon',
          lazy: false,
          ...(Platform.OS === 'ios' && { tabBarButton: HapticTab }),
          tabBarStyle: [
            styles.tabBar,
            Platform.select({
              ios: {
                ...styles.iosTabBar,
                height: 88,
                backgroundColor: tabBackgroundColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: tabBorderColor,
              },
              android: {
                ...styles.androidTabBar,
                height: 60,
                backgroundColor: tabBackgroundColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: tabBorderColor,
              },
              web: {
                ...styles.webTabBar,
                backgroundColor: tabBackgroundColor,
                borderTopColor: tabBorderColor,
                // Esconde a tab bar em tablets e telas grandes
                display: isMobile ? 'flex' : 'none',
              },
              default: {},
            }),
          ],
          tabBarItemStyle: Platform.select({
            web: {
              ...styles.webTabItem,
              paddingTop: 0,
              marginTop: -4,
              height: '100%',
              gap: 2,
            },
            native: {
              ...styles.tabItem,
              marginTop: -6,
            },
          }),
          tabBarLabelStyle: Platform.select({
            web: styles.webTabLabel,
            native: {
              fontSize: 12,
              lineHeight: 16,
              marginTop: -2
            }
          }),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
              <HomeIcon 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2 : 1.5} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dev"
          options={{
            title: 'Dev',
            headerTitle: 'Dev',
            tabBarLabel: 'Dev',
            tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
              <CodeIcon 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2 : 1.5} 
              />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: 'flex',
    height: 70,
    paddingBottom: 25,
  },
  iosTabBar: {
    position: 'absolute',
    paddingBottom: 25,
  },
  androidTabBar: {
    paddingBottom: 12,
  },
  webTabBar: {
    height: 70,
    paddingTop: 4,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    paddingTop: 8,
    gap: 4,
  },
  webTabItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webTabLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: -2,
  },
});
