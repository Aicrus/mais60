import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Input } from '@/components/inputs/Input';
import CodeInput from '@/components/inputs/CodeInput';
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
  const { currentTheme, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';
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
  const [resendIn, setResendIn] = useState<number>(0);
  const [timerId, setTimerId] = useState<any>(null);

  const sendCode = async () => {
    const normalized = normalizePhone(phone);
    if (!/^\+\d{12,15}$/.test(normalized)) {
      showToast({ type: 'warning', message: 'Telefone inválido', description: 'Digite um telefone válido com DDD.' });
      return;
    }
    // Simula geração de código
    const simulated = String(Math.floor(1000 + Math.random() * 9000));
    setGenerated(simulated);
    setCode('');
    setStep('code');
    // inicia timer de 20s para reenvio
    setResendIn(20);
    if (timerId) clearInterval(timerId);
    const id = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const confirmCode = async () => {
    if (!code || code !== generated) {
      showToast({ type: 'error', message: 'Código incorreto', description: 'Verifique o código e tente novamente.' });
      return;
    }
    try {
      setLoading(true);
      // Login temporário com credenciais fixas (para demo)
      const TEST_EMAIL = 'paulomorales@gmail.com';
      const TEST_PASSWORD = '123321';
      const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
      if (error || !data?.user) {
        console.error('signInWithPassword error:', error);
        showToast({ type: 'error', message: 'Erro ao entrar', description: 'Credenciais de teste indisponíveis.' });
        return;
      }

      const userId = data.user.id;
      const normalized = normalizePhone(phone);
      const { error: upsertErr } = await supabase
        .from('usuarios')
        .upsert({ id: userId, telefone: normalized, email: data.user.email ?? null, perfil_concluido: false }, { onConflict: 'id' });
      if (upsertErr) {
        console.error('upsert usuarios error:', upsertErr);
      }

      showToast({ type: 'success', message: 'Pronto!', description: 'Login realizado.' });
      // Não navega aqui; o AuthProvider já redireciona do grupo (auth) para /(tabs)/home
    } finally {
      setLoading(false);
    }
  };

  const handlePressOutside = () => { if (Platform.OS !== 'web') Keyboard.dismiss(); };

  React.useEffect(() => () => { if (timerId) clearInterval(timerId); }, [timerId]);
  // Garante tamanho "Grande" ao chegar nesta tela
  React.useEffect(() => { try { applyFontScale('grande'); } catch {} }, []);

  return (
    <ImageBackground
      source={require('@/assets/images/Homem Idoso Hidratando-se.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(0,0,0,0.97)',
          'rgba(0,0,0,0.85)',
          'rgba(0,0,0,0.45)',
          'rgba(0,0,0,0)'
        ]}
        locations={[0, 0.5, 0.9, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' }}
      />
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 160, justifyContent: 'flex-start' }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Image source={require('@/assets/images/Logo Mais 60 Branco.png')} style={{ width: 128, height: 38 }} resizeMode="contain" accessibilityIgnoresInvertColors />
          </View>
          <View style={[styles.container, { paddingTop: 24 }]}>
            <View style={styles.formContainer}>
              <Text style={{ color: colors['text-primary-dark'], fontFamily: dsFontFamily['jakarta-bold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default, marginBottom: 8 }}>
                Entrar com telefone
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.88)', fontFamily: dsFontFamily['jakarta-regular'], fontSize: bodyMdType.fontSize.default, lineHeight: bodyMdType.lineHeight.default, marginBottom: 18 }}>
                Informe seu número de telefone e valide o código. Use o código exibido abaixo (estamos em testes).
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
                <Text style={{ color: colors['brand-purple'], fontFamily: dsFontFamily['jakarta-extrabold'], marginBottom: 8 }}>
                  Use este código: {generated}
                </Text>
                <CodeInput value={code} onChange={setCode} length={4} />
                <View style={{ height: 12 }} />
                <Button variant="primary" onPress={confirmCode} fullWidth loading={loading} loadingText="Entrando...">
                  Confirmar
                </Button>
                <View style={{ height: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Pressable onPress={() => { setStep('phone'); setCode(''); setGenerated(''); setResendIn(0); if (timerId) { clearInterval(timerId); setTimerId(null); } }}>
                    <Text style={{ color: ui.primary, fontFamily: dsFontFamily['jakarta-semibold'] }}>Alterar telefone</Text>
                  </Pressable>
                  {resendIn > 0 ? (
                    <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>Reenviar em {resendIn}s</Text>
                  ) : (
                    <Pressable onPress={sendCode}>
                      <Text style={{ color: ui.primary, fontFamily: dsFontFamily['jakarta-semibold'] }}>Reenviar código</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}

            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  formContainer: { width: '100%', maxWidth: 420 },
});


