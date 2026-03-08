'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  consultations: number;
  documents: number;
  chats: number;
  upcoming: number;
}

export default function HomeClientDashboard() {
  const t = useTranslations();
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          setStats({ consultations: 0, documents: 0, chats: 0, upcoming: 0 });
          // Try to fetch actual counts
          const [casesRes, docsRes] = await Promise.all([
            fetch('/api/cases').catch(() => null),
            fetch('/api/documents').catch(() => null),
          ]);
          const casesData = casesRes?.ok ? await casesRes.json() : null;
          const docsData = docsRes?.ok ? await docsRes.json() : null;
          setStats({
            consultations: casesData?.cases?.length || 0,
            documents: docsData?.documents?.length || 0,
            chats: 0,
            upcoming: 0,
          });
        }
      } catch {
        // Not logged in or no profile — hide dashboard
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !stats) return null;

  return (
    <div className="mb-8 sm:mb-12 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {t('home.clientDashboard.title')}
          </h3>
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('home.clientDashboard.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <StatMini
            icon={<MessageSquare className="h-5 w-5 text-blue-600" />}
            label={t('home.clientDashboard.consultations')}
            value={stats.consultations}
            color="blue"
          />
          <StatMini
            icon={<FileText className="h-5 w-5 text-green-600" />}
            label={t('home.clientDashboard.documents')}
            value={stats.documents}
            color="green"
          />
          <StatMini
            icon={<Sparkles className="h-5 w-5 text-purple-600" />}
            label={t('home.clientDashboard.aiChats')}
            value={stats.chats}
            color="purple"
          />
          <StatMini
            icon={<Calendar className="h-5 w-5 text-orange-600" />}
            label={t('home.clientDashboard.upcoming')}
            value={stats.upcoming}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/dashboard/consultations`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            {t('home.clientDashboard.findLawyer')}
          </Link>
          <Link
            href={`/${locale}/dashboard/documents`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="h-4 w-4" />
            {t('home.clientDashboard.myDocuments')}
          </Link>
          <Link
            href={`/${locale}/dashboard/profile`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t('home.clientDashboard.editProfile')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatMini({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const bgClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className={`${bgClasses[color]} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-lg sm:text-xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}
