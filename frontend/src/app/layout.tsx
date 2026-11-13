import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OceanEA Official Store - Hệ thống Mua & Thuê Bot EA / Indicators MT4 & MT5',
  description:
    'Cửa hàng chính thức cung cấp Expert Advisors (Bot EA) & Indicators độc quyền trên MetaTrader 4 & MetaTrader 5. Hỗ trợ mua trọn đời và thuê theo tháng, cấp License Key tự động.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-canvas text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-ocean-900 text-slate-300 py-12 border-t border-ocean-700/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-ocean-600 flex items-center justify-center text-white">
                      <Compass className="w-5 h-5 text-sky-200" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-white">
                      Ocean<span className="text-ocean-300">EA</span> Market
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 max-w-sm mb-4 leading-relaxed">
                    Nền tảng thương mại điện tử chuyên biệt cho Bot EA & Indicator MT4/MT5.
                    Hệ thống xác thực License Key tự động thông qua WebRequest MQL4/MQL5.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Bảo mật file thực thi .ex4/.ex5 trên Cloudflare R2 / S3
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold text-sm mb-3">Liên kết nhanh</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">
                        Cửa hàng Bot & Indicator
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/licenses" className="hover:text-white transition-colors">
                        Kho License của tôi
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="hover:text-white transition-colors">
                        Đăng ký tài khoản
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="hover:text-white transition-colors">
                        Đăng nhập
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold text-sm mb-3">Hỗ trợ kỹ thuật</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li>API Xác thực MQL4/MQL5</li>
                    <li>Hướng dẫn cài Bot trên VPS</li>
                    <li>Chính sách hoàn tiền</li>
                    <li>Điều khoản dịch vụ</li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-ocean-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
                <p>© 2026 OceanEA Market. Tất cả quyền được bảo lưu.</p>
                <p className="flex items-center gap-1">
                  Xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> cho cộng đồng Trader
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

