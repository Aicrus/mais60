import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react-native';

type Pagina = { slug: string; titulo: string; conteudo: string };

export default function PaginaSobre() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const titleType = getResponsiveValues('headline-lg');
  const bodyType = getResponsiveValues('body-lg');
  const appBarLabelType = getResponsiveValues('label-md');

  const ui = useMemo(() => ({
    bg: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    card: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
    divider: isDark ? colors['divider-dark'] : '#E5E7EB',
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    text2: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
  }), [isDark]);

  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const s = (slug || '').toString();
        const { data, error } = await supabase
          .from('paginas')
          .select('slug,titulo,conteudo')
          .eq('slug', s)
          .eq('publicado', true)
          .maybeSingle();
        if (!mounted) return;
        if (!error && data) setPagina(data as Pagina);
        else setPagina(null);
      } catch {
        setPagina(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const renderContent = (text: string) => {
    // Renderização simples com quebras de linha
    const parts = text.split(/\n\n+/);
    return (
      <View style={{ gap: 12 }}>
        {parts.map((p, idx) => (
          <Text
            key={idx}
            style={{
              color: ui.text,
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: bodyType.fontSize.default,
              lineHeight: bodyType.lineHeight.default,
            }}
          >
            {p}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <PageContainer>
      {/* App Bar */}
      <View style={styles.appBar} accessibilityRole="header">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={[styles.appBarBack, { backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderColor: isDark ? colors['divider-dark'] : 'transparent' }]}
          hitSlop={10}
        >
          <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text style={{ color: ui.text, fontFamily: appBarLabelType.fontFamily, fontSize: appBarLabelType.fontSize.default, lineHeight: appBarLabelType.lineHeight.default }}>
          Voltar
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 90, gap: 10 }} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors['brand-purple']} />
          </View>
        )}
        {!loading && !pagina && (
          <Text style={{ textAlign: 'center', color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'] }}>
            Conteúdo não encontrado.
          </Text>
        )}
        {!!pagina && (
          <View style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }] }>
            <Text style={{
              color: ui.text,
              fontFamily: dsFontFamily['jakarta-extrabold'],
              fontSize: titleType.fontSize.default,
              lineHeight: titleType.lineHeight.default,
              marginBottom: 8,
            }}>
              {pagina.titulo}
            </Text>
            {renderContent(pagina.conteudo)}
          </View>
        )}
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
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
});


