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
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

import styles from "../styles/headerStyles";
import { useBackgroundHeroState } from "../utils/backgroundHeroStateContext";
import { useHeaderNavigationGate } from "../utils/headerNavigationGate";
import {
  arrowHintPeakOpacity,
  useHeaderSwipe,
} from "../utils/headerSwipeContext";

const navPages = ["home", "products", "aboutus", "contact"];
const indicatorSlideDuration = 130;
const activeTextBaseOffsetY = -3.6;
const heroAnimationScrollDistance = 2000;
const heroFadeScrollDistance = 480;
const heroVerticalFadeScrollDistance = 720;
const heroMinimumScrollOpacity = 0.1;
const heroScrollFreezeProgress =
  heroFadeScrollDistance / heroAnimationScrollDistance;
const heroStartScale = 1.5;
const heroFullScrollScale = 3.05;
const heroStartTranslateY = 74;
const heroFullScrollTranslateY = -56;
const heroVerticalFadeHeight = 430;
const heroVerticalFadeFeatherHeight = 170;
const heroVerticalFadeOverlayOpacity = 1 - heroMinimumScrollOpacity;
const heroVerticalFadeOverlayColor = `rgba(255, 252, 242, ${heroVerticalFadeOverlayOpacity})`;
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
  const canNavigateWithHeader = useHeaderNavigationGate(safeScrollY);
  const heroStateScrollY =
    showHero && backgroundHeroState?.isFrozen && backgroundHeroState?.heroScrollY
      ? backgroundHeroState.heroScrollY
      : safeScrollY;
  const headerMotionScrollY = showOnlyHero ? heroStateScrollY : safeScrollY;

  const fallbackHeldArrowOpacity = useRef(new Animated.Value(0)).current;
  const heldArrowOpacity =
    screenSwipe?.heldArrowOpacity || fallbackHeldArrowOpacity;
  const indicatorProgress = useRef(new Animated.Value(activePageIndex)).current;

  const indicatorAnimationRef = useRef(null);
  const indicatorIndexRef = useRef(activePageIndex);
  const suppressCarouselPressUntilRef = useRef(0);
  const canNavigateWithHeaderRef = useRef(canNavigateWithHeader);

  const activePageRef = useRef(resolvedActivePage);
  const activeIndexRef = useRef(activePageIndex);
  canNavigateWithHeaderRef.current = canNavigateWithHeader;
  activePageRef.current = resolvedActivePage;
  activeIndexRef.current = activePageIndex;

  const showHeldArrows = () => {
    if (screenSwipe?.showHeldArrowHint) {
      screenSwipe.showHeldArrowHint();
      return;
    }

    fallbackHeldArrowOpacity.stopAnimation();
    fallbackHeldArrowOpacity.setValue(arrowHintPeakOpacity);
  };

  const hideHeldArrows = () => {
    if (screenSwipe?.hideHeldArrowHint) {
      screenSwipe.hideHeldArrowHint();
      return;
    }

    fallbackHeldArrowOpacity.stopAnimation();
    fallbackHeldArrowOpacity.setValue(0);
  };

  const updateSwipePreview = (dragDistance) => {
    if (!screenSwipe) return;

    screenSwipe.updateSwipe({
      x: dragDistance,
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

  const animateIndicatorToPage = (pageName) => {
    const pageIndex = navPages.indexOf(pageName);
    if (pageIndex < 0) return;

    animateIndicatorBetweenIndexes(activeIndexRef.current, pageIndex);
  };

  const goToPage = (pageName, animateIndicator = true) => {
    hideHeldArrows();

    if (pageName === activePageRef.current) return;

    const route = pageRoutes[pageName];
    if (!route) return;

    if (navPages.includes(pageName)) {
      if (!canNavigateWithHeaderRef.current?.()) {
        screenSwipe?.clearSwipe({ animate: true });
        return;
      }

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
        canNavigateWithHeaderRef.current?.() &&
        Math.abs(gestureState.dx) > 7.33 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        canNavigateWithHeaderRef.current?.() &&
        Math.abs(gestureState.dx) > 7.33 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

      onPanResponderMove: (_, gestureState) => {
        if (!canNavigateWithHeaderRef.current?.()) return;

        suppressCarouselPressUntilRef.current = Date.now() + 500;
        updateSwipePreview(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        hideHeldArrows();

        if (!canNavigateWithHeaderRef.current?.()) {
          screenSwipe?.clearSwipe({ animate: true });
          return;
        }

        if (gestureState.dx <= -15) {
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

        if (gestureState.dx >= 15) {
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
    hideHeldArrows();

    return () => {
      hideHeldArrows();
    };
  }, [resolvedActivePage, showCarousel, showOnlyHero]);

  const activeLink = pageLabels[resolvedActivePage] || "Home";
  const arrowLinkTranslateX = 0;

  const scrollBeganArrowVisibility = headerMotionScrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const scrolledStateArrowOpacity = Animated.multiply(
    scrollBeganArrowVisibility,
    arrowHintPeakOpacity
  );
  const visibleArrowOpacity = Animated.add(
    heldArrowOpacity,
    scrolledStateArrowOpacity
  );
  const gatedVisibleArrowOpacity = Animated.multiply(
    visibleArrowOpacity.interpolate({
      inputRange: [0, arrowHintPeakOpacity],
      outputRange: [0, arrowHintPeakOpacity],
      extrapolate: "clamp",
    }),
    scrollBeganArrowVisibility
  );

  const heroVerticalFadeTranslateY = heroStateScrollY.interpolate({
    inputRange: [0, heroVerticalFadeScrollDistance],
    outputRange: [heroVerticalFadeHeight, -heroVerticalFadeFeatherHeight],
    extrapolate: "clamp",
  });

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

  const sharedHeaderTouchHandlers = {
    onStartShouldSetResponderCapture: handleCarouselTouchStart,
    onTouchStart: showHeldArrows,
    onTouchEnd: hideHeldArrows,
    onTouchCancel: hideHeldArrows,
  };

  const carousel = (
    <View
      style={styles.carouselShell}
      {...carouselPanResponder.panHandlers}
      {...sharedHeaderTouchHandlers}
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
                  opacity: gatedVisibleArrowOpacity,
                  transform: [
                    { translateX: arrowLinkTranslateX },
                  ],
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
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.88}
              style={[
                styles.carouselActiveText,
                styles.carouselActiveTextLayer,
                {
                  transform: [
                    { translateY: activeTextBaseOffsetY },
                  ],
                },
              ]}
            >
              {activeLink}
            </Text>
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
                  opacity: gatedVisibleArrowOpacity,
                  transform: [
                    { translateX: arrowLinkTranslateX },
                  ],
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
    <View
      style={styles.hero}
      {...carouselPanResponder.panHandlers}
      {...sharedHeaderTouchHandlers}
    >
      <Animated.Image
        source={require("../background1.png")}
        style={[
          styles.heroImage,
          {
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          },
        ]}
        resizeMode="cover"
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.heroVerticalFadePanel,
          {
            transform: [{ translateY: heroVerticalFadeTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 252, 242, 0)", heroVerticalFadeOverlayColor]}
          locations={[0, 1]}
          style={styles.heroVerticalFadeFeather}
        />
        <View
          style={[
            styles.heroVerticalFadeSolid,
            { backgroundColor: heroVerticalFadeOverlayColor },
          ]}
        />
      </Animated.View>
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
