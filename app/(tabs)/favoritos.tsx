import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { useFavorites } from '@/contexts/favorites';
import { useRouter } from 'expo-router';
import { Play, Trash2, HeartOff, Heart } from 'lucide-react-native';

export default function FavoritosScreen() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const router = useRouter();

  const titleType = getResponsiveValues('headline-lg');
  const listTitleType = getResponsiveValues('title-sm');
  const listSubtitleType = getResponsiveValues('body-lg');
  const emptyTitleType = getResponsiveValues('title-md');
  const emptyDescType = getResponsiveValues('body-md');

  const ui = useMemo(() => ({
    bg: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    card: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
    divider: isDark ? colors['divider-dark'] : '#E5E7EB',
    text: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    text2: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    tint: colors['brand-purple'],
  }), [isDark]);

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={{
          color: ui.text,
          fontFamily: dsFontFamily['jakarta-extrabold'],
          fontSize: titleType.fontSize.default,
          lineHeight: titleType.lineHeight.default,
          marginBottom: 8,
        }}>Favoritos</Text>

        {favorites.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: ui.divider, backgroundColor: ui.card }] }>
            <View style={{ marginBottom: 12 }}>
              <Heart size={64} color={ui.tint} />
            </View>
            <Text style={{ color: ui.text, fontFamily: dsFontFamily['jakarta-bold'], fontSize: emptyTitleType.fontSize.default, lineHeight: emptyTitleType.lineHeight.default, textAlign: 'center' }}>Nenhum favorito ainda</Text>
            <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-medium'], fontSize: emptyDescType.fontSize.default, lineHeight: emptyDescType.lineHeight.default, textAlign: 'center', marginTop: 6 }}>Toque no coração ao assistir um vídeo para salvar aqui.</Text>
          </View>
        ) : (
          <>
            <View style={styles.actionsRow}>
              <Pressable
                onPress={clearFavorites}
                accessibilityRole="button"
                style={[styles.clearBtn, { borderColor: ui.divider, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }]}
              >
                <HeartOff size={18} color={ui.text2} />
                <Text style={{ color: ui.text2, fontFamily: dsFontFamily['jakarta-semibold'] }}>Limpar todos</Text>
              </Pressable>
            </View>
            <View style={{ gap: 12 }}>
              {favorites.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.card, { borderColor: ui.divider, backgroundColor: ui.card }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.subtitle || ''}`}
                  onPress={() => router.push({ pathname: '/player/video/[id]', params: { id: item.id, title: item.title, subtitle: item.subtitle || '' } })}
                >
                  <View style={[styles.thumb, { backgroundColor: '#EEE' }]}>
                    {item.thumbnailUrl ? (
                      <Image source={{ uri: item.thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={[styles.thumbIcon]}> 
                        <Play size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: ui.text,
                      fontFamily: dsFontFamily['jakarta-extrabold'],
                      fontSize: listTitleType.fontSize.default,
                      lineHeight: listTitleType.lineHeight.default,
                    }}>{item.title}</Text>
                    {!!item.subtitle && (
                      <Text
                        style={{
                          marginTop: 6,
                          color: ui.text2,
                          fontFamily: dsFontFamily['jakarta-medium'],
                          fontSize: listSubtitleType.fontSize.default,
                          lineHeight: listSubtitleType.lineHeight.default,
                        }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => removeFavorite(item.id)}
                    accessibilityRole="button"
                    style={[styles.removeBtn, { borderColor: ui.divider, backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }]}
                  >
                    <Trash2 size={18} color={ui.text2} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 90, paddingTop: 4 },
  emptyCard: { borderWidth: 1, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  card: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors['brand-purple'], alignItems: 'center', justifyContent: 'center' },
  removeBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});


