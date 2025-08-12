import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/useToast';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/DesignSystemContext';

// Tipos
type AuthContextData = {
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  signUp: (data: { email: string; password: string; name: string }) => Promise<void>;
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
};

// Criação do contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider
export function AuthProvider({ 
  children,
  initialSession
}: { 
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { showToast } = useToast();
  const { currentTheme } = useTheme();
  const { setAccessibility } = useTheme();
  const isDark = currentTheme === 'dark';

  // Efeito para monitorar mudanças na sessão
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {      
      if (event === 'SIGNED_IN') {
        setSession(newSession);
        try {
          const userId = newSession?.user?.id;
          if (userId) {
            const { data } = await supabase
              .from('usuarios')
              .select('acess_font_scale, acess_contrast, acess_sound')
              .eq('id', userId)
              .maybeSingle();
            if (data) {
              const fontScale = (data.acess_font_scale as 'normal'|'grande'|'muito-grande') || 'normal';
              const contrast = (data.acess_contrast as 'normal'|'alto') || 'normal';
              const sound = (data.acess_sound as 'com'|'sem') || 'com';
              setAccessibility({ fontScale, contrast, sound });
            }
          }
        } catch (e) {
          // silencioso
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Efeito para navegação baseada no estado da sessão
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/(tabs)/home');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/onboarding/welcome');
    }
  }, [isInitialized, isLoading, session, segments]);

  useEffect(() => {
    if (!session) return;

    // Verifica a existência da conta a cada 5 minutos
    const checkInterval = setInterval(async () => {
      try {
        const { data: user, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Erro ao verificar usuário:', error);
          showToast({
            type: 'info',
            message: 'Conta não encontrada',
            description: 'Sua conta foi excluída. Você será desconectado.',
          });
          
          await signOut();
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      clearInterval(checkInterval);
    };
  }, [session]);

  // Carrega preferências de acessibilidade quando a sessão muda (ex.: app reaberto já logado)
  useEffect(() => {
    (async () => {
      try {
        const userId = session?.user?.id;
        if (userId) {
          const { data } = await supabase
            .from('usuarios')
            .select('acess_font_scale, acess_contrast, acess_sound')
            .eq('id', userId)
            .maybeSingle();
          if (data) {
            const fontScale = (data.acess_font_scale as 'normal'|'grande'|'muito-grande') || 'normal';
            const contrast = (data.acess_contrast as 'normal'|'alto') || 'normal';
            const sound = (data.acess_sound as 'com'|'sem') || 'com';
            setAccessibility({ fontScale, contrast, sound });
          }
        }
      } catch {}
    })();
  }, [session]);

  const signUp = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
      setIsLoading(true);
      
      // Validações básicas
      if (!email || !password || !name) {
        showToast({
          type: 'warning',
          message: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos.',
        });
        return;
      }

      if (name.trim().length < 3) {
        showToast({
          type: 'warning',
          message: 'Nome inválido',
          description: 'O nome deve ter pelo menos 3 caracteres.',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast({
          type: 'warning',
          message: 'Email inválido',
          description: 'Por favor, digite um endereço de email válido.',
        });
        return;
      }

      if (password.length < 6) {
        showToast({
          type: 'warning',
          message: 'Senha muito curta',
          description: 'A senha deve ter pelo menos 6 caracteres.',
        });
        return;
      }

      const emailLowerCase = email.toLowerCase().trim();

      // Tenta criar o usuário diretamente
      const { data, error } = await supabase.auth.signUp({
        email: emailLowerCase,
        password,
        options: {
          data: {
            name,
            display_name: name,
          },
          emailRedirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
        },
      });

      // Trata erros específicos
      if (error) {
        console.error('Erro no cadastro:', error);
        
        // Email já existe
        if (error.message?.includes('already registered') || 
            error.message?.includes('already exists') ||
            error.code === 'user_already_exists') {
          showToast({
            type: 'info',
            message: 'Email já cadastrado',
            description: 'Este email já está registrado. Por favor, faça login ou recupere sua senha.',
          });
          setTimeout(() => router.replace('/(auth)/login'), 1500);
          return;
        }
        
        // Senha fraca
        if (error.message?.includes('password') || error.code === 'weak_password') {
          showToast({
            type: 'error',
            message: 'Senha fraca',
            description: 'A senha deve ter pelo menos 6 caracteres.',
          });
          return;
        }

        // Qualquer outro erro
        showToast({
          type: 'error',
          message: 'Erro no cadastro',
          description: 'Não foi possível criar sua conta. Tente novamente.',
        });
        return;
      }

      // Sucesso - mensagem clara sobre confirmação de email
      if (data?.user) {
        // Verifica se o usuário já foi autenticado automaticamente
        // (isso acontece quando o Supabase está configurado para não exigir confirmação de e-mail)
        if (data.session) {
          // Autenticação automática - o usuário já está logado
          setSession(data.session);
          showToast({
            type: 'success',
            message: 'Cadastro realizado!',
            description: 'Sua conta foi criada com sucesso! Bem-vindo(a) a plataforma.',
          });
          
          // Não precisa navegar para login, pois já está autenticado
          // O useEffect que monitora a sessão fará a navegação automaticamente
        } else {
          // Confirmação de e-mail é necessária
          showToast({
            type: 'success',
            message: 'Cadastro realizado!',
            description: 'Verifique seu email para confirmar a conta antes de fazer login.',
          });
          
          // Navega para tela de login após o toast
          setTimeout(() => router.replace('/(auth)/login'), 2000);
        }
      } else {
        // Caso improvável, mas tratamos por segurança
        showToast({
          type: 'warning',
          message: 'Cadastro incompleto',
          description: 'Sua conta foi criada, mas houve um problema. Tente fazer login ou entre em contato com suporte.',
        });
        
        setTimeout(() => router.replace('/(auth)/login'), 2000);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      showToast({
        type: 'error',
        message: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      if (!email || !password) {
        showToast({
          type: 'warning',
          message: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos.',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast({
          type: 'warning',
          message: 'Email inválido',
          description: 'Por favor, digite um endereço de email válido.',
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Erro detalhado no login:', error);
        
        // Verifica tanto o código quanto a mensagem para maior segurança
        const errorMessage = error.message?.toLowerCase() || '';
        
        // Email não confirmado
        if (error.code === 'email_not_confirmed' || 
            errorMessage.includes('email not confirmed') || 
            errorMessage.includes('not confirmed')) {
          showToast({
            type: 'warning',
            message: 'Email não confirmado',
            description: 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.',
          });
          return;
        }
        
        // Credenciais inválidas 
        if (error.code === 'invalid_login_credentials' || 
            error.code === 'invalid_credentials' ||
            errorMessage.includes('invalid login') || 
            errorMessage.includes('invalid credentials')) {
          showToast({
            type: 'error',
            message: 'Credenciais inválidas',
            description: 'Email ou senha incorretos. Verifique seus dados.',
          });
          return;
        }
        
        // Qualquer outro erro
        showToast({
          type: 'error',
          message: 'Erro ao fazer login',
          description: 'Ocorreu um erro ao tentar entrar. Tente novamente.',
        });
        return;
      }

      if (data?.session) {
        setSession(data.session);
        showToast({
          type: 'success',
          message: 'Login realizado!',
          description: 'Bem‑vindo à plataforma!',
        });
      } else {
        showToast({
          type: 'error',
          message: 'Erro ao fazer login',
          description: 'Não foi possível iniciar sua sessão. Tente novamente.',
        });
      }
    } catch (err) {
      console.error('Erro no login:', err);
      showToast({
        type: 'error',
        message: 'Erro ao fazer login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // Lista de chaves que podem conter tokens do Supabase
      const storageKeys = [
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'supabase.auth.session',
        'sb-' + process.env.EXPO_PUBLIC_SUPABASE_URL + '-auth-token',
        'supabase.auth.expires_at',
        'supabase.auth.provider_token',
        'supabase.auth.provider_refresh_token'
      ];

      // Limpa o storage primeiro (web e nativo)
      if (Platform.OS === 'web') {
        // Para web, limpa localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.error(`Erro ao remover ${key}:`, e);
            }
          }
        });
      } else {
        // Para nativo, limpa AsyncStorage
        await Promise.all(
          storageKeys.map(async (key) => {
            try {
              await AsyncStorage.removeItem(key);
            } catch (e) {
              console.error(`Erro ao remover ${key}:`, e);
            }
          })
        );
      }

      // Remove outros dados persistentes
      await AsyncStorage.removeItem('@user_data');
      
      // Chama o signOut do Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao sair:', error);
        showToast({
          type: 'error',
          message: 'Erro ao sair',
          description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
        });
      } else {
        // Limpa o estado explicitamente
        setSession(null);
      }

      // A navegação acontece automaticamente no efeito de sessão
    } catch (error) {
      console.error('Erro ao sair:', error);
      showToast({
        type: 'error',
        message: 'Erro ao sair',
        description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
      
      // Garante que o estado seja limpo mesmo em caso de erro
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Tentar login com senha errada
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: 'senha-incorreta-para-verificacao',
      });
      
      // Analisa a mensagem de erro específica
      if (error && error.message) {
        // Se o erro indicar credenciais inválidas, significa que o email existe
        // mas a senha está errada (o que esperamos)
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return true;
        }
        
        // Se o erro indicar que o usuário não existe, temos certeza que não existe
        if (error.message.includes('user not found') || 
            error.message.includes('User not found')) {
          return false;
        }
      }
      
      // Não conseguimos determinar com certeza - retornar falso para permitir tentativa de cadastro
      return false;
    } catch (error) {
      console.error('Erro ao verificar existência do email:', error);
      // Em caso de erro, é mais seguro retornar falso
      return false;
    }
  };

  // Loading screen
  if (!isInitialized || isLoading) {
    return (
      <View 
        className={`flex-1 justify-center items-center ${
          isDark ? 'bg-bg-primary-dark' : 'bg-bg-primary-light'
        }`}
      >
        <ActivityIndicator 
          size="large" 
          color={isDark ? '#60a5fa' : '#2563eb'} 
        />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{
      session,
      isLoading,
      isInitialized,
      signUp,
      signIn,
      signOut,
      checkEmailExists,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 