import { usePathname, router } from "expo-router";
import { useRef } from "react";
import { PanResponder } from "react-native";

import {
  isInsideOrangeBarTouch,
  useHeaderSwipe,
} from "./headerSwipeContext";
import { useHeaderNavigationGate } from "./headerNavigationGate";

const navPages = ["home", "products", "aboutus", "contact"];
const swipeActivationDistance = 3.33;
const swipeActivationRatio = 0.55;
const swipeCommitDistance = 10;
const swipeCommitVelocity = 0.117;
const swipeVelocityDistance = 4.67;
const tapHoldCancelDistance = 1.5;

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
  const canNavigateWithHeader = useHeaderNavigationGate();
  const activePage = getActivePageFromPath(pathname);
  const activePageRef = useRef(activePage);
  const activeIndexRef = useRef(Math.max(navPages.indexOf(activePage), 0));
  const canNavigateWithHeaderRef = useRef(canNavigateWithHeader);

  activePageRef.current = activePage;
  activeIndexRef.current = Math.max(navPages.indexOf(activePage), 0);
  canNavigateWithHeaderRef.current = canNavigateWithHeader;

  const goToPage = (pageName) => {
    const route = pageRoutes[pageName];
    if (!route || pageName === activePageRef.current) return;
    if (!canNavigateWithHeaderRef.current?.()) {
      headerSwipe?.clearDirectionalArrowLinger?.();
      headerSwipe?.clearSwipe({ animate: true });
      return;
    }

    router.replace(route);
  };

  const updateHeaderSwipe = (dragDistance) => {
    if (!headerSwipe) return;

    headerSwipe.updateSwipe({ x: dragDistance });
  };

  const showHeldArrowsFromTouch = (event) => {
    if (isInsideOrangeBarTouch(event)) return false;

    headerSwipe?.showHeldArrowHint?.(event);
    return false;
  };

  const updateHeldArrowsFromTouchMove = (event) => {
    headerSwipe?.updateHeldArrowHintMovement?.(event);
    return false;
  };

  const hideHeldArrowsFromTouch = () => {
    headerSwipe?.hideHeldArrowHint?.();
    return false;
  };

  const shouldClaimHorizontalSwipe = (_, gestureState) => {
    if (!canNavigateWithHeaderRef.current?.()) return false;

    if (
      Math.abs(gestureState.dx) >= tapHoldCancelDistance ||
      Math.abs(gestureState.dy) >= tapHoldCancelDistance
    ) {
      headerSwipe?.cancelHeldArrowHint?.();
    }

    const shouldClaim = shouldUseHorizontalSwipe(null, gestureState);
    if (shouldClaim) {
      headerSwipe?.cancelHeldArrowHint?.();
    }

    return shouldClaim;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: shouldClaimHorizontalSwipe,

      onMoveShouldSetPanResponderCapture: shouldClaimHorizontalSwipe,

      onPanResponderMove: (_, gestureState) => {
        if (!canNavigateWithHeaderRef.current?.()) return;

        updateHeaderSwipe(gestureState.dx);

        if (shouldNavigateNext(gestureState)) {
          headerSwipe?.startDirectionalArrowLinger?.("left");
          return;
        }

        if (shouldNavigatePrevious(gestureState)) {
          headerSwipe?.startDirectionalArrowLinger?.("right");
          return;
        }

        headerSwipe?.clearDirectionalArrowLinger?.();
      },

      onPanResponderRelease: (_, gestureState) => {
        headerSwipe?.hideHeldArrowHint?.();

        if (!canNavigateWithHeaderRef.current?.()) {
          headerSwipe?.clearDirectionalArrowLinger?.();
          headerSwipe?.clearSwipe({ animate: true });
          return;
        }

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
          headerSwipe?.startDirectionalArrowLinger?.("left");
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
          headerSwipe?.startDirectionalArrowLinger?.("right");
          goToPage(previousPage);
          return;
        }

        headerSwipe?.clearDirectionalArrowLinger?.();
        headerSwipe?.clearSwipe({ animate: true });
      },

      onPanResponderTerminate: () => {
        headerSwipe?.hideHeldArrowHint?.();
        headerSwipe?.clearDirectionalArrowLinger?.();
        headerSwipe?.clearSwipe({ animate: true });
      },
    })
  ).current;

  return {
    ...panResponder.panHandlers,
    onStartShouldSetResponderCapture: showHeldArrowsFromTouch,
    onTouchStart: showHeldArrowsFromTouch,
    onTouchMove: updateHeldArrowsFromTouchMove,
    onTouchEnd: hideHeldArrowsFromTouch,
    onTouchCancel: hideHeldArrowsFromTouch,
  };
}
