import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Switch, Platform, ScrollView, Modal } from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';
 
import { getResponsiveValues, fontFamily as dsFontFamily } from '../../design-system/tokens/typography';
import { useAuth } from '../../contexts/auth';
import { supabase } from '@/lib/supabase';
import { Home, ChevronRight, LogOut, Moon, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ConfirmModal from '@/components/modals/ConfirmModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen() {
  const router = useRouter();
  const { currentTheme, setThemeMode, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';
  const { signOut, session } = useAuth();

  const nameType = getResponsiveValues('headline-lg');
  const emailType = getResponsiveValues('body-sm');
  const sectionType = getResponsiveValues('title-sm');
  const modalTitleType = getResponsiveValues('title-md');
  const modalDescType = getResponsiveValues('body-md');
  const modalButtonType = getResponsiveValues('label-lg');
  const editButtonType = getResponsiveValues('label-md');
  const rowLabelType = getResponsiveValues('body-md');

  // Estados simples para acessibilidade e notificações
  // removido: sons
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const ui = {
    bgSecondary: uiColors.bgSecondary,
    bgPrimary: uiColors.bgPrimary,
    divider: uiColors.divider,
    textPrimary: uiColors.textPrimary,
    textSecondary: uiColors.textSecondary,
  };

  const Row = ({
    icon,
    label,
    right,
    onPress,
    destructive,
  }: {
    icon: React.ReactNode;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
    destructive?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole={onPress ? 'button' : undefined}
      hitSlop={8}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>{icon}</View>
      <Text
        style={{
          flex: 1,
          color: destructive ? '#EF4444' : ui.textPrimary,
          fontFamily: dsFontFamily['jakarta-medium'],
          fontWeight: '600',
          fontSize: rowLabelType.fontSize.default,
          lineHeight: rowLabelType.lineHeight.default,
        }}
      >
        {label}
      </Text>
      {right}
    </Pressable>
  );

  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string>('');

  const [needsCompletion, setNeedsCompletion] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  const getInitials = (name?: string) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = session?.user?.id;
        const emailFromAuth = session?.user?.email || '';
        const nameFromAuth = ((session?.user?.user_metadata as any)?.name as string) || '';
        const avatarFromAuth = ((session?.user?.user_metadata as any)?.avatar_url as string) || '';
        if (userId) {
          const { data, error } = await supabase
            .from('usuarios')
            .select('nome, email, imagem_url, perfil_concluido, telefone')
            .eq('id', userId)
            .maybeSingle();
          if (!mounted) return;
          if (!error && data) {
            setProfileName(data.nome || nameFromAuth || 'Usuário');
            setProfileEmail(data.email || emailFromAuth);
            setProfileAvatar(data.imagem_url || avatarFromAuth || '');

            const nomeOk = !!(data.nome && data.nome.trim().length >= 3);
            const emailOk = !!(data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
            const telOk = !!(data.telefone && String(data.telefone).replace(/\D/g,'').length >= 10);
            const concluded = data.perfil_concluido ?? (nomeOk && emailOk && telOk);
            setNeedsCompletion(!concluded);
            if (!concluded) {
              try {
                const nextStr = await AsyncStorage.getItem('@profile_prompt_next');
                const next = nextStr ? parseInt(nextStr, 10) : 0;
                if (!next || Date.now() >= next) setShowCompleteModal(true);
              } catch {}
            }
          } else {
            setProfileName(nameFromAuth || 'Usuário');
            setProfileEmail(emailFromAuth);
            setProfileAvatar(avatarFromAuth || '');
            setNeedsCompletion(true);
            setShowCompleteModal(true);
          }
        }
      } catch {
        // mantém defaults
      }
    })();
    return () => { mounted = false; };
  }, [session]);

  // Recarrega quando a tela ganha foco (ex.: após salvar no editar)
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const userId = session?.user?.id;
          const emailFromAuth = session?.user?.email || '';
          const nameFromAuth = ((session?.user?.user_metadata as any)?.name as string) || '';
          const avatarFromAuth = ((session?.user?.user_metadata as any)?.avatar_url as string) || '';
          if (!userId) return;
          const { data, error } = await supabase
            .from('usuarios')
            .select('nome, email, imagem_url, perfil_concluido, telefone')
            .eq('id', userId)
            .maybeSingle();
          if (!isActive) return;
          if (!error && data) {
            setProfileName(data.nome || nameFromAuth || 'Usuário');
            setProfileEmail(data.email || emailFromAuth);
            const url = data.imagem_url || avatarFromAuth || '';
            // força refresh do cache da imagem
            setProfileAvatar(url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : url);

            const nomeOk = !!(data.nome && data.nome.trim().length >= 3);
            const emailOk = !!(data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
            const telOk = !!(data.telefone && String(data.telefone).replace(/\D/g,'').length >= 10);
            const concluded = data.perfil_concluido ?? (nomeOk && emailOk && telOk);
            setNeedsCompletion(!concluded);
          }
        } catch {}
      })();
      return () => { isActive = false; };
    }, [session])
  );

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarOuter}>
          {profileAvatar ? (
            <Image source={{ uri: profileAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' }]}>
              <Text style={{ fontFamily: dsFontFamily['jakarta-bold'] }}>{getInitials(profileName)}</Text>
            </View>
          )}
        </View>
      <Text
        style={{
          color: ui.textPrimary,
          fontFamily: dsFontFamily['jakarta-bold'],
          fontSize: nameType.fontSize.default,
          lineHeight: nameType.lineHeight.default,
          marginTop: 12,
        }}
      >
          {profileName || 'Usuário'}
        </Text>
        <Text
          style={{
            color: ui.textSecondary,
          fontFamily: dsFontFamily['jakarta-medium'],
          fontSize: emailType.fontSize.default,
          lineHeight: emailType.lineHeight.default,
            marginTop: 4,
          }}
        >
           {profileEmail || ''}
        </Text>

        <Pressable style={[styles.editButton, { backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'] }]}
          accessibilityRole="button"
          onPress={() => router.push('/perfil/editar')}
        >
          <Text style={{
            color: '#FFFFFF',
            fontFamily: dsFontFamily['jakarta-semibold'],
            fontSize: editButtonType.fontSize.default,
            lineHeight: editButtonType.lineHeight.default,
          }}>Editar perfil</Text>
        </Pressable>
      </View>



        {/* Removido bloco de Inventário (não faz sentido no PRD) */}

      {/* Sobre o App */}
      <Text
        accessibilityRole="header"
        style={{
          marginTop: 8,
          marginBottom: 8,
          paddingHorizontal: 4,
          color: ui.textSecondary,
          fontFamily: sectionType.fontFamily,
          fontSize: sectionType.fontSize.default,
          lineHeight: sectionType.lineHeight.default,
        }}
      >
        Sobre o App
      </Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Home size={20} color={ui.textPrimary} />}
          label="Versão"
          right={<ChevronRight size={22} color={ui.textSecondary} />}
          onPress={async () => {
            try {
              const { data } = await supabase.from('config_app').select('valor').eq('chave','versao').maybeSingle();
              const versao = (data?.valor as string) || '—';
              // Exibe alerta simples nativo
              const Alert = require('react-native').Alert;
              Alert.alert('Versão do aplicativo', versao);
            } catch {}
          }}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Home size={20} color={ui.textPrimary} />}
          label="Termos de uso"
          right={<ChevronRight size={22} color={ui.textSecondary} />}
          onPress={() => router.push(`/sobre/termos-de-uso` as any)}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Home size={20} color={ui.textPrimary} />}
          label="Política de privacidade"
          right={<ChevronRight size={22} color={ui.textSecondary} />}
          onPress={() => router.push(`/sobre/politica-de-privacidade` as any)}
        />
      </View>

      {/* Conta */}
      <Text
        accessibilityRole="header"
        style={{
          marginTop: 8,
          marginBottom: 8,
          paddingHorizontal: 4,
          color: ui.textSecondary,
          fontFamily: sectionType.fontFamily,
          fontSize: sectionType.fontSize.default,
          lineHeight: sectionType.lineHeight.default,
        }}
      >
        Conta
      </Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<LogOut size={18} color="#EF4444" />}
          label="Sair"
          destructive
          onPress={() => setShowLogoutConfirm(true)}
        />
      </View>
      {/* Modal de confirmação de logout */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.confirmCard,
            { backgroundColor: ui.bgSecondary, borderColor: ui.divider }
          ]}>
            <Text
              style={{
                color: ui.textPrimary,
                fontFamily: modalTitleType.fontFamily,
                fontSize: modalTitleType.fontSize.default,
                lineHeight: modalTitleType.lineHeight.default,
              }}
            >
              Sair da conta?
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: ui.textSecondary,
                fontFamily: modalDescType.fontFamily,
                fontSize: modalDescType.fontSize.default,
                lineHeight: modalDescType.lineHeight.default,
              }}
            >
              Tem certeza de que deseja sair? Você precisará fazer login novamente para acessar sua conta.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setShowLogoutConfirm(false)}
                style={[
                  styles.confirmButton,
                  styles.confirmButtonSecondary,
                  { borderColor: ui.divider }
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color: ui.textPrimary,
                    fontFamily: modalButtonType.fontFamily,
                    fontSize: modalButtonType.fontSize.default,
                    lineHeight: modalButtonType.lineHeight.default,
                  }}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  setShowLogoutConfirm(false);
                  await signOut();
                }}
                style={[
                  styles.confirmButton,
                  { backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'] }
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: modalButtonType.fontFamily,
                    fontSize: modalButtonType.fontSize.default,
                    lineHeight: modalButtonType.lineHeight.default,
                  }}
                >
                  Sair
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showCompleteModal}
        title="Precisamos finalizar seu perfil"
        description="Complete o nome, e-mail e telefone para continuar usando todos os recursos."
        cancelLabel="Depois"
        confirmLabel="Concluir agora"
        onCancel={async () => {
          setShowCompleteModal(false);
          try { await AsyncStorage.setItem('@profile_prompt_next', String(Date.now() + 60_000)); } catch {}
        }}
        onConfirm={async () => {
          setShowCompleteModal(false);
          try { await AsyncStorage.setItem('@profile_prompt_next', String(Date.now() + 60_000)); } catch {}
          router.push('/perfil/editar');
        }}
      />
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 4,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 22,
    height: 42,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },


  editButtonText: {
    color: '#FFFFFF',
    fontFamily: dsFontFamily['jakarta-semibold'],
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'none',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 64,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  confirmActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonLarge: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonSecondary: {
    borderWidth: 1,
  },
  confirmCardLarge: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
});


