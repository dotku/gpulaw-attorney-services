'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Search,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function ClientDashboard() {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title={t('client.myConsultations')}
          value="0"
          icon={<MessageSquare className="h-6 w-6" />}
          subtitle={t('client.noConsultationsYet')}
          color="blue"
        />
        <StatCard
          title={t('client.myDocuments')}
          value="0"
          icon={<FileText className="h-6 w-6" />}
          subtitle={t('client.noDocumentsYet')}
          color="green"
        />
        <StatCard
          title={t('client.aiChats')}
          value="0"
          icon={<Sparkles className="h-6 w-6" />}
          subtitle={t('client.startChatting')}
          color="purple"
        />
        <StatCard
          title={t('client.upcoming')}
          value="0"
          icon={<Calendar className="h-6 w-6" />}
          subtitle={t('client.noUpcoming')}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <QuickActionCard
          title={t('client.findLawyer')}
          description={t('client.findLawyerDesc')}
          href={`/${locale}/dashboard/consultations`}
          icon={<Search className="h-8 w-8" />}
          color="blue"
        />
        <QuickActionCard
          title={t('client.startAiChat')}
          description={t('client.startAiChatDesc')}
          href={`/${locale}`}
          icon={<Sparkles className="h-8 w-8" />}
          color="purple"
        />
        <QuickActionCard
          title={t('client.viewDocuments')}
          description={t('client.viewDocumentsDesc')}
          href={`/${locale}/dashboard/documents`}
          icon={<FileText className="h-8 w-8" />}
          color="green"
        />
      </div>

      {/* Recent AI Chats */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {t('client.recentAiChats')}
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <Clock className="h-10 w-10 mb-3 text-slate-300" />
          <p className="text-sm">{t('client.noRecentChats')}</p>
          <Link
            href={`/${locale}`}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('client.startFirstChat')}
          </Link>
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs sm:text-sm font-medium text-slate-600">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
    green: 'bg-green-50 border-green-200 hover:border-green-300',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
  };

  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all ${colorClasses[color]}`}
    >
      <div className={`mb-4 ${iconColorClasses[color]}`}>{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}
