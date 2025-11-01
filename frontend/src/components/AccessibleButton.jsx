/**
 * Accessible Button Component
 * Includes ARIA labels, keyboard navigation, and focus management
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.ariaLabel - ARIA label for screen readers
 * @param {string} props.variant - Button variant (primary, secondary, danger)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {string} props.type - Button type (button, submit, reset)
 */
export default function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  ariaLabel,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  ...props
}) {
  const baseStyles = {
    padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
    fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    secondary: {
      background: '#e2e8f0',
      color: '#1a202c',
    },
    danger: {
      background: '#f56565',
      color: 'white',
    },
  };

  const focusStyles = {
    outline: '3px solid #667eea',
    outlineOffset: '2px',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
      }}
      onFocus={(e) => {
        e.target.style.outline = focusStyles.outline;
        e.target.style.outlineOffset = focusStyles.outlineOffset;
      }}
      onBlur={(e) => {
        e.target.style.outline = 'none';
      }}
      {...props}
    >
      {loading && (
        <span
          role="status"
          aria-label="Loading"
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
    </button>
  );
}
