import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";

const HeaderSwipeContext = createContext(null);

const emptyPreview = {
  page: null,
  direction: 0,
};

export function HeaderSwipeProvider({ children }) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const currentXRef = useRef(0);
  const previewRef = useRef(emptyPreview);
  const [preview, setPreviewState] = useState(emptyPreview);

  const setPreview = useCallback((nextPreview) => {
    if (
      previewRef.current.page === nextPreview.page &&
      previewRef.current.direction === nextPreview.direction
    ) {
      return;
    }

    previewRef.current = nextPreview;
    setPreviewState(nextPreview);
  }, []);

  const updateSwipe = useCallback(
    ({ x, page, direction }) => {
      currentXRef.current = x;
      swipeX.setValue(x);

      if (!page || direction === 0 || Math.abs(x) < 1) {
        setPreview(emptyPreview);
        return;
      }

      setPreview({ page, direction });
    },
    [setPreview, swipeX]
  );

  const clearSwipe = useCallback(
    ({ animate = false } = {}) => {
      currentXRef.current = 0;

      if (animate) {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 52,
          friction: 7,
        }).start(() => {
          setPreview(emptyPreview);
        });
        return;
      }

      swipeX.setValue(0);
      setPreview(emptyPreview);
    },
    [setPreview, swipeX]
  );

  const value = useMemo(
    () => ({
      clearSwipe,
      currentXRef,
      preview,
      swipeX,
      updateSwipe,
    }),
    [clearSwipe, preview, swipeX, updateSwipe]
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
