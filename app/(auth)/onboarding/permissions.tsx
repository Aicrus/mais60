import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { colors } from '@/design-system/tokens/colors';
// Integração real com notificações é opcional e pode ser adicionada
// quando o pacote expo-notifications estiver instalado/configurado.

export default function OnboardingPermissions() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const title = getResponsiveValues('headline-lg');
  const body = getResponsiveValues('body-lg');
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const requestNotifications = async () => {
    // Mock simples para não depender de expo-notifications agora
    setNotifGranted(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'], padding: 24, justifyContent: 'space-between' }}>
      <View style={{ gap: 14 }}>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default }}>
          Vamos configurar algumas coisas
        </Text>

        <View style={{ gap: 16, paddingVertical: 8 }}>
          <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Notificações</Text>
            <Text style={{ marginTop: 6, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: body.fontSize.default, lineHeight: body.lineHeight.default }}>
              Para lembrá-lo dos exercícios
            </Text>
            <View style={{ height: 12 }} />
            <Pressable onPress={requestNotifications} style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Permitir notificações">
              <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 16 }}>{notifGranted ? 'Permitido' : 'Permitir'}</Text>
            </Pressable>
          </View>

          <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sensores de movimento</Text>
            <Text style={{ marginTop: 6, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: body.fontSize.default, lineHeight: body.lineHeight.default }}>
              Para contar seus passos (opcional)
            </Text>
            <View style={{ height: 12 }} />
            <Pressable onPress={() => {}} style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-tertiary-dark'] : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Agora não">
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 16 }}>Agora não</Text>
            </Pressable>
          </View>

          <View style={{ borderRadius: 16, padding: 16, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Armazenamento</Text>
            <Text style={{ marginTop: 6, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: body.fontSize.default, lineHeight: body.lineHeight.default }}>
              Para salvar seus conteúdos favoritos
            </Text>
            <View style={{ height: 12 }} />
            <Pressable onPress={() => {}} style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-tertiary-dark'] : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Agora não">
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 16 }}>Agora não</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Pressable onPress={() => router.push('/(auth)/onboarding/accessibility')} style={{ height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Continuar">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 18 }}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}


