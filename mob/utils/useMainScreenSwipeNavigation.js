import { usePathname, router } from "expo-router";
import { useRef } from "react";
import { PanResponder } from "react-native";

import {
  isInsideOrangeBarTouch,
  useHeaderSwipe,
} from "./headerSwipeContext";

const navPages = ["home", "products", "aboutus", "contact"];
const swipeActivationDistance = 10;
const swipeActivationRatio = 0.55;
const swipeCommitDistance = 30;
const swipeCommitVelocity = 0.35;
const swipeVelocityDistance = 14;

const pageRoutes = {
  home: "/",
  products: "/products",
  aboutus: "/aboutus",
  contact: "/contact",
};

function getActivePageFromPath(pathname) {
  if (pathname === "/products") return "products";
  if (pathname === "/aboutus") return "aboutus";
  if (pathname === "/contact") return "contact";
  return "home";
}

function shouldUseHorizontalSwipe(_, gestureState) {
  const horizontalDistance = Math.abs(gestureState.dx);
  const verticalDistance = Math.abs(gestureState.dy);

  return (
    horizontalDistance > swipeActivationDistance &&
    horizontalDistance > verticalDistance * swipeActivationRatio
  );
}

function shouldNavigateNext(gestureState) {
  return (
    gestureState.dx <= -swipeCommitDistance ||
    (gestureState.dx <= -swipeVelocityDistance &&
      gestureState.vx <= -swipeCommitVelocity)
  );
}

function shouldNavigatePrevious(gestureState) {
  return (
    gestureState.dx >= swipeCommitDistance ||
    (gestureState.dx >= swipeVelocityDistance &&
      gestureState.vx >= swipeCommitVelocity)
  );
}

export default function useMainScreenSwipeNavigation() {
  const pathname = usePathname();
  const headerSwipe = useHeaderSwipe();
  const activePage = getActivePageFromPath(pathname);
  const activePageRef = useRef(activePage);
  const activeIndexRef = useRef(Math.max(navPages.indexOf(activePage), 0));

  activePageRef.current = activePage;
  activeIndexRef.current = Math.max(navPages.indexOf(activePage), 0);

  const goToPage = (pageName) => {
    const route = pageRoutes[pageName];
    if (!route || pageName === activePageRef.current) return;

    router.replace(route);
  };

  const updateHeaderSwipe = (dragDistance) => {
    if (!headerSwipe) return;

    headerSwipe.updateSwipe({ x: dragDistance });
  };

  const showHeldArrowsFromTouch = (event) => {
    if (isInsideOrangeBarTouch(event)) return false;

    headerSwipe?.showHeldArrowHint?.();
    return false;
  };

  const hideHeldArrowsFromTouch = () => {
    headerSwipe?.hideHeldArrowHint?.();
    return false;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: shouldUseHorizontalSwipe,
      onMoveShouldSetPanResponderCapture: shouldUseHorizontalSwipe,

      onPanResponderMove: (_, gestureState) => {
        updateHeaderSwipe(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        headerSwipe?.hideHeldArrowHint?.();

        if (shouldNavigateNext(gestureState)) {
          const nextIndex = (activeIndexRef.current + 1) % navPages.length;
          const nextPage = navPages[nextIndex];

          updateHeaderSwipe(gestureState.dx);
          headerSwipe?.commitSwipe({
            x: gestureState.dx,
            page: nextPage,
            direction: 1,
            fromPage: activePageRef.current,
          });
          goToPage(nextPage);
          return;
        }

        if (shouldNavigatePrevious(gestureState)) {
          const previousIndex =
            (activeIndexRef.current + navPages.length - 1) % navPages.length;
          const previousPage = navPages[previousIndex];

          updateHeaderSwipe(gestureState.dx);
          headerSwipe?.commitSwipe({
            x: gestureState.dx,
            page: previousPage,
            direction: -1,
            fromPage: activePageRef.current,
          });
          goToPage(previousPage);
          return;
        }

        headerSwipe?.clearSwipe({ animate: true });
      },

      onPanResponderTerminate: () => {
        headerSwipe?.hideHeldArrowHint?.();
        headerSwipe?.clearSwipe({ animate: true });
      },
    })
  ).current;

  return {
    ...panResponder.panHandlers,
    onStartShouldSetResponderCapture: showHeldArrowsFromTouch,
    onTouchStart: showHeldArrowsFromTouch,
    onTouchEnd: hideHeldArrowsFromTouch,
    onTouchCancel: hideHeldArrowsFromTouch,
  };
}
