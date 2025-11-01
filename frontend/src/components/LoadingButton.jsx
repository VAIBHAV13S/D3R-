import React from 'react';

export default function LoadingButton({ loading, disabled, children, onClick, style, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        position: 'relative',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.7 : 1,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <Spinner />
        </span>
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
