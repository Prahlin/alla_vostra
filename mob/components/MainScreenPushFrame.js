import { useLayoutEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { usePathname } from "expo-router";

import AboutusScreen from "../app/aboutus";
import ContactScreen from "../app/contact";
import HomeScreen from "../app/index";
import ProductsScreen from "../app/products";
import { useBackgroundHeroState } from "../utils/backgroundHeroStateContext";
import { useHeaderScrollY } from "../utils/headerScrollContext";
import {
  isInsideOrangeBarTouch,
  useHeaderSwipe,
} from "../utils/headerSwipeContext";
import { readAnimatedValue } from "../utils/headerNavigationGate";
import {
  getMainScreenTopLoadOffset,
  MainScreenScrollProvider,
} from "../utils/mainScreenScrollContext";

const navPages = ["home", "products", "aboutus", "contact"];
const pushDuration = 210;

const pageComponents = {
  home: HomeScreen,
  products: ProductsScreen,
  aboutus: AboutusScreen,
  contact: ContactScreen,
};

function getActivePageFromPath(pathname) {
  if (pathname === "/products") return "products";
  if (pathname === "/aboutus") return "aboutus";
  if (pathname === "/contact") return "contact";
  if (pathname === "/shop") return "shop";
  return "home";
}

function getNavigationDirection(fromPage, toPage) {
  const fromIndex = navPages.indexOf(fromPage);
  const toIndex = navPages.indexOf(toPage);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return 1;

  const lastPageIndex = navPages.length - 1;

  if (fromIndex === lastPageIndex && toIndex === 0) return 1;
  if (fromIndex === 0 && toIndex === lastPageIndex) return -1;

  return toIndex > fromIndex ? 1 : -1;
}

function renderPage(pageName, scrollConfig = null) {
  const PageComponent = pageComponents[pageName];

  if (!PageComponent) return null;

  if (scrollConfig?.scrollY) {
    return (
      <MainScreenScrollProvider {...scrollConfig}>
        <PageComponent />
      </MainScreenScrollProvider>
    );
  }

  return <PageComponent />;
}

export default function MainScreenPushFrame({ children }) {
  const pathname = usePathname();
  const backgroundHeroState = useBackgroundHeroState();
  const freezeHero = backgroundHeroState?.freezeHero;
  const frozenHeroScrollY = backgroundHeroState?.frozenScrollY;
  const releaseHero = backgroundHeroState?.releaseHero;
  const sharedScrollY = useHeaderScrollY();
  const screenSwipe = useHeaderSwipe();
  const { width: windowWidth } = useWindowDimensions();
  const activePage = getActivePageFromPath(pathname);
  const activePageIndex = navPages.indexOf(activePage);
  const isMainPage = activePageIndex >= 0;

  const fallbackTransitionProgress = useRef(new Animated.Value(0)).current;
  const transitionProgress =
    screenSwipe?.routeTransitionProgress || fallbackTransitionProgress;
  const transitionAnimationRef = useRef(null);
  const heroFreezeIdRef = useRef(null);
  const previousActivePageRef = useRef(activePage);
  const activeContentScrollY = useRef(new Animated.Value(0)).current;
  const topPageScrollY = useRef(new Animated.Value(0)).current;
  const activeTopLoadRef = useRef({
    headerOffsetY: 0,
    contentOffsetY: 0,
  });
  const [transition, setTransition] = useState(null);
  const shouldFreezeHero =
    isMainPage && Boolean(screenSwipe?.isActive || transition);

  useLayoutEffect(() => {
    if (!freezeHero || !releaseHero) return;

    if (shouldFreezeHero) {
      if (heroFreezeIdRef.current === null) {
        heroFreezeIdRef.current = freezeHero(sharedScrollY);
      }

      return;
    }

    if (heroFreezeIdRef.current !== null) {
      releaseHero(heroFreezeIdRef.current);
      heroFreezeIdRef.current = null;
    }
  }, [freezeHero, releaseHero, sharedScrollY, shouldFreezeHero]);

  useLayoutEffect(
    () => () => {
      if (!releaseHero || heroFreezeIdRef.current === null) return;

      releaseHero(heroFreezeIdRef.current);
      heroFreezeIdRef.current = null;
    },
    [releaseHero]
  );

  useLayoutEffect(() => {
    const previousPage = previousActivePageRef.current;

    if (previousPage === activePage) return;

    const canPush =
      screenSwipe &&
      navPages.includes(previousPage) &&
      navPages.includes(activePage);

    if (transitionAnimationRef.current) {
      transitionAnimationRef.current.stop();
      transitionAnimationRef.current = null;
    }

    previousActivePageRef.current = activePage;

    if (!canPush) {
      const nextHeaderOffsetY = navPages.includes(activePage)
        ? readAnimatedValue(sharedScrollY)
        : 0;
      const nextContentOffsetY = navPages.includes(activePage)
        ? getMainScreenTopLoadOffset(sharedScrollY)
        : 0;

      activeTopLoadRef.current = {
        headerOffsetY: nextHeaderOffsetY,
        contentOffsetY: nextContentOffsetY,
      };
      activeContentScrollY.setValue(nextContentOffsetY);
      topPageScrollY.setValue(nextContentOffsetY);
      transitionProgress.setValue(0);
      setTransition(null);
      screenSwipe?.clearSwipe();
      return;
    }

    const committedSwipe = screenSwipe.consumeCommit(activePage, previousPage);
    const direction =
      committedSwipe?.direction ||
      getNavigationDirection(previousPage, activePage);
    const startX =
      committedSwipe?.x || screenSwipe.currentXRef.current || 0;
    const outgoingScrollOffsetY = readAnimatedValue(activeContentScrollY);
    const outgoingScrollY = new Animated.Value(outgoingScrollOffsetY);
    const incomingHeaderOffsetY = readAnimatedValue(sharedScrollY);
    const incomingScrollOffsetY = getMainScreenTopLoadOffset(sharedScrollY);

    activeTopLoadRef.current = {
      headerOffsetY: incomingHeaderOffsetY,
      contentOffsetY: incomingScrollOffsetY,
    };
    activeContentScrollY.setValue(incomingScrollOffsetY);
    topPageScrollY.setValue(incomingScrollOffsetY);

    if (freezeHero && heroFreezeIdRef.current === null) {
      heroFreezeIdRef.current = freezeHero(sharedScrollY);
    }

    screenSwipe.currentXRef.current = 0;
    transitionProgress.setValue(0);
    setTransition({
      commitId: committedSwipe?.id || null,
      direction,
      fromPage: previousPage,
      incomingHeaderOffsetY,
      incomingScrollOffsetY,
      outgoingScrollOffsetY,
      outgoingScrollY,
      startX,
      toPage: activePage,
    });

    const finishTransition = ({ shouldResetProgress = false } = {}) => {
      setTransition(null);
      screenSwipe.clearSwipe();
      screenSwipe.clearCommit(committedSwipe?.id);
      if (shouldResetProgress) transitionProgress.setValue(0);
    };

    if (screenSwipe.startRouteTransition) {
      screenSwipe.startRouteTransition({
        key: `${previousPage}->${activePage}`,
        duration: pushDuration,
        onFinish: finishTransition,
      });
      return;
    }

    const animation = Animated.timing(transitionProgress, {
      toValue: 1,
      duration: pushDuration,
      useNativeDriver: true,
    });

    transitionAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        finishTransition({ shouldResetProgress: true });
      }

      if (transitionAnimationRef.current === animation) {
        transitionAnimationRef.current = null;
      }
    });
  }, [
    activePage,
    activeContentScrollY,
    freezeHero,
    screenSwipe,
    sharedScrollY,
    topPageScrollY,
    transitionProgress,
  ]);

  const showHeldArrowsFromTouch = (event) => {
    if (isInsideOrangeBarTouch(event)) return false;

    screenSwipe?.showHeldArrowHint?.();
    return false;
  };

  const hideHeldArrowsFromTouch = () => {
    screenSwipe?.hideHeldArrowHint?.();
    return false;
  };

  const contentTouchHandlers = {
    onStartShouldSetResponderCapture: showHeldArrowsFromTouch,
    onTouchStart: showHeldArrowsFromTouch,
    onTouchEnd: hideHeldArrowsFromTouch,
    onTouchCancel: hideHeldArrowsFromTouch,
  };
  const liveTopLoadHeaderOffsetY = readAnimatedValue(sharedScrollY);
  const liveTopLoadContentOffsetY =
    getMainScreenTopLoadOffset(sharedScrollY);
  const shouldLiftContentAboveHeaderHero =
    isMainPage &&
    Boolean(screenSwipe?.isActive || transition || backgroundHeroState?.isFrozen);
  const frameStyle = shouldLiftContentAboveHeaderHero
    ? [styles.frame, styles.frameAboveHeaderHero]
    : styles.frame;

  useLayoutEffect(() => {
    if (!isMainPage || !screenSwipe?.isActive || transition) return;

    topPageScrollY.setValue(liveTopLoadContentOffsetY);
  }, [
    isMainPage,
    liveTopLoadContentOffsetY,
    screenSwipe?.isActive,
    topPageScrollY,
    transition,
  ]);

  if (!isMainPage && !transition) {
    return (
      <View style={frameStyle} {...contentTouchHandlers}>
        {children}
      </View>
    );
  }

  const previousPreviewPage =
    navPages[(activePageIndex + navPages.length - 1) % navPages.length];
  const nextPreviewPage = navPages[(activePageIndex + 1) % navPages.length];
  const dragTranslateX = screenSwipe?.swipeX || 0;
  const currentTranslateX = transition
    ? transitionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          transition.startX + transition.direction * windowWidth,
          0,
        ],
        extrapolate: "clamp",
      })
    : dragTranslateX;
  const outgoingTranslateX = transition
    ? transitionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          transition.startX,
          -transition.direction * windowWidth,
        ],
        extrapolate: "clamp",
      })
    : 0;
  const previousPreviewTranslateX = Animated.add(
    dragTranslateX,
    -windowWidth
  );
  const nextPreviewTranslateX = Animated.add(dragTranslateX, windowWidth);
  const shouldShowDragPreviews =
    isMainPage && screenSwipe?.isActive && !transition;
  const isPendingMainRouteChange =
    isMainPage && previousActivePageRef.current !== activePage;
  const topLoadHeaderOffsetY = transition
    ? transition.incomingHeaderOffsetY
    : liveTopLoadHeaderOffsetY;
  const topLoadContentOffsetY = transition
    ? transition.incomingScrollOffsetY
    : liveTopLoadContentOffsetY;
  const shouldSyncCurrentHeader =
    isMainPage && !transition && !isPendingMainRouteChange;
  const currentScrollY =
    transition || isPendingMainRouteChange
      ? topPageScrollY
      : activeContentScrollY;
  const activeTopLoad = activeTopLoadRef.current;
  const currentInitialHeaderOffsetY =
    transition || isPendingMainRouteChange
      ? topLoadHeaderOffsetY
      : activeTopLoad.headerOffsetY;
  const currentInitialOffsetY =
    transition || isPendingMainRouteChange
      ? topLoadContentOffsetY
      : activeTopLoad.contentOffsetY;
  const currentChildren = (
    <MainScreenScrollProvider
      key={`main-screen-${activePage}`}
      headerScrollY={sharedScrollY}
      initialHeaderOffsetY={currentInitialHeaderOffsetY}
      initialOffsetY={currentInitialOffsetY}
      scrollY={currentScrollY}
      syncHeader={shouldSyncCurrentHeader}
    >
      {children}
    </MainScreenScrollProvider>
  );
  const outgoingScrollConfig = transition
    ? {
        initialOffsetY: transition.outgoingScrollOffsetY,
        scrollY: transition.outgoingScrollY,
        syncHeader: false,
      }
    : {
        scrollY: frozenHeroScrollY || sharedScrollY,
        syncHeader: false,
      };
  const topScrollConfig = {
    initialHeaderOffsetY: topLoadHeaderOffsetY,
    initialOffsetY: topLoadContentOffsetY,
    scrollY: topPageScrollY,
    syncHeader: false,
  };

  return (
    <View style={frameStyle} {...contentTouchHandlers}>
      {shouldShowDragPreviews ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.layer,
              styles.previewLayer,
              {
                transform: [{ translateX: previousPreviewTranslateX }],
              },
            ]}
          >
            {renderPage(previousPreviewPage, topScrollConfig)}
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.layer,
              styles.previewLayer,
              {
                transform: [{ translateX: nextPreviewTranslateX }],
              },
            ]}
          >
            {renderPage(nextPreviewPage, topScrollConfig)}
          </Animated.View>
        </>
      ) : null}

      <Animated.View
        style={[
          styles.layer,
          styles.currentLayer,
          {
            transform: [{ translateX: currentTranslateX }],
          },
        ]}
      >
        {currentChildren}
      </Animated.View>

      {transition ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.layer,
            styles.outgoingLayer,
            {
              transform: [{ translateX: outgoingTranslateX }],
            },
          ]}
        >
          {renderPage(transition.fromPage, outgoingScrollConfig)}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  frameAboveHeaderHero: {
    zIndex: 200,
    elevation: 200,
  },

  layer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },

  currentLayer: {
    zIndex: 2,
    elevation: 2,
  },

  previewLayer: {
    zIndex: 1,
    elevation: 1,
  },

  outgoingLayer: {
    zIndex: 3,
    elevation: 3,
  },
});
