import React, { Suspense } from 'react';
import Link from 'next/link';
import { BotCard } from '@/components/BotCard';
import { IndicatorCard } from '@/components/IndicatorCard';
import { FilterBar } from '@/components/FilterBar';
import { Bot, Indicator, IndicatorCategory } from '@/types';
import {
  fallbackBots,
  fallbackIndicators,
  INDICATOR_CATEGORY_LABELS,
} from '@/lib/fallback-data';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Bot as BotIcon,
  Activity,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

interface HomePageProps {
  searchParams: {
    type?: string;
    search?: string;
    platform?: string;
    minWinRate?: string;
    category?: string;
    sort?: string;
  };
}

function getBaseApi(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1').replace(
    'localhost',
    '127.0.0.1',
  );
}

async function getBots(params: HomePageProps['searchParams']): Promise<Bot[]> {
  try {
    const url = new URL(`${getBaseApi()}/bots`);
    if (params.search) url.searchParams.set('search', params.search);
    if (params.platform && params.platform !== 'ALL') url.searchParams.set('platform', params.platform);
    if (params.minWinRate) url.searchParams.set('minWinRate', params.minWinRate);
    if (params.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString(), {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) throw new Error('Backend bots unavailable');
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    return filterLocalBots(params);
  } catch {
    return filterLocalBots(params);
  }
}

function filterLocalBots(params: HomePageProps['searchParams']): Bot[] {
  let list = [...fallbackBots];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (b) => b.title.toLowerCase().includes(q) || b.shortDesc.toLowerCase().includes(q),
    );
  }
  if (params.platform && params.platform !== 'ALL') {
    list = list.filter((b) => b.platform === params.platform || b.platform === 'BOTH');
  }
  if (params.minWinRate) {
    list = list.filter((b) => b.winRate >= parseFloat(params.minWinRate!));
  }
  if (params.sort === 'price_asc') {
    list.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (params.sort === 'popular') {
    list.sort((a, b) => b.winRate - a.winRate);
  }
  return list;
}

async function getIndicators(params: HomePageProps['searchParams']): Promise<Indicator[]> {
  try {
    const url = new URL(`${getBaseApi()}/indicators`);
    if (params.search) url.searchParams.set('search', params.search);
    if (params.platform && params.platform !== 'ALL') url.searchParams.set('platform', params.platform);
    if (params.category && params.category !== 'ALL') url.searchParams.set('category', params.category);
    if (params.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString(), {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) throw new Error('Backend indicators unavailable');
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    return filterLocalIndicators(params);
  } catch {
    return filterLocalIndicators(params);
  }
}

function filterLocalIndicators(params: HomePageProps['searchParams']): Indicator[] {
  let list = [...fallbackIndicators];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (ind) => ind.title.toLowerCase().includes(q) || ind.shortDesc.toLowerCase().includes(q),
    );
  }
  if (params.platform && params.platform !== 'ALL') {
    list = list.filter((ind) => ind.platform === params.platform || ind.platform === 'BOTH');
  }
  if (params.category && params.category !== 'ALL') {
    list = list.filter((ind) => ind.category === params.category);
  }
  if (params.sort === 'price_asc') {
    list.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (params.sort === 'popular') {
    list.sort((a, b) => b.accuracyRate - a.accuracyRate);
  }
  return list;
}

