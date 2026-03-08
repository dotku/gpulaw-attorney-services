'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserCircle } from 'lucide-react';

export default function ProfilePrompt() {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
      <UserCircle className="h-16 w-16 mx-auto mb-4 text-slate-400" />
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        {t('profile.completeProfile')}
      </h2>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {t('profile.completeProfileDesc')}
      </p>
      <Link
        href={`/${locale}/dashboard/settings`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        {t('profile.setupProfile')}
      </Link>
    </div>
  );
}
