import { useEffect, useMemo, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform, ViewStyle } from 'react-native';

type UseKeyboardOffsetOptions = {
  /**
   * Deslocamento adicional aplicado ao translateY (útil para compensar barras/rodapés)
   * @default 0
   */
  extraOffset?: number;
  /**
   * Quando true, retorna um style pronto para aplicar em rodapés fixos
   * @default true
   */
  provideStyle?: boolean;
};

/**
 * Hook padronizado para lidar com abertura/fechamento do teclado
 * e obter a altura atual do teclado, mantendo comportamento simétrico
 * entre iOS (will*) e Android (did*).
 */
export function useKeyboardOffset(options: UseKeyboardOffsetOptions = {}) {
  const { extraOffset = 0, provideStyle = true } = options;

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // iOS: eventos "will*" para animação suave
    if (Platform.OS === 'ios') {
      const onShow = (e: KeyboardEvent) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight((e.endCoordinates?.height ?? 0) + extraOffset);
      };
      const onHide = () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      };
      const subShow = Keyboard.addListener('keyboardWillShow', onShow);
      const subHide = Keyboard.addListener('keyboardWillHide', onHide);
      return () => {
        try { subShow.remove(); } catch {}
        try { subHide.remove(); } catch {}
      };
    }

    // Android: eventos "did*"
    const onShow = (e: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight((e.endCoordinates?.height ?? 0) + extraOffset);
    };
    const onHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };
    const subShow = Keyboard.addListener('keyboardDidShow', onShow);
    const subHide = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      try { subShow.remove(); } catch {}
      try { subHide.remove(); } catch {}
    };
  }, [extraOffset]);

  const footerTranslateStyle: { transform: ViewStyle['transform'] } | undefined = useMemo(() => {
    if (!provideStyle) return undefined;
    return { transform: [{ translateY: keyboardHeight }] };
  }, [keyboardHeight, provideStyle]);

  return {
    keyboardHeight,
    isKeyboardVisible,
    footerTranslateStyle,
  } as const;
}


