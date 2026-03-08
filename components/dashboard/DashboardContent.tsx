'use client';

import { useTranslations } from 'next-intl';
import ClientDashboard from './ClientDashboard';
import LawyerDashboard from './LawyerDashboard';
import AdminDashboard from './AdminDashboard';
import ProfilePrompt from './ProfilePrompt';

export type DashboardRole = 'CLIENT' | 'LAWYER' | 'FIRM_ADMIN' | 'PLATFORM_ADMIN' | null;

interface DashboardContentProps {
  role: DashboardRole;
  userName?: string | null;
  verificationStatus?: string;
  adminData?: {
    userCount: number;
    pendingVerifications: number;
    totalLawyers: number;
    recentAuditLogs: Array<{
      id: string;
      action: string;
      userId: string;
      timestamp: string;
    }>;
  };
  lawyerData?: {
    clientCount: number;
    pendingConsultations: number;
    totalEarnings: number;
    recentConsultations: Array<{
      id: string;
      clientName: string;
      category: string;
      status: string;
      scheduledAt: string | null;
    }>;
  };
  clientData?: {
    consultationCount: number;
    documentCount: number;
    chatCount: number;
    upcomingCount: number;
    recentChats: Array<{
      id: string;
      category: string | null;
      summary: string | null;
      updatedAt: string;
    }>;
  };
}

export default function DashboardContent({
  role,
  userName,
  verificationStatus,
  adminData,
  lawyerData,
  clientData,
}: DashboardContentProps) {
  const t = useTranslations('dashboard');

  const getSubtitle = () => {
    switch (role) {
      case 'CLIENT':
        return t('client.subtitle');
      case 'LAWYER':
        return t('lawyer.subtitle');
      case 'FIRM_ADMIN':
      case 'PLATFORM_ADMIN':
        return t('admin.subtitle');
      default:
        return t('overview.subtitle');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {userName
              ? t('welcomeBack', { name: userName })
              : t('nav.overview')}
          </h1>
          <p className="text-slate-600">{getSubtitle()}</p>
        </div>

        {/* Role-specific content */}
        {role === null && <ProfilePrompt />}
        {role === 'CLIENT' && (
          <ClientDashboard
            consultationCount={clientData?.consultationCount}
            documentCount={clientData?.documentCount}
            chatCount={clientData?.chatCount}
            upcomingCount={clientData?.upcomingCount}
            recentChats={clientData?.recentChats}
          />
        )}
        {role === 'LAWYER' && (
          <LawyerDashboard
            verificationStatus={verificationStatus}
            clientCount={lawyerData?.clientCount}
            pendingConsultations={lawyerData?.pendingConsultations}
            totalEarnings={lawyerData?.totalEarnings}
            recentConsultations={lawyerData?.recentConsultations}
          />
        )}
        {(role === 'FIRM_ADMIN' || role === 'PLATFORM_ADMIN') && adminData && (
          <AdminDashboard
            userCount={adminData.userCount}
            pendingVerifications={adminData.pendingVerifications}
            totalLawyers={adminData.totalLawyers}
            recentAuditLogs={adminData.recentAuditLogs}
          />
        )}
      </div>
    </div>
  );
}
