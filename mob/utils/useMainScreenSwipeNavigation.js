import { usePathname, router } from "expo-router";
import { useRef } from "react";
import { PanResponder } from "react-native";

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: shouldUseHorizontalSwipe,
      onMoveShouldSetPanResponderCapture: shouldUseHorizontalSwipe,

      onPanResponderRelease: (_, gestureState) => {
        if (shouldNavigateNext(gestureState)) {
          const nextIndex = (activeIndexRef.current + 1) % navPages.length;
          goToPage(navPages[nextIndex]);
          return;
        }

        if (shouldNavigatePrevious(gestureState)) {
          const previousIndex =
            (activeIndexRef.current + navPages.length - 1) % navPages.length;
          goToPage(navPages[previousIndex]);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
