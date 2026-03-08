'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Scale,
  Languages,
} from 'lucide-react';

interface ClientProfileData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  preferredLocale: string;
  timezone: string;
}

interface LawyerProfileData {
  firstName: string;
  lastName: string;
  barNumber: string;
  barState: string;
  yearsExperience: number;
  bio: string;
  hourlyRate: number | null;
  consultationFee: number | null;
  officePhone: string;
  officeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  status: string;
  languages: string[];
  categories: { id: string; key: string; name: string; isPrimary: boolean }[];
}

interface ProfileData {
  id?: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  image: string;
  locale: string;
  clientProfile: ClientProfileData | null;
  lawyerProfile: LawyerProfileData | null;
}

const LANGUAGES = [
  'ENGLISH',
  'MANDARIN',
  'CANTONESE',
  'SPANISH',
  'FRENCH',
  'KOREAN',
  'VIETNAMESE',
  'JAPANESE',
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
];

export default function ProfilePage() {
  const t = useTranslations('dashboard.profile');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [locale, setLocale] = useState('en');

  // Client fields
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientZipCode, setClientZipCode] = useState('');
  const [clientCountry, setClientCountry] = useState('US');
  const [clientPreferredLocale, setClientPreferredLocale] = useState('en');
  const [clientTimezone, setClientTimezone] = useState('');

  // Lawyer fields
  const [lawyerFirstName, setLawyerFirstName] = useState('');
  const [lawyerLastName, setLawyerLastName] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [barState, setBarState] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [lawyerCity, setLawyerCity] = useState('');
  const [lawyerState, setLawyerState] = useState('');
  const [lawyerZipCode, setLawyerZipCode] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const populateForm = useCallback((data: ProfileData) => {
    setName(data.name);
    setPhone(data.phone);
    setImage(data.image);
    setLocale(data.locale);

    if (data.clientProfile) {
      setClientFirstName(data.clientProfile.firstName);
      setClientLastName(data.clientProfile.lastName);
      setClientAddress(data.clientProfile.address);
      setClientCity(data.clientProfile.city);
      setClientState(data.clientProfile.state);
      setClientZipCode(data.clientProfile.zipCode);
      setClientCountry(data.clientProfile.country);
      setClientPreferredLocale(data.clientProfile.preferredLocale);
      setClientTimezone(data.clientProfile.timezone);
    }

    if (data.lawyerProfile) {
      setLawyerFirstName(data.lawyerProfile.firstName);
      setLawyerLastName(data.lawyerProfile.lastName);
      setBarNumber(data.lawyerProfile.barNumber);
      setBarState(data.lawyerProfile.barState);
      setYearsExperience(data.lawyerProfile.yearsExperience);
      setBio(data.lawyerProfile.bio);
      setHourlyRate(data.lawyerProfile.hourlyRate?.toString() || '');
      setConsultationFee(data.lawyerProfile.consultationFee?.toString() || '');
      setOfficePhone(data.lawyerProfile.officePhone);
      setOfficeAddress(data.lawyerProfile.officeAddress);
      setLawyerCity(data.lawyerProfile.city);
      setLawyerState(data.lawyerProfile.state);
      setLawyerZipCode(data.lawyerProfile.zipCode);
      setWebsite(data.lawyerProfile.website);
      setSelectedLanguages(data.lawyerProfile.languages);
    }
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        if (json.success && json.data) {
          setProfile(json.data);
          populateForm(json.data);
        }
      } catch {
        setMessage({ type: 'error', text: t('fetchError') });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [populateForm, t]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        name,
        phone,
        image,
        locale,
      };

      if (profile?.role === 'CLIENT' || !profile?.role || profile?.role === 'FIRM_ADMIN' || profile?.role === 'PLATFORM_ADMIN') {
        payload.clientProfile = {
          firstName: clientFirstName,
          lastName: clientLastName,
          address: clientAddress,
          city: clientCity,
          state: clientState,
          zipCode: clientZipCode,
          country: clientCountry,
          preferredLocale: clientPreferredLocale,
          timezone: clientTimezone,
        };
      }

      if (profile?.role === 'LAWYER') {
        payload.lawyerProfile = {
          firstName: lawyerFirstName,
          lastName: lawyerLastName,
          barNumber,
          barState,
          yearsExperience,
          bio,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          consultationFee: consultationFee ? parseFloat(consultationFee) : null,
          officePhone,
          officeAddress,
          city: lawyerCity,
          state: lawyerState,
          zipCode: lawyerZipCode,
          website,
          languages: selectedLanguages,
        };
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: t('saveSuccess') });
      } else {
        setMessage({ type: 'error', text: json.error || t('saveError') });
      }
    } catch {
      setMessage({ type: 'error', text: t('saveError') });
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">{t('subtitle')}</p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t('basicInfo')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('email')}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
              <Mail className="h-4 w-4" />
              <span className="text-sm truncate">{profile?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('role')}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">{t(`roles.${profile?.role || 'CLIENT'}`)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={t('namePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {t('phone')}
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('avatarUrl')}
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={t('avatarPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {t('locale')}
              </span>
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Profile Section */}
      {(profile?.role === 'CLIENT' || !profile?.role) && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">{t('clientInfo')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('firstName')}
              </label>
              <input
                type="text"
                value={clientFirstName}
                onChange={(e) => setClientFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('lastName')}
              </label>
              <input
                type="text"
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('address')}
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('city')}
              </label>
              <input
                type="text"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('state')}
              </label>
              <input
                type="text"
                value={clientState}
                onChange={(e) => setClientState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('zipCode')}
              </label>
              <input
                type="text"
                value={clientZipCode}
                onChange={(e) => setClientZipCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('country')}
              </label>
              <input
                type="text"
                value={clientCountry}
                onChange={(e) => setClientCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('preferredLocale')}
              </label>
              <select
                value={clientPreferredLocale}
                onChange={(e) => setClientPreferredLocale(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('timezone')}
              </label>
              <select
                value={clientTimezone}
                onChange={(e) => setClientTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t('selectTimezone')}</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lawyer Profile Section */}
      {profile?.role === 'LAWYER' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('lawyerInfo')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  value={lawyerFirstName}
                  onChange={(e) => setLawyerFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  value={lawyerLastName}
                  onChange={(e) => setLawyerLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('barNumber')}
                </label>
                <input
                  type="text"
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder={t('barNumberPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('barState')}
                </label>
                <input
                  type="text"
                  value={barState}
                  onChange={(e) => setBarState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder={t('barStatePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('yearsExperience')}
                </label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('hourlyRate')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('consultationFee')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('officePhone')}
                </label>
                <input
                  type="tel"
                  value={officePhone}
                  onChange={(e) => setOfficePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('bio')}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
                  placeholder={t('bioPlaceholder')}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('officeAddress')}
                </label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('city')}
                </label>
                <input
                  type="text"
                  value={lawyerCity}
                  onChange={(e) => setLawyerCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('state')}
                </label>
                <input
                  type="text"
                  value={lawyerState}
                  onChange={(e) => setLawyerState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('zipCode')}
                </label>
                <input
                  type="text"
                  value={lawyerZipCode}
                  onChange={(e) => setLawyerZipCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('website')}
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('languages')}</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedLanguages.includes(lang)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {t(`languageOptions.${lang}`)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('save')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
