import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router, usePathname } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "../styles/headerStyles";
import { useBackgroundHeroState } from "../utils/backgroundHeroStateContext";
import { useHeaderSwipe } from "../utils/headerSwipeContext";

const navPages = ["home", "products", "aboutus", "contact"];
const indicatorSlideDuration = 130;
const linkSlideDuration = 210;
const arrowIdleDelay = 3000;
const activeTextBaseOffsetY = -3.6;
const heroAnimationScrollDistance = 2000;
const heroFadeScrollDistance = 480;
const heroMinimumScrollOpacity = 0.1;
const arrowHintPeakOpacity = 0.45;
const heroScrollFreezeProgress =
  heroFadeScrollDistance / heroAnimationScrollDistance;
const heroStartScale = 1.5;
const heroFullScrollScale = 3.05;
const heroStartTranslateY = 74;
const heroFullScrollTranslateY = -56;
const heroScaleAtMinimumOpacity =
  heroStartScale +
  (heroFullScrollScale - heroStartScale) * heroScrollFreezeProgress;
const heroTranslateYAtMinimumOpacity =
  heroStartTranslateY +
  (heroFullScrollTranslateY - heroStartTranslateY) * heroScrollFreezeProgress;
const stickyExpansionMaxHeight = 20;

const pageLabels = {
  home: "Home",
  products: "Products",
  aboutus: "About Us",
  contact: "Contact",
  shop: "Shop",
};

