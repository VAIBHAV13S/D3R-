import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (timeout) setTimeout(() => removeToast(id), timeout);
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', gap: 8, flexDirection: 'column', zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} onClick={() => removeToast(t.id)}
               style={{
                 background: t.type === 'error' ? '#FDECEC' : t.type === 'success' ? '#E8FFF3' : '#F1F5F9',
                 color: '#0f172a',
                 border: '1px solid #cbd5e1',
                 borderLeft: `4px solid ${t.type === 'error' ? '#EF4444' : t.type === 'success' ? '#10B981' : '#3B82F6'}`,
                 borderRadius: 8,
                 padding: '10px 12px',
                 boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                 minWidth: 260,
                 cursor: 'pointer'
               }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
