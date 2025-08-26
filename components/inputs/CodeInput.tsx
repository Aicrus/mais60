import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Text, Platform, Animated } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useTheme } from '@/hooks/DesignSystemContext';

type CodeInputProps = {
  length?: number; // default 4
  value: string;
  onChange: (code: string) => void;
  onFocus?: () => void;
};

export default function CodeInput({ length = 4, value, onChange, onFocus }: CodeInputProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const chars = useMemo(() => {
    const arr = new Array(length).fill('');
    const v = (value || '').slice(0, length).split('');
    return arr.map((_, i) => v[i] || '');
  }, [length, value]);

  const ui = {
    border: isDark ? colors['divider-dark'] : '#E5E7EB',
    borderFocused: colors['brand-purple'],
    bg: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    tint: colors['brand-purple'],
    placeholder: isDark ? colors['text-secondary-dark'] : '#9CA3AF',
  } as const;

  const labelType = getResponsiveValues('label-lg');
  const digitType = getResponsiveValues('headline-md');

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {new Array(length).fill(0).map((_, idx) => {
          const isFocused = focusedIndex === idx;
          const hasValue = chars[idx] !== '';

          return (
            <Animated.View
              key={idx}
              style={[
                {
                  transform: isFocused && !hasValue ? [{ scale: pulseAnim }] : [{ scale: 1 }],
                },
                isFocused ? styles.focusedBox : undefined,
              ]}
            >
              <TextInput
                ref={(r) => {
                  inputs.current[idx] = r;
                }}
                value={chars[idx]}
                placeholder={isFocused && !hasValue ? '' : ''}
                placeholderTextColor={ui.placeholder}
                onChangeText={(t) => {
                  // Só lida com casos especiais (como colar texto ou outras situações)
                  // A lógica principal de edição está no onKeyPress
                  const numericValue = (t || '').replace(/\D/g, '');

                  if (numericValue.length > 1) {
                    // Se colaram múltiplos dígitos, pega apenas o último
                    const d = numericValue.slice(-1);
                    const arr = chars.slice();
                    arr[idx] = d;
                    const next = arr.join('');
                    onChange(next);

                    if (idx < length - 1) {
                      setFocusedIndex(idx + 1);
                      setTimeout(() => inputs.current[idx + 1]?.focus(), 100);
                    }
                  } else if (numericValue === '') {
                    // Se ficou vazio (apagaram tudo)
                    const arr = chars.slice();
                    arr[idx] = '';
                    const next = arr.join('');
                    onChange(next);

                    if (idx > 0) {
                      setFocusedIndex(idx - 1);
                      setTimeout(() => inputs.current[idx - 1]?.focus(), 100);
                    }
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    const arr = chars.slice();
                    arr[idx] = '';
                    const next = arr.join('');
                    onChange(next);

                    // Volta para o input anterior se possível
                    if (idx > 0) {
                      setFocusedIndex(idx - 1);
                      setTimeout(() => inputs.current[idx - 1]?.focus(), 100);
                    }
                  } else if (/\d/.test(nativeEvent.key)) {
                    // Intercepta dígitos numéricos e substitui diretamente
                    const d = nativeEvent.key;
                    const arr = chars.slice();
                    arr[idx] = d;
                    const next = arr.join('');
                    onChange(next);

                    // Avança para o próximo input
                    if (idx < length - 1) {
                      setFocusedIndex(idx + 1);
                      setTimeout(() => inputs.current[idx + 1]?.focus(), 100);
                    }
                  }
                }}
                onFocus={() => {
                  setFocusedIndex(idx);
                  startPulseAnimation();
                  onFocus?.();
                }}
                onTouchStart={() => {
                  // Permite focar qualquer input ao tocar
                  setFocusedIndex(idx);
                  startPulseAnimation();
                  setTimeout(() => inputs.current[idx]?.focus(), 10);
                }}
                onBlur={() => {
                  setFocusedIndex(null);
                  stopPulseAnimation();
                }}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                returnKeyType="done"
                maxLength={1}
                style={[
                  styles.box,
                  {
                    borderColor: isFocused ? ui.borderFocused : ui.border,
                    backgroundColor: ui.bg,
                    color: ui.text,
                    fontSize: digitType.fontSize.default,
                    lineHeight: digitType.lineHeight.default,
                    borderWidth: isFocused ? 2 : 1,

                  },
                ]}
                textAlign="center"
                selectTextOnFocus={false}
                editable={true}
                pointerEvents="auto"
              />
            </Animated.View>
          );
        })}
      </View>
      <Text style={{ marginTop: 8, color: ui.text, fontFamily: dsFontFamily['jakarta-medium'], fontSize: labelType.fontSize.default, lineHeight: labelType.lineHeight.default }}>
        Código de 4 dígitos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  box: {
    width: 56,
    height: 56,
    borderRadius: 12,
    fontFamily: dsFontFamily['jakarta-bold'],
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  focusedBox: {
    shadowColor: colors['brand-purple'],
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});


