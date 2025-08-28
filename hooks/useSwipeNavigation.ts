import { useRef, useMemo } from 'react';
import { PanResponder, PanResponderInstance } from 'react-native';

interface SwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enabled?: boolean;
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 30,
  velocityThreshold = 0.1,
  enabled = true,
}: SwipeNavigationOptions = {}) => {
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled) return false;
        const { dx, dy } = gestureState;
        // Reduzido para 5 pixels para detectar gestos mais cedo
        return Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy);
      },

      onPanResponderGrant: () => {
        // Feedback tátil opcional poderia ser adicionado aqui
      },

      onPanResponderMove: () => {
        // Podemos adicionar feedback visual aqui se necessário
      },

      onPanResponderRelease: (_, gestureState) => {
        if (!enabled) return;

        const { dx, vx } = gestureState;

        // Swipe para esquerda (próxima tela)
        if (dx < -swipeThreshold || vx < -velocityThreshold) {
          onSwipeLeft?.();
        }
        // Swipe para direita (tela anterior)
        else if (dx > swipeThreshold || vx > velocityThreshold) {
          onSwipeRight?.();
        }
      },

      onPanResponderTerminate: () => {
        // Gestos cancelados
      },
    })
  );

  return useMemo(() => ({
    panHandlers: panResponder.current.panHandlers,
    panResponder: panResponder.current,
  }), [enabled, onSwipeLeft, onSwipeRight, swipeThreshold, velocityThreshold]);
};
