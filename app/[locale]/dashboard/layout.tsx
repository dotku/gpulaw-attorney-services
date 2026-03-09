'use client';

import { useTranslations } from 'next-intl';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  Scale,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Globe,
  ShieldCheck,
  ClipboardCheck,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const { user } = useUser();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: t('dashboard.nav.overview'),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: t('dashboard.nav.cases'),
      href: `/${locale}/dashboard/cases`,
      icon: FolderOpen,
    },
    {
      name: t('dashboard.nav.documents'),
      href: `/${locale}/dashboard/documents`,
      icon: FileText,
    },
    {
      name: t('dashboard.nav.team'),
      href: `/${locale}/dashboard/team`,
      icon: Users,
    },
    {
      name: t('dashboard.nav.billing'),
      href: `/${locale}/dashboard/billing`,
      icon: CreditCard,
    },
    {
      name: t('dashboard.nav.profile'),
      href: `/${locale}/dashboard/profile`,
      icon: UserCircle,
    },
    {
      name: t('dashboard.nav.verification'),
      href: `/${locale}/dashboard/verification`,
      icon: ShieldCheck,
    },
    {
      name: t('dashboard.nav.settings'),
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
    {
      name: t('dashboard.nav.adminVerifications'),
      href: `/${locale}/dashboard/admin/verifications`,
      icon: ClipboardCheck,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const logoutHref = `/auth/logout?returnTo=${encodeURIComponent(`${appUrl}/${locale}`)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-slate-900">GPULaw</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="p-4 border-t border-slate-200">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* User Menu */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-semibold">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <a
              href={logoutHref}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.logout')}
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:hidden" />
            <div className="hidden lg:block text-sm text-slate-600">
              {new Date().toLocaleDateString(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'zh-CN', name: '简体中文' },
  ];

  const currentLang = languages.find((lang) => lang.code === currentLocale);

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="flex-1 text-left">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                switchLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                lang.code === currentLocale
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
