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

const BackgroundHeroStateContext = createContext(null);
const heroReleaseSettleDuration = 80;
const transientTopResetThreshold = 1;

function readAnimatedValue(animatedValue) {
  if (typeof animatedValue?.__getValue === "function") {
    return animatedValue.__getValue();
  }

  return 0;
}

export function BackgroundHeroStateProvider({ children, sourceScrollY }) {
  const heroScrollY = useRef(
    new Animated.Value(readAnimatedValue(sourceScrollY))
  ).current;
  const frozenScrollY = useRef(new Animated.Value(0)).current;
  const freezeIdRef = useRef(0);
  const isFrozenRef = useRef(false);
  const ignoreTransientTopResetRef = useRef(false);
  const lastFrozenScrollYRef = useRef(0);
  const releaseTimeoutRef = useRef(null);
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    if (!sourceScrollY || typeof sourceScrollY.addListener !== "function") {
      return undefined;
    }

    heroScrollY.setValue(readAnimatedValue(sourceScrollY));

    const listenerId = sourceScrollY.addListener(({ value }) => {
      if (isFrozenRef.current) return;

      if (ignoreTransientTopResetRef.current) {
        const shouldIgnoreTopReset =
          lastFrozenScrollYRef.current > transientTopResetThreshold &&
          value <= transientTopResetThreshold;

        if (shouldIgnoreTopReset) return;

        ignoreTransientTopResetRef.current = false;
      }

      heroScrollY.setValue(value);
    });

    return () => {
      sourceScrollY.removeListener(listenerId);
    };
  }, [heroScrollY, sourceScrollY]);

  const freezeHero = useCallback(
    (scrollY) => {
      const snapshotValue = readAnimatedValue(scrollY);

      if (releaseTimeoutRef.current) {
        clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = null;
      }

      freezeIdRef.current += 1;
      ignoreTransientTopResetRef.current = false;
      lastFrozenScrollYRef.current = snapshotValue;
      frozenScrollY.setValue(snapshotValue);
      heroScrollY.setValue(snapshotValue);
      isFrozenRef.current = true;
      setIsFrozen(true);

      return freezeIdRef.current;
    },
    [frozenScrollY, heroScrollY]
  );

  const releaseHero = useCallback(
    (freezeId = null) => {
      if (freezeId && freezeId !== freezeIdRef.current) return;

      if (releaseTimeoutRef.current) {
        clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = null;
      }

      const snapshotValue = lastFrozenScrollYRef.current;

      releaseTimeoutRef.current = setTimeout(() => {
        releaseTimeoutRef.current = null;

        const sourceValue = readAnimatedValue(sourceScrollY);
        const shouldHoldFrozenValue =
          snapshotValue > transientTopResetThreshold &&
          sourceValue <= transientTopResetThreshold;

        ignoreTransientTopResetRef.current = shouldHoldFrozenValue;
        isFrozenRef.current = false;
        heroScrollY.setValue(
          shouldHoldFrozenValue ? snapshotValue : sourceValue
        );
        setIsFrozen(false);
      }, heroReleaseSettleDuration);
    },
    [heroScrollY, sourceScrollY]
  );

  useEffect(
    () => () => {
      if (releaseTimeoutRef.current) {
        clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = null;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      freezeHero,
      frozenScrollY,
      heroScrollY,
      isFrozen,
      releaseHero,
    }),
    [freezeHero, frozenScrollY, heroScrollY, isFrozen, releaseHero]
  );

  return (
    <BackgroundHeroStateContext.Provider value={value}>
      {children}
    </BackgroundHeroStateContext.Provider>
  );
}

export function useBackgroundHeroState() {
  return useContext(BackgroundHeroStateContext);
}
