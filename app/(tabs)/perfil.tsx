import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Switch, Platform, ScrollView, Modal } from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { getResponsiveValues, fontFamily as dsFontFamily } from '../../design-system/tokens/typography';
import { useAuth } from '../../contexts/auth';
import { Home, Bell, ChevronRight, LogOut, Moon, Cog, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const { currentTheme, setThemeMode } = useTheme();
  const isDark = currentTheme === 'dark';
  const { signOut } = useAuth();

  const nameType = getResponsiveValues('headline-lg');
  const emailType = getResponsiveValues('body-sm');
  const sectionType = getResponsiveValues('title-sm');
  const modalTitleType = getResponsiveValues('title-md');
  const modalDescType = getResponsiveValues('body-md');
  const modalButtonType = getResponsiveValues('label-lg');
  const editButtonType = getResponsiveValues('label-md');
  const rowLabelType = getResponsiveValues('body-md');

  // Estados simples para acessibilidade e notificações
  const [highContrast, setHighContrast] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [notifyExercises, setNotifyExercises] = useState(false);
  const [notifyRecipes, setNotifyRecipes] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const ui = {
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
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

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarOuter}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/160?img=12' }}
            style={styles.avatar}
          />
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
          Coffeestories
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
          mark.brock@icloud.com
        </Text>

        <Pressable style={[styles.editButton, { backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'] }]}
          accessibilityRole="button"
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
        Preferências
      </Text>

      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Cog size={20} color={ui.textPrimary} />}
          label="Acessibilidade"
          right={<ChevronRight size={20} color={ui.textSecondary} />}
          onPress={() => router.push('/acessibilidade')}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Shield size={20} color={ui.textPrimary} />}
          label="Permissões"
          right={<ChevronRight size={20} color={ui.textSecondary} />}
          onPress={() => router.push('/permissoes')}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Moon size={20} color={ui.textPrimary} />}
          label="Modo escuro"
          right={
            <Switch
              value={isDark}
              onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={"#FFFFFF"}
            />
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Bell size={20} color={ui.textPrimary} />}
          label="Sons"
          right={
            <Switch
              value={soundsEnabled}
              onValueChange={setSoundsEnabled}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
            />
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Moon size={20} color={ui.textPrimary} />}
          label="Alto contraste"
          right={
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
            />
          }
        />
      </View>

      {/* Notificações */}
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
        Notificações
      </Text>
      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Bell size={20} color={ui.textPrimary} />}
          label="Lembretes de exercícios"
          right={
            <Switch
              value={notifyExercises}
              onValueChange={setNotifyExercises}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
            />
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Bell size={20} color={ui.textPrimary} />}
          label="Novas receitas"
          right={
            <Switch
              value={notifyRecipes}
              onValueChange={setNotifyRecipes}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
            />
          }
        />
      </View>

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
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Home size={20} color={ui.textPrimary} />}
          label="Termos de uso"
          right={<ChevronRight size={22} color={ui.textSecondary} />}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Home size={20} color={ui.textPrimary} />}
          label="Política de privacidade"
          right={<ChevronRight size={22} color={ui.textSecondary} />}
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
  confirmButtonSecondary: {
    borderWidth: 1,
  },
});


