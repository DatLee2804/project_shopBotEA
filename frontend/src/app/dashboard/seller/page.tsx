'use client';

import React, { useState, useRef } from 'react';
import { Bot } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { botsApi } from '@/lib/api-client';
import {
  Store,
  Plus,
  Upload,
  DollarSign,
  BarChart3,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  FileCode,
  Layers,
  Loader2,
} from 'lucide-react';

// Demo bots for when backend is offline
const demoSellerBots: Bot[] = [
  {
    id: '1', title: 'OceanGold Scalper Pro XAUUSD', slug: 'oceangold-scalper-pro-xauusd',
    shortDesc: 'Scalping vàng siêu tần số trên khung M5', description: '', price: 149.0,
    platform: 'MT5', version: '2.1.0', fileKey: 'bots/oceangold/v2.1.0.ex5', winRate: 78.5,
    maxDrawdown: 11.2, profitFactor: 2.15, status: 'APPROVED', sellerId: 's1',
    createdAt: '2026-09-15T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
  },
  {
    id: '2', title: 'SkyTrend Grid Master EURUSD', slug: 'skytrend-grid-master-eurusd',
    shortDesc: 'Grid trading thông minh đa khung thời gian', description: '', price: 99.0,
    platform: 'BOTH', version: '3.0.4', fileKey: 'bots/skytrend/v3.0.4.ex5', winRate: 82.0,
    maxDrawdown: 14.8, profitFactor: 1.95, status: 'APPROVED', sellerId: 's1',
    createdAt: '2026-08-10T00:00:00Z', updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: '7', title: 'Phoenix Reversal EA', slug: 'phoenix-reversal-ea',
    shortDesc: 'Đánh đảo chiều tại các vùng cung cầu quan trọng', description: '', price: 179.0,
    platform: 'MT5', version: '1.0.0', fileKey: '', winRate: 0, maxDrawdown: 0,
    profitFactor: 0, status: 'PENDING', sellerId: 's1',
    createdAt: '2026-11-10T00:00:00Z', updatedAt: '2026-11-10T00:00:00Z',
  },
];

