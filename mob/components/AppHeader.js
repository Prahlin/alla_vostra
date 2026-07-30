import {
  Animated,
  Image,
  PanResponder,
  Platform,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
import styles from "../styles/headerStyles";
import { useBackgroundHeroState } from "../utils/backgroundHeroStateContext";
import {
  isHeaderNewState,
  readAnimatedValue,
  useHeaderNavigationGate,
} from "../utils/headerNavigationGate";
import {
  arrowHintPeakOpacity,
  useHeaderSwipe,
} from "../utils/headerSwipeContext";

const navPages = ["home", "products", "aboutus", "contact"];
const indicatorSlideDuration = 130;
const activeTextBaseOffsetY = Platform.select({
  ios: -10.5,
  default: -3.6,
});
const heroAnimationScrollDistance = 2000;
const heroFadeScrollDistance = 480;
const heroVerticalFadeScrollDistance = 720;
const heroMinimumScrollOpacity = 0.08;
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
const noCheeseboardHeroImage = require("../background1_no_cheeseboard.png");
const defaultHeroImage = require("../background1.png");
const cheeseboardProductsImage = require("../cheeseboard_products.png");
const heroSourceWidth = 1234;
const heroSourceHeight = 1800;
const noCheeseboardVisibleBottomSourceY = 852;
const cheeseboardSourceX = 415;
const cheeseboardSourceY = 748;
const cheeseboardSourceWidth = 405;
const cheeseboardSourceHeight = 250;
const heroScaleAtMinimumOpacity =
  heroStartScale +
  (heroFullScrollScale - heroStartScale) * heroScrollFreezeProgress;
const heroTranslateYAtMinimumOpacity =
  heroStartTranslateY +
  (heroFullScrollTranslateY - heroStartTranslateY) * heroScrollFreezeProgress;
const carouselBaseHeight = 84;
const carouselExpandedHeight = Platform.OS === "ios" ? 104 : 84;
const carouselExpansionHeight = carouselExpandedHeight - carouselBaseHeight;
const carouselStickyOffsetY = Platform.OS === "ios" ? 0 : 20;
const stickyExpansionMaxHeight = Math.max(
  carouselExpansionHeight,
  carouselStickyOffsetY
);
const tapHoldHorizontalCancelDistance = Platform.OS === "ios" ? 11 : 4;
const tapHoldHorizontalDominanceRatio = Platform.OS === "ios" ? 1.08 : 0.7;
const carouselSwipeActivationDistance = Platform.OS === "ios" ? 20 : 8;
const carouselSwipeActivationRatio = Platform.OS === "ios" ? 1.5 : 1.05;
const carouselSwipeCommitDistance = Platform.OS === "ios" ? 60 : 28;

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
  dimHeaderExceptShopButton = false,
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
  const frozenHeroMotionScrollY = useRef(new Animated.Value(0)).current;
  const frozenHeaderMotionScrollY = useRef(new Animated.Value(0)).current;
  const shouldFreezeHeaderMotion = Boolean(
    screenSwipe?.isActive || screenSwipe?.routeTransitionState?.isActive
  );
  const previousShouldFreezeHeaderMotionRef = useRef(false);

  useEffect(() => {
    if (
      shouldFreezeHeaderMotion &&
      !previousShouldFreezeHeaderMotionRef.current
    ) {
      frozenHeroMotionScrollY.setValue(readAnimatedValue(heroStateScrollY));
      frozenHeaderMotionScrollY.setValue(readAnimatedValue(headerMotionScrollY));
    }

    previousShouldFreezeHeaderMotionRef.current = shouldFreezeHeaderMotion;
  }, [
    frozenHeroMotionScrollY,
    frozenHeaderMotionScrollY,
    headerMotionScrollY,
    heroStateScrollY,
    shouldFreezeHeaderMotion,
  ]);

  const resolvedHeroMotionScrollY = shouldFreezeHeaderMotion
    ? frozenHeroMotionScrollY
    : heroStateScrollY;
  const resolvedHeaderMotionScrollY = shouldFreezeHeaderMotion
    ? frozenHeaderMotionScrollY
    : headerMotionScrollY;

  const fallbackHeldArrowOpacity = useRef(new Animated.Value(0)).current;
  const fallbackRouteTransitionProgress = useRef(
    new Animated.Value(0)
  ).current;
  const heldArrowOpacity =
    screenSwipe?.heldArrowOpacity || fallbackHeldArrowOpacity;
  const routeTransitionProgress =
    screenSwipe?.routeTransitionProgress || fallbackRouteTransitionProgress;
  const indicatorProgress = useRef(new Animated.Value(activePageIndex)).current;
  const fallbackDirectionalLeftArrowOpacity = useRef(
    new Animated.Value(0)
  ).current;
  const fallbackDirectionalRightArrowOpacity = useRef(
    new Animated.Value(0)
  ).current;
  const fallbackDirectionalArrowBaseSuppression = useRef(
    new Animated.Value(0)
  ).current;
  const directionalLeftArrowOpacity =
    screenSwipe?.directionalLeftArrowOpacity ||
    fallbackDirectionalLeftArrowOpacity;
  const directionalRightArrowOpacity =
    screenSwipe?.directionalRightArrowOpacity ||
    fallbackDirectionalRightArrowOpacity;
  const directionalArrowBaseSuppression =
    screenSwipe?.directionalArrowBaseSuppression ||
    fallbackDirectionalArrowBaseSuppression;

  const indicatorAnimationRef = useRef(null);
  const indicatorIndexRef = useRef(activePageIndex);
  const suppressCarouselPressUntilRef = useRef(0);
  const canNavigateWithHeaderRef = useRef(canNavigateWithHeader);

  const activePageRef = useRef(resolvedActivePage);
  const activeIndexRef = useRef(activePageIndex);
  canNavigateWithHeaderRef.current = canNavigateWithHeader;
  activePageRef.current = resolvedActivePage;
  activeIndexRef.current = activePageIndex;

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const resolvedCheeseboardImage = Image.resolveAssetSource(
      cheeseboardProductsImage
    );

    if (resolvedCheeseboardImage?.uri) {
      Image.prefetch(resolvedCheeseboardImage.uri).catch(() => {});
    }
  }, []);

  const showHeldArrows = (event = null) => {
    if (screenSwipe?.showHeldArrowHint) {
      screenSwipe.showHeldArrowHint(event);
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

  const cancelHeldArrows = () => {
    if (screenSwipe?.cancelHeldArrowHint) {
      screenSwipe.cancelHeldArrowHint();
      return;
    }

    hideHeldArrows();
  };

  const updateHeldArrowsFromTouchMove = (event) => {
    screenSwipe?.updateHeldArrowHintMovement?.(event);
    return false;
  };

  const clearDirectionalArrowLinger = () => {
    if (screenSwipe?.clearDirectionalArrowLinger) {
      screenSwipe.clearDirectionalArrowLinger();
      return;
    }

    fallbackDirectionalLeftArrowOpacity.stopAnimation();
    fallbackDirectionalRightArrowOpacity.stopAnimation();
    fallbackDirectionalArrowBaseSuppression.stopAnimation();
    fallbackDirectionalLeftArrowOpacity.setValue(0);
    fallbackDirectionalRightArrowOpacity.setValue(0);
    fallbackDirectionalArrowBaseSuppression.setValue(0);
  };

  const startDirectionalArrowLinger = (direction) => {
    if (screenSwipe?.startDirectionalArrowLinger) {
      screenSwipe.startDirectionalArrowLinger(direction);
      return;
    }

    fallbackDirectionalLeftArrowOpacity.stopAnimation();
    fallbackDirectionalRightArrowOpacity.stopAnimation();
    fallbackDirectionalArrowBaseSuppression.stopAnimation();
    fallbackDirectionalArrowBaseSuppression.setValue(1);
    fallbackDirectionalLeftArrowOpacity.setValue(
      direction === "left" ? arrowHintPeakOpacity : 0
    );
    fallbackDirectionalRightArrowOpacity.setValue(
      direction === "right" ? arrowHintPeakOpacity : 0
    );
  };

  const updateSwipePreview = (dragDistance) => {
    if (!screenSwipe) return;

    screenSwipe.updateSwipe({
      x: dragDistance,
    });
  };

  const animateIndicatorBetweenIndexes = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) {
      if (!indicatorAnimationRef.current) {
        clearDirectionalArrowLinger();
      }
      return;
    }

    if (indicatorAnimationRef.current) {
      const previousAnimation = indicatorAnimationRef.current;
      indicatorAnimationRef.current = null;
      previousAnimation.stop();
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
        clearDirectionalArrowLinger();
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

    if (pageName === activePageRef.current) {
      if (pageName === "shop") {
        goToPage("home", animateIndicator);
      }

      return;
    }

    const route = pageRoutes[pageName];
    if (!route) return;

    if (navPages.includes(pageName)) {
      if (!canNavigateWithHeaderRef.current?.()) {
        clearDirectionalArrowLinger();
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

  const shouldClaimCarouselSwipe = (_, gestureState) => {
    if (!canNavigateWithHeaderRef.current?.()) return false;

    const horizontalDistance = Math.abs(gestureState.dx);
    const verticalDistance = Math.abs(gestureState.dy);

    if (
      horizontalDistance >= tapHoldHorizontalCancelDistance &&
      horizontalDistance > verticalDistance * tapHoldHorizontalDominanceRatio
    ) {
      cancelHeldArrows();
    }

    const shouldClaim =
      horizontalDistance > carouselSwipeActivationDistance &&
      horizontalDistance > verticalDistance * carouselSwipeActivationRatio;

    if (shouldClaim) {
      cancelHeldArrows();
    }

    return shouldClaim;
  };

  const carouselPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: shouldClaimCarouselSwipe,

      onMoveShouldSetPanResponderCapture: shouldClaimCarouselSwipe,

      onPanResponderTerminationRequest: (_, gestureState) =>
        !shouldClaimCarouselSwipe(null, gestureState),

      onPanResponderMove: (_, gestureState) => {
        if (!canNavigateWithHeaderRef.current?.()) return;

        suppressCarouselPressUntilRef.current = Date.now() + 500;
        updateSwipePreview(gestureState.dx);

        if (gestureState.dx <= -carouselSwipeCommitDistance) {
          startDirectionalArrowLinger("left");
          return;
        }

        if (gestureState.dx >= carouselSwipeCommitDistance) {
          startDirectionalArrowLinger("right");
          return;
        }

        clearDirectionalArrowLinger();
      },

      onPanResponderRelease: (_, gestureState) => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        hideHeldArrows();

        if (!canNavigateWithHeaderRef.current?.()) {
          clearDirectionalArrowLinger();
          screenSwipe?.clearSwipe({ animate: true });
          return;
        }

        if (gestureState.dx <= -carouselSwipeCommitDistance) {
          const nextIndex = (activeIndexRef.current + 1) % navPages.length;
          const nextPage = navPages[nextIndex];

          updateSwipePreview(gestureState.dx);
          screenSwipe?.commitSwipe({
            x: gestureState.dx,
            page: nextPage,
            direction: 1,
            fromPage: activePageRef.current,
          });
          startDirectionalArrowLinger("left");
          goToPage(nextPage, true, 1);

          return;
        }

        if (gestureState.dx >= carouselSwipeCommitDistance) {
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
          startDirectionalArrowLinger("right");
          goToPage(previousPage, true, -1);

          return;
        }

        clearDirectionalArrowLinger();
        screenSwipe?.clearSwipe({ animate: true });
      },

      onPanResponderTerminate: () => {
        suppressCarouselPressUntilRef.current = Date.now() + 500;
        hideHeldArrows();
        clearDirectionalArrowLinger();
        screenSwipe?.clearSwipe({ animate: true });
      },

      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  useEffect(() => {
    hideHeldArrows();

    return () => {
      hideHeldArrows();
    };
  }, [resolvedActivePage, showCarousel, showOnlyHero]);

  useEffect(
    () => () => {
      clearDirectionalArrowLinger();
    },
    []
  );

  const activeLink = pageLabels[resolvedActivePage] || "Home";
  const arrowLinkTranslateX = 0;

  const scrollBeganArrowVisibility = resolvedHeaderMotionScrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const oldHeaderArrowVisibility = resolvedHeaderMotionScrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const oldHeaderHeldArrowOpacity = Animated.multiply(
    heldArrowOpacity.interpolate({
      inputRange: [0, arrowHintPeakOpacity],
      outputRange: [0, arrowHintPeakOpacity],
      extrapolate: "clamp",
    }),
    oldHeaderArrowVisibility
  );
  const scrolledStateArrowOpacity = Animated.multiply(
    scrollBeganArrowVisibility,
    arrowHintPeakOpacity
  );
  const scrolledVisibleArrowOpacity = Animated.add(
    heldArrowOpacity,
    scrolledStateArrowOpacity
  );
  const gatedScrolledArrowOpacity = Animated.multiply(
    scrolledVisibleArrowOpacity.interpolate({
      inputRange: [0, arrowHintPeakOpacity],
      outputRange: [0, arrowHintPeakOpacity],
      extrapolate: "clamp",
    }),
    scrollBeganArrowVisibility
  );
  const gatedVisibleArrowOpacity = Animated.add(
    oldHeaderHeldArrowOpacity,
    gatedScrolledArrowOpacity
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const directionalBaseArrowOpacity = Animated.multiply(
    gatedVisibleArrowOpacity,
    directionalArrowBaseSuppression.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })
  );
  const leftArrowOpacity = Animated.add(
    directionalBaseArrowOpacity,
    directionalLeftArrowOpacity
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const rightArrowOpacity = Animated.add(
    directionalBaseArrowOpacity,
    directionalRightArrowOpacity
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const heroVerticalFadeTranslateY = resolvedHeroMotionScrollY.interpolate({
    inputRange: [0, heroVerticalFadeScrollDistance],
    outputRange: [heroVerticalFadeHeight, -heroVerticalFadeFeatherHeight],
    extrapolate: "clamp",
  });

  const stickyOffset =
    Platform.OS === "web"
      ? 0
      : resolvedHeaderMotionScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, carouselStickyOffsetY],
          extrapolate: "clamp",
        });
  const carouselExpansionOffsetY =
    Platform.OS === "ios"
      ? resolvedHeaderMotionScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, carouselExpansionHeight],
          extrapolate: "clamp",
        })
      : stickyOffset;
  const carouselInnerTranslateY = carouselExpansionOffsetY;
  const centerShadowOpacity =
    Platform.OS === "web"
      ? 1
      : resolvedHeaderMotionScrollY.interpolate({
          inputRange: [96, 120],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

  const stickyExpansionTranslateY = resolvedHeaderMotionScrollY.interpolate({
    inputRange: [96, 120],
    outputRange: [-stickyExpansionMaxHeight, 0],
    extrapolate: "clamp",
  });

  const heroScale = resolvedHeroMotionScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [heroStartScale, heroScaleAtMinimumOpacity],
    extrapolate: "clamp",
  });

  const heroTranslateY = resolvedHeroMotionScrollY.interpolate({
    inputRange: [0, heroFadeScrollDistance],
    outputRange: [heroStartTranslateY, heroTranslateYAtMinimumOpacity],
    extrapolate: "clamp",
  });

  const headerTranslateY = resolvedHeaderMotionScrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const indicatorSegmentWidth = windowWidth / navPages.length;
  const indicatorTranslateX = Animated.multiply(
    indicatorProgress,
    indicatorSegmentWidth
  );
  const isMainHeroPage = navPages.includes(resolvedActivePage);
  const heroImageSource = isMainHeroPage
    ? noCheeseboardHeroImage
    : defaultHeroImage;
  const mainHeroVisualOpacity = isMainHeroPage
    ? resolvedHeroMotionScrollY.interpolate({
        inputRange: [0, heroFadeScrollDistance],
        outputRange: [1, heroMinimumScrollOpacity],
        extrapolate: "clamp",
      })
    : 1;
  const heroWidthFitScale = windowWidth / heroSourceWidth;
  const heroWidthFitImageHeight = heroSourceHeight * heroWidthFitScale;
  const heroImageFrameStyle = isMainHeroPage
    ? {
        width: windowWidth,
        height: heroWidthFitImageHeight,
      }
    : null;
  const heroImageTransformStyle = isMainHeroPage
    ? null
    : {
        transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
      };
  const heroImageOpacityStyle = isMainHeroPage
    ? { opacity: mainHeroVisualOpacity }
    : null;
  const heroCoverScale = Math.max(
    windowWidth / heroSourceWidth,
    heroVerticalFadeHeight / heroSourceHeight
  );
  const heroLayoutScale = isMainHeroPage ? heroWidthFitScale : heroCoverScale;
  const heroRenderedWidth = heroSourceWidth * heroLayoutScale;
  const heroRenderedHeight = heroSourceHeight * heroLayoutScale;
  const heroRenderedLeft = (windowWidth - heroRenderedWidth) / 2;
  const heroRenderedTop = isMainHeroPage
    ? 0
    : (heroVerticalFadeHeight - heroRenderedHeight) / 2;
  const noCheeseboardVisibleBottomY = Math.min(
    heroVerticalFadeHeight,
    heroRenderedTop + noCheeseboardVisibleBottomSourceY * heroLayoutScale
  );
  const cheeseboardWidth = cheeseboardSourceWidth * heroLayoutScale;
  const cheeseboardHeight = cheeseboardSourceHeight * heroLayoutScale;
  const cheeseboardLeft =
    heroRenderedLeft + cheeseboardSourceX * heroLayoutScale;
  const cheeseboardTop = isMainHeroPage
    ? noCheeseboardVisibleBottomY - cheeseboardHeight / 2
    : heroRenderedTop + cheeseboardSourceY * heroLayoutScale;
  const routeTransitionState = screenSwipe?.routeTransitionState;
  const isCheeseboardNavigationMotionDisabled =
    isMainHeroPage && isHeaderNewState(resolvedHeroMotionScrollY);
  const isCheeseboardRouteTransitionActive =
    isMainHeroPage &&
    !isCheeseboardNavigationMotionDisabled &&
    Boolean(routeTransitionState?.isActive);
  const isCheeseboardSwipeActive =
    isMainHeroPage &&
    !isCheeseboardNavigationMotionDisabled &&
    Boolean(screenSwipe?.isActive);
  const cheeseboardTransitionDirection =
    routeTransitionState?.direction === -1 ? -1 : 1;
  const cheeseboardTransitionStartX =
    typeof routeTransitionState?.startX === "number"
      ? routeTransitionState.startX
      : 0;
  const cheeseboardCenteredMotionTranslateX =
    Platform.OS === "ios" ? 0.01 : 0;
  const cheeseboardTransitionStartTranslateX =
    Math.abs(cheeseboardTransitionStartX) > 0.01
      ? cheeseboardTransitionStartX
      : cheeseboardCenteredMotionTranslateX;
  const cheeseboardHiddenHandoffOpacity =
    Platform.OS === "ios" ? 0.001 : 0;
  const cheeseboardDragTranslateX = isCheeseboardSwipeActive
    ? screenSwipe?.swipeX || 0
    : 0;
  const cheeseboardBaseTranslateX = isCheeseboardRouteTransitionActive
    ? 0
    : cheeseboardDragTranslateX;
  const cheeseboardBaseOpacity = isCheeseboardRouteTransitionActive
    ? routeTransitionProgress.interpolate({
        inputRange: [0, 0.92, 1],
        outputRange: [
          cheeseboardHiddenHandoffOpacity,
          cheeseboardHiddenHandoffOpacity,
          1,
        ],
        extrapolate: "clamp",
      })
    : 1;
  const cheeseboardOutgoingTranslateX = isCheeseboardRouteTransitionActive
    ? routeTransitionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          cheeseboardTransitionStartTranslateX,
          -cheeseboardTransitionDirection * windowWidth,
        ],
        extrapolate: "clamp",
      })
    : cheeseboardDragTranslateX;
  const cheeseboardIncomingTranslateX = routeTransitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      cheeseboardTransitionStartTranslateX +
        cheeseboardTransitionDirection * windowWidth,
      cheeseboardCenteredMotionTranslateX,
    ],
    extrapolate: "clamp",
  });
  const cheeseboardIncomingOpacity = routeTransitionProgress.interpolate({
    inputRange: [0, 0.92, 1],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });
  const cheeseboardPreviousPreviewTranslateX = screenSwipe?.swipeX
    ? Animated.add(screenSwipe.swipeX, -windowWidth)
    : -windowWidth;
  const cheeseboardNextPreviewTranslateX = screenSwipe?.swipeX
    ? Animated.add(screenSwipe.swipeX, windowWidth)
    : windowWidth;
  const shouldShowCheeseboardDragPreviews =
    isMainHeroPage &&
    isCheeseboardSwipeActive &&
    !isCheeseboardRouteTransitionActive;
  const handleCarouselTouchStart = (event) => {
    showHeldArrows(event);
    return false;
  };

  const sharedHeaderTouchHandlers = {
    onStartShouldSetResponderCapture: handleCarouselTouchStart,
    onTouchStart: showHeldArrows,
    onTouchMove: updateHeldArrowsFromTouchMove,
    onTouchEnd: hideHeldArrows,
    onTouchCancel: hideHeldArrows,
  };

  const renderArrowChevron = (direction) => (
    <View
      style={[
        styles.arrowChevron,
        direction === "left"
          ? styles.arrowChevronLeft
          : styles.arrowChevronRight,
      ]}
    />
  );

  const renderCheeseboardLayer = (key, translateX, opacity = 1) => {
    const slideTransformStyle =
      translateX === 0 ? null : { transform: [{ translateX }] };
    const resolvedSlideOpacity =
      isMainHeroPage && opacity !== 1
        ? Animated.multiply(opacity, mainHeroVisualOpacity)
        : isMainHeroPage
        ? mainHeroVisualOpacity
        : opacity;
    const slideOpacityStyle =
      resolvedSlideOpacity === 1 ? null : { opacity: resolvedSlideOpacity };

    return (
      <Animated.View
        key={key}
        collapsable={false}
        pointerEvents="none"
        renderToHardwareTextureAndroid
        style={[
          styles.cheeseboardSlideLayer,
          slideTransformStyle,
          slideOpacityStyle,
        ]}
      >
        <Animated.View
          collapsable={false}
          style={styles.cheeseboardHeroTransformLayer}
        >
          <Animated.View
            collapsable={false}
            renderToHardwareTextureAndroid
            style={[
              styles.cheeseboardProductsFrame,
              {
                left: cheeseboardLeft,
                top: cheeseboardTop,
                width: cheeseboardWidth,
                height: cheeseboardHeight,
                transform: [{ scale: heroScale }],
              },
            ]}
          >
            <Image
              fadeDuration={0}
              source={cheeseboardProductsImage}
              style={styles.cheeseboardProductsImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
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
              transform: [{ translateY: carouselInnerTranslateY }],
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
                  opacity: leftArrowOpacity,
                  transform: [
                    { translateX: arrowLinkTranslateX },
                  ],
                },
              ]}
            >
              {renderArrowChevron("left")}
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
                  opacity: rightArrowOpacity,
                  transform: [
                    { translateX: arrowLinkTranslateX },
                  ],
                },
              ]}
            >
              {renderArrowChevron("right")}
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.carouselIndicatorSeparator,
            {
              transform: [{ translateY: carouselExpansionOffsetY }],
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.carouselIndicatorBar,
            {
              transform: [{ translateY: carouselExpansionOffsetY }],
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
        source={heroImageSource}
        style={[
          isMainHeroPage ? styles.heroImageWidthFit : styles.heroImage,
          heroImageFrameStyle,
          heroImageTransformStyle,
          heroImageOpacityStyle,
        ]}
        resizeMode={isMainHeroPage ? "contain" : "cover"}
      />
      {isMainHeroPage
        ? renderCheeseboardLayer(
            "cheeseboard-current",
            cheeseboardBaseTranslateX,
            cheeseboardBaseOpacity
          )
        : null}
      {isCheeseboardRouteTransitionActive
        ? renderCheeseboardLayer(
            "cheeseboard-outgoing",
            cheeseboardOutgoingTranslateX
          )
        : null}
      {shouldShowCheeseboardDragPreviews ? (
        <>
          {renderCheeseboardLayer(
            "cheeseboard-previous-preview",
            cheeseboardPreviousPreviewTranslateX
          )}
          {renderCheeseboardLayer(
            "cheeseboard-next-preview",
            cheeseboardNextPreviewTranslateX
          )}
        </>
      ) : null}
      {isCheeseboardRouteTransitionActive
        ? renderCheeseboardLayer(
            "cheeseboard-incoming",
            cheeseboardIncomingTranslateX,
            cheeseboardIncomingOpacity
          )
        : null}
      {!isMainHeroPage ? (
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
      ) : null}
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
      {Platform.OS === "ios" ? (
        <Animated.View
          style={{
            transform: [{ translateY: carouselExpansionOffsetY }],
          }}
        >
          {hero}
        </Animated.View>
      ) : (
        hero
      )}
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
        <Pressable
          style={[
            styles.logoPressable,
            dimHeaderExceptShopButton && styles.logoPressableSpotlight,
          ]}
          onPress={() => goToPage("home")}
        >
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={styles.logoText}
          >
            Alla Vostra
          </Text>
        </Pressable>

        {dimHeaderExceptShopButton ? (
          <View pointerEvents="none" style={styles.orangeBarDimOverlay} />
        ) : null}

        <Pressable
          style={[
            styles.shopButtonWrap,
            dimHeaderExceptShopButton && styles.shopButtonWrapSpotlight,
          ]}
          onPress={() => goToPage("shop")}
        >
          <ButtonShadowPlate style={styles.shopButtonShadowPlate} />
          <View style={styles.shopButton}>
            <Text style={styles.shopButtonText}>SHOP</Text>
          </View>
        </Pressable>

        <View pointerEvents="none" style={styles.orangeBarBottomHairline} />
      </Animated.View>

      {showCarousel && showHero && centerShadow}
      {showCarousel && carousel}
      {showHero && hero}
    </Animated.View>
  );
}
