'use client';

import React, { useState, useEffect } from 'react';
import { License, Bot, Indicator } from '@/types';
import { licensesApi, ordersApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { fallbackBots, fallbackIndicators } from '@/lib/fallback-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import {
  KeyRound,
  Copy,
  CheckCircle2,
  RefreshCw,
  Download,
  Shield,
  Server,
  Calendar,
  AlertTriangle,
  Loader2,
  Bot as BotIcon,
  Activity,
} from 'lucide-react';

const demoLicenses: (License & { bot?: Bot; indicator?: Indicator })[] = [
  {
    id: 'lic1',
    licenseKey: 'EA-DEMO-2026-8888',
    userId: 'u1',
    productType: 'BOT_EA',
    botId: '1',
    mtAccountNo: '21008899',
    resetCount: 0,
    isActive: true,
    expiresAt: null,
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    bot: fallbackBots[0],
  },
  {
    id: 'lic2',
    licenseKey: 'IND-DEMO-2026-9999',
    userId: 'u1',
    productType: 'INDICATOR',
    indicatorId: 'ind-1',
    mtAccountNo: '21008899',
    resetCount: 0,
    isActive: true,
    expiresAt: null,
    createdAt: '2026-11-02T00:00:00Z',
    updatedAt: '2026-11-02T00:00:00Z',
    indicator: fallbackIndicators[0],
  },
  {
    id: 'lic3',
    licenseKey: 'EA-K8X2-M4PQ-9J7L',
    userId: 'u1',
    productType: 'BOT_EA',
    botId: '5',
    mtAccountNo: null,
    resetCount: 0,
    isActive: true,
    expiresAt: '2027-06-30T23:59:59Z',
    createdAt: '2026-11-05T00:00:00Z',
    updatedAt: '2026-11-05T00:00:00Z',
    bot: fallbackBots[4],
  },
];

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<(License & { bot?: Bot; indicator?: Indicator })[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'BOT_EA' | 'INDICATOR'>('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  async function fetchLicenses() {
    try {
      const res = await licensesApi.getMyLicenses();
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setLicenses(res.data.data);
      } else {
        setLicenses(demoLicenses);
      }
    } catch {
      setLicenses(demoLicenses);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleReset = async (licenseId: string) => {
    setResettingId(licenseId);
    try {
      const res = await licensesApi.resetAccount(licenseId);
      if (res.data.success) {
        setToastMsg({
          type: 'success',
          message: 'Đã gỡ liên kết tài khoản MT4/MT5. Bạn có thể gắn sang tài khoản mới.',
        });
        fetchLicenses();
      }
    } catch (err: any) {
      setToastMsg({
        type: 'error',
        message: err.response?.data?.message || 'Không thể reset tài khoản. Vui lòng thử lại.',
      });
    } finally {
      setResettingId(null);
    }
  };

  const handleDownload = async (productId: string) => {
    setDownloadingId(productId);
    try {
      const res = await ordersApi.getDownloadUrl(productId);
      if (res.data.success && res.data.data?.downloadUrl) {
        window.open(res.data.data.downloadUrl, '_blank');
        setToastMsg({ type: 'success', message: 'Link tải đã mở! Link sẽ hết hạn sau 60 giây.' });
      }
    } catch (err: any) {
      setToastMsg({
        type: 'error',
        message: err.response?.data?.message || 'Không thể tạo link tải. Vui lòng thử lại.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredLicenses = licenses.filter((l) => {
    const resolvedType = l.productType || (l.indicatorId || l.indicator ? 'INDICATOR' : 'BOT_EA');
    if (filterType === 'ALL') return true;
    return resolvedType === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-ocean-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* Header + Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Kho License Bot EA & Indicator</h1>
            <p className="text-xs text-slate-500">
              Quản lý mã kích hoạt riêng biệt cho từng Bot EA (<code className="font-mono">EA-...</code>) và Indicator (<code className="font-mono">IND-...</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Tất cả ({licenses.length})
          </button>
          <button
            onClick={() => setFilterType('BOT_EA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'BOT_EA' ? 'bg-ocean-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Bot EA
          </button>
          <button
            onClick={() => setFilterType('INDICATOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'INDICATOR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Indicator
          </button>
        </div>
      </div>

      {/* Licenses List */}
      {filteredLicenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <KeyRound className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có License nào trong mục này</h3>
          <p className="text-sm text-slate-500">
            Mua hoặc thuê Bot EA / Indicator tại cửa hàng để được cấp License Key tự động.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLicenses.map((license) => {
            const isIndicator =
              license.productType === 'INDICATOR' || Boolean(license.indicator || license.indicatorId);
            const productTitle = isIndicator
              ? license.indicator?.title || 'Custom Indicator'
              : license.bot?.title || 'Expert Advisor Bot';
            const productPlatform = isIndicator
              ? license.indicator?.platform
              : license.bot?.platform;
            const productVersion = isIndicator
              ? license.indicator?.version
              : license.bot?.version;
            const targetProductId = (isIndicator ? license.indicatorId : license.botId) || '';

            return (
              <div
                key={license.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div
                  className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 ${
                    isIndicator
                      ? 'bg-gradient-to-r from-indigo-50/60 to-white'
                      : 'bg-gradient-to-r from-ocean-50/50 to-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIndicator
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-ocean-100 text-ocean-600'
                      }`}
                    >
                      {isIndicator ? <Activity className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isIndicator
                              ? 'bg-indigo-600 text-white'
                              : 'bg-ocean-600 text-white'
                          }`}
                        >
                          {isIndicator ? 'Indicator' : 'Bot EA'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{productTitle}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {productPlatform && <Badge platform={productPlatform} />}
                        {productVersion && (
                          <span className="text-[11px] font-mono text-slate-400">v{productVersion}</span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          • Chép vào:{' '}
                          <code className="font-mono font-bold text-slate-700">
                            {isIndicator ? 'MQL4/5/Indicators' : 'MQL4/5/Experts'}
                          </code>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {license.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-profit bg-profit-bg px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Đang kích hoạt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Đã hết hạn
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        {isIndicator ? 'Indicator License Key' : 'Bot EA License Key'}
                      </p>
                      <p className="text-sm font-mono font-bold text-slate-800 tracking-widest">
                        {license.licenseKey}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(license.licenseKey)}
                      className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-ocean-50 hover:border-ocean-200 flex items-center justify-center transition-all"
                      title="Copy License Key"
                    >
                      {copiedKey === license.licenseKey ? (
                        <CheckCircle2 className="w-4 h-4 text-profit" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <Server className="w-3 h-3" />
                        <span className="font-bold uppercase text-[10px]">MT Account</span>
                      </div>
                      <p className="font-mono font-bold text-slate-800">
                        {license.mtAccountNo || '—— Chưa gắn ——'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <RefreshCw className="w-3 h-3" />
                        <span className="font-bold uppercase text-[10px]">Đã reset</span>
                      </div>
                      <p className="font-bold text-slate-800">{license.resetCount}/2 lần/tháng</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <Calendar className="w-3 h-3" />
                        <span className="font-bold uppercase text-[10px]">Hết hạn</span>
                      </div>
                      <p className="font-bold text-slate-800">
                        {license.expiresAt ? formatDate(license.expiresAt) : '♾️ Lifetime'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <Calendar className="w-3 h-3" />
                        <span className="font-bold uppercase text-[10px]">Ngày cấp</span>
                      </div>
                      <p className="font-bold text-slate-800">{formatDate(license.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      className={isIndicator ? '!bg-indigo-600 hover:!bg-indigo-700' : ''}
                      onClick={() => handleDownload(targetProductId)}
                      isLoading={downloadingId === targetProductId}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải file .{productPlatform === 'MT4' ? 'ex4' : 'ex5'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReset(license.id)}
                      isLoading={resettingId === license.id}
                      disabled={license.resetCount >= 2}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Account
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(license.licenseKey)}>
                      <Copy className="w-3.5 h-3.5" />
                      {copiedKey === license.licenseKey ? 'Đã copy!' : 'Copy Key'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MQL Usage Guide */}
      <div className="bg-ocean-50 rounded-2xl border border-ocean-200 p-6">
        <h3 className="text-sm font-bold text-ocean-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-ocean-600" />
          Cấu trúc xác thực WebRequest cho Bot EA & Indicator
        </h3>
        <div className="text-xs text-ocean-800 space-y-1 font-mono bg-white/70 rounded-xl p-4 border border-ocean-200">
          <p className="text-ocean-600">
            POST {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/licenses/verify
          </p>
          <p>{'{'}</p>
          <p className="pl-4">{'"licenseKey": "EA-XXXX-XXXX-XXXX hoặc IND-XXXX-XXXX-XXXX",'}</p>
          <p className="pl-4">{'"accountNumber": "21008899",'}</p>
          <p className="pl-4">{'"botId": "uuid-cua-bot" // hoặc "indicatorId": "uuid-cua-indicator"'}</p>
          <p>{'}'}</p>
        </div>
      </div>
    </div>
  );
}
