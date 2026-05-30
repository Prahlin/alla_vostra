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

export function HeaderSwipeProvider({ children }) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const routeTransitionProgress = useRef(new Animated.Value(0)).current;
  const returnAnimationRef = useRef(null);
  const commitRef = useRef(null);
  const commitIdRef = useRef(0);
  const currentXRef = useRef(0);
  const isActiveRef = useRef(false);
  const routeTransitionAnimationRef = useRef(null);
  const routeTransitionCallbacksRef = useRef([]);
  const routeTransitionDurationRef = useRef(0);
  const routeTransitionKeyRef = useRef(null);
  const routeTransitionTimeoutRef = useRef(null);
  const [isActive, setIsActiveState] = useState(false);

  const setIsActive = useCallback((nextIsActive) => {
    if (isActiveRef.current === nextIsActive) return;

    isActiveRef.current = nextIsActive;
    setIsActiveState(nextIsActive);
  }, []);

  const updateSwipe = useCallback(
    ({ x }) => {
      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = x;
      swipeX.setValue(x);
      setIsActive(Math.abs(x) > 1);
    },
    [setIsActive, swipeX]
  );

  const commitSwipe = useCallback(
    ({ x, page, direction, fromPage = null }) => {
      if (!page || direction === 0) return;

      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = x;
      setIsActive(true);
      commitIdRef.current += 1;
      commitRef.current = {
        id: commitIdRef.current,
        x,
        page,
        direction,
        fromPage,
      };
      swipeX.setValue(x);
    },
    [setIsActive, swipeX]
  );

  const consumeCommit = useCallback((page, fromPage = null) => {
    const commit = commitRef.current;

    if (!commit || (page && commit.page !== page)) return null;
    if (fromPage && commit.fromPage && commit.fromPage !== fromPage) {
      return null;
    }

    return commit;
  }, []);

  const clearCommit = useCallback((id = null) => {
    if (!commitRef.current) return;
    if (id && commitRef.current.id !== id) return;

    commitRef.current = null;
  }, []);

  const startRouteTransition = useCallback(
    ({ duration, key, onFinish }) => {
      if (routeTransitionKeyRef.current !== key) {
        if (routeTransitionAnimationRef.current) {
          routeTransitionAnimationRef.current.stop();
          routeTransitionAnimationRef.current = null;
        }

        if (routeTransitionTimeoutRef.current) {
          clearTimeout(routeTransitionTimeoutRef.current);
          routeTransitionTimeoutRef.current = null;
        }

        routeTransitionCallbacksRef.current = [];
        routeTransitionDurationRef.current = duration;
        routeTransitionKeyRef.current = key;
        routeTransitionProgress.setValue(0);

        routeTransitionTimeoutRef.current = setTimeout(() => {
          routeTransitionTimeoutRef.current = null;

          const animation = Animated.timing(routeTransitionProgress, {
            toValue: 1,
            duration: routeTransitionDurationRef.current,
            useNativeDriver: true,
          });

          routeTransitionAnimationRef.current = animation;

          animation.start(({ finished }) => {
            if (routeTransitionAnimationRef.current === animation) {
              routeTransitionAnimationRef.current = null;
            }

            if (!finished) return;

            const callbacks = routeTransitionCallbacksRef.current;

            routeTransitionCallbacksRef.current = [];
            routeTransitionKeyRef.current = null;
            callbacks.forEach((callback) => callback());
          });
        }, 0);
      }

      if (onFinish) {
        routeTransitionCallbacksRef.current.push(onFinish);
      }
    },
    [routeTransitionProgress]
  );

  const clearSwipe = useCallback(
    ({ animate = false } = {}) => {
      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      currentXRef.current = 0;

      if (animate) {
        setIsActive(true);

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

          setIsActive(false);
        });
        return;
      }

      swipeX.setValue(0);
      setIsActive(false);
    },
    [setIsActive, swipeX]
  );

  const value = useMemo(
    () => ({
      clearCommit,
      clearSwipe,
      commitSwipe,
      consumeCommit,
      currentXRef,
      isActive,
      routeTransitionProgress,
      swipeX,
      startRouteTransition,
      updateSwipe,
    }),
    [
      clearCommit,
      clearSwipe,
      commitSwipe,
      consumeCommit,
      isActive,
      routeTransitionProgress,
      swipeX,
      startRouteTransition,
      updateSwipe,
    ]
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