const pageRoutes = {
  home: "/",
  products: "/products",
  aboutus: "/aboutus",
  contact: "/contact",
  shop: "/shop",
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

export default function AppHeader({
  activePage,
  scrollY,
  showCarousel = true,
  showHero = true,
  showOnlyCarousel = false,
  showOnlyHero = false,
}) {
  const pathname = usePathname();
  const backgroundHeroState = useBackgroundHeroState();
  const screenSwipe = useHeaderSwipe();
  const resolvedActivePage = activePage || getActivePageFromPath(pathname);
  const { width: windowWidth } = useWindowDimensions();
  const activePageIndex = Math.max(navPages.indexOf(resolvedActivePage), 0);
  const handlesCarouselVisuals = showCarousel && !showOnlyHero;

  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const safeScrollY = scrollY || fallbackScrollY;
  const heroStateScrollY =
    showHero && backgroundHeroState?.heroScrollY
      ? backgroundHeroState.heroScrollY
      : safeScrollY;
  const headerMotionScrollY = showOnlyHero ? heroStateScrollY : safeScrollY;

  const leftArrowX = useRef(new Animated.Value(0)).current;
  const rightArrowX = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0)).current;
  const heldArrowOpacity = useRef(new Animated.Value(0)).current;
  const fallbackLinkTransitionProgress = useRef(new Animated.Value(0)).current;
  const linkTransitionProgress =
    screenSwipe?.routeTransitionProgress || fallbackLinkTransitionProgress;
  const indicatorProgress = useRef(new Animated.Value(activePageIndex)).current;

  const arrowLoopRef = useRef(null);
  const arrowIdleTimeoutRef = useRef(null);
  const indicatorAnimationRef = useRef(null);
  const linkTransitionAnimationRef = useRef(null);
  const indicatorIndexRef = useRef(activePageIndex);
  const wasAtTopRef = useRef(true);
  const latestScrollYRef = useRef(0);
  const visibleLinkPageRef = useRef(resolvedActivePage);
  const incomingLinkPageRef = useRef(null);
  const pendingLinkTransitionDirectionRef = useRef(null);
  const arrowDismissedForPageRef = useRef(false);
  const suppressCarouselPressUntilRef = useRef(0);

  const activePageRef = useRef(resolvedActivePage);
  const activeIndexRef = useRef(activePageIndex);
  const [linkTransitionState, setLinkTransitionState] = useState({
    visiblePage: resolvedActivePage,
    incomingPage: null,
    direction: 1,
    startX: 0,
  });
  activePageRef.current = resolvedActivePage;
  activeIndexRef.current = activePageIndex;

  const isAtOriginalHeaderState = (scrollValue = latestScrollYRef.current) =>
    scrollValue <= 1;

  const clearArrowIdleTimeout = () => {
    if (arrowIdleTimeoutRef.current) {
      clearTimeout(arrowIdleTimeoutRef.current);
      arrowIdleTimeoutRef.current = null;
    }
  };

  const stopArrowLoop = () => {
    if (arrowLoopRef.current) {
      arrowLoopRef.current.stop();
      arrowLoopRef.current = null;
    }

    leftArrowX.setValue(0);
    rightArrowX.setValue(0);
    arrowOpacity.setValue(0);
  };

  const startArrowLoop = () => {
    if (
      arrowLoopRef.current ||
      arrowDismissedForPageRef.current ||
      !showCarousel ||
      showOnlyHero ||
      !navPages.includes(activePageRef.current) ||
      !isAtOriginalHeaderState()
    ) {
      return;
    }

    leftArrowX.setValue(0);
    rightArrowX.setValue(0);
    arrowOpacity.setValue(0.15);

    arrowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftArrowX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rightArrowX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 0.15,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(arrowOpacity, {
          toValue: arrowHintPeakOpacity,
          duration: 490,
          useNativeDriver: true,
        }),

        Animated.timing(arrowOpacity, {
          toValue: 0.15,
          duration: 490,
          useNativeDriver: true,
        }),

        Animated.timing(arrowOpacity, {
          toValue: arrowHintPeakOpacity,
          duration: 490,
          useNativeDriver: true,
        }),

        Animated.timing(arrowOpacity, {
          toValue: 0.15,
          duration: 490,
          useNativeDriver: true,
        }),

        Animated.timing(arrowOpacity, {
          toValue: arrowHintPeakOpacity,
          duration: 490,
          useNativeDriver: true,
        }),

        Animated.parallel([
          Animated.timing(arrowOpacity, {
            toValue: 0,
            duration: 665,
            useNativeDriver: true,
          }),
          Animated.timing(leftArrowX, {
            toValue: -120,
            duration: 665,
            useNativeDriver: true,
          }),
          Animated.timing(rightArrowX, {
            toValue: 120,
            duration: 665,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(arrowIdleDelay),
      ])
    );

    arrowLoopRef.current.start();
  };

  const scheduleArrowIdleHint = () => {
    if (
      arrowIdleTimeoutRef.current ||
      arrowDismissedForPageRef.current ||
      arrowLoopRef.current ||
      !showCarousel ||
      showOnlyHero ||
      !navPages.includes(activePageRef.current) ||
      !isAtOriginalHeaderState()
    ) {
      return;
    }

    arrowIdleTimeoutRef.current = setTimeout(() => {
      arrowIdleTimeoutRef.current = null;
      startArrowLoop();
    }, arrowIdleDelay);
  };

  const dismissArrowHint = () => {
    arrowDismissedForPageRef.current = true;
    clearArrowIdleTimeout();
    stopArrowLoop();
  };

  const showHeldArrows = () => {
    dismissArrowHint();
    heldArrowOpacity.stopAnimation();
    heldArrowOpacity.setValue(arrowHintPeakOpacity);
  };

  const hideHeldArrows = () => {
    heldArrowOpacity.stopAnimation();
    heldArrowOpacity.setValue(0);
  };

  const resetArrowHintForPage = () => {
    clearArrowIdleTimeout();
    stopArrowLoop();
    hideHeldArrows();
    arrowDismissedForPageRef.current = false;

    const currentScrollValue =
      typeof safeScrollY?.__getValue === "function"
        ? safeScrollY.__getValue()
        : latestScrollYRef.current;

    latestScrollYRef.current = currentScrollValue;
    wasAtTopRef.current = isAtOriginalHeaderState(currentScrollValue);
    scheduleArrowIdleHint();
  };

  const updateSwipePreview = (dragDistance) => {
    if (!screenSwipe) return;

    screenSwipe.updateSwipe({
      x: incomingLinkPageRef.current ? 0 : dragDistance,
    });
  };

  const animateIndicatorBetweenIndexes = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    if (indicatorAnimationRef.current) {
      indicatorAnimationRef.current.stop();
    }

    indicatorIndexRef.current = toIndex;

    const createIndicatorTiming = (toValue, duration = indicatorSlideDuration) =>
      Animated.timing(indicatorProgress, {
        toValue,
        duration,
        useNativeDriver: true,
      });

    const lastPageIndex = navPages.length - 1;
    const animation =
      fromIndex === lastPageIndex && toIndex === 0
        ? Animated.sequence([
            createIndicatorTiming(navPages.length),
            createIndicatorTiming(-1, 0),
            createIndicatorTiming(toIndex),
          ])
        : fromIndex === 0 && toIndex === lastPageIndex
        ? Animated.sequence([
            createIndicatorTiming(-1),
            createIndicatorTiming(navPages.length, 0),
            createIndicatorTiming(toIndex),
          ])
        : createIndicatorTiming(toIndex);

    indicatorAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        indicatorIndexRef.current = toIndex;
      }

      if (indicatorAnimationRef.current === animation) {
        indicatorAnimationRef.current = null;
      }
    });
  };

  useEffect(() => {
    animateIndicatorBetweenIndexes(indicatorIndexRef.current, activePageIndex);
  }, [activePageIndex, indicatorProgress]);

  useLayoutEffect(() => {
    const currentVisiblePage = visibleLinkPageRef.current;

    if (
      currentVisiblePage === resolvedActivePage &&
      !incomingLinkPageRef.current
    ) {
      return;
    }

    if (!navPages.includes(resolvedActivePage)) {
      if (linkTransitionAnimationRef.current) {
        linkTransitionAnimationRef.current.stop();
        linkTransitionAnimationRef.current = null;
      }

      visibleLinkPageRef.current = resolvedActivePage;
      incomingLinkPageRef.current = null;
      pendingLinkTransitionDirectionRef.current = null;
      if (handlesCarouselVisuals) screenSwipe?.clearSwipe();
      linkTransitionProgress.setValue(0);
      setLinkTransitionState({
        visiblePage: resolvedActivePage,
        incomingPage: null,
        direction: 1,
        startX: 0,
      });
      return;
    }

    const committedSwipe = handlesCarouselVisuals
      ? screenSwipe?.consumeCommit(resolvedActivePage, currentVisiblePage)
      : null;
    const transitionDirection =
      committedSwipe?.direction ||
      pendingLinkTransitionDirectionRef.current ||
      getNavigationDirection(currentVisiblePage, resolvedActivePage);

    pendingLinkTransitionDirectionRef.current = null;

    if (linkTransitionAnimationRef.current) {
      linkTransitionAnimationRef.current.stop();
      linkTransitionAnimationRef.current = null;
    }

    const transitionStartX =
      committedSwipe?.x ||
      (handlesCarouselVisuals ? screenSwipe?.currentXRef.current : 0) ||
      0;

    if (handlesCarouselVisuals && screenSwipe) {
      screenSwipe.currentXRef.current = 0;
    }

    incomingLinkPageRef.current = resolvedActivePage;
    setLinkTransitionState({
      visiblePage: currentVisiblePage,
      incomingPage: resolvedActivePage,
      direction: transitionDirection,
      startX: transitionStartX,
    });
    linkTransitionProgress.setValue(0);

    const finishLinkTransition = ({ shouldResetProgress = false } = {}) => {
      visibleLinkPageRef.current = resolvedActivePage;
      incomingLinkPageRef.current = null;
      if (handlesCarouselVisuals) screenSwipe?.clearSwipe();
      screenSwipe?.clearCommit(committedSwipe?.id);
      if (shouldResetProgress) linkTransitionProgress.setValue(0);
      setLinkTransitionState({
        visiblePage: resolvedActivePage,
        incomingPage: null,
        direction: transitionDirection,
        startX: 0,
      });
    };

    if (screenSwipe?.startRouteTransition) {
      screenSwipe.startRouteTransition({
        key: `${currentVisiblePage}->${resolvedActivePage}`,
        duration: linkSlideDuration,
        onFinish: finishLinkTransition,
      });
      return;
    }

    const animation = Animated.timing(linkTransitionProgress, {
      toValue: 1,
      duration: linkSlideDuration,
      useNativeDriver: true,
    });

    linkTransitionAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        finishLinkTransition({ shouldResetProgress: true });
      }

      if (linkTransitionAnimationRef.current === animation) {
        linkTransitionAnimationRef.current = null;
      }
    });
  }, [linkTransitionProgress, resolvedActivePage]);

  const animateIndicatorToPage = (pageName) => {
    const pageIndex = navPages.indexOf(pageName);
    if (pageIndex < 0) return;

    animateIndicatorBetweenIndexes(activeIndexRef.current, pageIndex);
  };

  const goToPage = (
    pageName,
    animateIndicator = true,
    linkTransitionDirection = null
  ) => {
    dismissArrowHint();
    hideHeldArrows();

    if (pageName === activePageRef.current) return;

    const route = pageRoutes[pageName];
    if (!route) return;

    if (navPages.includes(pageName)) {
      pendingLinkTransitionDirectionRef.current =
        linkTransitionDirection ||
        getNavigationDirection(activePageRef.current, pageName);

      backgroundHeroState?.freezeHero(safeScrollY);
      if (animateIndicator) animateIndicatorToPage(pageName);
      router.replace(route);
      return;
    }

    router.push(route);
  };

  const goToPreviousPage = () => {
    if (Date.now() < suppressCarouselPressUntilRef.current) return;

    const previousIndex =
      (activeIndexRef.current + navPages.length - 1) % navPages.length;

    goToPage(navPages[previousIndex], true, -1);
  };

  const goToNextPage = () => {
    if (Date.now() < suppressCarouselPressUntilRef.current) return;

    const nextIndex = (activeIndexRef.current + 1) % navPages.length;

    goToPage(navPages[nextIndex], true, 1);
  };

  const carouselPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 22 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        Math.abs(gestureState.dx) > 22 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

      onPanResponderMove: (_, gestureState) => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        updateSwipePreview(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        hideHeldArrows();

        if (gestureState.dx <= -45) {
          const nextIndex = (activeIndexRef.current + 1) % navPages.length;
          const nextPage = navPages[nextIndex];

          updateSwipePreview(gestureState.dx);
          screenSwipe?.commitSwipe({
            x: gestureState.dx,
            page: nextPage,
            direction: 1,
            fromPage: activePageRef.current,
          });
          goToPage(nextPage, true, 1);

          return;
        }

        if (gestureState.dx >= 45) {
          const previousIndex =
            (activeIndexRef.current + navPages.length - 1) % navPages.length;
          const previousPage = navPages[previousIndex];

          updateSwipePreview(gestureState.dx);
          screenSwipe?.commitSwipe({
            x: gestureState.dx,
            page: previousPage,
            direction: -1,
            fromPage: activePageRef.current,
          });
          goToPage(previousPage, true, -1);

          return;
        }

        screenSwipe?.clearSwipe({ animate: true });
      },

      onPanResponderTerminate: () => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        hideHeldArrows();
        screenSwipe?.clearSwipe({ animate: true });
      },
    })
  ).current;

  useEffect(() => {
    const listenerId = safeScrollY.addListener(({ value }) => {
      latestScrollYRef.current = value;
      const isAtTop = value <= 1;

      if (!isAtTop) {
        wasAtTopRef.current = false;
        clearArrowIdleTimeout();
        stopArrowLoop();
      }

      if (isAtTop && !wasAtTopRef.current) {
        wasAtTopRef.current = true;
        scheduleArrowIdleHint();
      }

      if (isAtTop) scheduleArrowIdleHint();
    });

    return () => {
      clearArrowIdleTimeout();
      stopArrowLoop();
      safeScrollY.removeListener(listenerId);
    };
  }, [safeScrollY]);

  useEffect(() => {
    resetArrowHintForPage();

    return () => {
      clearArrowIdleTimeout();
      stopArrowLoop();
    };
  }, [resolvedActivePage, showCarousel, showOnlyHero]);

  const activeLink = pageLabels[linkTransitionState.visiblePage] || "Home";
  const incomingLink = linkTransitionState.incomingPage
    ? pageLabels[linkTransitionState.incomingPage] || "Home"
    : null;
  const visibleLinkPageIndex = Math.max(
    navPages.indexOf(linkTransitionState.visiblePage),
    0
  );
  const previousDragPage =
    navPages[(visibleLinkPageIndex + navPages.length - 1) % navPages.length];
  const nextDragPage = navPages[(visibleLinkPageIndex + 1) % navPages.length];
  const previousDragLink = pageLabels[previousDragPage] || "Home";
  const nextDragLink = pageLabels[nextDragPage] || "Home";
  const dragTranslateX =
    handlesCarouselVisuals && screenSwipe ? screenSwipe.swipeX : 0;
  const linkSlideDistance = windowWidth;
  const outgoingLinkTranslateX = linkTransitionState.incomingPage
    ? linkTransitionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          linkTransitionState.startX,
          -linkTransitionState.direction * linkSlideDistance,
        ],
        extrapolate: "clamp",
      })
    : dragTranslateX;
  const incomingLinkTranslateX = linkTransitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      linkTransitionState.startX +
        linkTransitionState.direction * linkSlideDistance,
      0,
    ],
    extrapolate: "clamp",
  });
  const previousDragTranslateX = Animated.add(
    dragTranslateX,
    -linkSlideDistance
  );
  const nextDragTranslateX = Animated.add(dragTranslateX, linkSlideDistance);

  const arrowPlacementOpacity = safeScrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const visibleArrowOpacity = Animated.multiply(
    Animated.add(arrowOpacity, heldArrowOpacity).interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    arrowPlacementOpacity
  );

  const originalHeaderOpacity = heroStateScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [1, heroMinimumScrollOpacity],
    extrapolate: "clamp",
  });

  const visibleHeroOpacity = originalHeaderOpacity;

  const stickyOffset =
    Platform.OS === "web"
      ? 0
      : headerMotionScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, 20],
          extrapolate: "clamp",
        });

  const centerShadowOpacity =
    Platform.OS === "web"
      ? 1
      : headerMotionScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

  const stickyExpansionTranslateY = headerMotionScrollY.interpolate({
    inputRange: [96, 120],
    outputRange: [-stickyExpansionMaxHeight, 0],
    extrapolate: "clamp",
  });

  const heroScale = heroStateScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [heroStartScale, heroScaleAtMinimumOpacity],
    extrapolate: "clamp",
  });

  const heroTranslateY = heroStateScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [heroStartTranslateY, heroTranslateYAtMinimumOpacity],
    extrapolate: "clamp",
  });

  const headerTranslateY = headerMotionScrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const indicatorSegmentWidth = windowWidth / navPages.length;
  const indicatorTranslateX = Animated.multiply(
    indicatorProgress,
    indicatorSegmentWidth
  );

  const handleCarouselTouchStart = () => {
    showHeldArrows();
    return false;
  };

  const carousel = (
    <View
      style={styles.carouselShell}
      {...carouselPanResponder.panHandlers}
      onStartShouldSetResponderCapture={handleCarouselTouchStart}
      onTouchStart={showHeldArrows}
      onTouchEnd={hideHeldArrows}
      onTouchCancel={hideHeldArrows}
    >
      <Animated.View style={styles.carouselNavBar}>
        <View style={styles.carouselStickyExpansion}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.carouselStickyExpansionFill,
              {
                transform: [{ translateY: stickyExpansionTranslateY }],
              },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.carouselInner,
            {
              transform: [{ translateY: stickyOffset }],
            },
          ]}
        >
          <Pressable
            onPress={goToPreviousPage}
            onPressIn={showHeldArrows}
            onPressOut={hideHeldArrows}
          >
            <Animated.View
              style={[
                styles.arrowBox,
                {
                  opacity: visibleArrowOpacity,
                  transform: [{ translateX: leftArrowX }],
                },
              ]}
            >
              <View style={[styles.arrowChevron, styles.arrowChevronLeft]} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={goToNextPage}
            onPressIn={showHeldArrows}
            onPressOut={hideHeldArrows}
            style={styles.carouselActiveWrap}
          >
            <Animated.Text
              style={[
                styles.carouselActiveText,
                styles.carouselActiveTextLayer,
                {
                  transform: [
                    { translateX: outgoingLinkTranslateX },
                    { translateY: activeTextBaseOffsetY },
                  ],
                },
              ]}
            >
              {activeLink}
            </Animated.Text>

            {incomingLink ? (
              <Animated.Text
                style={[
                  styles.carouselActiveText,
                  styles.carouselActiveTextLayer,
                  {
                    transform: [
                      { translateX: incomingLinkTranslateX },
                      { translateY: activeTextBaseOffsetY },
                    ],
                  },
                ]}
              >
                {incomingLink}
              </Animated.Text>
            ) : null}

            {!incomingLink && handlesCarouselVisuals ? (
              <>
                <Animated.Text
                  style={[
                    styles.carouselActiveText,
                    styles.carouselActiveTextLayer,
                    {
                      transform: [
                        { translateX: previousDragTranslateX },
                        { translateY: activeTextBaseOffsetY },
                      ],
                    },
                  ]}
                >
                  {previousDragLink}
                </Animated.Text>

                <Animated.Text
                  style={[
                    styles.carouselActiveText,
                    styles.carouselActiveTextLayer,
                    {
                      transform: [
                        { translateX: nextDragTranslateX },
                        { translateY: activeTextBaseOffsetY },
                      ],
                    },
                  ]}
                >
                  {nextDragLink}
                </Animated.Text>
              </>
            ) : null}
          </Pressable>

          <Pressable
            onPress={goToNextPage}
            onPressIn={showHeldArrows}
            onPressOut={hideHeldArrows}
          >
            <Animated.View
              style={[
                styles.arrowBox,
                {
                  opacity: visibleArrowOpacity,
                  transform: [{ translateX: rightArrowX }],
                },
              ]}
            >
              <View style={[styles.arrowChevron, styles.arrowChevronRight]} />
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.carouselIndicatorSeparator,
            {
              transform: [{ translateY: stickyOffset }],
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.carouselIndicatorBar,
            {
              transform: [{ translateY: stickyOffset }],
            },
          ]}
        >
          <View style={styles.carouselIndicatorTrack}>
            {navPages.map((pageName) => (
              <View
                key={`carousel-indicator-track-${pageName}`}
                style={styles.carouselIndicatorSegment}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.carouselIndicatorActiveSegment,
              {
                width: indicatorSegmentWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

    </View>
  );

  const centerShadow = (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.headerCenterShadow,
        {
          opacity: centerShadowOpacity,
          transform: [{ translateY: stickyOffset }],
        },
      ]}
    >
      {Platform.OS !== "web" && (
        <>
          {Array.from({ length: 36 }, (_, index) => (
            <View
              key={`center-shadow-layer-${index + 1}`}
              style={styles[`centerShadowLayer${index + 1}`]}
            />
          ))}
        </>
      )}
    </Animated.View>
  );

  const hero = (
    <View style={styles.hero} {...carouselPanResponder.panHandlers}>
      <Animated.Image
        source={require("../background1.png")}
        style={[
          styles.heroImage,
          {
            opacity: visibleHeroOpacity,
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );

  const heroOnlyLayer = (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      {centerShadow}
      <View style={styles.heroOnlySpacer} />
      {hero}
    </Animated.View>
  );

  if (showOnlyCarousel) return carousel;
  if (showOnlyHero) return heroOnlyLayer;

  return (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      <Animated.View style={styles.orangeBar}>
        <Pressable style={styles.logoPressable} onPress={() => goToPage("home")}>
          <Text style={styles.logoText}>Alla Vostra</Text>
        </Pressable>

        <Pressable style={styles.shopButtonWrap} onPress={() => goToPage("shop")}>
          <View style={styles.shopButton}>
            <Text style={styles.shopButtonText}>SHOP</Text>
          </View>
        </Pressable>
      </Animated.View>

      {showCarousel && showHero && centerShadow}
      {showCarousel && carousel}
      {showHero && hero}
    </Animated.View>
  );
}
