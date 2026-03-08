'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Clock,
  ShieldCheck,
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface LawyerDashboardProps {
  verificationStatus?: string;
  clientCount?: number;
  pendingConsultations?: number;
  totalEarnings?: number;
  recentConsultations?: Array<{
    id: string;
    clientName: string;
    category: string;
    status: string;
    scheduledAt: string | null;
  }>;
}

export default function LawyerDashboard({
  verificationStatus,
  clientCount = 0,
  pendingConsultations = 0,
  totalEarnings = 0,
  recentConsultations = [],
}: LawyerDashboardProps) {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale as string;

  const isPending = verificationStatus === 'PENDING_VERIFICATION';
  const isRejected = verificationStatus === 'REJECTED';
  const isApproved = verificationStatus === 'APPROVED';
  const isVerified = verificationStatus === 'VERIFIED';

  return (
    <>
      {/* Verification Status Banner */}
      {isPending && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">{t('lawyer.verificationPending')}</p>
            <p className="text-sm text-yellow-700">{t('lawyer.verificationPendingDesc')}</p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-medium text-red-800">{t('lawyer.verificationRejected')}</p>
            <p className="text-sm text-red-700">{t('lawyer.verificationRejectedDesc')}</p>
          </div>
        </div>
      )}
      {(isApproved || isVerified) && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="font-medium text-green-800">{t('lawyer.verificationApproved')}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title={t('lawyer.myClients')}
          value={String(clientCount)}
          icon={<Users className="h-6 w-6" />}
          subtitle={clientCount === 0 ? t('lawyer.noClientsYet') : t('lawyer.activeClients')}
          color="blue"
        />
        <StatCard
          title={t('lawyer.pendingConsultations')}
          value={String(pendingConsultations)}
          icon={<Clock className="h-6 w-6" />}
          subtitle={pendingConsultations === 0 ? t('lawyer.noPending') : t('lawyer.awaitingResponse')}
          color="orange"
        />
        <StatCard
          title={t('lawyer.verificationLabel')}
          value={isPending ? '...' : isApproved || isVerified ? '1' : '0'}
          icon={<ShieldCheck className="h-6 w-6" />}
          subtitle={
            isPending
              ? t('lawyer.statusPending')
              : isApproved || isVerified
              ? t('lawyer.statusVerified')
              : t('lawyer.statusUnverified')
          }
          color="green"
        />
        <StatCard
          title={t('lawyer.earnings')}
          value={`$${totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          subtitle={t('lawyer.earningsThisMonth')}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <QuickActionCard
          title={t('lawyer.viewSchedule')}
          description={t('lawyer.viewScheduleDesc')}
          href={`/${locale}/dashboard/consultations`}
          icon={<Calendar className="h-8 w-8" />}
          color="blue"
        />
        <QuickActionCard
          title={t('lawyer.manageCases')}
          description={t('lawyer.manageCasesDesc')}
          href={`/${locale}/dashboard/cases`}
          icon={<FileText className="h-8 w-8" />}
          color="purple"
        />
        <QuickActionCard
          title={t('lawyer.viewClients')}
          description={t('lawyer.viewClientsDesc')}
          href={`/${locale}/dashboard/clients`}
          icon={<Users className="h-8 w-8" />}
          color="green"
        />
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {t('lawyer.recentConsultations')}
        </h2>
        {recentConsultations.length > 0 ? (
          <div className="space-y-3">
            {recentConsultations.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {c.clientName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {c.category} &middot; {c.status}
                  </p>
                </div>
                {c.scheduledAt && (
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(c.scheduledAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Clock className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm">{t('lawyer.noRecentConsultations')}</p>
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
