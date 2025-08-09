import { useColorScheme as _useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

export interface ColorSchemeType {
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

export function useColorScheme(): ColorSchemeType {
  const colorScheme = _useColorScheme();
  const [theme, setTheme] = useState<ColorSchemeType>({
    isDark: colorScheme === 'dark',
    colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
  });

  useEffect(() => {
    setTheme({
      isDark: colorScheme === 'dark',
      colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
    });
  }, [colorScheme]);

  return theme;
}

export default useColorScheme;