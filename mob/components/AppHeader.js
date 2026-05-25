import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Link, router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";

import styles from "../styles/headerStyles";

const navPages = ["home", "products", "aboutus", "contact"];

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

  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const safeScrollY = scrollY || fallbackScrollY;

  const leftArrowX = useRef(new Animated.Value(0)).current;
  const rightArrowX = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0.15)).current;
  const stickyPadding = useRef(new Animated.Value(0)).current;
  const arrowLoopRef = useRef(null);
  const wasAtTopRef = useRef(true);
  const isStickyRef = useRef(false);

  const activePageRef = useRef(resolvedActivePage);
  const activeIndexRef = useRef(Math.max(navPages.indexOf(resolvedActivePage), 0));

  activePageRef.current = resolvedActivePage;
  activeIndexRef.current = Math.max(navPages.indexOf(resolvedActivePage), 0);

  const goToPage = (pageName) => {
    if (pageName === activePageRef.current) return;

    const route = pageRoutes[pageName];
    if (route) router.push(route);
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

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= -45) {
          goToNextPage();
        }

        if (gestureState.dx >= 45) {
          goToPreviousPage();
        }
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
      if (arrowLoopRef.current) {
        arrowLoopRef.current.stop();
        arrowLoopRef.current = null;
      }

      leftArrowX.setValue(0);
      rightArrowX.setValue(0);
      arrowOpacity.setValue(0);
    };

    const animateStickyPadding = (toValue) => {
      Animated.timing(stickyPadding, {
        toValue,
        duration: 90,
        useNativeDriver: false,
      }).start();
    };

    startArrowLoop();

    const listenerId = safeScrollY.addListener(({ value }) => {
      const isAtTop = value <= 1;
      const shouldBeSticky = value >= 120 && Platform.OS !== "web";

      if (shouldBeSticky !== isStickyRef.current) {
        isStickyRef.current = shouldBeSticky;
        animateStickyPadding(shouldBeSticky ? 20 : 0);
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
  }, [arrowOpacity, leftArrowX, rightArrowX, safeScrollY, stickyPadding]);

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

  const stickyHeight =
    Platform.OS === "web" ? 84 : Animated.add(84, stickyPadding);

  const centerShadowOpacity =
    Platform.OS === "web"
      ? 1
      : stickyPadding.interpolate({
          inputRange: [0, 20],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

  const heroScale = safeScrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [1.5, 3.05],
    extrapolate: "clamp",
  });

  const heroTranslateY = safeScrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [30, -56],
    extrapolate: "clamp",
  });

  const headerTranslateY = safeScrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const carousel = (
    <View style={styles.carouselShell} {...carouselPanResponder.panHandlers}>
      <Animated.View
        style={[
          styles.carouselNavBar,
          Platform.OS !== "web"
            ? {
                height: stickyHeight,
                paddingTop: stickyPadding,
              }
            : null,
        ]}
      >
        <View style={styles.carouselInner}>
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

          <Pressable onPress={goToNextPage}>
            <Text style={styles.carouselActiveText}>{activeLink}</Text>
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
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.carouselCenterShadow,
          {
            opacity: centerShadowOpacity,
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
    </View>
  );

const hero = (
  <View style={styles.hero} {...carouselPanResponder.panHandlers}>
    <Animated.Image
      source={require("../background3.png")}
      style={[
        styles.heroImage,
        {
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
      <View style={styles.orangeBar}>
        <Link href="/" asChild>
          <Pressable style={styles.logoPressable}>
            <Text style={styles.logoText}>Alla Vostra</Text>
          </Pressable>
        </Link>

        <View style={styles.shopButtonWrap}>
          <Link href="/shop" asChild>
            <Pressable style={styles.shopButton}>
              <Text style={styles.shopButtonText}>SHOP</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {showCarousel && carousel}
      {showHero && hero}
    </Animated.View>
  );
}