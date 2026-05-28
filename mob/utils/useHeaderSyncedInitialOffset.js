import { useRef } from "react";

const collapsedHeaderOffset = 120;
const heroHiddenCarryOffset = 270;

function clampHeaderOffset(value) {
  if (!Number.isFinite(value)) return 0;
  if (value >= collapsedHeaderOffset) return heroHiddenCarryOffset;

  return Math.max(0, Math.min(value, collapsedHeaderOffset));
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
