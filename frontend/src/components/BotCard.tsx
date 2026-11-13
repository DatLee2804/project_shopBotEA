import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bot } from '@/types';
import { Badge } from './ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ShieldCheck, ArrowRight, Bot as BotIcon } from 'lucide-react';

interface BotCardProps {
  bot: Bot;
}

export function BotCard({ bot }: BotCardProps) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-ocean-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-gradient-to-tr from-slate-100 to-ocean-50 overflow-hidden">
        {bot.thumbnailUrl ? (
          <img
            src={bot.thumbnailUrl}
            alt={bot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ocean-600/40">
            <TrendingUp className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-semibold text-slate-400 mt-1">OceanEA Bot</span>
          </div>
        )}

        {/* Platform Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 bg-ocean-600/95 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
            <BotIcon className="w-3 h-3" />
            Bot EA
          </span>
          <Badge platform={bot.platform} />
          {bot.version && (
            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded-full">
              v{bot.version}
            </span>
          )}
        </div>

        {/* Free Tag */}
        {Number(bot.price) === 0 && (
          <div className="absolute top-3 right-3 bg-profit text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            MIỄN PHÍ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Company badge */}
          <div className="flex items-center gap-1.5 text-xs text-ocean-700 font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-ocean-600 flex-shrink-0" />
            <span className="truncate">Sản phẩm chính thức OceanEA</span>
          </div>

          {/* Title */}
          <Link href={`/bots/${bot.slug}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-ocean-600 transition-colors line-clamp-1 mb-1.5">
              {bot.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {bot.shortDesc}
          </p>
        </div>

        <div>
          {/* Backtest Metrics Box */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Win Rate</span>
              <span className="text-xs font-extrabold text-profit mt-0.5">
                {bot.winRate > 0 ? `${bot.winRate}%` : 'N/A'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center border-x border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Drawdown</span>
              <span className="text-xs font-extrabold text-drawdown mt-0.5">
                {bot.maxDrawdown > 0 ? `${bot.maxDrawdown}%` : 'N/A'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Profit Fac</span>
              <span className="text-xs font-extrabold text-slate-700 mt-0.5">
                {bot.profitFactor > 0 ? bot.profitFactor : 'N/A'}
              </span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {Number(bot.price) === 0 ? 'Giá sở hữu' : 'Mua đứt hoặc Thuê'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-ocean-900">
                  {formatCurrency(bot.price)}
                </span>
                {Number(bot.price) > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (thuê từ {formatCurrency(Math.round(Number(bot.price) * 0.28))}/tháng)
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/bots/${bot.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-50 text-ocean-700 hover:bg-ocean-600 hover:text-white text-xs font-semibold transition-all duration-200 shadow-sm"
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
