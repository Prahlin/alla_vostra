import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Animated } from "react-native";

const BackgroundHeroStateContext = createContext(null);

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

  useEffect(() => {
    if (!sourceScrollY || typeof sourceScrollY.addListener !== "function") {
      return undefined;
    }

    heroScrollY.setValue(readAnimatedValue(sourceScrollY));

    const listenerId = sourceScrollY.addListener(({ value }) => {
      if (isFrozenRef.current) return;

      heroScrollY.setValue(value);
    });

    return () => {
      sourceScrollY.removeListener(listenerId);
    };
  }, [heroScrollY, sourceScrollY]);

  const freezeHero = useCallback(
    (scrollY) => {
      const snapshotValue = readAnimatedValue(scrollY);

      freezeIdRef.current += 1;
      frozenScrollY.setValue(snapshotValue);
      heroScrollY.setValue(snapshotValue);
      isFrozenRef.current = true;

      return freezeIdRef.current;
    },
    [frozenScrollY, heroScrollY]
  );

  const releaseHero = useCallback(
    (freezeId = null) => {
      if (freezeId && freezeId !== freezeIdRef.current) return;

      isFrozenRef.current = false;
    },
    []
  );

  const value = useMemo(
    () => ({
      freezeHero,
      frozenScrollY,
      heroScrollY,
      releaseHero,
    }),
    [freezeHero, frozenScrollY, heroScrollY, releaseHero]
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
