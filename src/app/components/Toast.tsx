'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-700 border-green-800',
    error: 'bg-red-600 border-red-700',
    info: 'bg-blue-600 border-blue-700',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl border-2 flex items-center gap-3 min-w-[300px] animate-slideInRight`}>
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
        {icons[type]}
      </div>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 hover:text-white font-bold text-xl leading-none transition-transform hover:scale-110"
      >
        ×
      </button>
    </div>
  );
}
