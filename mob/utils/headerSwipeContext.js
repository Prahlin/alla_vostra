import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";

export const arrowHintPeakOpacity = 0.45;
export const orangeBarTouchExclusionHeight = 120;
const heldArrowHintDelayMs = 50;
const heldArrowHintPendingHorizontalCancelDistance = 4;
const heldArrowHintVisibleHorizontalCancelDistance = 8;
const heldArrowHintHorizontalDominanceRatio = 0.7;

const HeaderSwipeContext = createContext(null);

export function isInsideOrangeBarTouch(event) {
  const pageY = event?.nativeEvent?.pageY;

  return (
    typeof pageY === "number" &&
    pageY >= 0 &&
    pageY <= orangeBarTouchExclusionHeight
  );
}

export function HeaderSwipeProvider({ children }) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const routeTransitionProgress = useRef(new Animated.Value(0)).current;
  const heldArrowOpacity = useRef(new Animated.Value(0)).current;
  const directionalLeftArrowOpacity = useRef(new Animated.Value(0)).current;
  const directionalRightArrowOpacity = useRef(new Animated.Value(0)).current;
  const directionalArrowBaseSuppression = useRef(
    new Animated.Value(0)
  ).current;
  const returnAnimationRef = useRef(null);
  const commitRef = useRef(null);
  const commitIdRef = useRef(0);
  const currentXRef = useRef(0);
  const activeDirectionalArrowRef = useRef(null);
  const heldArrowHintTimeoutRef = useRef(null);
  const heldArrowHintStartXRef = useRef(null);
  const heldArrowHintStartYRef = useRef(null);
  const heldArrowHintCancelledRef = useRef(false);
  const heldArrowHintVisibleRef = useRef(false);
  const heldArrowListenersRef = useRef(new Set());
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

  const notifyHeldArrowChange = useCallback((isHeld) => {
    heldArrowListenersRef.current.forEach((listener) => listener(isHeld));
  }, []);

  const cancelHeldArrowHint = useCallback(() => {
    heldArrowHintCancelledRef.current = true;
    heldArrowHintVisibleRef.current = false;

    if (heldArrowHintTimeoutRef.current) {
      clearTimeout(heldArrowHintTimeoutRef.current);
      heldArrowHintTimeoutRef.current = null;
    }

    heldArrowOpacity.stopAnimation();
    heldArrowOpacity.setValue(0);
    notifyHeldArrowChange(false);
  }, [heldArrowOpacity, notifyHeldArrowChange]);

  const showHeldArrowHint = useCallback(
    (event = null) => {
      const nextStartX = event?.nativeEvent?.pageX;
      const nextStartY = event?.nativeEvent?.pageY;

      if (heldArrowHintTimeoutRef.current || heldArrowHintVisibleRef.current) {
        if (
          typeof heldArrowHintStartXRef.current !== "number" &&
          typeof nextStartX === "number"
        ) {
          heldArrowHintStartXRef.current = nextStartX;
        }

        if (
          typeof heldArrowHintStartYRef.current !== "number" &&
          typeof nextStartY === "number"
        ) {
          heldArrowHintStartYRef.current = nextStartY;
        }

        return;
      }

      if (heldArrowHintTimeoutRef.current) {
        clearTimeout(heldArrowHintTimeoutRef.current);
        heldArrowHintTimeoutRef.current = null;
      }

      heldArrowHintStartXRef.current =
        typeof nextStartX === "number" ? nextStartX : null;
      heldArrowHintStartYRef.current =
        typeof nextStartY === "number" ? nextStartY : null;
      heldArrowHintCancelledRef.current = false;
      heldArrowHintVisibleRef.current = false;
      heldArrowOpacity.stopAnimation();
      heldArrowOpacity.setValue(0);

      heldArrowHintTimeoutRef.current = setTimeout(() => {
        heldArrowHintTimeoutRef.current = null;

        if (
          heldArrowHintCancelledRef.current ||
          activeDirectionalArrowRef.current
        ) {
          return;
        }

        heldArrowHintVisibleRef.current = true;
        heldArrowOpacity.stopAnimation();
        heldArrowOpacity.setValue(arrowHintPeakOpacity);
        notifyHeldArrowChange(true);
      }, heldArrowHintDelayMs);
    },
    [heldArrowOpacity, notifyHeldArrowChange]
  );

  const hideHeldArrowHint = useCallback(() => {
    heldArrowHintStartXRef.current = null;
    heldArrowHintStartYRef.current = null;
    cancelHeldArrowHint();
  }, [cancelHeldArrowHint]);

  const updateHeldArrowHintMovement = useCallback(
    (event) => {
      const startX = heldArrowHintStartXRef.current;
      const startY = heldArrowHintStartYRef.current;
      const currentX = event?.nativeEvent?.pageX;
      const currentY = event?.nativeEvent?.pageY;

      if (
        typeof startX !== "number" ||
        typeof startY !== "number" ||
        typeof currentX !== "number" ||
        typeof currentY !== "number"
      ) {
        return;
      }

      const movedX = Math.abs(currentX - startX);
      const movedY = Math.abs(currentY - startY);
      const cancelDistance = heldArrowHintVisibleRef.current
        ? heldArrowHintVisibleHorizontalCancelDistance
        : heldArrowHintPendingHorizontalCancelDistance;
      const isHorizontalIntent =
        movedX >= cancelDistance &&
        movedX > movedY * heldArrowHintHorizontalDominanceRatio;

      if (!isHorizontalIntent) return;

      cancelHeldArrowHint();
    },
    [cancelHeldArrowHint]
  );

  const clearDirectionalArrowLinger = useCallback(() => {
    activeDirectionalArrowRef.current = null;
    directionalLeftArrowOpacity.stopAnimation();
    directionalRightArrowOpacity.stopAnimation();
    directionalArrowBaseSuppression.stopAnimation();
    directionalLeftArrowOpacity.setValue(0);
    directionalRightArrowOpacity.setValue(0);
    directionalArrowBaseSuppression.setValue(0);
  }, [
    directionalArrowBaseSuppression,
    directionalLeftArrowOpacity,
    directionalRightArrowOpacity,
  ]);

  const startDirectionalArrowLinger = useCallback(
    (direction) => {
      if (activeDirectionalArrowRef.current === direction) return;

      cancelHeldArrowHint();
      activeDirectionalArrowRef.current = direction;
      directionalLeftArrowOpacity.stopAnimation();
      directionalRightArrowOpacity.stopAnimation();
      directionalArrowBaseSuppression.stopAnimation();
      directionalArrowBaseSuppression.setValue(1);
      directionalLeftArrowOpacity.setValue(
        direction === "left" ? arrowHintPeakOpacity : 0
      );
      directionalRightArrowOpacity.setValue(
        direction === "right" ? arrowHintPeakOpacity : 0
      );
    },
    [
      cancelHeldArrowHint,
      directionalArrowBaseSuppression,
      directionalLeftArrowOpacity,
      directionalRightArrowOpacity,
    ]
  );

  const subscribeHeldArrowHint = useCallback((listener) => {
    heldArrowListenersRef.current.add(listener);

    return () => {
      heldArrowListenersRef.current.delete(listener);
    };
  }, []);

  const updateSwipe = useCallback(
    ({ x }) => {
      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      if (Math.abs(x) > 1) {
        cancelHeldArrowHint();
      }

      currentXRef.current = x;
      swipeX.setValue(x);
      setIsActive(Math.abs(x) > 1);
    },
    [cancelHeldArrowHint, setIsActive, swipeX]
  );

  const commitSwipe = useCallback(
    ({ x, page, direction, fromPage = null }) => {
      if (!page || direction === 0) return;

      if (returnAnimationRef.current) {
        returnAnimationRef.current.stop();
        returnAnimationRef.current = null;
      }

      cancelHeldArrowHint();
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
    [cancelHeldArrowHint, setIsActive, swipeX]
  );

  useEffect(
    () => () => {
      if (heldArrowHintTimeoutRef.current) {
        clearTimeout(heldArrowHintTimeoutRef.current);
        heldArrowHintTimeoutRef.current = null;
      }
    },
    []
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
      cancelHeldArrowHint,
      clearDirectionalArrowLinger,
      clearSwipe,
      commitSwipe,
      consumeCommit,
      currentXRef,
      directionalArrowBaseSuppression,
      directionalLeftArrowOpacity,
      directionalRightArrowOpacity,
      heldArrowOpacity,
      hideHeldArrowHint,
      isActive,
      routeTransitionProgress,
      showHeldArrowHint,
      startDirectionalArrowLinger,
      subscribeHeldArrowHint,
      swipeX,
      startRouteTransition,
      updateHeldArrowHintMovement,
      updateSwipe,
    }),
    [
      clearCommit,
      cancelHeldArrowHint,
      clearDirectionalArrowLinger,
      clearSwipe,
      commitSwipe,
      consumeCommit,
      directionalArrowBaseSuppression,
      directionalLeftArrowOpacity,
      directionalRightArrowOpacity,
      heldArrowOpacity,
      hideHeldArrowHint,
      isActive,
      routeTransitionProgress,
      showHeldArrowHint,
      startDirectionalArrowLinger,
      subscribeHeldArrowHint,
      swipeX,
      startRouteTransition,
      updateHeldArrowHintMovement,
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

export function useHeaderArrowHintScrollHandlers() {
  const headerSwipe = useHeaderSwipe();

  return useMemo(() => {
    const showHeldArrows = (event) => {
      if (isInsideOrangeBarTouch(event)) return false;

      headerSwipe?.showHeldArrowHint?.(event);
      return false;
    };

    const updateHeldArrows = (event) => {
      headerSwipe?.updateHeldArrowHintMovement?.(event);
      return false;
    };

    const cancelHeldArrows = () => {
      headerSwipe?.hideHeldArrowHint?.();
      return false;
    };

    return {
      onTouchStart: showHeldArrows,
      onTouchMove: updateHeldArrows,
      onTouchEnd: cancelHeldArrows,
      onTouchCancel: cancelHeldArrows,
      onScrollBeginDrag: cancelHeldArrows,
      onScrollEndDrag: cancelHeldArrows,
      onMomentumScrollEnd: cancelHeldArrows,
    };
  }, [headerSwipe]);
}
