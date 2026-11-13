'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Bot, Indicator, IndicatorCategory, ProductType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  fallbackBots,
  fallbackIndicators,
  INDICATOR_CATEGORY_LABELS,
} from '@/lib/fallback-data';
import { botsApi, indicatorsApi } from '@/lib/api-client';
import {
  ShieldCheck,
  Plus,
  KeyRound,
  DollarSign,
  Users,
  Upload,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BarChart3,
  Eye,
  Bot as BotIcon,
  Activity,
  BellRing,
} from 'lucide-react';

interface AdminLicenseItem {
  id: string;
  licenseKey: string;
  productType: ProductType;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  planType: 'LIFETIME' | 'RENTAL';
  mtAccountNo: string | null;
  resetCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const initialLicenses: AdminLicenseItem[] = [
  {
    id: 'lic1',
    licenseKey: 'EA-DEMO-2026-8888',
    productType: 'BOT_EA',
    customerName: 'John Trader',
    customerEmail: 'trader@oceanea.com',
    productTitle: 'OceanGold Scalper Pro XAUUSD',
    planType: 'LIFETIME',
    mtAccountNo: '21008899',
    resetCount: 0,
    isActive: true,
    expiresAt: null,
    createdAt: '2026-10-15T00:00:00Z',
  },
  {
    id: 'lic2',
    licenseKey: 'IND-DEMO-2026-9999',
    productType: 'INDICATOR',
    customerName: 'John Trader',
    customerEmail: 'trader@oceanea.com',
    productTitle: 'OceanSMC OrderBlock & FVG Matrix',
    planType: 'LIFETIME',
    mtAccountNo: '21008899',
    resetCount: 0,
    isActive: true,
    expiresAt: null,
    createdAt: '2026-11-02T00:00:00Z',
  },
  {
    id: 'lic3',
    licenseKey: 'EA-RENT-2026-7712',
    productType: 'BOT_EA',
    customerName: 'Nguyễn Văn Minh',
    customerEmail: 'minh.trader@gmail.com',
    productTitle: 'Marine PropFirm Challenge Passer',
    planType: 'RENTAL',
    mtAccountNo: '88392102',
    resetCount: 1,
    isActive: true,
    expiresAt: '2026-12-15T23:59:59Z',
    createdAt: '2026-11-10T00:00:00Z',
  },
  {
    id: 'lic4',
    licenseKey: 'IND-RENT-2026-5520',
    productType: 'INDICATOR',
    customerName: 'Trần Hoàng Long',
    customerEmail: 'long.invest@yahoo.com',
    productTitle: 'TidalFlow Institutional Volume Profile',
    planType: 'RENTAL',
    mtAccountNo: null,
    resetCount: 0,
    isActive: true,
    expiresAt: '2027-02-10T23:59:59Z',
    createdAt: '2026-11-11T00:00:00Z',
  },
];

type AdminTab = 'BOTS' | 'INDICATORS' | 'LICENSES' | 'ORDERS';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('BOTS');
  const [bots, setBots] = useState<Bot[]>(fallbackBots);
  const [indicators, setIndicators] = useState<Indicator[]>(fallbackIndicators);
  const [licenses, setLicenses] = useState<AdminLicenseItem[]>(initialLicenses);

