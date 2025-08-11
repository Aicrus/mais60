import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/design-system/tokens/colors';
import { fontFamily as dsFontFamily, getResponsiveValues } from '@/design-system/tokens/typography';
import { useTheme } from '@/hooks/DesignSystemContext';
import { Checkbox } from '@/components/checkboxes/Checkbox';
import { useAuth } from '@/contexts/auth';

type SafetyCategory = 'banheiro' | 'cozinha' | 'quarto';

type ChecklistState = Record<string, boolean>; // key: itemId -> checked

const DEFAULT_ITEMS: Record<SafetyCategory, Array<{ id: string; label: string }>> = {
  banheiro: [
    { id: 'barras-apoio', label: 'Instalar barras de apoio próximas ao vaso e chuveiro' },
    { id: 'tapete-antiderrapante', label: 'Usar tapete antiderrapante dentro e fora do box' },
    { id: 'iluminacao', label: 'Garantir boa iluminação noturna (luz de presença)' },
    { id: 'objetos-alcance', label: 'Deixar objetos de uso diário ao alcance' },
    { id: 'sem-poças', label: 'Secar poças de água imediatamente' },
  ],
  cozinha: [
    { id: 'cabos-voltados', label: 'Manter cabos de panelas voltados para dentro do fogão' },
    { id: 'itens-frequentes-altura', label: 'Guardar itens de uso frequente à altura da cintura' },
    { id: 'sem-fios-soltos', label: 'Evitar fios soltos ou extensões no caminho' },
    { id: 'piso-seco', label: 'Manter o piso seco para evitar escorregões' },
    { id: 'boa-iluminacao', label: 'Manter boa iluminação sobre a bancada' },
  ],
  quarto: [
    { id: 'tapete-firme', label: 'Usar tapetes firmes com base antiderrapante' },
    { id: 'caminho-livre', label: 'Manter o caminho da cama ao banheiro livre' },
    { id: 'luz-de-apoio', label: 'Ter luz de apoio acessível a partir da cama' },
    { id: 'calçados-adequados', label: 'Usar calçados fechados ao levantar' },
    { id: 'altura-cama', label: 'Verificar altura adequada da cama para sentar e levantar' },
  ],
};

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
  const defaults = DEFAULT_ITEMS[categoryId];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        if (raw) setState(JSON.parse(raw));
        else setState({});
      } catch {
        setState({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageKey]);

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
    const total = defaults.length;
    const done = defaults.reduce((acc, it) => acc + (state[it.id] ? 1 : 0), 0);
    return { done, total };
  }, [defaults, state]);

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
        {defaults.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Checkbox
              checked={!!state[item.id]}
              onCheckedChange={(val) => toggle(item.id, val)}
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


