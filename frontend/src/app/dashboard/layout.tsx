'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  KeyRound,
  ShieldCheck,
  Compass,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const userLinks = [
    {
      href: '/dashboard/licenses',
      label: 'Kho License & Bot của tôi',
      icon: KeyRound,
      color: 'text-emerald-600',
    },
  ];

  const adminLinks = [
    {
      href: '/dashboard/admin',
      label: 'Bảng quản trị Admin',
      icon: ShieldCheck,
      color: 'text-amber-600',
    },
    {
      href: '/dashboard/licenses',
      label: 'License của tôi',
      icon: KeyRound,
      color: 'text-emerald-600',
    },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
              {/* Profile Card */}
              <div
                className={`p-5 text-white ${
                  isAdmin
                    ? 'bg-gradient-to-br from-amber-600 to-slate-900'
                    : 'bg-gradient-to-br from-ocean-600 to-ocean-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-black">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user?.fullName || 'Khách hàng'}</p>
                    <p className="text-xs text-slate-200 truncate">{user?.email || ''}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm">
                      {isAdmin ? '👑 Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-3 space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-ocean-50 text-ocean-900 border border-ocean-200 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <link.icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? link.color : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="flex-1">{link.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-ocean-400" />}
                    </Link>
                  );
                })}

                <div className="border-t border-slate-100 my-2 pt-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-slate-400" />
                    <span>Cửa hàng Bot/Indicator</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
