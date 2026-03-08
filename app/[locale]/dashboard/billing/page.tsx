'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Star,
  FileText,
  Users,
  ArrowRight,
} from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  stripePriceId?: string;
};

export default function BillingPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: t('dashboard.billing.plans.starter.name'),
      price: billingInterval === 'month' ? 49 : 470,
      interval: billingInterval,
      features: [
        t('dashboard.billing.plans.starter.feat1'),
        t('dashboard.billing.plans.starter.feat2'),
        t('dashboard.billing.plans.starter.feat3'),
        t('dashboard.billing.plans.starter.feat4'),
      ],
    },
    {
      id: 'professional',
      name: t('dashboard.billing.plans.professional.name'),
      price: billingInterval === 'month' ? 149 : 1430,
      interval: billingInterval,
      recommended: true,
      features: [
        t('dashboard.billing.plans.professional.feat1'),
        t('dashboard.billing.plans.professional.feat2'),
        t('dashboard.billing.plans.professional.feat3'),
        t('dashboard.billing.plans.professional.feat4'),
        t('dashboard.billing.plans.professional.feat5'),
      ],
    },
    {
      id: 'enterprise',
      name: t('dashboard.billing.plans.enterprise.name'),
      price: billingInterval === 'month' ? 399 : 3830,
      interval: billingInterval,
      features: [
        t('dashboard.billing.plans.enterprise.feat1'),
        t('dashboard.billing.plans.enterprise.feat2'),
        t('dashboard.billing.plans.enterprise.feat3'),
        t('dashboard.billing.plans.enterprise.feat4'),
        t('dashboard.billing.plans.enterprise.feat5'),
        t('dashboard.billing.plans.enterprise.feat6'),
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(planId);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
          locale,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t('dashboard.billing.title')}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('dashboard.billing.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-slate-900' : 'text-slate-500'}`}>
            {t('dashboard.billing.monthly')}
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="relative w-14 h-7 bg-blue-600 rounded-full transition-colors"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                billingInterval === 'year' ? 'translate-x-7' : ''
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-slate-900' : 'text-slate-500'}`}>
            {t('dashboard.billing.yearly')}
            <span className="ml-1 text-green-600 text-xs font-semibold">
              {t('dashboard.billing.savePercent')}
            </span>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border-2 p-6 sm:p-8 relative ${
                plan.recommended
                  ? 'border-blue-600 shadow-lg'
                  : 'border-slate-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {t('dashboard.billing.recommended')}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-slate-500">
                  /{plan.interval === 'month' ? t('dashboard.billing.mo') : t('dashboard.billing.yr')}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing !== null}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  plan.recommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                } disabled:opacity-50`}
              >
                {isProcessing === plan.id ? (
                  t('dashboard.billing.processing')
                ) : (
                  <>
                    {t('dashboard.billing.subscribe')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Current Subscription Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t('dashboard.billing.currentPlan')}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-slate-900">
                {t('dashboard.billing.freeTrial')}
              </p>
              <p className="text-sm text-slate-600">
                {t('dashboard.billing.freeTrialDesc')}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">
                <CreditCard className="h-4 w-4" />
                {t('dashboard.billing.manageBilling')}
              </button>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {t('dashboard.billing.allFeatures')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{t('dashboard.billing.feat.ai')}</p>
                <p className="text-sm text-slate-600">{t('dashboard.billing.feat.aiDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{t('dashboard.billing.feat.docs')}</p>
                <p className="text-sm text-slate-600">{t('dashboard.billing.feat.docsDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{t('dashboard.billing.feat.team')}</p>
                <p className="text-sm text-slate-600">{t('dashboard.billing.feat.teamDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{t('dashboard.billing.feat.security')}</p>
                <p className="text-sm text-slate-600">{t('dashboard.billing.feat.securityDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