export default function SellerPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bots, setBots] = useState<Bot[]>(demoSellerBots);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState<'MT4' | 'MT5' | 'BOTH'>('MT5');
  const [winRate, setWinRate] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState('');
  const [profitFactor, setProfitFactor] = useState('');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const demoFileRef = useRef<HTMLInputElement>(null);

  const approvedBots = bots.filter((b) => b.status === 'APPROVED');
  const pendingBots = bots.filter((b) => b.status === 'PENDING');
  const totalRevenue = approvedBots.reduce((sum, b) => sum + Number(b.price) * 3, 0); // demo multiply
  const platformFee = totalRevenue * 0.15;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'ex4' && ext !== 'ex5') {
        setToastMsg({ type: 'error', message: 'Chỉ chấp nhận file .ex4 hoặc .ex5' });
        return;
      }
      setter(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDesc || !price) {
      setToastMsg({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await botsApi.createBot({
        title,
        shortDesc,
        description,
        price: parseFloat(price) as any,
        platform,
        winRate: winRate ? parseFloat(winRate) : 0,
        maxDrawdown: maxDrawdown ? parseFloat(maxDrawdown) : 0,
        profitFactor: profitFactor ? parseFloat(profitFactor) : 0,
      });

      if (res.data.success && res.data.data) {
        // Upload files if present
        if (mainFile) {
          const formData = new FormData();
          formData.append('file', mainFile);
          if (demoFile) formData.append('demoFile', demoFile);
          await botsApi.uploadBotFile(res.data.data.id, formData);
        }

        setToastMsg({ type: 'success', message: 'Đã gửi Bot lên hệ thống! Admin sẽ duyệt trong 24h.' });
        setShowCreateForm(false);
        resetForm();
      }
    } catch (err: any) {
      setToastMsg({
        type: 'error',
        message: err.response?.data?.message || 'Không thể tạo Bot. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setShortDesc('');
    setDescription('');
    setPrice('');
    setPlatform('MT5');
    setWinRate('');
    setMaxDrawdown('');
    setProfitFactor('');
    setMainFile(null);
    setDemoFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-600 to-ocean-900 flex items-center justify-center text-white shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Kênh Seller</h1>
              <p className="text-xs text-slate-500">Đăng bán Bot EA, theo dõi trạng thái duyệt & doanh thu</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4" />
            Đăng Bot mới
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Package className="w-4 h-4" />
            <span className="font-bold uppercase">Tổng Bot</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{bots.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <CheckCircle2 className="w-4 h-4 text-profit" />
            <span className="font-bold uppercase">Đã duyệt</span>
          </div>
          <p className="text-2xl font-black text-profit">{approvedBots.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-bold uppercase">Đang chờ duyệt</span>
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingBots.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-ocean-600" />
            <span className="font-bold uppercase">Doanh thu ước tính</span>
          </div>
          <p className="text-2xl font-black text-ocean-900">{formatCurrency(totalRevenue - platformFee)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Phí sàn 15%: {formatCurrency(platformFee)}</p>
        </div>
      </div>

      {/* Create Bot Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-ocean-600" />
            Đăng Bot EA mới
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tên Bot EA *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: OceanGold Scalper Pro XAUUSD"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>

              {/* Short Desc */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mô tả ngắn *</label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn dưới 255 ký tự"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>

              {/* Price + Platform */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Giá bản quyền (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 = Miễn phí"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nền tảng</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as 'MT4' | 'MT5' | 'BOTH')}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                >
                  <option value="MT5">MetaTrader 5</option>
                  <option value="MT4">MetaTrader 4</option>
                  <option value="BOTH">Cả MT4 & MT5</option>
                </select>
              </div>

              {/* Backtest Metrics */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Win Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={winRate}
                  onChange={(e) => setWinRate(e.target.value)}
                  placeholder="VD: 78.5"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Max Drawdown (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(e.target.value)}
                  placeholder="VD: 11.2"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>

              {/* Profit Factor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Profit Factor</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={profitFactor}
                  onChange={(e) => setProfitFactor(e.target.value)}
                  placeholder="VD: 2.15"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mô tả chi tiết</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả đầy đủ về Bot EA: chiến lược, cặp tiền, khung thời gian, yêu cầu tài khoản..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  File chính (.ex4/.ex5) *
                </label>
                <input
                  ref={mainFileRef}
                  type="file"
                  accept=".ex4,.ex5"
                  onChange={(e) => handleFileChange(e, setMainFile)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mainFileRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-ocean-400 hover:bg-ocean-50/50 transition-all group"
                >
                  {mainFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileCode className="w-5 h-5 text-ocean-600" />
                      <span className="text-sm font-medium text-slate-700">{mainFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-ocean-600" />
                      <p className="text-xs text-slate-500">Kéo thả hoặc click để chọn file</p>
                      <p className="text-[10px] text-slate-400">.ex4 hoặc .ex5</p>
                    </div>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  File Demo (tùy chọn)
                </label>
                <input
                  ref={demoFileRef}
                  type="file"
                  accept=".ex4,.ex5"
                  onChange={(e) => handleFileChange(e, setDemoFile)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => demoFileRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-ocean-400 hover:bg-ocean-50/50 transition-all group"
                >
                  {demoFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileCode className="w-5 h-5 text-ocean-600" />
                      <span className="text-sm font-medium text-slate-700">{demoFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-ocean-600" />
                      <p className="text-xs text-slate-500">File demo miễn phí</p>
                      <p className="text-[10px] text-slate-400">.ex4 hoặc .ex5</p>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
                <Upload className="w-4 h-4" />
                Gửi Bot để duyệt
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Bot List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-ocean-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh sách Bot của bạn</h2>
        </div>

        {bots.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Chưa có Bot nào. Nhấn &quot;Đăng Bot mới&quot; để bắt đầu.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bots.map((bot) => (
              <div key={bot.id} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-ocean-50 flex items-center justify-center text-ocean-600 flex-shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{bot.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge platform={bot.platform} />
                      <span className="text-xs text-slate-400">v{bot.version}</span>
                      <span className="text-xs font-mono text-slate-500">{formatCurrency(bot.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {bot.winRate > 0 && (
                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <span className="text-profit font-bold">{bot.winRate}% WR</span>
                      <span className="text-drawdown font-bold">{bot.maxDrawdown}% DD</span>
                    </div>
                  )}
                  <Badge status={bot.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

