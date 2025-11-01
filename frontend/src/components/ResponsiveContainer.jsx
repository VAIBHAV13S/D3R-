/**
 * Responsive Container Component
 * Provides responsive layout utilities
 */

import React from 'react';
import { useBreakpoints } from '../hooks/useMediaQuery';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.mobileStyles - Styles for mobile
 * @param {Object} props.tabletStyles - Styles for tablet
 * @param {Object} props.desktopStyles - Styles for desktop
 * @param {string} props.maxWidth - Maximum width
 * @param {boolean} props.padding - Add padding
 */
export default function ResponsiveContainer({
  children,
  mobileStyles = {},
  tabletStyles = {},
  desktopStyles = {},
  maxWidth = '1200px',
  padding = true,
  ...props
}) {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const baseStyles = {
    width: '100%',
    maxWidth,
    margin: '0 auto',
    padding: padding ? (isMobile ? '16px' : isTablet ? '24px' : '32px') : '0',
  };

  const responsiveStyles = isMobile
    ? mobileStyles
    : isTablet
    ? tabletStyles
    : desktopStyles;

  return (
    <div style={{ ...baseStyles, ...responsiveStyles }} {...props}>
      {children}
    </div>
  );
}

/**
 * Responsive Grid Component
 */
export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '24px',
  ...props
}) {
  const { isMobile, isTablet } = useBreakpoints();

  const gridColumns = isMobile
    ? columns.mobile
    : isTablet
    ? columns.tablet
    : columns.desktop;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Responsive Stack Component
 */
export function ResponsiveStack({
  children,
  direction = { mobile: 'column', tablet: 'column', desktop: 'row' },
  gap = '16px',
  align = 'stretch',
  justify = 'flex-start',
  ...props
}) {
  const { isMobile, isTablet } = useBreakpoints();

  const flexDirection = isMobile
    ? direction.mobile
    : isTablet
    ? direction.tablet
    : direction.desktop;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection,
        gap,
        alignItems: align,
        justifyContent: justify,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
