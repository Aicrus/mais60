import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform, ScrollView } from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '../../design-system/tokens/typography';
import { ChevronRight, Cog, Shield, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { currentTheme, setThemeMode, uiColors } = useTheme();
  const isDark = currentTheme === 'dark';

  const sectionType = getResponsiveValues('title-sm');
  const modalTitleType = getResponsiveValues('title-md');
  const editButtonType = getResponsiveValues('label-lg');
  const rowLabelType = getResponsiveValues('body-md');

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
  }: {
    icon: React.ReactNode;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
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
          color: ui.textPrimary,
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
          <Text
            style={{
              color: ui.textPrimary,
              fontFamily: dsFontFamily['jakarta-bold'],
              fontSize: getResponsiveValues('headline-lg').fontSize.default,
              lineHeight: getResponsiveValues('headline-lg').lineHeight.default,
            }}
          >
            Configurações
          </Text>
          <Text
            style={{
              color: ui.textSecondary,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: getResponsiveValues('body-md').fontSize.default,
              lineHeight: getResponsiveValues('body-md').lineHeight.default,
              marginTop: 4,
              textAlign: 'center',
              paddingHorizontal: 20
            }}
          >
            Personalize sua experiência no app
          </Text>
        </View>

        <Text
          accessibilityRole="header"
          style={{
            marginTop: 16,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Acessibilidade
        </Text>

        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
          <Row
            icon={<Cog size={20} color={ui.textPrimary} />}
            label="Fonte e visual"
            right={<ChevronRight size={20} color={ui.textSecondary} />}
            onPress={() => router.push('/acessibilidade')}
          />
        </View>

        <Text
          accessibilityRole="header"
          style={{
            marginTop: 16,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Privacidade e Segurança
        </Text>

        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
          <Row
            icon={<Shield size={20} color={ui.textPrimary} />}
            label="Permissões e privacidade"
            right={<ChevronRight size={20} color={ui.textSecondary} />}
            onPress={() => router.push('/permissoes')}
          />
        </View>

        <Text
          accessibilityRole="header"
          style={{
            marginTop: 16,
            marginBottom: 8,
            paddingHorizontal: 4,
            color: ui.textSecondary,
            fontFamily: sectionType.fontFamily,
            fontSize: sectionType.fontSize.default,
            lineHeight: sectionType.lineHeight.default,
          }}
        >
          Aparência
        </Text>

        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
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
        </View>
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
});
