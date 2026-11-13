import React from 'react';
import { cn } from '@/lib/utils';
import { Platform, BotStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'ocean' | 'profit' | 'drawdown' | 'outline' | 'slate';
  platform?: Platform;
  status?: BotStatus;
}

export function Badge({
  className,
  variant = 'default',
  platform,
  status,
  children,
  ...props
}: BadgeProps) {
  let badgeClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';

  if (platform) {
    if (platform === 'MT5') {
      badgeClasses = cn(badgeClasses, 'bg-ocean-100 text-ocean-900 border border-ocean-300');
    } else if (platform === 'MT4') {
      badgeClasses = cn(badgeClasses, 'bg-slate-100 text-slate-800 border border-slate-300');
    } else {
      badgeClasses = cn(badgeClasses, 'bg-indigo-50 text-indigo-700 border border-indigo-200');
    }
  } else if (status) {
    if (status === 'APPROVED') {
      badgeClasses = cn(badgeClasses, 'bg-profit-bg text-profit border border-emerald-300');
    } else if (status === 'PENDING') {
      badgeClasses = cn(badgeClasses, 'bg-amber-50 text-amber-700 border border-amber-300');
    } else {
      badgeClasses = cn(badgeClasses, 'bg-rose-50 text-rose-700 border border-rose-300');
    }
  } else {
    const variants = {
      default: 'bg-slate-100 text-slate-800',
      ocean: 'bg-ocean-100 text-ocean-900 border border-ocean-300',
      profit: 'bg-profit-bg text-profit border border-emerald-300',
      drawdown: 'bg-drawdown-bg text-drawdown border border-amber-300',
      outline: 'border border-slate-300 text-slate-700',
      slate: 'bg-slate-800 text-white',
    };
    badgeClasses = cn(badgeClasses, variants[variant]);
  }

  return (
    <span className={cn(badgeClasses, className)} {...props}>
      {platform || status || children}
    </span>
  );
}
