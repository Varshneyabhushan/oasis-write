import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SIDEBAR_MAX_WINDOW_FRACTION,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
} from '../constants';

const SIDEBAR_WIDTH_STORAGE_KEY = 'oasis-write-sidebar-width';

// Upper bound depends on the window so the sidebar can never crowd out the editor
function clampWidth(width: number): number {
  const max = Math.max(SIDEBAR_WIDTH_MIN, Math.min(SIDEBAR_WIDTH_MAX, window.innerWidth * SIDEBAR_MAX_WINDOW_FRACTION));
  return Math.round(Math.min(Math.max(width, SIDEBAR_WIDTH_MIN), max));
}

function loadWidth(): number {
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return clampWidth(Number.isFinite(parsed) ? parsed : SIDEBAR_WIDTH_DEFAULT);
  } catch {
    return SIDEBAR_WIDTH_DEFAULT;
  }
}

export function useSidebarResize() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState<number>(loadWidth);
  const [isResizing, setIsResizing] = useState(false);

  const persistWidth = useCallback((value: number) => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(value));
    } catch {
      // Ignore storage failures - the width just won't persist
    }
  }, []);

  const setClampedWidth = useCallback((value: number) => {
    const next = clampWidth(value);
    setWidth(next);
    return next;
  }, []);

  // Shrinking the window can push the stored width past its allowed maximum
  useEffect(() => {
    const handleWindowResize = () => setWidth((current) => clampWidth(current));
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Keep the col-resize cursor and suppress text selection for the whole drag
  useEffect(() => {
    if (!isResizing) return;
    document.body.classList.add('is-resizing');
    return () => document.body.classList.remove('is-resizing');
  }, [isResizing]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsResizing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
    setClampedWidth(e.clientX - left);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsResizing(false);
    persistWidth(width);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const delta = e.key === 'ArrowLeft' ? -SIDEBAR_WIDTH_STEP : SIDEBAR_WIDTH_STEP;
    persistWidth(setClampedWidth(width + delta));
  };

  const handleDoubleClick = () => {
    persistWidth(setClampedWidth(SIDEBAR_WIDTH_DEFAULT));
  };

  return {
    sidebarRef,
    width,
    isResizing,
    resizeHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onKeyDown: handleKeyDown,
      onDoubleClick: handleDoubleClick,
    },
  };
}

export default useSidebarResize;
