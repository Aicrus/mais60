import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BellRing, Activity, Database } from 'lucide-react-native';
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

  const ProgressDots = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 12, marginBottom: 2 }}>
        Passo 2 de 3
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#430593' }} />
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
      </View>
    </View>
  );

  const requestNotifications = async () => {
    // Mock simples para não depender de expo-notifications agora
    setNotifGranted(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'], padding: 20, justifyContent: 'space-between' }}>
      <View style={{ gap: 10 }}>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: title.fontSize.default, lineHeight: title.lineHeight.default }}>
          Permissões que ajudam você
        </Text>
        <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
          Explicamos rapidamente para que serve cada uma. Você pode mudar depois nas configurações.
        </Text>

        <View style={{ gap: 16, paddingVertical: 8 }}>
          <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <BellRing size={20} color={'#430593'} />
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Notificações</Text>
            </View>
            <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
              Envia lembretes suaves para praticar atividades e não perder seus objetivos.
            </Text>
            <View style={{ height: 8 }} />
            <Pressable onPress={requestNotifications} style={{ height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593' }} accessibilityRole="button" accessibilityLabel="Permitir notificações">
              <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 15 }}>{notifGranted ? 'Permitido' : 'Permitir'}</Text>
            </Pressable>
          </View>

          <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Activity size={20} color={'#430593'} />
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Sensores de movimento</Text>
            </View>
            <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
              Usamos os sensores para estimar passos e atividades. É opcional e melhora suas estatísticas.
            </Text>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => {}} style={{ height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-tertiary-dark'] : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Agora não">
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 15 }}>Agora não</Text>
            </Pressable>
          </View>

          <View style={{ borderRadius: 14, padding: 12, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Database size={20} color={'#430593'} />
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-semibold'], fontSize: 18 }}>Armazenamento</Text>
            </View>
            <Text style={{ marginTop: 4, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 14, lineHeight: 20 }}>
              Permite guardar suas preferências e progresso localmente, para abrir o app já do seu jeito.
            </Text>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => {}} style={{ height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors['bg-tertiary-dark'] : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' }} accessibilityRole="button" accessibilityLabel="Agora não">
              <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: 15 }}>Agora não</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <ProgressDots />
        <Pressable onPress={() => router.push('/(auth)/onboarding/accessibility')} style={{ height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#430593', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }} accessibilityRole="button" accessibilityLabel="Continuar">
          <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'], fontSize: 17 }}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}


