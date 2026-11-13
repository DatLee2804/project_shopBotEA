'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from './ui/Button';
import {
  Compass,
  KeyRound,
  ShieldCheck,
  Search,
  LogOut,
  ChevronDown,
  Bot as BotIcon,
  Activity,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-ocean-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-600 to-ocean-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-sky-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-ocean-900">
              Ocean<span className="text-ocean-600">EA</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider -mt-1">
              Official Store
            </span>
          </div>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-md relative"
        >
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm Bot EA, Indicator SMC, Volume, XAUUSD..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent transition-all"
          />
        </form>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/#bots-section"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
          >
            <BotIcon className="w-4 h-4 text-ocean-600" />
            <span className="hidden sm:inline">Bot EA</span>
          </Link>

          <Link
            href="/#indicators-section"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Indicators</span>
          </Link>

          {mounted && isAuthenticated ? (
            <>
              <Link
                href="/dashboard/licenses"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">License của tôi</span>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Quản trị Admin</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-ocean-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate hidden md:inline">
                    {user?.fullName || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Đăng nhập với</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-ocean-100 text-ocean-900">
                        {user?.role === 'ADMIN' ? '👑 Quản trị viên' : 'Khách hàng'}
                      </span>
                    </div>

                    <Link
                      href="/dashboard/licenses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      Kho License của tôi
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Trang Quản trị Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
