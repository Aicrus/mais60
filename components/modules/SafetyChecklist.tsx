import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/design-system/tokens/colors';
import { fontFamily as dsFontFamily, getResponsiveValues } from '@/design-system/tokens/typography';
import { useTheme } from '@/hooks/DesignSystemContext';
import { Checkbox } from '@/components/checkboxes/Checkbox';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

type SafetyCategory = 'banheiro' | 'cozinha' | 'quarto';

type ChecklistState = Record<string, boolean>; // key: itemId -> checked
type ChecklistItem = { id: string; label: string };

function useStorageKey(userId: string | null | undefined, categoryId: SafetyCategory) {
  return useMemo(() => `@mais60:checklist:${userId || 'anon'}:${categoryId}:v1`, [userId, categoryId]);
}

export function SafetyChecklist({ categoryId }: { categoryId: SafetyCategory }) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const storageKey = useStorageKey(userId, categoryId);

  const titleType = getResponsiveValues('title-sm');
  const itemType = getResponsiveValues('body-lg');

  const [state, setState] = useState<ChecklistState>({});
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Carrega itens do Supabase; mantém fallback em cache local se offline
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('checklist_itens')
          .select('id,label')
          .eq('categoria', categoryId)
          .order('ordem', { ascending: true });
        if (!mounted) return;
        if (!error && Array.isArray(data)) {
          setItems(data.map((d: any) => ({ id: d.id as string, label: d.label as string })));
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoryId]);

  // Carrega progresso: do Supabase se logado, senão do cache local
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (userId) {
          const { data, error } = await supabase
            .from('checklist_progresso')
            .select('item_id, checked')
            .eq('usuario_id', userId);
          if (!mounted) return;
          if (!error && Array.isArray(data)) {
            const map: ChecklistState = {};
            data.forEach((row: any) => { map[row.item_id as string] = !!row.checked; });
            setState(map);
            await AsyncStorage.setItem(storageKey, JSON.stringify(map));
            return;
          }
        }
        // Fallback: cache local
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        setState(raw ? JSON.parse(raw) : {});
      } catch {
        setState({});
      }
    })();
    return () => { mounted = false; };
  }, [storageKey, userId]);

  const persist = useCallback(async (next: ChecklistState) => {
    setState(next);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }, [storageKey]);

  const toggle = useCallback((id: string, checked: boolean) => {
    const next = { ...state, [id]: checked } as ChecklistState;
    persist(next);
  }, [state, persist]);

  const clear = useCallback(() => {
    persist({});
  }, [persist]);

  const progress = useMemo(() => {
    const total = items.length;
    const done = items.reduce((acc, it) => acc + (state[it.id] ? 1 : 0), 0);
    return { done, total };
  }, [items, state]);

  const brand = {
    bg: colors['brand-blue'],
    bgSoft: isDark ? 'rgba(59,130,246,0.20)' : 'rgba(59,130,246,0.10)',
    textOn: '#FFFFFF',
  };

  return (
    <View style={[styles.card, { borderColor: isDark ? colors['divider-dark'] : '#E5E7EB', backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }]}>
      <View style={[styles.headerRow, { backgroundColor: brand.bg, borderTopLeftRadius: 12, borderTopRightRadius: 12, marginHorizontal: -14, marginTop: -14, paddingHorizontal: 14, paddingVertical: 10 }] }>
        <Text style={{ color: brand.textOn, fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default }}>
          Checklist de Segurança
        </Text>
        <Text style={{ color: brand.textOn, fontFamily: dsFontFamily['jakarta-semibold'] }}>
          {progress.done}/{progress.total}
        </Text>
      </View>

      <View style={{ marginTop: 12, gap: 12 }}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Checkbox
              checked={!!state[item.id]}
              onCheckedChange={async (val) => {
                // Persistência local imediata
                toggle(item.id, val);
                // Sincroniza no Supabase se logado
                if (userId) {
                  try {
                    const { error } = await supabase.rpc('toggle_checklist_item', {
                      p_usuario_id: userId,
                      p_item_id: item.id,
                      p_checked: !!val,
                    });
                    if (error) {
                      // Fallback: upsert direto na tabela em caso de erro na RPC
                      await supabase
                        .from('checklist_progresso')
                        .upsert(
                          [{ usuario_id: userId, item_id: item.id, checked: !!val }],
                          { onConflict: 'usuario_id,item_id' }
                        );
                    }
                  } catch {
                    // Fallback: upsert direto na tabela em caso de exceção
                    try {
                      await supabase
                        .from('checklist_progresso')
                        .upsert(
                          [{ usuario_id: userId, item_id: item.id, checked: !!val }],
                          { onConflict: 'usuario_id,item_id' }
                        );
                    } catch {}
                  }
                }
              }}
              aria-label={item.label}
            />
            <Text style={{
              marginLeft: 10,
              color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
              fontFamily: dsFontFamily['jakarta-medium'],
              fontSize: itemType.fontSize.default,
              lineHeight: itemType.lineHeight.default,
              flex: 1,
            }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={clear}
          accessibilityRole="button"
          style={[styles.clearBtn, { borderColor: isDark ? colors['divider-dark'] : '#E5E7EB', backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF' }]}
        >
          <Text style={{ color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-semibold'] }}>Limpar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  clearBtn: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 999 },
});

export default SafetyChecklist;


