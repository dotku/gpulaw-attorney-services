'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Settings,
  UserCheck,
  Clock,
} from 'lucide-react';

interface AdminDashboardProps {
  userCount: number;
  pendingVerifications: number;
  totalLawyers: number;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    userId: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard({
  userCount,
  pendingVerifications,
  totalLawyers,
  recentAuditLogs,
}: AdminDashboardProps) {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title={t('admin.totalUsers')}
          value={String(userCount)}
          icon={<Users className="h-6 w-6" />}
          subtitle={t('admin.registeredUsers')}
          color="blue"
        />
        <StatCard
          title={t('admin.pendingVerifications')}
          value={String(pendingVerifications)}
          icon={<ShieldCheck className="h-6 w-6" />}
          subtitle={t('admin.awaitingReview')}
          color="orange"
        />
        <StatCard
          title={t('admin.totalLawyers')}
          value={String(totalLawyers)}
          icon={<UserCheck className="h-6 w-6" />}
          subtitle={t('admin.onPlatform')}
          color="green"
        />
        <StatCard
          title={t('admin.systemHealth')}
          value={t('admin.healthy')}
          icon={<BarChart3 className="h-6 w-6" />}
          subtitle={t('admin.allSystemsOperational')}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <QuickActionCard
          title={t('admin.manageUsers')}
          description={t('admin.manageUsersDesc')}
          href={`/${locale}/dashboard/team`}
          icon={<Users className="h-8 w-8" />}
          color="blue"
        />
        <QuickActionCard
          title={t('admin.reviewVerifications')}
          description={t('admin.reviewVerificationsDesc')}
          href={`/${locale}/dashboard/admin/verifications`}
          icon={<ShieldCheck className="h-8 w-8" />}
          color="purple"
        />
        <QuickActionCard
          title={t('admin.systemSettings')}
          description={t('admin.systemSettingsDesc')}
          href={`/${locale}/dashboard/settings`}
          icon={<Settings className="h-8 w-8" />}
          color="green"
        />
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          {t('admin.recentAuditLogs')}
        </h2>
        {recentAuditLogs.length > 0 ? (
          <div className="space-y-3">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {log.action}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {t('admin.user')}: {log.userId}
                  </p>
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Clock className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm">{t('admin.noRecentLogs')}</p>
          </div>
        )}
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
