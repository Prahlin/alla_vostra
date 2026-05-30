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
import { useHeaderSwipe } from "../utils/headerSwipeContext";

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

function renderPage(pageName) {
  const PageComponent = pageComponents[pageName];

  if (!PageComponent) return null;

  return <PageComponent />;
}

export default function MainScreenPushFrame({ children }) {
  const pathname = usePathname();
  const screenSwipe = useHeaderSwipe();
  const { width: windowWidth } = useWindowDimensions();
  const activePage = getActivePageFromPath(pathname);
  const activePageIndex = navPages.indexOf(activePage);
  const isMainPage = activePageIndex >= 0;

  const transitionProgress = useRef(new Animated.Value(0)).current;
  const transitionAnimationRef = useRef(null);
  const previousActivePageRef = useRef(activePage);
  const [transition, setTransition] = useState(null);

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

    screenSwipe.currentXRef.current = 0;
    transitionProgress.setValue(0);
    setTransition({
      commitId: committedSwipe?.id || null,
      direction,
      fromPage: previousPage,
      startX,
      toPage: activePage,
    });

    const animation = Animated.timing(transitionProgress, {
      toValue: 1,
      duration: pushDuration,
      useNativeDriver: true,
    });

    transitionAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        setTransition(null);
        screenSwipe.clearSwipe();
        screenSwipe.clearCommit(committedSwipe?.id);
        transitionProgress.setValue(0);
      }

      if (transitionAnimationRef.current === animation) {
        transitionAnimationRef.current = null;
      }
    });
  }, [activePage, screenSwipe, transitionProgress]);

  if (!isMainPage && !transition) {
    return <View style={styles.frame}>{children}</View>;
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

  return (
    <View style={styles.frame}>
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
            {renderPage(previousPreviewPage)}
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
            {renderPage(nextPreviewPage)}
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
        {children}
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
          {renderPage(transition.fromPage)}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
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
