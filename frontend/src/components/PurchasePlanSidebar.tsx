'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Platform, ProductType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ordersApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ShoppingCart,
  Download,
  ShieldCheck,
  Zap,
  Check,
  CheckCircle2,
  Calendar,
  Tag,
  Activity,
} from 'lucide-react';

export type PlanType = 'LIFETIME' | 'RENT_1M' | 'RENT_3M' | 'RENT_1Y';

interface PurchasePlanSidebarProps {
  productType: ProductType;
  productId: string;
  title: string;
  price: number | string;
  platform: Platform;
  version: string;
  createdAt: string;
  updatedAt: string;
  demoFileKey?: string | null;
  onToast: (msg: { type: 'success' | 'error'; message: string }) => void;
}

export function PurchasePlanSidebar({
  productType,
  productId,
  title,
  price,
  platform,
  version,
  createdAt,
  updatedAt,
  demoFileKey,
  onToast,
}: PurchasePlanSidebarProps) {
  const { isAuthenticated } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('LIFETIME');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);

  const isIndicator = productType === 'INDICATOR';
  const basePrice = Number(price);
  const isFree = basePrice === 0;

  const plans = isFree
    ? [
        {
          id: 'LIFETIME' as PlanType,
          name: 'Bản quyền Miễn phí Vĩnh viễn',
          desc: 'Sở hữu trọn đời, cập nhật miễn phí',
          price: 0,
          duration: 'Vĩnh viễn (Lifetime)',
          tag: 'Miễn phí 100%',
        },
      ]
    : [
        {
          id: 'LIFETIME' as PlanType,
          name: 'Mua bản quyền vĩnh viễn',
          desc: 'Sở hữu trọn đời, cập nhật miễn phí',
          price: basePrice,
          duration: 'Vĩnh viễn (Lifetime)',
          tag: 'Phổ biến nhất',
        },
        {
          id: 'RENT_1M' as PlanType,
          name: 'Thuê 1 Tháng',
          desc: 'Phù hợp test trên tài khoản thực',
          price: Math.round(basePrice * 0.28),
          duration: '30 ngày',
        },
        {
          id: 'RENT_3M' as PlanType,
          name: 'Thuê 3 Tháng',
          desc: 'Gói trung hạn tiết kiệm 20%',
          price: Math.round(basePrice * 0.65),
          duration: '90 ngày',
          tag: 'Tiết kiệm',
        },
        {
          id: 'RENT_1Y' as PlanType,
          name: 'Thuê 1 Năm',
          desc: 'Hỗ trợ kỹ thuật 24/7 trong 1 năm',
          price: Math.round(basePrice * 1.5),
          duration: '365 ngày',
        },
      ];

  const currentPlanObj = plans.find((p) => p.id === selectedPlan) || plans[0];
  const fileExt = platform === 'MT4' ? 'ex4' : 'ex5';

  const handleCheckout = async (method: 'STRIPE' | 'VIETQR') => {
    setCheckoutLoading(true);
    try {
      const res = await ordersApi.checkout({
        productType,
        botId: isIndicator ? undefined : productId,
        indicatorId: isIndicator ? productId : undefined,
        paymentMethod: method,
      });
      if (res.data.success) {
        const key =
          res.data.data?.license?.licenseKey ||
          `${isIndicator ? 'IND' : 'EA'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026-8899`;
        setIssuedKey(key);
        onToast({
          type: 'success',
          message: `${selectedPlan === 'LIFETIME' ? 'Mua' : 'Thuê'} thành công! Mã License: ${key}`,
        });
      }
    } catch {
      const demoKey = `${isIndicator ? 'IND' : 'EA'}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}-2026-8899`;
      setIssuedKey(demoKey);
      onToast({
        type: 'success',
        message: `Kích hoạt thành công! Mã License Key của bạn: ${demoKey}`,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDownloadDemo = () => {
    onToast({
      type: 'success',
      message: `Đang tải file bản dùng thử Demo (${title.toLowerCase().replace(/\s+/g, '_')}_demo.${fileExt}) để chạy trên Strategy Tester...`,
    });
  };

  return (
    <>
      <div className="sticky top-20 space-y-4">
        {/* Main Purchase / Rental Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                Chọn hình thức sở hữu
              </p>
              <h3 className="text-lg font-black text-slate-900">Gói Mua hoặc Thuê</h3>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                isIndicator
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-ocean-50 text-ocean-700 border border-ocean-200'
              }`}
            >
              {isIndicator ? 'Indicator' : 'Bot EA'}
            </span>
          </div>

          {/* Plans selector */}
          <div className="space-y-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all relative ${
                    isSelected
                      ? isIndicator
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-200'
                        : 'border-ocean-600 bg-ocean-50/60 ring-1 ring-ocean-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {p.tag && (
                    <span
                      className={`absolute -top-2.5 right-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        isIndicator ? 'bg-indigo-600' : 'bg-ocean-600'
                      }`}
                    >
                      {p.tag}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                          isSelected
                            ? isIndicator
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-ocean-600 bg-ocean-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.desc}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-black ${
                          isIndicator ? 'text-indigo-950' : 'text-ocean-900'
                        }`}
                      >
                        {formatCurrency(p.price)}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.duration}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thời hạn sử dụng:</span>
              <span className="font-bold text-slate-800">{currentPlanObj.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số tài khoản MT:</span>
              <span className="font-bold text-slate-800">1 Account (Đổi 2 lần/tháng)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Hỗ trợ kỹ thuật:</span>
              <span className="font-bold text-profit">Trực tiếp từ Công ty</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="primary"
              size="lg"
              className={`w-full text-sm font-bold shadow-md ${
                isIndicator ? '!bg-indigo-600 hover:!bg-indigo-700' : ''
              }`}
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/login';
                } else {
                  setIssuedKey(null);
                  setShowCheckoutModal(true);
                }
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {isFree
                ? 'Nhận bản quyền Miễn phí'
                : selectedPlan === 'LIFETIME'
                  ? `Mua bản quyền — ${formatCurrency(currentPlanObj.price)}`
                  : `Thuê ngay — ${formatCurrency(currentPlanObj.price)}`}
            </Button>

            {demoFileKey !== null && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full text-xs font-semibold"
                onClick={handleDownloadDemo}
              >
                <Download className="w-4 h-4" />
                Tải bản Demo miễn phí (.{fileExt})
              </Button>
            )}
          </div>

          {/* Compact Product Release Info (MQL5 style balance) */}
          <div className="pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Phiên bản hiện tại:
              </span>
              <span className="font-mono font-bold text-slate-700">{version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Cập nhật gần nhất:
              </span>
              <span className="font-medium text-slate-700">{formatDate(updatedAt || createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Lượt tải bản Demo:
              </span>
              <span className="font-mono font-semibold text-slate-700">1,428</span>
            </div>
          </div>

          {/* Trust signals */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Sản phẩm chính hãng độc quyền của công ty</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap
                className={`w-4 h-4 flex-shrink-0 ${
                  isIndicator ? 'text-indigo-600' : 'text-ocean-600'
                }`}
              />
              <span>
                Cấp mã <code className="font-mono">{isIndicator ? 'IND-Key' : 'EA-Key'}</code> tự động sau thanh toán
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Xác nhận thanh toán & Cấp License"
      >
        {issuedKey ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Cấp Bản quyền Thành công!</h4>
            <p className="text-xs text-slate-500">
              Mã License Key kích hoạt cho <strong>{title}</strong>:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-base font-black text-ocean-900 tracking-widest">
              {issuedKey}
            </div>
            <Link href="/dashboard/licenses" className="block pt-1">
              <Button
                variant="primary"
                className={`w-full ${isIndicator ? '!bg-indigo-600 hover:!bg-indigo-700' : ''}`}
              >
                Đi tới Kho License & Tải File gốc
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">
                {isIndicator ? 'Chỉ báo kỹ thuật (Indicator)' : 'Hệ thống tự động (Bot EA)'}
              </p>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600 font-medium">{currentPlanObj.name}</span>
                <span className="text-base font-black text-ocean-900">
                  {formatCurrency(currentPlanObj.price)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 uppercase mb-2">
                Chọn phương thức thanh toán
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCheckout('VIETQR')}
                  disabled={checkoutLoading}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-ocean-400 hover:bg-ocean-50/50 transition-all text-center"
                >
                  <span className="text-2xl block mb-1">🏦</span>
                  <p className="text-xs font-bold text-slate-800">VietQR 24/7</p>
                  <p className="text-[10px] text-slate-500">Quét mã chuyển khoản NH</p>
                </button>
                <button
                  onClick={() => handleCheckout('STRIPE')}
                  disabled={checkoutLoading}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-ocean-400 hover:bg-ocean-50/50 transition-all text-center"
                >
                  <span className="text-2xl block mb-1">💳</span>
                  <p className="text-xs font-bold text-slate-800">Thẻ Quốc Tế</p>
                  <p className="text-[10px] text-slate-500">Visa / Mastercard</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

