'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bot } from '@/types';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { botsApi } from '@/lib/api-client';
import { fallbackBots } from '@/lib/fallback-data';
import { ProductDetailTabs } from '@/components/ProductDetailTabs';
import { PurchasePlanSidebar } from '@/components/PurchasePlanSidebar';
import { ArrowLeft } from 'lucide-react';

export default function BotDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    async function fetchBot() {
      try {
        const res = await botsApi.getBotBySlug(slug);
        if (res.data.success && res.data.data) {
          setBot(res.data.data);
        } else {
          setBot(fallbackBots.find((b) => b.slug === slug) || null);
        }
      } catch {
        setBot(fallbackBots.find((b) => b.slug === slug) || null);
      } finally {
        setLoading(false);
      }
    }
    fetchBot();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-8 h-[560px] bg-slate-200/70 rounded-2xl" />
          <div className="lg:col-span-4 h-[480px] bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-3">Không tìm thấy Bot EA này</h1>
        <p className="text-sm text-slate-500 mb-6">
          Sản phẩm không tồn tại hoặc đường dẫn đã thay đổi.
        </p>
        <Link href="/#bots-section">
          <Button variant="primary">Quay lại Danh sách Bot EA</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* Breadcrumb Bar (MQL5 Market style) */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/"
            className="hover:text-ocean-600 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Market
          </Link>
          <span>/</span>
          <Link href="/#bots-section" className="hover:text-ocean-600 transition-colors">
            Bot EA ({bot.platform})
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">{bot.title}</span>
        </div>
      </div>

      {/* Balanced 12-Col Layout: 8 Cols (4 Tabs) + 4 Cols (Purchase/Rent Box) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-8">
            <ProductDetailTabs productType="BOT_EA" bot={bot} onToast={setToastMsg} />
          </div>

          <div className="lg:col-span-4">
            <PurchasePlanSidebar
              productType="BOT_EA"
              productId={bot.id}
              title={bot.title}
              price={bot.price}
              platform={bot.platform}
              version={bot.version}
              createdAt={bot.createdAt}
              updatedAt={bot.updatedAt}
              demoFileKey={bot.demoFileKey}
              onToast={setToastMsg}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
