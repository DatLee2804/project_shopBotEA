'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Bot as BotIcon,
  Activity,
  LayoutGrid,
} from 'lucide-react';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') || 'ALL';
  const currentPlatform = searchParams.get('platform') || 'ALL';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinWinRate = searchParams.get('minWinRate') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/', { scroll: false });
  };

  const productTypes = [
    { label: 'Tất cả sản phẩm', value: 'ALL', icon: LayoutGrid, activeClass: 'bg-slate-900 text-white' },
    { label: 'Chỉ Bot EA (Tự động)', value: 'BOT_EA', icon: BotIcon, activeClass: 'bg-ocean-600 text-white' },
    { label: 'Chỉ Indicator (Chỉ báo)', value: 'INDICATOR', icon: Activity, activeClass: 'bg-indigo-600 text-white' },
  ];

  const platforms = [
    { label: 'Tất cả nền tảng', value: 'ALL' },
    { label: 'MetaTrader 5 (MT5)', value: 'MT5' },
    { label: 'MetaTrader 4 (MT4)', value: 'MT4' },
    { label: 'Hỗ trợ cả MT4 & MT5', value: 'BOTH' },
  ];

  const sorts = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Hiệu suất cao nhất', value: 'popular' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-10 space-y-3.5">
      {/* Row 1: Product Type Switcher (Bot EA vs Indicator) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Loại sản phẩm:
          </span>
          {productTypes.map((pt) => {
            const Icon = pt.icon;
            const isActive = currentType === pt.value;
            return (
              <button
                key={pt.value}
                onClick={() => updateFilter('type', pt.value)}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `${pt.activeClass} shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {pt.label}
              </button>
            );
          })}
        </div>

        {/* Quick Jump Links when viewing ALL */}
        {currentType === 'ALL' && (
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Đi nhanh tới:</span>
            <a
              href="#bots-section"
              className="font-semibold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              ↓ Danh sách Bot EA
            </a>
            <a
              href="#indicators-section"
              className="font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              ↓ Danh sách Indicator
            </a>
          </div>
        )}
      </div>

      {/* Row 2: Platform + Performance + Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-ocean-600" />
            Nền tảng:
          </span>
          {platforms.map((p) => {
            const isActive = currentPlatform === p.value;
            return (
              <button
                key={p.value}
                onClick={() => updateFilter('platform', p.value)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-ocean-50 hover:text-ocean-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentType !== 'INDICATOR' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Winrate EA:</span>
              <select
                value={currentMinWinRate}
                onChange={(e) => updateFilter('minWinRate', e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="60">&gt;= 60%</option>
                <option value="70">&gt;= 70%</option>
                <option value="80">&gt;= 80%</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sắp xếp:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
