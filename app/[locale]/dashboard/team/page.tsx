'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Shield,
  MoreVertical,
  Search,
  X,
} from 'lucide-react';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'FIRM_ADMIN' | 'LAWYER' | 'ASSISTANT';
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  avatar?: string;
  joinedAt: string;
};

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'You',
    email: 'admin@gpulaw.com',
    role: 'FIRM_ADMIN',
    status: 'ACTIVE',
    joinedAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@gpulaw.com',
    role: 'LAWYER',
    status: 'ACTIVE',
    joinedAt: '2025-02-01',
  },
  {
    id: '3',
    name: 'Michael Park',
    email: 'michael.park@gpulaw.com',
    role: 'LAWYER',
    status: 'ACTIVE',
    joinedAt: '2025-03-01',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.r@gpulaw.com',
    role: 'ASSISTANT',
    status: 'INVITED',
    joinedAt: '2026-03-05',
  },
];

export default function TeamPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members] = useState<TeamMember[]>(mockMembers);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      FIRM_ADMIN: 'bg-red-100 text-red-700',
      LAWYER: 'bg-blue-100 text-blue-700',
      ASSISTANT: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      INVITED: 'bg-yellow-100 text-yellow-700',
      INACTIVE: 'bg-slate-100 text-slate-500',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t('dashboard.team.title')}
            </h1>
            <p className="text-slate-600">{t('dashboard.team.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-start"
          >
            <Plus className="h-5 w-5" />
            {t('dashboard.team.inviteMember')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-bold text-slate-900">{members.length}</p>
            <p className="text-sm text-slate-600">{t('dashboard.team.totalMembers')}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-bold text-slate-900">
              {members.filter((m) => m.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-slate-600">{t('dashboard.team.activeMembers')}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-bold text-slate-900">
              {members.filter((m) => m.role === 'LAWYER').length}
            </p>
            <p className="text-sm text-slate-600">{t('dashboard.team.lawyers')}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-bold text-slate-900">
              {members.filter((m) => m.status === 'INVITED').length}
            </p>
            <p className="text-sm text-slate-600">{t('dashboard.team.pendingInvites')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('dashboard.team.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
            <div className="col-span-4">{t('dashboard.team.member')}</div>
            <div className="col-span-3">{t('dashboard.team.role')}</div>
            <div className="col-span-2">{t('dashboard.team.status')}</div>
            <div className="col-span-2">{t('dashboard.team.joined')}</div>
            <div className="col-span-1"></div>
          </div>

          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors items-center"
            >
              <div className="sm:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-sm text-slate-500 truncate">{member.email}</p>
                </div>
              </div>
              <div className="sm:col-span-3 flex items-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                  {t(`dashboard.team.roles.${member.role}`)}
                </span>
              </div>
              <div className="sm:col-span-2 flex items-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                  {t(`dashboard.team.statuses.${member.status}`)}
                </span>
              </div>
              <div className="sm:col-span-2 text-sm text-slate-600">
                {new Date(member.joinedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    role: 'LAWYER',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // TODO: API call to send invite
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {t('dashboard.team.inviteMember')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.team.emailAddress')} *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('dashboard.team.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.team.role')}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LAWYER">{t('dashboard.team.roles.LAWYER')}</option>
                <option value="ASSISTANT">{t('dashboard.team.roles.ASSISTANT')}</option>
                <option value="FIRM_ADMIN">{t('dashboard.team.roles.FIRM_ADMIN')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.team.personalMessage')}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t('dashboard.team.messagePlaceholder')}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" />
              {isSending ? t('dashboard.team.sending') : t('dashboard.team.sendInvite')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t('dashboard.cases.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
