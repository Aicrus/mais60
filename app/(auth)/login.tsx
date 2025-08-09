import { useState, useRef } from 'react';
import { Pressable, Platform, Keyboard, View, Text, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { useWindowDimensions } from 'react-native';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/useToast';
import { Mail } from 'lucide-react-native';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { Input } from '@/components/inputs/Input';
import { Button } from '@/components/buttons/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  
  const { currentTheme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isDesktopOrTablet = width >= 768;
  const isDark = currentTheme === 'dark';
  const { signIn, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const senhaRef = useRef<any>(null);

  // Tipografia responsiva
  const titleType = getResponsiveValues('headline-md');
  const bodyMdType = getResponsiveValues('body-md');
  const bodySmType = getResponsiveValues('body-sm');

  // Cores do design system
  const ui = {
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    primary: isDark ? colors['primary-dark'] : colors['primary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
  } as const;

  // Função para validar email em tempo real
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Digite um email válido');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  // Função para validar senha em tempo real
  const validateSenha = (senha: string) => {
    if (!senha) {
      setSenhaError('Senha é obrigatória');
      return false;
    }
    
    if (senha.length < 6) {
      setSenhaError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    setSenhaError('');
    return true;
  };

  // Função para lidar com mudança no email
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text) {
      validateEmail(text);
    } else {
      setEmailError('');
    }
  };

  // Função para lidar com mudança na senha
  const handleSenhaChange = (text: string) => {
    setSenha(text);
    if (text) {
      validateSenha(text);
    } else {
      setSenhaError('');
    }
  };

  const handleLogin = async () => {
    try {
      // Validar todos os campos
      const isEmailValid = validateEmail(email);
      const isSenhaValid = validateSenha(senha);

      if (!isEmailValid || !isSenhaValid) {
        showToast({
          type: 'warning',
          message: 'Campos inválidos',
          description: 'Por favor, corrija os erros antes de continuar.',
        });
        return;
      }

      await signIn({ email, password: senha });
    } catch (error) {
      // Erro tratado pelo contexto de autenticação
    }
  };

  const handlePressOutside = () => {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  };

  // Estilos para garantir layout dinâmico
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    formSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      maxWidth: isDesktopOrTablet ? '50%' : '100%',
    },
    imageSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#14181B' : '#F1F4F8',
      display: isDesktopOrTablet ? 'flex' : 'none',
    },
    formContainer: {
      width: '100%',
      maxWidth: 400,
    },
    fullImage: {
      width: '100%',
      height: '100%',
    }
  });

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View className={isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'} style={{flex: 1}}>
        <View style={styles.container}>
          {/* Formulário de login */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* Títulos */}
              <Text
                style={{
                  color: ui.textPrimary,
                  fontFamily: dsFontFamily['jakarta-bold'],
                  fontSize: titleType.fontSize.default,
                  lineHeight: titleType.lineHeight.default,
                  marginBottom: 8,
                }}
              >
                Bem-vindo de volta
              </Text>

              <Text
                style={{
                  color: ui.textSecondary,
                  fontFamily: dsFontFamily['jakarta-regular'],
                  fontSize: bodyMdType.fontSize.default,
                  lineHeight: bodyMdType.lineHeight.default,
                  marginBottom: 32,
                }}
              >
                Entre com suas credenciais para acessar sua conta
              </Text>

              {/* Campo de email */}
              <View className="mb-4">
                <Input
                  label="Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Digite seu email"
                  type="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={isLoading}
                  onSubmitEditing={() => {
                    // Focar no próximo campo (senha) - será implementado via focus automático
                  }}
                  returnKeyType="next"
                  autoComplete="email"
                  error={emailError}
                  onBlur={() => email && validateEmail(email)}
                />
              </View>

              {/* Campo de senha */}
              <View className="mb-6">
                <Input
                  label="Senha"
                  value={senha}
                  onChangeText={handleSenhaChange}
                  placeholder="Digite sua senha"
                  type="password"
                  disabled={isLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  autoComplete="current-password"
                  error={senhaError}
                  onBlur={() => senha && validateSenha(senha)}
                />
              </View>

              {/* Esqueci minha senha */}
              <View className="flex-row justify-end mb-6">
                <Pressable>
                  <Text
                    style={{
                      color: ui.primary,
                      fontFamily: dsFontFamily['jakarta-medium'],
                      fontSize: bodySmType.fontSize.default,
                      lineHeight: bodySmType.lineHeight.default,
                    }}
                  >
                    Esqueci minha senha
                  </Text>
                </Pressable>
              </View>

              {/* Botão de login */}
              <Button
                variant="primary"
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
                loadingText="Entrando..."
                fullWidth
                leftIcon={<Mail size={18} color="#FFFFFF" />}
              >
                Login
              </Button>

              {/* Separador "ou" */}
              <View className="flex-row items-center my-6">
                <View className={`flex-1 h-px ${isDark ? 'bg-divider-dark' : 'bg-divider-light'}`} />
                <Text
                  style={{
                    marginHorizontal: 16,
                    color: ui.textSecondary,
                    fontFamily: dsFontFamily['jakarta-regular'],
                    fontSize: bodySmType.fontSize.default,
                    lineHeight: bodySmType.lineHeight.default,
                  }}
                >
                  ou continue com
                </Text>
                <View className={`flex-1 h-px ${isDark ? 'bg-divider-dark' : 'bg-divider-light'}`} />
              </View>

              {/* Botões de login social */}
              <View className="flex-row justify-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  onPress={() => {}}
                  isIconOnly
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                  }}
                >
                  <Image
                    source={require('@/assets/images/icon-apple.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </Button>
                
                <Button
                  variant="outline"
                  onPress={() => {}}
                  isIconOnly
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                  }}
                >
                  <Image
                    source={require('@/assets/images/icon-gmail.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </Button>
              </View>

              {/* Link para cadastro */}
              <View className="flex-row justify-center mt-4">
                <Text
                  style={{
                    color: ui.textPrimary,
                    fontFamily: dsFontFamily['jakarta-regular'],
                    fontSize: bodyMdType.fontSize.default,
                    lineHeight: bodyMdType.lineHeight.default,
                  }}
                >
                  Não tem uma conta?{' '}
                </Text>
                <Link href="/register" asChild>
                  <Pressable>
                    <Text
                      style={{
                        color: ui.primary,
                        fontFamily: dsFontFamily['jakarta-semibold'],
                        fontSize: bodyMdType.fontSize.default,
                        lineHeight: bodyMdType.lineHeight.default,
                      }}
                    >
                      Cadastre-se
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          {/* Imagem lateral (visível apenas em desktop/tablet) */}
          <View style={styles.imageSection}>
            <Image
              source={require('@/assets/images/placeholder-img.png')}
              style={styles.fullImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
} 