import { useState, useRef } from 'react';
import { Pressable, Platform, Keyboard, View, Text, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/DesignSystemContext';
import { useWindowDimensions } from 'react-native';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/inputs/Input';
import { Button } from '@/components/buttons/Button';
import { UserRound } from 'lucide-react-native';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados de erro para validação visual
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
  
  // Adicionando as referências para os campos
  const emailRef = useRef<any>(null);
  const senhaRef = useRef<any>(null);
  const confirmarSenhaRef = useRef<any>(null);
  
  const { currentTheme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { signUp, isLoading, checkEmailExists } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const isDark = currentTheme === 'dark';
  const isDesktopOrTablet = width >= 768;

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

  // Funções de validação em tempo real
  const validateNome = (nome: string) => {
    if (!nome) {
      setNomeError('Nome é obrigatório');
      return false;
    }
    
    if (nome.trim().length < 3) {
      setNomeError('Nome deve ter pelo menos 3 caracteres');
      return false;
    }
    
    setNomeError('');
    return true;
  };

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

  const validateConfirmarSenha = (confirmarSenha: string, senhaAtual: string) => {
    if (!confirmarSenha) {
      setConfirmarSenhaError('Confirmação de senha é obrigatória');
      return false;
    }
    
    if (confirmarSenha !== senhaAtual) {
      setConfirmarSenhaError('As senhas não coincidem');
      return false;
    }
    
    setConfirmarSenhaError('');
    return true;
  };

  // Funções para lidar com mudanças nos campos
  const handleNomeChange = (text: string) => {
    setNome(text);
    if (text) {
      validateNome(text);
    } else {
      setNomeError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text) {
      validateEmail(text);
    } else {
      setEmailError('');
    }
  };

  const handleSenhaChange = (text: string) => {
    setSenha(text);
    if (text) {
      validateSenha(text);
      // Revalidar confirmação de senha se já foi preenchida
      if (confirmarSenha) {
        validateConfirmarSenha(confirmarSenha, text);
      }
    } else {
      setSenhaError('');
    }
  };

  const handleConfirmarSenhaChange = (text: string) => {
    setConfirmarSenha(text);
    if (text) {
      validateConfirmarSenha(text, senha);
    } else {
      setConfirmarSenhaError('');
    }
  };

  const handleRegister = async () => {
    try {
      // Validar todos os campos
      const isNomeValid = validateNome(nome);
      const isEmailValid = validateEmail(email);
      const isSenhaValid = validateSenha(senha);
      const isConfirmarSenhaValid = validateConfirmarSenha(confirmarSenha, senha);

      if (!isNomeValid || !isEmailValid || !isSenhaValid || !isConfirmarSenhaValid) {
        showToast({
          type: 'warning',
          message: 'Campos inválidos',
          description: 'Por favor, corrija os erros antes de continuar.',
        });
        return;
      }

      await signUp({ email, password: senha, name: nome });
    } catch (error: any) {
      // Tratamento de erros conforme implementação existente
      console.error('Erro detalhado no cadastro:', error);
      
      // Se chegou aqui, é um erro não mapeado
      showToast({
        type: 'error',
        message: 'Não foi possível criar sua conta',
        description: 'Por favor, verifique seus dados e tente novamente.',
      });
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
          {/* Imagem lateral (visível apenas em desktop/tablet) */}
          <View style={styles.imageSection}>
            <Image
              source={require('@/assets/images/placeholder-img.png')}
              style={styles.fullImage}
              resizeMode="cover"
            />
          </View>

          {/* Formulário de cadastro */}
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
                Crie sua conta
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
                Preencha seus dados para começar
              </Text>

              {/* Campo de nome */}
              <View className="mb-4">
                <Input
                  label="Nome completo"
                  value={nome}
                  onChangeText={handleNomeChange}
                  placeholder="Digite seu nome completo"
                  autoCapitalize="words"
                  disabled={isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Navegação para próximo campo
                  }}
                  autoComplete="name"
                  error={nomeError}
                  onBlur={() => nome && validateNome(nome)}
                />
              </View>

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
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Navegação para próximo campo
                  }}
                  autoComplete="email"
                  error={emailError}
                  onBlur={() => email && validateEmail(email)}
                />
              </View>

              {/* Campo de senha */}
              <View className="mb-4">
                <Input
                  label="Senha"
                  value={senha}
                  onChangeText={handleSenhaChange}
                  placeholder="Digite sua senha"
                  type="password"
                  disabled={isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Navegação para próximo campo
                  }}
                  autoComplete="new-password"
                  error={senhaError}
                  onBlur={() => senha && validateSenha(senha)}
                />
              </View>

              {/* Campo de confirmar senha */}
              <View className="mb-6">
                <Input
                  label="Confirmar senha"
                  value={confirmarSenha}
                  onChangeText={handleConfirmarSenhaChange}
                  placeholder="Confirme sua senha"
                  type="password"
                  disabled={isLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                  autoComplete="new-password"
                  error={confirmarSenhaError}
                  onBlur={() => confirmarSenha && validateConfirmarSenha(confirmarSenha, senha)}
                />
              </View>

              {/* Botão de cadastro */}
              <Button
                variant="primary"
                onPress={handleRegister}
                disabled={isLoading}
                loading={isLoading}
                loadingText="Cadastrando..."
                fullWidth
                leftIcon={<UserRound size={18} color="#FFFFFF" />}
              >
                Criar conta
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

              {/* Link para login */}
              <View className="flex-row justify-center mt-4">
                <Text
                  style={{
                    color: ui.textPrimary,
                    fontFamily: dsFontFamily['jakarta-regular'],
                    fontSize: bodyMdType.fontSize.default,
                    lineHeight: bodyMdType.lineHeight.default,
                  }}
                >
                  Já tem uma conta?{' '}
                </Text>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text
                      style={{
                        color: ui.primary,
                        fontFamily: dsFontFamily['jakarta-semibold'],
                        fontSize: bodyMdType.fontSize.default,
                        lineHeight: bodyMdType.lineHeight.default,
                      }}
                    >
                      Faça login
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
} 