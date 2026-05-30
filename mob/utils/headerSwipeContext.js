import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Animated } from "react-native";

const HeaderSwipeContext = createContext(null);

export function HeaderSwipeProvider({ children }) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const returnAnimationRef = useRef(null);
  const commitRef = useRef(null);
  const currentXRef = useRef(0);

  const updateSwipe = useCallback(
    ({ x }) => {
      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = x;
      swipeX.setValue(x);
    },
    [swipeX]
  );

  const commitSwipe = useCallback(
    ({ x, page, direction }) => {
      if (!page || direction === 0) return;

      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = x;
      commitRef.current = { x, page, direction };
      swipeX.setValue(x);
    },
    [swipeX]
  );

  const consumeCommit = useCallback((page) => {
    const commit = commitRef.current;

    if (!commit || (page && commit.page !== page)) return null;

    commitRef.current = null;
    return commit;
  }, []);

  const clearSwipe = useCallback(
    ({ animate = false } = {}) => {
      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = 0;

      if (animate) {
        const animation = Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 52,
          friction: 7,
        });

        returnAnimationRef.current = animation;

        animation.start(() => {
          if (returnAnimationRef.current === animation) {
            returnAnimationRef.current = null;
          }
        });
        return;
      }

      swipeX.setValue(0);
    },
    [swipeX]
  );

  const value = useMemo(
    () => ({
      clearSwipe,
      commitSwipe,
      consumeCommit,
      currentXRef,
      swipeX,
      updateSwipe,
    }),
    [clearSwipe, commitSwipe, consumeCommit, swipeX, updateSwipe]
  );

  return (
    <HeaderSwipeContext.Provider value={value}>
      {children}
    </HeaderSwipeContext.Provider>
  );
}

export function useHeaderSwipe() {
  return useContext(HeaderSwipeContext);
}
