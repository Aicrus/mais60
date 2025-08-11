import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Input } from '@/components/inputs/Input';
import { Button } from '@/components/buttons/Button';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

function normalizePhone(raw: string) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('55')) return `+${digits}`;
  if (digits.length === 11) return `+55${digits}`;
  if (digits.length === 10) return `+55${digits}`;
  if (digits.length >= 12 && digits.startsWith('0')) return `+${digits.slice(1)}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export default function LoginTelefone() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();
  const { showToast } = useToast();

  const titleType = getResponsiveValues('headline-md');
  const bodyMdType = getResponsiveValues('body-md');
  const bodySmType = getResponsiveValues('body-sm');

  const ui = useMemo(() => ({
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    text2: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    primary: isDark ? colors['primary-dark'] : colors['primary-light'],
    bg: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
  }), [isDark]);

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    const normalized = normalizePhone(phone);
    if (!/^\+\d{12,15}$/.test(normalized)) {
      showToast({ type: 'warning', message: 'Telefone inválido', description: 'Digite um telefone válido com DDD.' });
      return;
    }
    // Simula geração de código
    const simulated = String(Math.floor(1000 + Math.random() * 9000));
    setGenerated(simulated);
    setStep('code');
  };

  const confirmCode = async () => {
    if (!code || code !== generated) {
      showToast({ type: 'error', message: 'Código incorreto', description: 'Verifique o código e tente novamente.' });
      return;
    }
    try {
      setLoading(true);
      // Fluxo anônimo
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data?.user) {
        showToast({ type: 'error', message: 'Erro ao entrar', description: 'Não foi possível iniciar a sessão.' });
        return;
      }

      const userId = data.user.id;
      const normalized = normalizePhone(phone);
      await supabase
        .from('usuarios')
        .upsert({ id: userId, telefone: normalized, perfil_concluido: false }, { onConflict: 'id' });

      showToast({ type: 'success', message: 'Pronto!', description: 'Login realizado com telefone.' });
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handlePressOutside = () => { if (Platform.OS !== 'web') Keyboard.dismiss(); };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={{ flex: 1 }} className={isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default, marginBottom: 8 }}>
              Entrar com telefone
            </Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-regular'], fontSize: bodyMdType.fontSize.default, lineHeight: bodyMdType.lineHeight.default, marginBottom: 18 }}>
              Informe seu número e valide o código.
            </Text>

            {step === 'phone' ? (
              <>
                <Input label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(11) 91234-5678" mask="phone" />
                <View style={{ height: 12 }} />
                <Button variant="primary" onPress={sendCode} fullWidth>
                  Enviar código
                </Button>
              </>
            ) : (
              <>
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], marginBottom: 8 }}>
                  Use este código: {generated} — estamos em teste
                </Text>
                <Input label="Código" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="0000" />
                <View style={{ height: 12 }} />
                <Button variant="primary" onPress={confirmCode} fullWidth loading={loading} loadingText="Entrando...">
                  Confirmar
                </Button>
                <View style={{ height: 12 }} />
                <Pressable onPress={() => setStep('phone')}>
                  <Text style={{ color: ui.primary, fontFamily: dsFontFamily['jakarta-semibold'] }}>Alterar telefone</Text>
                </Pressable>
              </>
            )}

            <View style={{ height: 18 }} />
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={{ color: ui.primary, fontFamily: dsFontFamily['jakarta-semibold'] }}>Entrar com email e senha</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  formContainer: { width: '100%', maxWidth: 420 },
});


