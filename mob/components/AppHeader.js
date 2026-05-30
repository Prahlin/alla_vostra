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
import { useEffect, useRef } from "react";

import styles from "../styles/headerStyles";

const navPages = ["home", "products", "aboutus", "contact"];
const indicatorSlideDuration = 130;
const activeTextBaseOffsetY = -3.6;
const heroAnimationScrollDistance = 2000;
const heroFadeScrollDistance = 480;

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

export default function AppHeader({
  activePage,
  scrollY,
  showCarousel = true,
  showHero = true,
  showOnlyCarousel = false,
  showOnlyHero = false,
}) {
  const pathname = usePathname();
  const resolvedActivePage = activePage || getActivePageFromPath(pathname);
  const { width: windowWidth } = useWindowDimensions();
  const activePageIndex = Math.max(navPages.indexOf(resolvedActivePage), 0);

  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const safeScrollY = scrollY || fallbackScrollY;

  const leftArrowX = useRef(new Animated.Value(0)).current;
  const rightArrowX = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0.15)).current;
  const swipeTextTranslateX = useRef(new Animated.Value(0)).current;
  const indicatorProgress = useRef(new Animated.Value(activePageIndex)).current;
  const routeHeroVisibility = useRef(new Animated.Value(1)).current;

  const arrowLoopRef = useRef(null);
  const indicatorAnimationRef = useRef(null);
  const indicatorIndexRef = useRef(activePageIndex);
  const wasAtTopRef = useRef(true);
  const latestScrollYRef = useRef(0);
  const previousRoutePageRef = useRef(resolvedActivePage);
  const isRouteHeroSuppressedRef = useRef(false);

  const activePageRef = useRef(resolvedActivePage);
  const activeIndexRef = useRef(activePageIndex);

  activePageRef.current = resolvedActivePage;
  activeIndexRef.current = activePageIndex;

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
    swipeTextTranslateX.setValue(0);
  }, [resolvedActivePage, swipeTextTranslateX]);

  useEffect(() => {
    animateIndicatorBetweenIndexes(indicatorIndexRef.current, activePageIndex);
  }, [activePageIndex, indicatorProgress]);

  useEffect(() => {
    if (previousRoutePageRef.current !== resolvedActivePage) {
      if (latestScrollYRef.current >= 120) {
        routeHeroVisibility.stopAnimation();
        routeHeroVisibility.setValue(0);
        isRouteHeroSuppressedRef.current = true;
      }

      previousRoutePageRef.current = resolvedActivePage;
    }
  }, [resolvedActivePage, routeHeroVisibility]);

  const animateIndicatorToPage = (pageName) => {
    const pageIndex = navPages.indexOf(pageName);
    if (pageIndex < 0) return;

    animateIndicatorBetweenIndexes(activeIndexRef.current, pageIndex);
  };

  const goToPage = (pageName, animateIndicator = true) => {
    if (pageName === activePageRef.current) return;

    const route = pageRoutes[pageName];
    if (!route) return;

    if (navPages.includes(pageName)) {
      if (animateIndicator) animateIndicatorToPage(pageName);
      router.replace(route);
      return;
    }

    router.push(route);
  };

  const goToPreviousPage = () => {
    const previousIndex =
      (activeIndexRef.current + navPages.length - 1) % navPages.length;

    goToPage(navPages[previousIndex]);
  };

  const goToNextPage = () => {
    const nextIndex = (activeIndexRef.current + 1) % navPages.length;

    goToPage(navPages[nextIndex]);
  };

  const carouselPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 22 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

      onPanResponderMove: (_, gestureState) => {
        swipeTextTranslateX.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= -45) {
          const nextIndex = (activeIndexRef.current + 1) % navPages.length;
          const nextPage = navPages[nextIndex];

          animateIndicatorToPage(nextPage);

          Animated.timing(swipeTextTranslateX, {
            toValue: -260,
            duration: 210,
            useNativeDriver: true,
          }).start(() => {
            goToPage(nextPage, false);
          });

          return;
        }

        if (gestureState.dx >= 45) {
          const previousIndex =
            (activeIndexRef.current + navPages.length - 1) % navPages.length;
          const previousPage = navPages[previousIndex];

          animateIndicatorToPage(previousPage);

          Animated.timing(swipeTextTranslateX, {
            toValue: 260,
            duration: 210,
            useNativeDriver: true,
          }).start(() => {
            goToPage(previousPage, false);
          });

          return;
        }

        Animated.spring(swipeTextTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 52,
          friction: 7,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(swipeTextTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 52,
          friction: 7,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const startArrowLoop = () => {
      if (arrowLoopRef.current) arrowLoopRef.current.stop();

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
            toValue: 0.45,
            duration: 490,
            useNativeDriver: true,
          }),

          Animated.timing(arrowOpacity, {
            toValue: 0.15,
            duration: 490,
            useNativeDriver: true,
          }),

          Animated.timing(arrowOpacity, {
            toValue: 0.45,
            duration: 490,
            useNativeDriver: true,
          }),

          Animated.timing(arrowOpacity, {
            toValue: 0.15,
            duration: 490,
            useNativeDriver: true,
          }),

          Animated.timing(arrowOpacity, {
            toValue: 0.45,
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

          Animated.delay(500),
        ])
      );

      arrowLoopRef.current.start();
    };

    const stopArrowLoop = () => {
      if (arrowLoopRef.current) arrowLoopRef.current.stop();

      leftArrowX.setValue(0);
      rightArrowX.setValue(0);
      arrowOpacity.setValue(0);
    };

    startArrowLoop();

    const listenerId = safeScrollY.addListener(({ value }) => {
      latestScrollYRef.current = value;
      const isAtTop = value <= 1;

      if (isAtTop && isRouteHeroSuppressedRef.current) {
        isRouteHeroSuppressedRef.current = false;

        Animated.timing(routeHeroVisibility, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      }

      if (!isAtTop && wasAtTopRef.current) {
        wasAtTopRef.current = false;
        stopArrowLoop();
      }

      if (isAtTop && !wasAtTopRef.current) {
        wasAtTopRef.current = true;
        startArrowLoop();
      }
    });

    return () => {
      stopArrowLoop();
      safeScrollY.removeListener(listenerId);
    };
  }, [arrowOpacity, leftArrowX, rightArrowX, routeHeroVisibility, safeScrollY]);

  const activeLink = pageLabels[resolvedActivePage] || "Home";

  const arrowPlacementOpacity = safeScrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const visibleArrowOpacity = Animated.multiply(
    arrowOpacity,
    arrowPlacementOpacity
  );

  const originalHeaderOpacity = safeScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const visibleHeroOpacity = Animated.multiply(
    originalHeaderOpacity,
    routeHeroVisibility
  );

  const stickyOffset =
    Platform.OS === "web"
      ? 0
      : safeScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, 20],
          extrapolate: "clamp",
        });

  const centerShadowOpacity =
    Platform.OS === "web"
      ? 1
      : safeScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

  const heroScale = safeScrollY.interpolate({
    inputRange: [0, heroAnimationScrollDistance],
    outputRange: [1.5, 3.05],
    extrapolate: "clamp",
  });

  const heroTranslateY = safeScrollY.interpolate({
    inputRange: [0, heroAnimationScrollDistance],
    outputRange: [54, -56],
    extrapolate: "clamp",
  });

  const headerTranslateY = safeScrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const indicatorSegmentWidth = windowWidth / navPages.length;
  const indicatorTranslateX = Animated.multiply(
    indicatorProgress,
    indicatorSegmentWidth
  );

  const carousel = (
    <View style={styles.carouselShell} {...carouselPanResponder.panHandlers}>
      <Animated.View style={styles.carouselNavBar}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.carouselStickyExpansion,
            {
              opacity: centerShadowOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.carouselInner,
            {
              transform: [{ translateY: stickyOffset }],
            },
          ]}
        >
          <Pressable onPress={goToPreviousPage}>
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

          <Pressable onPress={goToNextPage} style={styles.carouselActiveWrap}>
            <Animated.Text
              style={[
                styles.carouselActiveText,
                {
                  transform: [
                    { translateX: swipeTextTranslateX },
                    { translateY: activeTextBaseOffsetY },
                  ],
                },
              ]}
            >
              {activeLink}
            </Animated.Text>
          </Pressable>

          <Pressable onPress={goToNextPage}>
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
        source={require("../background3.png")}
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

  if (showOnlyCarousel) return carousel;
  if (showOnlyHero) return hero;

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
