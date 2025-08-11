import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { ChevronLeft, Bell, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type NotificationData = {
  id: string;
  titulo: string;
  descricao: string;
  criado_em: string;
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

  const [items, setItems] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notificacoes')
          .select('id, titulo, descricao, criado_em')
          .order('criado_em', { ascending: false });
        if (!mounted) return;
        if (!error && data) setItems(data as NotificationData[]);
        else setItems([]);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return ''; }
  };

  const IconFor = (createdAt?: string) => {
    const common = { size: 18, color: ui.tint, strokeWidth: 2 } as const;
    return createdAt && new Date(createdAt).getSeconds() % 2 === 0 ? <Bell {...common} /> : <Clock {...common} />;
  };

  return (
    <PageContainer>
      {/* App Bar no padrão dos módulos */}
      <View style={styles.appBar} accessibilityRole="header">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={[
            styles.appBarBack,
            {
              backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
              borderColor: isDark ? colors['divider-dark'] : 'transparent',
            },
          ]}
          hitSlop={10}
        >
          <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text
          style={[
            styles.appBarLabel,
            { color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'] },
          ]}
        >
          Voltar
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90, gap: 10 }}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollbar"
      >
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors['brand-purple']} />
          </View>
        )}
        {!loading && items.length === 0 && (
          <Text style={{ textAlign: 'center', color: ui.textSecondary, fontFamily: dsFontFamily['jakarta-medium'] }}>
            Nenhuma notificação no momento.
          </Text>
        )}
        {items.map((n) => (
          <View
            key={n.id}
            style={[
              styles.item,
              { backgroundColor: ui.bgSecondary, borderColor: ui.divider },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${n.titulo}. ${n.descricao}`}
          >
            <View style={[styles.iconWrap, { backgroundColor: ui.tint + '1A' }]}>
              {IconFor(n.criado_em)}
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
                  {n.titulo}
                </Text>
                <Text
                  style={{
                    color: ui.textTertiary,
                    fontFamily: dsFontFamily['jakarta-medium'],
                    fontSize: itemTimeType.fontSize.default,
                    lineHeight: itemTimeType.lineHeight.default,
                  }}
                >
                  {formatTime(n.criado_em)}
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
                {n.descricao}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 8,
    marginBottom: 6,
  },
  appBarBack: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  appBarLabel: {
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 16,
  },
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
});


