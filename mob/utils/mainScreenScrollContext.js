import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHeaderScrollY } from "./headerScrollContext";
import { useHeaderArrowHintScrollHandlers } from "./headerSwipeContext";
import {
  newHeaderMinScroll,
  readAnimatedValue,
} from "./headerNavigationGate";
import {
  compactHeaderVisibleInsetBase,
  getMainScreenContentTopInset,
  mainScreenContentTopInsetBase,
  mainScreenInnerTopPadding,
} from "./platformLayout";
import {
  mainScreenIntroSpacerHeight,
  scaleVerticalGap,
} from "./responsiveLayout";

export { mainScreenIntroSpacerHeight } from "./responsiveLayout";

const MainScreenScrollContext = createContext(null);
const topContentOffset = { x: 0, y: 0 };
const regularTopAssetOffset =
  mainScreenContentTopInsetBase +
  mainScreenInnerTopPadding +
  mainScreenIntroSpacerHeight -
  compactHeaderVisibleInsetBase;
const compactTopLoadOffset =
  Math.max(newHeaderMinScroll, regularTopAssetOffset);
export const mainScreenCompactIntroSpacerHeight =
  compactTopLoadOffset +
  compactHeaderVisibleInsetBase -
  mainScreenContentTopInsetBase -
  mainScreenInnerTopPadding;
const topLoadOffsetMax = scaleVerticalGap(480);

function clampTopLoadOffset(value) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(0, Math.min(value, topLoadOffsetMax));
}

export function getMainScreenCompactTopLoadOffset() {
  return compactTopLoadOffset;
}

export function getMainScreenTopLoadOffset(
  scrollY,
  compactTopLayout = false
) {
  if (compactTopLayout) return compactTopLoadOffset;

  return clampTopLoadOffset(readAnimatedValue(scrollY));
}

function getScrollEventY(event) {
  const value = event?.nativeEvent?.contentOffset?.y;

  return Number.isFinite(value) ? value : 0;
}

export function MainScreenScrollProvider({
  children,
  compactTopLayout = false,
  headerScrollY = null,
  initialHeaderOffsetY = null,
  initialOffsetY = 0,
  scrollY,
  syncHeader = false,
}) {
  const shouldSyncHeaderRef = useRef(false);
  const headerSyncStartYRef = useRef(0);
  const contentSyncStartYRef = useRef(0);
  const topLoadHeaderOffsetYRef = useRef(initialHeaderOffsetY);
  const topLoadContentOffsetYRef = useRef(initialOffsetY);
  const initialContentOffset = useMemo(
    () => ({ x: 0, y: initialOffsetY }),
    [initialOffsetY]
  );

  useEffect(() => {
    shouldSyncHeaderRef.current = false;
    topLoadHeaderOffsetYRef.current = initialHeaderOffsetY;
    topLoadContentOffsetYRef.current = initialOffsetY;
  }, [initialHeaderOffsetY, initialOffsetY, scrollY]);

  const activateHeaderSync = useCallback((event) => {
    if (!syncHeader || shouldSyncHeaderRef.current) return;

    headerSyncStartYRef.current = readAnimatedValue(headerScrollY);
    contentSyncStartYRef.current = event
      ? getScrollEventY(event)
      : readAnimatedValue(scrollY);
    shouldSyncHeaderRef.current = true;
  }, [headerScrollY, scrollY, syncHeader]);

  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
          useNativeDriver: false,
          listener: (event) => {
            if (
              !syncHeader ||
              typeof headerScrollY?.setValue !== "function"
            ) {
              return;
            }

            const eventY = getScrollEventY(event);

            if (!shouldSyncHeaderRef.current) {
              headerSyncStartYRef.current = readAnimatedValue(headerScrollY);
              contentSyncStartYRef.current = eventY;
              shouldSyncHeaderRef.current = true;
              return;
            }

            const topLoadHeaderOffsetY =
              topLoadHeaderOffsetYRef.current;
            const topLoadContentOffsetY =
              topLoadContentOffsetYRef.current;
            const hasTopLoadMapping =
              Number.isFinite(topLoadHeaderOffsetY) &&
              topLoadHeaderOffsetY > 0 &&
              topLoadContentOffsetY > 0;
            const nextHeaderY =
              hasTopLoadMapping && eventY <= topLoadContentOffsetY
                ? topLoadHeaderOffsetY *
                  (eventY / topLoadContentOffsetY)
                : hasTopLoadMapping &&
                  contentSyncStartYRef.current <= topLoadContentOffsetY
                ? topLoadHeaderOffsetY +
                  eventY -
                  topLoadContentOffsetY
                : headerSyncStartYRef.current +
                  eventY -
                  contentSyncStartYRef.current;

            headerScrollY.setValue(Math.max(0, nextHeaderY));
          },
        }
      ),
    [headerScrollY, scrollY, syncHeader]
  );

  const value = useMemo(
    () => ({
      activateHeaderSync,
      compactTopLayout,
      initialContentOffset,
      onScroll,
      scrollY,
    }),
    [
      activateHeaderSync,
      compactTopLayout,
      initialContentOffset,
      onScroll,
      scrollY,
    ]
  );

  return (
    <MainScreenScrollContext.Provider value={value}>
      {children}
    </MainScreenScrollContext.Provider>
  );
}

export function useMainScreenScrollProps() {
  const context = useContext(MainScreenScrollContext);
  const headerScrollY = useHeaderScrollY();
  const safeAreaInsets = useSafeAreaInsets();
  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const fallbackResolvedScrollY = headerScrollY || fallbackScrollY;
  const fallbackOnScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: fallbackResolvedScrollY } } }],
        { useNativeDriver: false }
      ),
    [fallbackResolvedScrollY]
  );
  const arrowScrollHandlers = useHeaderArrowHintScrollHandlers();

  const scrollY = context?.scrollY || fallbackResolvedScrollY;
  const initialContentOffset =
    context?.initialContentOffset || topContentOffset;
  const onScroll = context?.onScroll || fallbackOnScroll;
  const scrollContentInsetStyle = useMemo(
    () => ({
      paddingTop: getMainScreenContentTopInset(safeAreaInsets),
    }),
    [safeAreaInsets]
  );

  const scrollHandlers = useMemo(
    () => ({
      ...arrowScrollHandlers,
      onScroll,
      onScrollBeginDrag: (event) => {
        context?.activateHeaderSync?.(event);
        arrowScrollHandlers.onScrollBeginDrag?.(event);
      },
      onMomentumScrollBegin: (event) => {
        context?.activateHeaderSync?.(event);
        arrowScrollHandlers.onMomentumScrollBegin?.(event);
      },
    }),
    [arrowScrollHandlers, context, onScroll]
  );

  return {
    compactTopLayout: Boolean(context?.compactTopLayout),
    initialContentOffset,
    scrollContentInsetStyle,
    scrollHandlers,
    scrollY,
  };
}
