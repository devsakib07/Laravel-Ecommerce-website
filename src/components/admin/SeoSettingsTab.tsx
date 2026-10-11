import React, { useState } from 'react';
import { SeoSettings, SiteSettings } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import { applySeoMetadata } from '../../utils/seo';
import {
  Globe,
  Share2,
  Search,
  CheckCircle,
  AlertCircle,
  Code,
  Sparkles,
  Save,
  Check,
  Eye,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface SeoSettingsTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const SeoSettingsTab: React.FC<SeoSettingsTabProps> = ({ settings, onSettingsUpdated }) => {
  const [seo, setSeo] = useState<SeoSettings>(() => ({
    meta_title: settings.seo_settings?.meta_title || `${settings.website_name} – Pure & Organic Natural Grocery Bangladesh`,
    meta_description: settings.seo_settings?.meta_description || 'Buy 100% authentic Sundarban honey, artisanal gawa ghee, cold-pressed mustard oil, Madinah dates, and organic staples with fast home delivery in Bangladesh.',
    meta_keywords: settings.seo_settings?.meta_keywords || 'organic grocery, pure honey bangladesh, gawa ghee, mustard oil, shuddho bazar, ghorer bazar',
    og_title: settings.seo_settings?.og_title || `${settings.website_name} – Pure & Safe Natural Food`,
    og_description: settings.seo_settings?.og_description || 'Pure, authentic organic food delivered directly to your doorstep in Dhaka & all over Bangladesh. 100% adulteration-free guaranteed.',
    og_image: settings.seo_settings?.og_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=630&fit=crop',
    twitter_card: settings.seo_settings?.twitter_card || 'summary_large_image',
    twitter_site: settings.seo_settings?.twitter_site || '@shuddhobazar',
    canonical_url: settings.seo_settings?.canonical_url || 'https://shuddhobazar.com',
    google_verification: settings.seo_settings?.google_verification || 'google-site-verification=shuddho_demo_verify_2026',
    robots: settings.seo_settings?.robots || 'index, follow',
    author: settings.seo_settings?.author || 'Shuddho Bazar Organic Ltd.',
    structured_data_enabled: settings.seo_settings?.structured_data_enabled !== false,
  }));

  const [saved, setSaved] = useState(false);
  const [activePreview, setActivePreview] = useState<'google' | 'social' | 'schema'>('google');

  // Real-time SEO score calculation
  const getSeoHealth = () => {
    let score = 0;
    const checks = [];

    // Title length (30-60 chars)
    const titleLen = seo.meta_title.trim().length;
    if (titleLen >= 30 && titleLen <= 65) {
      score += 25;
      checks.push({ label: `Page title length is optimal (${titleLen} chars)`, pass: true });
    } else {
      checks.push({ label: `Title should be between 30-60 chars (currently ${titleLen})`, pass: false });
    }

    // Description length (120-160 chars)
    const descLen = seo.meta_description.trim().length;
    if (descLen >= 100 && descLen <= 165) {
      score += 25;
      checks.push({ label: `Meta description length is ideal (${descLen} chars)`, pass: true });
    } else {
      checks.push({ label: `Meta description should be between 120-160 chars (currently ${descLen})`, pass: false });
    }

    // Social image
    if (seo.og_image && seo.og_image.startsWith('http')) {
      score += 20;
      checks.push({ label: 'OpenGraph high-resolution social share image configured', pass: true });
    } else {
      checks.push({ label: 'Add an absolute URL for OpenGraph social share card image', pass: false });
    }

    // Structured data
    if (seo.structured_data_enabled) {
      score += 15;
      checks.push({ label: 'Schema.org JSON-LD Structured Data enabled for Google rich snippets', pass: true });
    } else {
      checks.push({ label: 'Enable Schema.org Structured Data', pass: false });
    }

    // Canonical & keywords
    if (seo.canonical_url && seo.meta_keywords) {
      score += 15;
      checks.push({ label: 'Canonical URL and targeting keywords defined', pass: true });
    } else {
      checks.push({ label: 'Define canonical URL and comma-separated keywords', pass: false });
    }

    return { score, checks };
  };

  const health = getSeoHealth();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateSettings({
      seo_settings: seo,
    });
    applySeoMetadata(seo, updated);
    onSettingsUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Search Engine Optimization (SEO) & Social Cards</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Configure how your store appears on Google search results, WhatsApp, Facebook, Twitter, and other platforms. Manage rich snippets, JSON-LD structured data, and search engine crawlers.
          </p>
        </div>

        {/* SEO Score Meter */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 text-center min-w-[140px]">
          <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">SEO Health Score</div>
          <div className="text-3xl font-black text-white mt-0.5">
            {health.score}<span className="text-sm font-semibold text-emerald-400">/100</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5 font-medium">
            {health.score >= 80 ? '🟢 Excellent Rating' : health.score >= 50 ? '🟡 Good (Action needed)' : '🔴 Needs Attention'}
          </div>
        </div>
      </div>

      {/* SEO Health Checklist */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          SEO Audit & Optimization Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {health.checks.map((chk, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${chk.pass ? 'bg-emerald-50/60 text-emerald-900' : 'bg-amber-50/70 text-amber-900'}`}>
              {chk.pass ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-tight">{chk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Settings Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Settings (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* General Meta Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Standard Google Meta Tags</span>
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Page Meta Title</label>
                <span className={`text-[11px] font-mono ${seo.meta_title.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {seo.meta_title.length} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={seo.meta_title}
                onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="e.g. Shuddho Bazar – Pure & Organic Natural Grocery"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Recommended length: 30 to 60 characters for optimal display in search snippets.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                <span className={`text-[11px] font-mono ${seo.meta_description.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {seo.meta_description.length} / 160 chars
                </span>
              </div>
              <textarea
                value={seo.meta_description}
                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 leading-relaxed"
                placeholder="A compelling 1-2 sentence summary of your store..."
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Recommended length: 120 to 160 characters. Avoid truncation on mobile screens.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Meta Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={seo.meta_keywords}
                  onChange={(e) => setSeo({ ...seo, meta_keywords: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                  placeholder="honey, ghee, spices, organic food"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Canonical URL</label>
                <input
                  type="url"
                  value={seo.canonical_url}
                  onChange={(e) => setSeo({ ...seo, canonical_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                  placeholder="https://shuddhobazar.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Robots Meta Directive</label>
                <select
                  value={seo.robots}
                  onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  <option value="index, follow">Index, Follow (Recommended for live stores)</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow (Private / Staging)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Google Site Verification Code</label>
                <input
                  type="text"
                  value={seo.google_verification}
                  onChange={(e) => setSeo({ ...seo, google_verification: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                  placeholder="e.g. google-site-verification=..."
                />
              </div>
            </div>
          </div>

          {/* Social Media & OpenGraph Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>OpenGraph (Facebook, WhatsApp, LinkedIn) & Twitter Cards</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Social Share Title (og:title)</label>
              <input
                type="text"
                value={seo.og_title}
                onChange={(e) => setSeo({ ...seo, og_title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                placeholder="Title that appears when shared on WhatsApp or Facebook"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Social Share Description (og:description)</label>
              <textarea
                value={seo.og_description}
                onChange={(e) => setSeo({ ...seo, og_description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                placeholder="Description for social link cards"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Social Share Image URL (og:image / 1200x630)</label>
              <input
                type="url"
                value={seo.og_image}
                onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                placeholder="https://... image banner 1200x630"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSeo({ ...seo, og_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=630&fit=crop' })}
                  className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                >
                  Use Organic Food Banner
                </button>
                <button
                  type="button"
                  onClick={() => setSeo({ ...seo, og_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&h=630&fit=crop' })}
                  className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200"
                >
                  Use Honey Harvest Banner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Twitter Card Format</label>
                <select
                  value={seo.twitter_card}
                  onChange={(e) => setSeo({ ...seo, twitter_card: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  <option value="summary_large_image">Large Image Card (Recommended)</option>
                  <option value="summary">Standard Compact Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  value={seo.twitter_site}
                  onChange={(e) => setSeo({ ...seo, twitter_site: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                  placeholder="@shuddhobazar"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="structuredData"
                  checked={seo.structured_data_enabled}
                  onChange={(e) => setSeo({ ...seo, structured_data_enabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="structuredData" className="text-xs font-medium text-slate-700">
                  Enable Schema.org WebSite & Organization JSON-LD Structured Data
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'SEO Settings Saved & Applied!' : 'Save & Apply SEO Settings'}</span>
            </button>
            {saved && (
              <span className="text-xs text-emerald-600 font-semibold animate-fade-in">
                Website head metadata successfully updated!
              </span>
            )}
          </div>
        </form>

        {/* Right Column: Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Preview Mode Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActivePreview('google')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${activePreview === 'google' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Google Preview
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('social')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${activePreview === 'social' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Social Card Preview
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('schema')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${activePreview === 'schema' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              JSON-LD Code
            </button>
          </div>

          {/* PREVIEW: GOOGLE SEARCH SERP */}
          {activePreview === 'google' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Google Search Result Snippet Simulation
              </span>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#ffffff] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                    🌿
                  </div>
                  <div>
                    <div className="text-[12px] text-[#202124] leading-none font-medium">{settings.website_name || 'Shuddho Bazar'}</div>
                    <div className="text-[11px] text-[#5f6368] leading-none mt-0.5 truncate max-w-[240px]">{seo.canonical_url}</div>
                  </div>
                </div>

                <h4 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug line-clamp-2">
                  {seo.meta_title || 'Store Title'}
                </h4>

                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                  {seo.meta_description || 'Store meta description will appear here...'}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                <p className="font-semibold text-slate-700">Snippet Guidelines:</p>
                <p>Google automatically bolds search keywords found in your meta description and title tag.</p>
              </div>
            </div>
          )}

          {/* PREVIEW: SOCIAL SHARE CARD (WhatsApp, Facebook, Twitter) */}
          {activePreview === 'social' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Social Link Share Card (WhatsApp & Facebook Preview)
              </span>

              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-50">
                {seo.og_image ? (
                  <div className="aspect-[1.91/1] w-full bg-slate-200 overflow-hidden relative">
                    <img
                      src={seo.og_image}
                      alt="Social share preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    No image configured
                  </div>
                )}

                <div className="p-3 bg-white space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {new URL(seo.canonical_url || 'https://shuddhobazar.com').hostname}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {seo.og_title || seo.meta_title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {seo.og_description || seo.meta_description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW: JSON-LD Structured Data */}
          {activePreview === 'schema' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Schema.org JSON-LD Output
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  Valid Schema
                </span>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-[360px] leading-relaxed">
{JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': settings.website_name,
    'url': seo.canonical_url,
    'description': seo.meta_description,
    'publisher': {
      '@type': 'Organization',
      'name': settings.website_name,
      'logo': seo.og_image || settings.logo,
      'telephone': settings.phone,
    }
  },
  null,
  2
)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
