"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Assume motion is fine while rendering on the server; corrected on hydration. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks the visitor's motion preference and re-renders if they change it
 * mid-session (macOS and iOS both allow this without a reload).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
