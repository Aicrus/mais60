import React, { useMemo, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, Platform } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useTheme } from '@/hooks/DesignSystemContext';

type CodeInputProps = {
  length?: number; // default 4
  value: string;
  onChange: (code: string) => void;
};

export default function CodeInput({ length = 4, value, onChange }: CodeInputProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const inputs = useRef<Array<TextInput | null>>([]);
  const chars = useMemo(() => {
    const arr = new Array(length).fill('');
    const v = (value || '').slice(0, length).split('');
    return arr.map((_, i) => v[i] || '');
  }, [length, value]);

  const ui = {
    border: isDark ? colors['divider-dark'] : '#E5E7EB',
    bg: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    tint: colors['brand-purple'],
  } as const;

  const labelType = getResponsiveValues('label-lg');

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {new Array(length).fill(0).map((_, idx) => (
          <TextInput
            key={idx}
            ref={(r) => (inputs.current[idx] = r)}
            value={chars[idx]}
            onChangeText={(t) => {
              const d = (t || '').replace(/\D/g, '').slice(-1);
              const arr = chars.slice();
              arr[idx] = d;
              const next = arr.join('');
              onChange(next);
              if (d && idx < length - 1) inputs.current[idx + 1]?.focus();
              if (!d && idx > 0 && !chars[idx]) inputs.current[idx - 1]?.focus();
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                if (value.length <= 1) {
                  onChange('');
                  inputs.current[0]?.focus();
                } else if (idx === value.length - 1) {
                  const arr = chars.slice();
                  arr[idx] = '';
                  const next = arr.join('');
                  onChange(next);
                  if (idx > 0) inputs.current[idx - 1]?.focus();
                }
              }
            }}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            returnKeyType="done"
            maxLength={1}
            style={[
              styles.box,
              {
                borderColor: ui.border,
                backgroundColor: ui.bg,
                color: ui.text,
              },
            ]}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
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
    borderWidth: 1,
    borderRadius: 12,
    fontFamily: dsFontFamily['jakarta-bold'],
    fontSize: 22,
  },
});