  const [createMode, setCreateMode] = useState<ProductType | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Common Form Fields
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState<'MT4' | 'MT5' | 'BOTH'>('MT5');
  const [mainFileName, setMainFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bot EA Specific Fields
  const [winRate, setWinRate] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState('');
  const [profitFactor, setProfitFactor] = useState('');

  // Indicator Specific Fields
  const [category, setCategory] = useState<IndicatorCategory>('SMC_ICT');
  const [accuracyRate, setAccuracyRate] = useState('');
  const [isNonRepaint, setIsNonRepaint] = useState(true);
  const [hasAlert, setHasAlert] = useState(true);
  const [timeframes, setTimeframes] = useState('M5, M15, H1, H4');

  const resetForm = () => {
    setTitle('');
    setShortDesc('');
    setDescription('');
    setPrice('');
    setPlatform('MT5');
    setMainFileName('');
    setWinRate('');
    setMaxDrawdown('');
    setProfitFactor('');
    setCategory('SMC_ICT');
    setAccuracyRate('');
    setIsNonRepaint(true);
    setHasAlert(true);
    setTimeframes('M5, M15, H1, H4');
  };

  const handleToggleLicenseActive = (licenseId: string) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === licenseId ? { ...l, isActive: !l.isActive } : l)),
    );
    setToastMsg({ type: 'success', message: 'Cập nhật trạng thái License thành công!' });
  };

  const handleResetMtAccount = (licenseId: string) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === licenseId ? { ...l, mtAccountNo: null } : l)),
    );
    setToastMsg({
      type: 'success',
      message: 'Đã gỡ số tài khoản MT4/MT5 cho khách hàng.',
    });
  };

  const handleExtendRental = (licenseId: string, days: number) => {
    setLicenses((prev) =>
      prev.map((l) => {
        if (l.id === licenseId) {
          const currentExp = l.expiresAt ? new Date(l.expiresAt) : new Date();
          currentExp.setDate(currentExp.getDate() + days);
          return { ...l, expiresAt: currentExp.toISOString() };
        }
        return l;
      }),
    );
    setToastMsg({ type: 'success', message: `Đã gia hạn thêm ${days} ngày cho License!` });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDesc || price === '') {
      setToastMsg({ type: 'error', message: 'Vui lòng điền đủ tên, mô tả ngắn và giá!' });
      return;
    }

    const slug = title.toLowerCase().trim().replace(/\s+/g, '-');

    if (createMode === 'BOT_EA') {
      const payload = {
        title,
        shortDesc,
        description: description || shortDesc,
        price: parseFloat(price),
        platform,
        version: '1.0.0',
        fileKey: `bots/${slug}/${mainFileName || 'main.ex5'}`,
        winRate: winRate ? parseFloat(winRate) : 75,
        maxDrawdown: maxDrawdown ? parseFloat(maxDrawdown) : 10,
        profitFactor: profitFactor ? parseFloat(profitFactor) : 2.0,
      };

      try {
        await botsApi.createBot(payload);
      } catch {
        // Fallback local state when DB offline
      }

      const newBot: Bot = {
        id: 'bot-' + Date.now(),
        slug,
        ...payload,
        demoFileKey: null,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80',
        status: 'APPROVED',
        sellerId: 'company',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBots([newBot, ...bots]);
      setActiveTab('BOTS');
      setToastMsg({ type: 'success', message: 'Đã xuất bản Bot EA mới vào bảng Bot thành công!' });
    } else if (createMode === 'INDICATOR') {
      const payload = {
        title,
        shortDesc,
        description: description || shortDesc,
        price: parseFloat(price),
        platform,
        version: '1.0.0',
        fileKey: `indicators/${slug}/${mainFileName || 'main.ex5'}`,
        category,
        accuracyRate: accuracyRate ? parseFloat(accuracyRate) : 85,
        isNonRepaint,
        hasAlert,
        timeframes: timeframes || 'M5, M15, H1, H4',
      };

      try {
        await indicatorsApi.createIndicator(payload);
      } catch {
        // Fallback local state when DB offline
      }

      const newInd: Indicator = {
        id: 'ind-' + Date.now(),
        slug,
        ...payload,
        demoFileKey: null,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=600&q=80',
        status: 'APPROVED',
        sellerId: 'company',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIndicators([newInd, ...indicators]);
      setActiveTab('INDICATORS');
      setToastMsg({
        type: 'success',
        message: 'Đã xuất bản Chỉ báo mới vào bảng Indicator thành công!',
      });
    }

    setCreateMode(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">Quản trị Hệ thống OceanEA</h1>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  Admin Công ty
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân tách quản lý 2 bảng dữ liệu độc lập: <strong>Bot EA</strong> & <strong>Indicator</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setCreateMode('BOT_EA');
              }}
            >
              <Plus className="w-4 h-4" />
              Đăng Bot EA mới
            </Button>

            <Button
              variant="primary"
              className="!bg-indigo-600 hover:!bg-indigo-700"
              onClick={() => {
                resetForm();
                setCreateMode('INDICATOR');
              }}
            >
              <Plus className="w-4 h-4" />
              Đăng Indicator mới
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <BotIcon className="w-4 h-4 text-ocean-600" />
            <span className="font-bold uppercase">Sản phẩm Bot EA</span>
          </div>
          <p className="text-3xl font-black text-ocean-900">{bots.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Bảng DB: <code className="font-mono">Bot</code></p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="font-bold uppercase">Sản phẩm Indicator</span>
          </div>
          <p className="text-3xl font-black text-indigo-700">{indicators.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Bảng DB: <code className="font-mono">Indicator</code></p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span className="font-bold uppercase">License Đang mở</span>
          </div>
          <p className="text-3xl font-black text-profit">
            {licenses.filter((l) => l.isActive).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Cả mã EA- và IND-</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span className="font-bold uppercase">Tổng Doanh thu</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{formatCurrency(18490)}</p>
          <p className="text-[11px] text-profit font-semibold mt-1">100% doanh thu công ty</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('BOTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'BOTS'
              ? 'bg-ocean-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BotIcon className="w-4 h-4" />
          Quản lý Bot EA ({bots.length})
        </button>

        <button
          onClick={() => setActiveTab('INDICATORS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'INDICATORS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Quản lý Indicator ({indicators.length})
        </button>

        <button
          onClick={() => setActiveTab('LICENSES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'LICENSES'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          License Khách hàng ({licenses.length})
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Đơn hàng & Doanh thu
        </button>
      </div>

      {/* TAB 1: BOT EA MANAGEMENT */}
      {activeTab === 'BOTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className="w-4 h-4 text-ocean-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Danh sách Bot EA (Hệ thống Giao dịch Tự động)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Prisma Model: Bot</span>
          </div>

          <div className="divide-y divide-slate-100">
            {bots.map((b) => (
              <div
                key={b.id}
                className="p-5 flex items-center justify-between flex-wrap gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 border border-ocean-100 flex items-center justify-center text-ocean-600 flex-shrink-0">
                    <BotIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{b.title}</h3>
                      <Badge platform={b.platform} />
                      <span className="text-xs font-mono text-slate-400">v{b.version}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.shortDesc}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>
                        Giá bán: <strong className="text-ocean-900">{formatCurrency(b.price)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Thuê/tháng:{' '}
                        <strong className="text-slate-700">
                          {Number(b.price) === 0
                            ? 'Miễn phí'
                            : formatCurrency(Math.round(Number(b.price) * 0.28))}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-profit">{b.winRate}% Winrate</p>
                    <p className="text-xs text-drawdown">{b.maxDrawdown}% Max DD</p>
                  </div>
                  <Link href={`/bots/${b.slug}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5" />
                      Xem
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INDICATORS MANAGEMENT */}
      {activeTab === 'INDICATORS' && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Danh sách Indicator (Chỉ báo Kỹ thuật & Tín hiệu)
              </h2>
            </div>
            <span className="text-xs text-indigo-600 font-semibold">Prisma Model: Indicator</span>
          </div>

          <div className="divide-y divide-slate-100">
            {indicators.map((ind) => (
              <div
                key={ind.id}
                className="p-5 flex items-center justify-between flex-wrap gap-4 hover:bg-indigo-50/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{ind.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {INDICATOR_CATEGORY_LABELS[ind.category]}
                      </span>
                      <Badge platform={ind.platform} />
                      <span className="text-xs font-mono text-slate-400">v{ind.version}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ind.shortDesc}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>
                        Giá bán: <strong className="text-indigo-900">{formatCurrency(ind.price)}</strong>
                      </span>
                      <span>•</span>
                      <span>Khung: <strong className="text-slate-700">{ind.timeframes}</strong></span>
                      {ind.isNonRepaint && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">100% Non-Repaint</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-profit">{ind.accuracyRate}% Chuẩn xác</p>
                    <p className="text-xs text-amber-700 flex items-center justify-end gap-1">
                      <BellRing className="w-3 h-3" />
                      {ind.hasAlert ? 'Có Alert' : 'Không Alert'}
                    </p>
                  </div>
                  <Link href={`/indicators/${ind.slug}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5" />
                      Xem
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LICENSES MANAGEMENT */}
      {activeTab === 'LICENSES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Quản lý License Khách Hàng (Bot EA & Indicator)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Phân loại tự động theo ProductType</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-5 py-3">License Key</th>
                  <th className="px-5 py-3">Loại SP</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Tên Sản phẩm</th>
                  <th className="px-5 py-3">MT Account</th>
                  <th className="px-5 py-3">Thời hạn</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">{lic.licenseKey}</td>
                    <td className="px-5 py-4">
                      {lic.productType === 'INDICATOR' ? (
                        <span className="bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                          INDICATOR
                        </span>
                      ) : (
                        <span className="bg-ocean-100 text-ocean-900 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                          BOT EA
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{lic.customerName}</p>
                      <p className="text-[11px] text-slate-400">{lic.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 max-w-[180px] truncate">
                      {lic.productTitle}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      {lic.mtAccountNo ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                          {lic.mtAccountNo}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa gắn</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {lic.expiresAt ? formatDate(lic.expiresAt) : '♾️ Vĩnh viễn'}
                    </td>
                    <td className="px-5 py-4">
                      {lic.isActive ? (
                        <span className="text-profit font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {lic.mtAccountNo && (
                        <button
                          onClick={() => handleResetMtAccount(lic.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <RefreshCw className="w-3 h-3 inline mr-1" />
                          Reset MT
                        </button>
                      )}
                      {lic.planType === 'RENTAL' && (
                        <button
                          onClick={() => handleExtendRental(lic.id, 30)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold transition-colors border border-amber-200"
                        >
                          +30 Ngày
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleLicenseActive(lic.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          lic.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {lic.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & DB ARCHITECTURE SUMMARY */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cấu trúc Doanh thu & Phân tách CSDL (Bot EA vs Indicator)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-ocean-50/60 border border-ocean-200 space-y-1.5">
              <p className="font-extrabold text-ocean-900 text-sm">1. Dòng sản phẩm Bot EA (Bảng `Bot`)</p>
              <p>• Lưu thông số kiểm thử tự động: <code>winRate</code>, <code>maxDrawdown</code>, <code>profitFactor</code>.</p>
              <p>• Cấp mã kích hoạt định dạng <code>EA-XXXX-XXXX-XXXX</code> qua trường <code>botId</code>.</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
              <p className="font-extrabold text-indigo-900 text-sm">2. Dòng sản phẩm Indicator (Bảng `Indicator`)</p>
              <p>• Lưu thông số tín hiệu: <code>category</code>, <code>accuracyRate</code>, <code>isNonRepaint</code>, <code>hasAlert</code>, <code>timeframes</code>.</p>
              <p>• Cấp mã kích hoạt định dạng <code>IND-XXXX-XXXX-XXXX</code> qua trường <code>indicatorId</code>.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BOT EA OR INDICATOR */}
      {createMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setCreateMode(null)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    createMode === 'INDICATOR'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-ocean-100 text-ocean-800'
                  }`}
                >
                  {createMode === 'INDICATOR' ? 'Bảng DB: Indicator' : 'Bảng DB: Bot'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {createMode === 'INDICATOR'
                    ? 'Xuất bản Chỉ báo Kỹ thuật (Indicator) Mới'
                    : 'Xuất bản Hệ thống Giao dịch (Bot EA) Mới'}
                </h3>
              </div>
              <button
                onClick={() => setCreateMode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {createMode === 'INDICATOR' ? 'Tên Chỉ báo Indicator *' : 'Tên Bot EA *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    createMode === 'INDICATOR'
                      ? 'VD: OceanSMC Liquidity Sweep Indicator'
                      : 'VD: OceanTitan Smart Scalper XAUUSD'
                  }
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mô tả ngắn *
                </label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Tóm tắt điểm mạnh nổi bật trên thẻ sản phẩm"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giá bán trọn đời (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Nhập 0 nếu miễn phí"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nền tảng hỗ trợ
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'MT4' | 'MT5' | 'BOTH')}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
                  >
                    <option value="MT5">MetaTrader 5 (MT5)</option>
                    <option value="MT4">MetaTrader 4 (MT4)</option>
                    <option value="BOTH">Hỗ trợ cả MT4 & MT5</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields by ProductType */}
              {createMode === 'BOT_EA' ? (
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-ocean-50/50 border border-ocean-100">
                  <div>
                    <label className="block text-xs font-bold text-ocean-900 uppercase mb-1">
                      Win Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={winRate}
                      onChange={(e) => setWinRate(e.target.value)}
                      placeholder="VD: 78.5"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ocean-900 uppercase mb-1">
                      Max Drawdown (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={maxDrawdown}
                      onChange={(e) => setMaxDrawdown(e.target.value)}
                      placeholder="VD: 10.2"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ocean-900 uppercase mb-1">
                      Profit Factor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={profitFactor}
                      onChange={(e) => setProfitFactor(e.target.value)}
                      placeholder="VD: 2.15"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                        Nhóm Chỉ báo
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as IndicatorCategory)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="SMC_ICT">SMC / ICT Smart Money</option>
                        <option value="TREND_SIGNAL">Tín hiệu Xu hướng</option>
                        <option value="VOLUME_FLOW">Volume & Orderflow</option>
                        <option value="OSCILLATOR">Động lượng & Phân kỳ</option>
                        <option value="MULTI_TIMEFRAME">Đa khung thời gian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                        Độ chuẩn xác (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={accuracyRate}
                        onChange={(e) => setAccuracyRate(e.target.value)}
                        placeholder="VD: 86.5"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                        Khung thời gian
                      </label>
                      <input
                        type="text"
                        value={timeframes}
                        onChange={(e) => setTimeframes(e.target.value)}
                        placeholder="M5, M15, H1, H4"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNonRepaint}
                        onChange={(e) => setIsNonRepaint(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Cam kết 100% Non-Repaint (Không vẽ lại)
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAlert}
                        onChange={(e) => setHasAlert(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Tích hợp Cảnh báo Alert (Popup / Mobile / Telegram)
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hướng dẫn thông số cài đặt, chiến lược sử dụng..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  File biên dịch (.ex4 / .ex5)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ex4,.ex5"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setMainFileName(f.name);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-ocean-400 hover:bg-ocean-50/50 transition-all text-xs text-slate-500"
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  {mainFileName ? (
                    <span className="font-bold text-ocean-700">{mainFileName}</span>
                  ) : (
                    <span>Click chọn file .ex4 / .ex5</span>
                  )}
                </button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  className={`flex-1 ${
                    createMode === 'INDICATOR' ? '!bg-indigo-600 hover:!bg-indigo-700' : ''
                  }`}
                >
                  {createMode === 'INDICATOR'
                    ? 'Xuất bản vào Danh sách Indicator'
                    : 'Xuất bản vào Danh sách Bot EA'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreateMode(null)}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
