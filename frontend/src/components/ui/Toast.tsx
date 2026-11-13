'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({ type = 'info', message, onClose, className }: ToastProps) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    error: 'bg-rose-50 text-rose-800 border-rose-300',
    info: 'bg-ocean-50 text-ocean-900 border-ocean-300',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-ocean-600 flex-shrink-0" />,
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border shadow-sm text-sm font-medium',
        styles[type],
        className,
      )}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 text-slate-500 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
