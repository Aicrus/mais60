import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { X } from 'lucide-react-native';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onRequestClose?: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  onRequestClose,
}: ConfirmModalProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const ui = {
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    primary: isDark ? colors['primary-dark'] : colors['primary-light'],
  } as const;

  const titleType = getResponsiveValues('title-md');
  const descType = getResponsiveValues('body-md');
  const btnType = getResponsiveValues('label-lg');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose || onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
          {/* Botão de fechar */}
          <Pressable
            style={[styles.closeButton, { backgroundColor: ui.divider }]}
            onPress={onRequestClose || onCancel}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal"
          >
            <X size={20} color={ui.textPrimary} />
          </Pressable>
          <Text style={{ color: ui.textPrimary, fontFamily: titleType.fontFamily, fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default }}>
            {title}
          </Text>
          {!!description && (
            <Text style={{ marginTop: 6, color: ui.textSecondary, fontFamily: descType.fontFamily, fontSize: descType.fontSize.default, lineHeight: descType.lineHeight.default }}>
              {description}
            </Text>
          )}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.btnSecondary, { borderColor: ui.divider }]}> 
              <Text style={{ color: ui.textPrimary, fontFamily: btnType.fontFamily, fontSize: btnType.fontSize.default, lineHeight: btnType.lineHeight.default }}>{cancelLabel}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.btn, { backgroundColor: ui.primary }]}> 
              <Text style={{ color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-semibold'], fontSize: btnType.fontSize.default, lineHeight: btnType.lineHeight.default }}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, borderRadius: 14, borderWidth: 1, padding: 16 },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { height: 44, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { borderWidth: 1 },
});


