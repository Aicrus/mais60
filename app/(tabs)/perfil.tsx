import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/HapticTab';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors } from '../../design-system/tokens/colors';
import { getResponsiveValues } from '../../design-system/tokens/typography';
import {
  Home,
  LifeBuoy,
  Bell,
  Fingerprint,
  Grid3x3,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';

export default function PerfilScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const nameType = getResponsiveValues('headline-lg');
  const emailType = getResponsiveValues('body-sm');
  const sectionType = getResponsiveValues('label-sm');

  const [pushEnabled, setPushEnabled] = useState(true);
  const [faceEnabled, setFaceEnabled] = useState(true);

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
    <Pressable onPress={onPress} style={styles.row} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>{icon}</View>
      <Text
        style={{
          flex: 1,
          color: destructive ? '#EF4444' : ui.textPrimary,
          fontFamily: nameType.fontFamily,
          fontWeight: '500',
          fontSize: 15,
        }}
      >
        {label}
      </Text>
      {right}
    </Pressable>
  );

  return (
    <PageContainer>
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
            fontFamily: nameType.fontFamily,
            fontWeight: '700',
            fontSize: Platform.select({ default: 24, web: nameType.fontSize.default }) as number,
            marginTop: 12,
          }}
        >
          Coffeestories
        </Text>
        <Text
          style={{
            color: ui.textSecondary,
            fontFamily: emailType.fontFamily,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          mark.brock@icloud.com
        </Text>

        <Pressable style={[styles.editButton, { backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'] }]}
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>Edit profile</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: ui.textSecondary, fontFamily: sectionType.fontFamily }]}>Inventories</Text>

      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Home size={18} color={ui.textPrimary} />}
          label="My stores"
          right={
            <View style={styles.rightGroup}>
              <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
              <ChevronRight size={18} color={ui.textSecondary} />
            </View>
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<LifeBuoy size={18} color={ui.textPrimary} />}
          label="Support"
          right={<ChevronRight size={18} color={ui.textSecondary} />}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: ui.textSecondary, fontFamily: sectionType.fontFamily }]}>Preferences</Text>

      <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }] }>
        <Row
          icon={<Bell size={18} color={ui.textPrimary} />}
          label="Push notifications"
          right={
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={pushEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Fingerprint size={18} color={ui.textPrimary} />}
          label="Face ID"
          right={
            <Switch
              value={faceEnabled}
              onValueChange={setFaceEnabled}
              trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
              thumbColor={faceEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          }
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<Grid3x3 size={18} color={ui.textPrimary} />}
          label="PIN Code"
          right={<ChevronRight size={18} color={ui.textSecondary} />}
          onPress={() => {}}
        />
        <View style={[styles.separator, { backgroundColor: ui.divider }]} />
        <Row
          icon={<LogOut size={18} color="#EF4444" />}
          label="Logout"
          destructive
          onPress={() => {}}
        />
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    fontSize: 12,
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
    height: 56,
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
    fontSize: 12,
  },
  separator: {
    height: 1,
    width: '100%',
  },
});


