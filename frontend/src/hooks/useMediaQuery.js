/**
 * Custom hook for responsive design
 * Detects screen size and provides breakpoint utilities
 */

import { useState, useEffect } from 'react';

/**
 * Media query hook
 * @param {string} query - CSS media query
 * @returns {boolean} Whether the query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e) => setMatches(e.matches);
    
    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Breakpoint utilities hook
 * @returns {Object} Breakpoint flags and current breakpoint
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');

  const getCurrentBreakpoint = () => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isLargeDesktop) return 'large-desktop';
    if (isDesktop) return 'desktop';
    return 'unknown';
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint: getCurrentBreakpoint(),
  };
}

/**
 * Viewport size hook
 * @returns {Object} Current viewport width and height
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

export default useMediaQuery;
