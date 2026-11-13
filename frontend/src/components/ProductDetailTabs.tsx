'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Indicator, ProductType, Review } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  fallbackBots,
  fallbackIndicators,
  INDICATOR_CATEGORY_LABELS,
} from '@/lib/fallback-data';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Star,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Activity,
  Layers,
  CheckCircle2,
  BellRing,
  FileCode,
  Download,
  CornerDownRight,
  MessageSquare,
  Send,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  FolderOpen,
  Info,
} from 'lucide-react';

export type DetailTabKey = 'OVERVIEW' | 'REVIEWS' | 'COMMENTS' | 'WHATS_NEW';

interface ProductDetailTabsProps {
  productType: ProductType;
  bot?: Bot;
  indicator?: Indicator;
  onToast: (msg: { type: 'success' | 'error'; message: string }) => void;
}

interface RichReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  developerReply?: {
    date: string;
    content: string;
  };
}

interface CommentPostItem {
  id: string;
  number: number;
  author: string;
  isDeveloper?: boolean;
  date: string;
  title?: string;
  content: string;
  attachments?: Array<{ name: string; size: string; presetContent: string }>;
  chartPreviewUrl?: string;
}

interface ChangelogItem {
  version: string;
  date: string;
  highlights: string[];
  codeNote?: string;
}

