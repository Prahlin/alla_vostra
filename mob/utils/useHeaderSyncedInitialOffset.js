import { useRef } from "react";

const heroStateFreezeOffset = 480;

function clampHeaderOffset(value) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(0, Math.min(value, heroStateFreezeOffset));
}

export default function useHeaderSyncedInitialOffset(scrollY) {
  const initialOffsetRef = useRef(null);

  if (initialOffsetRef.current === null) {
    const currentScrollValue =
      typeof scrollY?.__getValue === "function" ? scrollY.__getValue() : 0;

    initialOffsetRef.current = {
      x: 0,
      y: clampHeaderOffset(currentScrollValue),
    };
  }

  return initialOffsetRef.current;
}
