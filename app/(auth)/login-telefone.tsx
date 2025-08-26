import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard, Platform, Image, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Input } from '@/components/inputs/Input';
import CodeInput from '@/components/inputs/CodeInput';
import { Button } from '@/components/buttons/Button';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { useResponsive } from '@/hooks/useResponsive';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';

function normalizePhone(raw: string) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('55')) return `+${digits}`;
  if (digits.length === 11) return `+55${digits}`;
  if (digits.length === 10) return `+55${digits}`;
  if (digits.length >= 12 && digits.startsWith('0')) return `+${digits.slice(1)}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

type LoginTelefoneProps = {
  mode?: 'login' | 'register';
};

export default function LoginTelefone({ mode = 'login' }: LoginTelefoneProps) {
  const { currentTheme, applyFontScale } = useTheme();
  const isDark = currentTheme === 'dark';
  const { showToast } = useToast();
  const { responsive } = useResponsive();
  const insets = useSafeAreaInsets();

  const titleType = getResponsiveValues('headline-md');
  const bodyMdType = getResponsiveValues('body-md');
  const bodySmType = getResponsiveValues('body-sm');
  const codeType = getResponsiveValues('headline-xl');

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
  const { footerTranslateStyle } = useKeyboardOffset();
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Listeners padronizados movidos para useKeyboardOffset

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? insets.top
            : responsive({ mobile: 30, tablet: 40, desktop: 50, default: 30 })
        }
      >
        <View style={{ flex: 1 }} className={isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: responsive({ mobile: 60, tablet: 80, desktop: 100, default: 60 })
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Logo superior, mesmo tamanho/posição do onboarding */}
              <View style={styles.logoContainer}>
                <Image
                  source={isDark
                    ? require('@/assets/images/Logo Mais 60 Branco.png')
                    : require('@/assets/images/Logo Mais 60 Roxo.png')}
                  style={{
                    width: responsive({ mobile: 176, tablet: 208, desktop: 232, default: 176 }),
                    height: responsive({ mobile: 52, tablet: 62, desktop: 70, default: 52 }),
                  }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                <View style={{ height: 0 }} />
              </View>

              <View style={styles.formWrapper}>
                <View style={[styles.formContainer, isDark ? styles.cardDark : styles.cardLight]}>
                  <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default, marginBottom: 6, textAlign: 'center' }}>
                  {mode === 'login' ? 'Entrar com telefone' : 'Cadastrar com telefone'}
                </Text>
                  <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-regular'], fontSize: bodyMdType.fontSize.default, lineHeight: bodyMdType.lineHeight.default, marginBottom: 16, textAlign: 'center' }}>
                    {mode === 'login' ? 'Informe seu número e valide o código exibido (modo de testes).' : 'Informe seu número para criar sua conta e valide o código (modo de testes).'}
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
                      <View style={styles.codeContainer}>
                        <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'], marginBottom: 6, textAlign: 'center' }}>
                          Use este código
                        </Text>
                        <Text style={{ color: colors['brand-purple'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: codeType.fontSize.default, lineHeight: codeType.lineHeight.default, letterSpacing: 4, textAlign: 'center' }}>
                          {generated}
                        </Text>
                      </View>
                      <View style={{ height: 12 }} />
                      <CodeInput
                        value={code}
                        onChange={setCode}
                        length={4}
                        onFocus={() => {
                          // Scroll responsivo baseado na altura da tela
                          setTimeout(() => {
                            const scrollDistance = responsive({
                              mobile: 100,
                              tablet: 120,
                              desktop: 140,
                              default: 100
                            });
                            scrollViewRef.current?.scrollTo({
                              y: scrollDistance,
                              animated: true
                            });
                          }, 150);
                        }}
                      />
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
            </View>
          </ScrollView>
          {/* Rodapé fixo: no Android, desloca para baixo quando teclado aparece */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 10), ...(footerTranslateStyle || {}) }}>
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
              <Text style={{ textAlign: 'center', color: ui.text2, fontFamily: dsFontFamily['jakarta-regular'] }}>
                Para conhecer os{' '}
                <Link href="/sobre/termos-de-uso" asChild>
                  <Text style={{ color: colors['brand-purple'], fontFamily: dsFontFamily['jakarta-semibold'] }}>termos de uso</Text>
                </Link>
                {' '}e a{' '}
                <Link href="/sobre/politica-de-privacidade" asChild>
                  <Text style={{ color: colors['brand-purple'], fontFamily: dsFontFamily['jakarta-semibold'] }}>política de privacidade</Text>
                </Link>
                {' '}do app Mais 60.
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#430593' }} />
            <View style={{ height: 2 }} />
            <View style={{ height: 6, backgroundColor: '#27CC95' }} />
            <View style={{ height: 2 }} />
            <View style={{ height: 6, backgroundColor: '#FB5C3D' }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  logoContainer: { alignItems: 'center', marginTop: 48, marginBottom: 24 },
  formWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  formContainer: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 2,
      },
      web: {
        // @ts-ignore web-only style
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
      },
      default: {},
    }),
  },
  cardLight: {
    backgroundColor: colors['bg-secondary-light'],
    borderWidth: 1,
    borderColor: colors['divider-light'],
  },
  cardDark: {
    backgroundColor: colors['bg-secondary-dark'],
    borderWidth: 1,
    borderColor: colors['divider-dark'],
  },
  codeContainer: {
    alignItems: 'center',
  },
});