function renderFormattedDescription(raw: string, isIndicator: boolean) {
  const blocks = raw
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {blocks.map((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const firstLine = lines[0] || '';
        const isHeading = firstLine.startsWith('##');
        const headingText = isHeading ? firstLine.replace(/^#+\s*/, '') : null;
        const bodyLines = isHeading ? lines.slice(1) : lines;

        const bulletLines = bodyLines.filter((l) => l.startsWith('- ') || l.startsWith('• '));
        const paragraphLines = bodyLines.filter((l) => !l.startsWith('- ') && !l.startsWith('• '));

        return (
          <div key={idx} className="space-y-2.5">
            {headingText && (
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-1.5 border-b border-slate-100">
                {headingText}
              </h3>
            )}
            {paragraphLines.map((p, pIdx) => (
              <p key={pIdx} className="text-sm text-slate-700 leading-relaxed">
                {p}
              </p>
            ))}
            {bulletLines.length > 0 && (
              <ul className="space-y-2 pt-1">
                {bulletLines.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isIndicator ? 'text-indigo-600' : 'text-ocean-600'
                      }`}
                    />
                    <span>{b.replace(/^[-•]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProductDetailTabs({
  productType,
  bot,
  indicator,
  onToast,
}: ProductDetailTabsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const isIndicator = productType === 'INDICATOR';

  const title = (isIndicator ? indicator?.title : bot?.title) || '';
  const slug = (isIndicator ? indicator?.slug : bot?.slug) || '';
  const shortDesc = (isIndicator ? indicator?.shortDesc : bot?.shortDesc) || '';
  const description = (isIndicator ? indicator?.description : bot?.description) || '';
  const platform = (isIndicator ? indicator?.platform : bot?.platform) || 'MT5';
  const version = (isIndicator ? indicator?.version : bot?.version) || '1.0.0';
  const thumbnailUrl = isIndicator ? indicator?.thumbnailUrl : bot?.thumbnailUrl;
  const updatedAt = (isIndicator ? indicator?.updatedAt : bot?.updatedAt) || new Date().toISOString();
  const baseReviews: Review[] = (isIndicator ? indicator?.reviews : bot?.reviews) || [];

  const [activeTab, setActiveTab] = useState<DetailTabKey>('OVERVIEW');
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest'>('newest');
  const [previewImageModal, setPreviewImageModal] = useState<{ title: string; url: string } | null>(
    null,
  );

  // Initial rich reviews (merging product reviews + realistic MQL5-style verified reviews with developer replies)
  const initialReviews: RichReviewItem[] = [
    ...baseReviews.map((r) => ({
      id: r.id,
      author: r.user?.fullName || 'Khách hàng xác thực',
      date: formatDate(r.createdAt),
      rating: r.rating,
      comment: r.comment,
      developerReply: {
        date: formatDate(updatedAt),
        content: `Cảm ơn bạn đã tin tưởng sử dụng ${title}! Đội ngũ kỹ thuật OceanEA luôn theo dõi sát sao hiệu suất thực tế và cập nhật bộ tham số tối ưu miễn phí cho khách hàng.`,
      },
    })),
    {
      id: 'rev-extra-1',
      author: 'Hoàng Minh Quân',
      date: '10/11/2026',
      rating: 5,
      comment: isIndicator
        ? 'Chỉ báo hoạt động cực kỳ mượt trên tài khoản Exness Raw Spread, tín hiệu đóng nến rõ ràng không hề bị vẽ lại (Non-Repaint). Cảnh báo bắn về điện thoại gần như tức thì!'
        : 'Đã chạy live hơn 3 tuần trên VPS Singapore, lệnh vào rất kỷ luật có SL/TP rõ ràng, không nhồi lệnh nguy hiểm. Rất đáng tiền so với các bot trôi nổi ngoài thị trường.',
      developerReply: {
        date: '10/11/2026',
        content:
          'Cảm ơn phản hồi tuyệt vời của anh Quân! Anh nhớ tải thêm bộ file cấu hình Low-Risk ở mục Comments bên cạnh để tối ưu cho các ngày có tin CPI/FOMC nhé.',
      },
    },
    {
      id: 'rev-extra-2',
      author: 'David Nguyen (Prop Trader)',
      date: '03/11/2026',
      rating: 5,
      comment: isIndicator
        ? 'Giao diện trực quan, dễ kết hợp quản lý vốn. Đội ngũ support hỗ trợ kích hoạt License Key rất nhanh.'
        : 'Kiểm soát sụt giảm tài khoản (Drawdown) rất chuẩn để thi quỹ FTMO. Mình thích nhất là cơ chế tự ngắt khi spread giãn cao đầu phiên Á.',
      developerReply: {
        date: '04/11/2026',
        content:
          'Chúc mừng anh vượt vòng quỹ thuận lợi! Nếu cần tinh chỉnh thông số cho tài khoản kích thước lớn hơn, anh cứ nhắn ở tab Comments để kỹ thuật hỗ trợ ngay ạ.',
      },
    },
  ];

  const [reviewsList, setReviewsList] = useState<RichReviewItem[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Initial MQL5-style Comments & .set Presets
  const safePrefix = slug.split('-').slice(0, 2).join('_') || 'oceanea';
  const initialComments: CommentPostItem[] = [
    {
      id: 'cmt-1',
      number: 1,
      author: 'OceanEA Official Team',
      isDeveloper: true,
      date: '15/09/2026 09:00',
      title: `HƯỚNG DẪN CÀI ĐẶT & KÍCH HOẠT BẢN QUYỀN ${title.toUpperCase()}`,
      content: isIndicator
        ? `1. Tải file thực thi và chép vào thư mục MQL4/Indicators hoặc MQL5/Indicators.\n2. Mở Tools -> Options -> Expert Advisors -> tích chọn "Allow WebRequest for listed URL" và thêm địa chỉ API xác thực của OceanEA.\n3. Kéo chỉ báo vào biểu đồ, nhập mã IND-XXXX-XXXX-XXXX vào ô LicenseKey.`
        : `1. Tải file thực thi và chép vào thư mục MQL4/Experts hoặc MQL5/Experts.\n2. Mở Tools -> Options -> Expert Advisors -> bật Algo Trading và thêm URL xác thực License vào danh sách WebRequest.\n3. Khuyến nghị chạy trên VPS có độ trễ < 15ms tới máy chủ sàn ECN/Raw Spread.`,
    },
    {
      id: 'cmt-2',
      number: 2,
      author: 'OceanEA Official Team',
      isDeveloper: true,
      date: '22/10/2026 14:30',
      title: 'Bộ file cấu hình chuẩn (.set) tối ưu sẵn theo từng mức khẩu vị rủi ro',
      content:
        'Đội ngũ kỹ sư Quant gửi kèm các file Preset (.set) đã kiểm thử kỹ lưỡng. Khách hàng chỉ cần bấm nút Load trong cửa sổ Inputs của MetaTrader để nạp cấu hình:',
      attachments: [
        {
          name: `${safePrefix}_conservative_lowrisk.set`,
          size: '2.2 KB',
          presetContent: `; OceanEA Official Preset - Low Risk\nLicenseKey=YOUR_LICENSE_KEY\nRiskPercent=0.5\nMaxSpreadPips=2.0\nEnableNewsFilter=true\n`,
        },
        {
          name: `${safePrefix}_standard_recommended.set`,
          size: '2.4 KB',
          presetContent: `; OceanEA Official Preset - Standard Recommended\nLicenseKey=YOUR_LICENSE_KEY\nRiskPercent=1.0\nMaxSpreadPips=2.5\nEnableNewsFilter=true\n`,
        },
        {
          name: `${safePrefix}_propfirm_ftmo_passer.set`,
          size: '2.6 KB',
          presetContent: `; OceanEA Official Preset - PropFirm FTMO Mode\nLicenseKey=YOUR_LICENSE_KEY\nRiskPercent=0.35\nMaxDailyDrawdownPercent=2.0\nCloseBeforeWeekend=true\n`,
        },
      ],
    },
    {
      id: 'cmt-3',
      number: 3,
      author: 'OceanEA Official Team',
      isDeveloper: true,
      date: '05/11/2026 10:15',
      title: 'Cập nhật báo cáo hiệu suất tuần đầu tháng 11/2026',
      content:
        'Hệ thống vận hành ổn định qua bản tin Non-Farm vừa rồi với mức trượt giá thấp và tỷ lệ khớp lệnh đạt chuẩn trên tài khoản ECN.',
      chartPreviewUrl:
        thumbnailUrl ||
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'cmt-4',
      number: 4,
      author: 'Trần Quốc Bảo',
      isDeveloper: false,
      date: '11/11/2026 16:42',
      content:
        'Cho mình hỏi nếu mình đổi VPS sang nhà cung cấp khác thì có tự gỡ số tài khoản MT5 cũ được không hay phải chờ Admin duyệt?',
    },
    {
      id: 'cmt-5',
      number: 5,
      author: 'OceanEA Official Team',
      isDeveloper: true,
      date: '11/11/2026 16:55',
      content:
        'Chào bạn Bảo! Nếu vẫn giữ nguyên số tài khoản MT4/MT5 thì bạn chuyển sang bao nhiêu VPS mới cũng chạy được ngay mà không cần reset. Trường hợp đổi sang số tài khoản MT khác, bạn vào mục "License của tôi" bấm nút Reset Account là hệ thống mở khóa tức thì nhé!',
    },
  ];

  const [commentsList, setCommentsList] = useState<CommentPostItem[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');

  // Changelog items for Tab 4: What's new (MQL5 style)
  const changelogItems: ChangelogItem[] = [
    {
      version,
      date: '2026.11.01',
      highlights: isIndicator
        ? [
            'Tối ưu hóa tốc độ quét đa khung thời gian (giảm 40% mức tiêu thụ CPU khi mở hơn 10 biểu đồ cùng lúc).',
            'Bổ sung bộ lọc nhiễu biến động phiên Á giúp tín hiệu đầu phiên Âu - Mỹ có độ chính xác cao hơn.',
            'Thêm tùy chọn gửi ảnh chụp màn hình biểu đồ kèm cảnh báo qua Bot Telegram cá nhân.',
            'Cập nhật bảng Dashboard mini thu gọn được trên màn hình Laptop độ phân giải nhỏ.',
          ]
        : [
            'Khắc phục triệt để sai số làm tròn khối lượng Lot trên các sàn có Balance Step đặc biệt (Cent / Micro / Raw ECN).',
            'Bổ sung chế độ "Prop Firm Strict Protection": tự động đóng toàn bộ lệnh và ngưng giao dịch trong ngày khi chạm ngưỡng bảo vệ Drawdown ngày.',
            'Nâng cấp bộ lọc giãn Spread động theo phiên giao dịch giúp tránh vào lệnh lúc giao phiên.',
            'Hiển thị trực tiếp khối lượng dự kiến của lệnh kế tiếp ngay trên bảng điều khiển góc biểu đồ.',
          ],
      codeNote: isIndicator
        ? `EnableTelegramPush = true\nSignalConfirmationBars = 1\nShowDashboardPanel = true`
        : `StrictPropFirmMode = true\nMaxDailyLossPercent = 2.0\nMaxSpreadFilterPips = 2.2`,
    },
    {
      version: '1.8.0',
      date: '2026.10.12',
      highlights: [
        'Tự động đồng bộ hóa múi giờ máy chủ Broker (Auto GMT Offset) không cần chỉnh tay.',
        'Cải thiện cơ chế kết nối xác thực WebRequest dự phòng giúp hoạt động mượt khi mạng VPS chập chờn.',
        'Tinh chỉnh giao diện hiển thị thông số trực quan chuẩn DPI màn hình 2K/4K.',
      ],
    },
    {
      version: '1.4.0',
      date: '2026.08.25',
      highlights: [
        'Bổ sung tính năng tạm dừng hoạt động trước giờ đóng cửa ngày Thứ Sáu để tránh rủi ro Gap đầu tuần.',
        'Tối ưu bộ nhớ đệm lịch sử nến và sửa các lỗi hiển thị nhỏ từ phiên bản đầu tiên.',
      ],
    },
  ];

  // Screenshot gallery items for Overview (like Image 4)
  const galleryItems = [
    {
      title: isIndicator ? 'Giao diện Tín hiệu Thực tế trên Chart' : 'Đường cong Tăng trưởng Vốn (Equity Curve)',
      subtitle: isIndicator ? 'Tín hiệu Non-Repaint rõ nét' : 'Kiểm thử dữ liệu Tick Data 99.9%',
      url:
        thumbnailUrl ||
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: isIndicator ? 'Cấu trúc Vùng Thanh khoản & Đa khung' : 'Báo cáo Thống kê Lợi nhuận & Drawdown',
      subtitle: 'Hiệu suất ổn định qua nhiều chu kỳ',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Bảng Điều khiển Trực quan trên MT4/MT5',
      subtitle: 'Hiển thị trạng thái License & Thông số',
      url: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Thiết lập Tham số Đầu vào (Inputs)',
      subtitle: 'Kèm sẵn file Preset .set chuẩn',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const avgRating = (
    reviewsList.reduce((acc, item) => acc + item.rating, 0) / Math.max(1, reviewsList.length)
  ).toFixed(2);

  const sortedReviews = [...reviewsList].sort((a, b) =>
    reviewSort === 'highest' ? b.rating - a.rating : 0,
  );

  const handleDownloadPreset = (file: { name: string; presetContent: string }) => {
    const blob = new Blob([file.presetContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast({ type: 'success', message: `Đã tải xuống file cấu hình ${file.name}` });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const item: RichReviewItem = {
      id: 'rev-' + Date.now(),
      author: user?.fullName || 'Khách hàng OceanEA',
      date: formatDate(new Date().toISOString()),
      rating: newRating,
      comment: newReviewText.trim(),
    };
    setReviewsList([item, ...reviewsList]);
    setNewReviewText('');
    setShowReviewForm(false);
    onToast({ type: 'success', message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!' });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const nextNum = commentsList.length + 1;
    const item: CommentPostItem = {
      id: 'cmt-' + Date.now(),
      number: nextNum,
      author: user?.fullName || 'Khách hàng OceanEA',
      isDeveloper: user?.role === 'ADMIN',
      date: formatDate(new Date().toISOString()),
      content: newCommentText.trim(),
    };
    setCommentsList([...commentsList, item]);
    setNewCommentText('');
    onToast({ type: 'success', message: 'Đã đăng bình luận vào luồng thảo luận!' });
  };

  const relatedBots = fallbackBots.filter((b) => b.slug !== slug).slice(0, 3);
  const relatedIndicators = fallbackIndicators.filter((i) => i.slug !== slug).slice(0, 3);

  const tabs: Array<{ key: DetailTabKey; label: string; count?: number }> = [
    { key: 'OVERVIEW', label: 'Overview' },
    { key: 'REVIEWS', label: 'Reviews', count: reviewsList.length },
    { key: 'COMMENTS', label: 'Comments', count: commentsList.length },
    { key: 'WHATS_NEW', label: "What's new" },
  ];

  const accentBorder = isIndicator ? 'border-t-indigo-600 text-indigo-700' : 'border-t-ocean-600 text-ocean-700';

  return (
    <div className="space-y-0">
      {/* =================================================================== */}
      {/* MQL5-INSPIRED PRODUCT COMPACT HEADER + 4-TAB BAR                    */}
      {/* =================================================================== */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Product Square Cover Icon/Thumbnail (Balanced MQL5 style) */}
          <div className="relative w-full sm:w-36 h-40 sm:h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm flex-shrink-0">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <TrendingUp className="w-10 h-10" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Badge platform={platform} />
            </div>
            <div
              className={`absolute bottom-0 inset-x-0 py-1 text-center text-[10px] font-extrabold uppercase tracking-wider text-white ${
                isIndicator ? 'bg-indigo-600/95' : 'bg-ocean-600/95'
              }`}
            >
              {isIndicator ? 'Custom Indicator' : 'Expert Advisor'}
            </div>
          </div>

          {/* Product Metadata Header */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </h1>
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-black text-slate-800 ml-0.5">{avgRating}</span>
              </div>
            </div>

            {/* MQL5 Metadata Strip: Category • Author • Version • Updated • Activations */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span
                className={`font-bold flex items-center gap-1 ${
                  isIndicator ? 'text-indigo-700' : 'text-ocean-700'
                }`}
              >
                {isIndicator ? (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    {indicator ? INDICATOR_CATEGORY_LABELS[indicator.category] : 'Indicators'}
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Experts (Bot EA)
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                OceanEA Official Team
              </span>

              <span>
                Version: <strong className="font-mono text-slate-800">{version}</strong>
              </span>

              <span>
                Updated: <strong className="text-slate-800">{formatDate(updatedAt)}</strong>
              </span>

              <span>
                Activations: <strong className="text-slate-800">10 VPS</strong>
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{shortDesc}</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4 FOLDER TABS BAR: Overview | Reviews | Comments | What's new       */}
      {/* =================================================================== */}
      <div className="bg-slate-100/90 border-x border-t border-slate-200 px-3 sm:px-5 pt-2.5 flex items-end gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all whitespace-nowrap border-x border-t-2 ${
                isActive
                  ? `bg-white ${accentBorder} border-x-slate-200 -mb-px pb-[11px] shadow-sm`
                  : 'bg-slate-200/50 text-slate-600 border-transparent hover:bg-slate-200/90 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? isIndicator
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-ocean-50 text-ocean-700'
                      : 'bg-slate-300/60 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* MAIN TAB CONTENT CONTAINER                                          */}
      {/* =================================================================== */}
      <div className="bg-white rounded-b-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW                                                   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Key Performance / Technical Metrics */}
            {!isIndicator && bot ? (
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Chỉ số Kiểm thử Xác thực (Verified Backtest & Live Metrics)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-profit-bg rounded-xl p-3.5 text-center border border-emerald-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Win Rate</p>
                    <p className="text-2xl font-black text-profit mt-0.5">{bot.winRate}%</p>
                  </div>
                  <div className="bg-drawdown-bg rounded-xl p-3.5 text-center border border-amber-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Max Drawdown</p>
                    <p className="text-2xl font-black text-drawdown mt-0.5">{bot.maxDrawdown}%</p>
                  </div>
                  <div className="bg-ocean-50 rounded-xl p-3.5 text-center border border-ocean-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Profit Factor</p>
                    <p className="text-2xl font-black text-ocean-900 mt-0.5">{bot.profitFactor}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nền tảng</p>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">{bot.platform}</p>
                  </div>
                </div>
              </div>
            ) : (
              indicator && (
                <div>
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                    Thông số Kỹ thuật Chỉ báo (Indicator Specifications)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-emerald-50/80 rounded-xl p-3.5 text-center border border-emerald-200">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Độ chuẩn xác</p>
                      <p className="text-2xl font-black text-profit mt-0.5">
                        {indicator.accuracyRate}%
                      </p>
                    </div>
                    <div className="bg-indigo-50/80 rounded-xl p-3.5 text-center border border-indigo-200">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase">Cơ chế Tín hiệu</p>
                      <p className="text-base font-black text-indigo-900 mt-1.5">
                        {indicator.isNonRepaint ? '100% Non-Repaint' : 'Tiêu chuẩn'}
                      </p>
                    </div>
                    <div className="bg-amber-50/80 rounded-xl p-3.5 text-center border border-amber-200">
                      <p className="text-[10px] font-bold text-amber-800 uppercase">Cảnh báo Alert</p>
                      <p className="text-base font-black text-amber-900 mt-1.5 flex items-center justify-center gap-1">
                        <BellRing className="w-4 h-4 text-amber-600" />
                        {indicator.hasAlert ? 'App & Telegram' : 'Cơ bản'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Khung giờ</p>
                      <p className="text-sm font-black text-slate-800 mt-2 truncate px-1">
                        {indicator.timeframes}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Highlight Callout Box (MQL5 style) */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border ${
                isIndicator
                  ? 'bg-indigo-50/50 border-indigo-200/80'
                  : 'bg-ocean-50/60 border-ocean-200/80'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                <Sparkles className={`w-4 h-4 ${isIndicator ? 'text-indigo-600' : 'text-ocean-600'}`} />
                Cam kết Chất lượng từ Đội ngũ Kỹ sư OceanEA
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isIndicator
                  ? 'Chỉ báo được lập trình gốc trên C++/MQL tối ưu hiệu năng, tuyệt đối không vẽ lại tín hiệu quá khứ (Zero Repaint), đi kèm sẵn bộ hướng dẫn kết hợp Quản lý vốn và file cấu hình chuẩn ở tab Comments.'
                  : 'Hệ thống tuyệt đối KHÔNG sử dụng nhồi lệnh vô kỷ luật. Mọi lệnh giao dịch đều có Stop Loss & Take Profit vật lý bảo vệ tài khoản trước biến động mạnh, đã kiểm định trên dữ liệu Tick Data thực tế nhiều năm.'}
              </p>
            </div>

            {/* Formatted Strategy / Algorithm Description */}
            <div>{renderFormattedDescription(description, isIndicator)}</div>

            {/* Recommendations Block (MQL5 style) */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-1.5 border-b border-slate-100">
                Khuyến nghị Vận hành & Cài đặt (Recommendations)
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
                <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Layers className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    <strong>Nền tảng hỗ trợ:</strong>{' '}
                    {platform === 'BOTH' ? 'MetaTrader 4 & MetaTrader 5' : `MetaTrader (${platform})`}
                  </span>
                </li>
                <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <FolderOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    <strong>Thư mục cài đặt:</strong>{' '}
                    <code className="font-mono font-bold">
                      {isIndicator ? 'MQL4/5 → Indicators' : 'MQL4/5 → Experts'}
                    </code>
                  </span>
                </li>
                <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    <strong>Loại tài khoản tốt nhất:</strong> Raw Spread / ECN (Exness, ICMarkets, FTMO)
                  </span>
                </li>
                <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <FileCode className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    <strong>File cấu hình mẫu (.set):</strong> Tải miễn phí tại tab{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('COMMENTS')}
                      className="font-bold underline text-ocean-700"
                    >
                      Comments
                    </button>
                  </span>
                </li>
              </ul>
            </div>

            {/* Screenshot & Chart Gallery (MQL5 Image 4 style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  Hình ảnh Thực tế & Báo cáo Kiểm thử (Screenshots)
                </h3>
                <span className="text-[11px] text-slate-400">Click vào ảnh để phóng to</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {galleryItems.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewImageModal({ title: img.title, url: img.url })}
                    className="group text-left rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-ocean-400 hover:shadow-md transition-all"
                  >
                    <div className="h-24 w-full overflow-hidden bg-slate-900">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{img.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{img.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Reviews Snippet in Overview (MQL5 Image 4 style) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Đánh giá Nổi bật ({reviewsList.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('REVIEWS')}
                  className={`text-xs font-bold hover:underline inline-flex items-center gap-1 ${
                    isIndicator ? 'text-indigo-600' : 'text-ocean-600'
                  }`}
                >
                  Xem tất cả {reviewsList.length} đánh giá →
                </button>
              </div>

              <div className="space-y-3">
                {reviewsList.slice(0, 2).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-[11px] text-slate-400 ml-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Products Strip at bottom of Overview (MQL5 Image 4 style) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isIndicator
                  ? 'Các Chỉ báo Indicator Khác Cùng Hệ Sinh Thái'
                  : 'Các Hệ thống Bot EA Đề xuất Khác'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(isIndicator ? relatedIndicators : relatedBots).map((item) => (
                  <Link
                    key={item.id}
                    href={isIndicator ? `/indicators/${item.slug}` : `/bots/${item.slug}`}
                    className="group flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-ocean-300 hover:bg-slate-50/60 transition-all"
                  >
                    <img
                      src={item.thumbnailUrl || ''}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-ocean-600 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-black text-ocean-800 mt-0.5">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Risk Disclaimer */}
            <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Cảnh báo rủi ro: Giao dịch ngoại hối và vàng (XAUUSD) sử dụng đòn bẩy có mức độ rủi ro cao. Hiệu suất kiểm thử trong quá khứ không đảm bảo tuyệt đối lợi nhuận tương lai; vui lòng tuân thủ khuyến nghị quản lý vốn của OceanEA.
              </span>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: REVIEWS (MQL5 Image 5 style with Developer Replies)         */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-6">
            {/* Filter & Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Filter:</span>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as 'newest' | 'highest')}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
                >
                  <option value="newest">Mới nhất (New)</option>
                  <option value="highest">Đánh giá cao nhất (Positive)</option>
                </select>
                <span className="text-xs text-slate-400">
                  Điểm trung bình: <strong className="text-slate-800">{avgRating} / 5.0</strong>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = '/login';
                    return;
                  }
                  setShowReviewForm(!showReviewForm);
                }}
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Viết đánh giá của bạn
              </Button>
            </div>

            {/* Submit Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleAddReview}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Chọn số sao:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về hiệu quả tín hiệu / vận hành trên tài khoản..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-600"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="sm">
                    Gửi đánh giá
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </form>
            )}

            {/* Reviews List with Indented Developer Replies */}
            <div className="divide-y divide-slate-100">
              {sortedReviews.map((rev) => (
                <div key={rev.id} className="py-5 first:pt-1 space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                      {rev.author[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold text-slate-900">{rev.author}</span>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>

                  {/* Developer Reply (MQL5 Image 5 style) */}
                  {rev.developerReply && (
                    <div className="ml-8 sm:ml-12 pl-4 border-l-2 border-ocean-200 bg-slate-50/70 rounded-r-xl p-3.5 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <CornerDownRight className="w-3.5 h-3.5 text-ocean-600" />
                        <span className="text-slate-500">Phản hồi từ nhà phát triển</span>
                        <span className="font-bold text-ocean-800 inline-flex items-center gap-1">
                          OceanEA Official Team
                          <ShieldCheck className="w-3.5 h-3.5 text-ocean-600" />
                        </span>
                        <span className="text-[11px] text-slate-400">{rev.developerReply.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rev.developerReply.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: COMMENTS (MQL5 Image 6 style: #1, #2, .set files, composer) */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'COMMENTS' && (
          <div className="space-y-6">
            {/* Top Thread Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded bg-ocean-600 text-white font-bold">1</span>
                <span className="text-slate-400 pl-2">
                  Hiển thị {commentsList.length} thảo luận kỹ thuật & file Preset cấu hình
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                Hỗ trợ kỹ thuật trực tiếp & chia sẻ file .set từ OceanEA
              </span>
            </div>

            {/* Thread Posts */}
            <div className="divide-y divide-slate-100">
              {commentsList.map((post) => (
                <div key={post.id} className="py-5 first:pt-1 flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                      post.isDeveloper
                        ? 'bg-gradient-to-br from-ocean-600 to-ocean-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {post.isDeveloper ? 'EA' : post.author[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-extrabold ${
                            post.isDeveloper ? 'text-ocean-800' : 'text-slate-900'
                          }`}
                        >
                          {post.author}
                        </span>
                        {post.isDeveloper && (
                          <span className="text-[10px] font-bold bg-ocean-50 text-ocean-700 border border-ocean-200 px-2 py-0.5 rounded-full">
                            Author / Official
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{post.date}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{post.number}
                      </span>
                    </div>

                    {post.title && (
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">{post.title}</h4>
                    )}

                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {/* Downloadable .set Preset Attachments (MQL5 Image 6 style) */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">
                          Files đính kèm ({post.attachments.length}):
                        </p>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                          {post.attachments.map((att, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleDownloadPreset(att)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-ocean-50 border border-slate-200 hover:border-ocean-300 text-xs font-semibold text-ocean-700 transition-all"
                            >
                              <FileCode className="w-4 h-4 text-ocean-600 flex-shrink-0" />
                              <span className="underline">{att.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Weekly Chart Preview */}
                    {post.chartPreviewUrl && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImageModal({
                              title: post.title || 'Báo cáo hiệu suất tuần',
                              url: post.chartPreviewUrl!,
                            })
                          }
                          className="block max-w-md rounded-xl overflow-hidden border border-slate-200 hover:border-ocean-400 transition-all"
                        >
                          <img
                            src={post.chartPreviewUrl}
                            alt="Performance report"
                            className="w-full h-48 object-cover"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Composer */}
            <div className="pt-4 border-t border-slate-200">
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Gửi câu hỏi kỹ thuật hoặc bình luận mới
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Nhập câu hỏi về cách cài đặt VPS, thông số .set hoặc góp ý..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    <Send className="w-3.5 h-3.5" />
                    Đăng bình luận
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Vui lòng đăng nhập tài khoản để đặt câu hỏi kỹ thuật hoặc bình luận.
                  </span>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Đăng nhập ngay
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: WHAT'S NEW (MQL5 Image 7 style Changelog)                  */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'WHATS_NEW' && (
          <div className="space-y-7">
            {changelogItems.map((log, idx) => (
              <div
                key={log.version}
                className={`${idx !== 0 ? 'pt-6 border-t border-slate-100' : ''} space-y-3`}
              >
                <div className="flex items-baseline gap-3">
                  <h3
                    className={`text-base font-black ${
                      isIndicator ? 'text-indigo-700' : 'text-emerald-700'
                    }`}
                  >
                    Version {log.version}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{log.date}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Bản mới nhất
                    </span>
                  )}
                </div>

                <ol className="space-y-2 text-xs sm:text-sm text-slate-700 list-decimal list-inside leading-relaxed">
                  {log.highlights.map((h, hIdx) => (
                    <li key={hIdx}>{h}</li>
                  ))}
                </ol>

                {log.codeNote && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-700 whitespace-pre-line">
                    <p className="text-[10px] font-sans font-bold uppercase text-slate-400 mb-1">
                      Tham số mới bổ sung trong Inputs:
                    </p>
                    {log.codeNote}
                  </div>
                )}

                {idx === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    * Khuyến nghị khách hàng đang sở hữu License tải lại file .{platform === 'MT4' ? 'ex4' : 'ex5'} mới nhất trong mục Kho License (miễn phí cập nhật 100%).
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Screenshot Preview */}
      <Modal
        isOpen={Boolean(previewImageModal)}
        onClose={() => setPreviewImageModal(null)}
        title={previewImageModal?.title || 'Xem chi tiết biểu đồ'}
      >
        {previewImageModal && (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="w-full max-h-[65vh] object-contain"
              />
            </div>
            <div className="flex justify-end">
              <a
                href={previewImageModal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-600 hover:underline"
              >
                Mở ảnh kích thước gốc <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

