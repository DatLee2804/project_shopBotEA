import React from 'react';
import Link from 'next/link';
import { Indicator } from '@/types';
import { Badge } from './ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { INDICATOR_CATEGORY_LABELS } from '@/lib/fallback-data';
import {
  Activity,
  BellRing,
  CheckCircle2,
  ArrowRight,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface IndicatorCardProps {
  indicator: Indicator;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  const categoryLabel = INDICATOR_CATEGORY_LABELS[indicator.category] || indicator.category;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-teal-900 overflow-hidden">
        {indicator.thumbnailUrl ? (
          <img
            src={indicator.thumbnailUrl}
            alt={indicator.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-indigo-300/60">
            <Activity className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-semibold text-indigo-200 mt-1">OceanEA Indicator</span>
          </div>
        )}

        {/* Top Left Badges: Product Type + Platform + Version */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 bg-indigo-600/95 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
            <Activity className="w-3 h-3" />
            Indicator
          </span>
          <Badge platform={indicator.platform} />
          {indicator.version && (
            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded-full">
              v{indicator.version}
            </span>
          )}
        </div>

        {/* Free Tag or Non-Repaint Tag */}
        {Number(indicator.price) === 0 ? (
          <div className="absolute top-3 right-3 bg-profit text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            MIỄN PHÍ
          </div>
        ) : (
          indicator.isNonRepaint && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              100% Non-Repaint
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Category & Company Pill */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              <Layers className="w-3 h-3 text-indigo-600" />
              {categoryLabel}
            </span>

            {indicator.hasAlert && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
                title="Hỗ trợ cảnh báo Popup, Push Mobile & Telegram"
              >
                <BellRing className="w-3 h-3 text-amber-600" />
                Có Alert
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/indicators/${indicator.slug}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
              {indicator.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {indicator.shortDesc}
          </p>
        </div>

        <div>
          {/* Indicator Specific Specs Box (Different from Bot EA Backtest Box) */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/80 mb-4">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Chuẩn xác</span>
              <span className="text-xs font-extrabold text-profit mt-0.5">
                {indicator.accuracyRate > 0 ? `${indicator.accuracyRate}%` : 'N/A'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center border-x border-indigo-100 px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tín hiệu</span>
              <span className="text-[11px] font-extrabold text-indigo-700 mt-0.5 truncate max-w-full">
                {indicator.isNonRepaint ? 'K.Vẽ lại' : 'Tiêu chuẩn'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Khung giờ</span>
              <span
                className="text-[11px] font-extrabold text-slate-700 mt-0.5 truncate max-w-full"
                title={indicator.timeframes}
              >
                {indicator.timeframes.split(',').slice(0, 2).join(',')}
              </span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                {Number(indicator.price) === 0 ? 'Chỉ báo miễn phí' : 'Mua đứt hoặc Thuê'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(indicator.price)}
                </span>
                {Number(indicator.price) > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (thuê từ {formatCurrency(Math.round(Number(indicator.price) * 0.28))}/tháng)
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/indicators/${indicator.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all duration-200 shadow-sm"
            >
              Chi tiết
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

