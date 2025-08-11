import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { ArrowLeft, Bell, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type NotificationData = {
  id: string | number;
  title: string;
  description: string;
  time: string;
  isUnread?: boolean;
  icon?: 'bell' | 'clock';
};

export default function NotificacoesScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();

  const titleType = getResponsiveValues('headline-lg');
  const itemTitleType = getResponsiveValues('body-lg');
  const itemDescType = getResponsiveValues('body-md');
  const itemTimeType = getResponsiveValues('label-sm');

  const ui = useMemo(() => ({
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    textTertiary: isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light'],
    tint: isDark ? colors['primary-dark'] : colors['primary-light'],
  }), [isDark]);

  const data: NotificationData[] = [
    {
      id: 1,
      title: 'Bem‑vindo ao Mais 60',
      description: 'Explore as aulas e alongamentos no módulo Movimente‑se.',
      time: 'agora',
      isUnread: true,
      icon: 'bell',
    },
    {
      id: 2,
      title: 'Dica do dia',
      description: 'Faça uma pausa para respiração guiada de 3 minutos.',
      time: '2 h',
      icon: 'clock',
    },
  ];

  const IconFor = (name?: NotificationData['icon']) => {
    const common = { size: 18, color: ui.tint, strokeWidth: 2 } as const;
    if (name === 'clock') return <Clock {...common} />;
    return <Bell {...common} />;
  };

  return (
    <PageContainer>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={10}
          style={[styles.backBtn, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
        >
          <ArrowLeft size={20} color={ui.textPrimary} />
        </Pressable>
        <Text
          accessibilityRole="header"
          style={{
            flex: 1,
            textAlign: 'center',
            color: ui.textPrimary,
            fontFamily: dsFontFamily['jakarta-extrabold'],
            fontSize: titleType.fontSize.default,
            lineHeight: titleType.lineHeight.default,
          }}
        >
          Notificações
        </Text>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90, gap: 10 }}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollbar"
      >
        {data.map((n) => (
          <View
            key={n.id}
            style={[
              styles.item,
              { backgroundColor: ui.bgSecondary, borderColor: ui.divider },
              n.isUnread && { borderColor: ui.tint + '55' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${n.title}. ${n.description}`}
          >
            <View style={[styles.iconWrap, { backgroundColor: ui.tint + '1A' }]}>
              {IconFor(n.icon)}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.itemHeader}>
                <Text
                  style={{
                    flex: 1,
                    color: ui.textPrimary,
                    fontFamily: dsFontFamily['jakarta-bold'],
                    fontSize: itemTitleType.fontSize.default,
                    lineHeight: itemTitleType.lineHeight.default,
                  }}
                >
                  {n.title}
                </Text>
                <Text
                  style={{
                    color: ui.textTertiary,
                    fontFamily: dsFontFamily['jakarta-medium'],
                    fontSize: itemTimeType.fontSize.default,
                    lineHeight: itemTimeType.lineHeight.default,
                  }}
                >
                  {n.time}
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 4,
                  color: ui.textSecondary,
                  fontFamily: dsFontFamily['jakarta-medium'],
                  fontSize: itemDescType.fontSize.default,
                  lineHeight: itemDescType.lineHeight.default,
                }}
              >
                {n.description}
              </Text>
            </View>
            {n.isUnread && <View style={[styles.unreadDot, { backgroundColor: ui.tint }]} />}
          </View>
        ))}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 4,
    marginBottom: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: { width: 44, height: 44 },
  item: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' as any }),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 12,
    right: 12,
  },
});