function buildCategoryHref(
  currentParams: HomePageProps['searchParams'],
  categoryValue: string,
): string {
  const qs = new URLSearchParams();
  if (currentParams.type) qs.set('type', currentParams.type);
  if (currentParams.search) qs.set('search', currentParams.search);
  if (currentParams.platform) qs.set('platform', currentParams.platform);
  if (currentParams.minWinRate) qs.set('minWinRate', currentParams.minWinRate);
  if (currentParams.sort) qs.set('sort', currentParams.sort);
  if (categoryValue !== 'ALL') qs.set('category', categoryValue);
  const query = qs.toString();
  return query ? `/?${query}#indicators-section` : '/#indicators-section';
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const activeType = searchParams.type || 'ALL';
  const showBots = activeType === 'ALL' || activeType === 'BOT_EA';
  const showIndicators = activeType === 'ALL' || activeType === 'INDICATOR';

  const [bots, indicators] = await Promise.all([
    showBots ? getBots(searchParams) : Promise.resolve([]),
    showIndicators ? getIndicators(searchParams) : Promise.resolve([]),
  ]);

  const selectedCategory = searchParams.category || 'ALL';
  const indicatorCategories: Array<{ label: string; value: 'ALL' | IndicatorCategory }> = [
    { label: 'Tất cả chỉ báo', value: 'ALL' },
    { label: INDICATOR_CATEGORY_LABELS.SMC_ICT, value: 'SMC_ICT' },
    { label: INDICATOR_CATEGORY_LABELS.TREND_SIGNAL, value: 'TREND_SIGNAL' },
    { label: INDICATOR_CATEGORY_LABELS.VOLUME_FLOW, value: 'VOLUME_FLOW' },
    { label: INDICATOR_CATEGORY_LABELS.OSCILLATOR, value: 'OSCILLATOR' },
    { label: INDICATOR_CATEGORY_LABELS.MULTI_TIMEFRAME, value: 'MULTI_TIMEFRAME' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocean-100 via-ocean-50 to-canvas py-14 sm:py-18 border-b border-ocean-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-100 text-ocean-900 border border-ocean-300 text-xs font-semibold mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
              Sản phẩm Chính thức & Độc quyền Công ty OceanEA
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Hệ sinh thái <span className="text-ocean-600">Bot EA Tự động</span> &{' '}
              <span className="text-indigo-600">Chỉ báo Indicator</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-7 leading-relaxed">
              Hai dòng sản phẩm chuyên biệt dành riêng cho Trader MT4/MT5: Hệ thống{' '}
              <strong className="text-slate-800">Bot EA giao dịch tự động</strong> và bộ{' '}
              <strong className="text-slate-800">Indicator phân tích tín hiệu Non-Repaint</strong>.
              Hỗ trợ mua đứt trọn đời hoặc thuê theo tháng, cấp License Key kích hoạt tức thì.
            </p>

            {/* Quick Section Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
              <a
                href="#bots-section"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 hover:bg-white border border-ocean-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-ocean-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <BotIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 group-hover:text-ocean-600 transition-colors">
                    Dòng 1: Bot EA Tự động
                  </p>
                  <p className="text-xs text-slate-500">
                    Tự động vào/thoát lệnh, quản lý vốn, mã License <code className="font-mono text-ocean-700">EA-...</code>
                  </p>
                </div>
              </a>

              <a
                href="#indicators-section"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 hover:bg-white border border-indigo-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Dòng 2: Indicator Kỹ thuật
                  </p>
                  <p className="text-xs text-slate-500">
                    SMC, Volume, Tín hiệu Non-Repaint + Alert, mã License <code className="font-mono text-indigo-700">IND-...</code>
                  </p>
                </div>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ocean-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Độc quyền Công ty</p>
                  <p className="text-[11px] text-slate-500">Kiểm định thực chiến</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center text-ocean-700">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cấp Key riêng biệt</p>
                  <p className="text-[11px] text-slate-500">EA Key & Indicator Key</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Mua đứt / Thuê tháng</p>
                  <p className="text-[11px] text-slate-500">Linh hoạt ngân sách</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Store Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Global Filter Bar */}
        <Suspense fallback={<div className="h-24 bg-white rounded-2xl animate-pulse" />}>
          <FilterBar />
        </Suspense>

        {/* ================================================================ */}
        {/* SECTION 1: DANH SÁCH BOT EA (EXPERT ADVISORS)                    */}
        {/* ================================================================ */}
        {showBots && (
          <section id="bots-section" className="scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-600 to-ocean-900 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <BotIcon className="w-6 h-6 text-sky-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Danh sách Bot EA
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ocean-100 text-ocean-800 border border-ocean-200">
                      Giao dịch tự động 100%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tìm thấy <strong>{bots.length}</strong> hệ thống Expert Advisor tự động vào lệnh, quản trị rủi ro và kiểm soát Drawdown trên MT4/MT5
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-ocean-50/70 border border-ocean-100 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-ocean-600" />
                <span>Thư mục cài đặt: <code className="font-mono font-bold text-ocean-800">MQL4/5 → Experts</code></span>
              </div>
            </div>

            {bots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">
                  Không tìm thấy Bot EA nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ================================================================ */}
        {/* SECTION 2: DANH SÁCH INDICATOR (CUSTOM TECHNICAL INDICATORS)     */}
        {/* ================================================================ */}
        {showIndicators && (
          <section
            id="indicators-section"
            className="scroll-mt-24 rounded-3xl bg-gradient-to-b from-indigo-50/60 via-white to-white border border-indigo-100 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-indigo-100">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Activity className="w-6 h-6 text-indigo-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Danh sách Indicator
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Chỉ báo Tín hiệu & Phân tích
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Tìm thấy <strong>{indicators.length}</strong> chỉ báo kỹ thuật chuyên sâu (SMC/ICT, Volume Profile, Mũi tên xu hướng) hỗ trợ điểm vào lệnh chuẩn xác
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cam kết Non-Repaint
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <BellRing className="w-3.5 h-3.5 text-amber-600" />
                  Báo Tín hiệu Mobile & Telegram
                </span>
              </div>
            </div>

            {/* Indicator Category Sub-filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-7">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Nhóm chỉ báo:
              </span>
              {indicatorCategories.map((cat) => {
                const isCatActive = selectedCategory === cat.value;
                return (
                  <Link
                    key={cat.value}
                    href={buildCategoryHref(searchParams, cat.value)}
                    scroll={false}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                      isCatActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {indicators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {indicators.map((indicator) => (
                  <IndicatorCard key={indicator.id} indicator={indicator} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">
                  Không tìm thấy Indicator nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
