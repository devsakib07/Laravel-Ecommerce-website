import { SeoSettings, SiteSettings } from '../types/ecommerce';

/**
 * Updates the document head with current SEO settings and Schema.org JSON-LD
 */
export function applySeoMetadata(seo: SeoSettings, settings?: SiteSettings) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  if (seo.meta_title) {
    document.title = seo.meta_title;
  }

  // Helper to set or update meta tag by name
  const setMetaTagByName = (name: string, content: string) => {
    if (!content) return;
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  // Helper to set or update meta tag by property
  const setMetaTagByProperty = (property: string, content: string) => {
    if (!content) return;
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  // 2. Standard Meta Tags
  if (seo.meta_description) {
    setMetaTagByName('description', seo.meta_description);
  }
  if (seo.meta_keywords) {
    setMetaTagByName('keywords', seo.meta_keywords);
  }
  if (seo.author) {
    setMetaTagByName('author', seo.author);
  }
  if (seo.robots) {
    setMetaTagByName('robots', seo.robots);
  }
  if (seo.google_verification) {
    setMetaTagByName('google-site-verification', seo.google_verification);
  }

  // 3. OpenGraph Tags
  setMetaTagByProperty('og:type', 'website');
  setMetaTagByProperty('og:title', seo.og_title || seo.meta_title || 'Shuddho Bazar');
  setMetaTagByProperty('og:description', seo.og_description || seo.meta_description || '');
  if (seo.og_image) {
    setMetaTagByProperty('og:image', seo.og_image);
  }
  if (settings?.website_name) {
    setMetaTagByProperty('og:site_name', settings.website_name);
  }
  const currentUrl = typeof window !== 'undefined' ? window.location.href : (seo.canonical_url || 'https://shuddhobazar.com');
  setMetaTagByProperty('og:url', currentUrl);

  // 4. Twitter Cards
  setMetaTagByName('twitter:card', seo.twitter_card || 'summary_large_image');
  setMetaTagByName('twitter:title', seo.og_title || seo.meta_title || 'Shuddho Bazar');
  setMetaTagByName('twitter:description', seo.og_description || seo.meta_description || '');
  if (seo.og_image) {
    setMetaTagByName('twitter:image', seo.og_image);
  }
  if (seo.twitter_site) {
    setMetaTagByName('twitter:site', seo.twitter_site);
  }

  // 5. Canonical URL
  if (seo.canonical_url) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = seo.canonical_url;
  }

  // 6. Schema.org JSON-LD Structured Data
  if (seo.structured_data_enabled !== false) {
    let script = document.getElementById('shuddho-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'shuddho-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${currentUrl}#website`,
          'url': currentUrl,
          'name': settings?.website_name || 'Shuddho Bazar',
          'description': seo.meta_description,
          'potentialAction': [
            {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${currentUrl}?search={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          ]
        },
        {
          '@type': 'Organization',
          '@id': `${currentUrl}#organization`,
          'name': settings?.website_name || 'Shuddho Bazar',
          'url': currentUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': seo.og_image || settings?.logo || ''
          },
          'contactPoint': [
            {
              '@type': 'ContactPoint',
              'telephone': settings?.phone || '+8809642922922',
              'contactType': 'customer support',
              'areaServed': 'BD',
              'availableLanguage': ['bn', 'en']
            }
          ],
          'sameAs': [
            settings?.facebook_url,
            settings?.instagram_url,
            settings?.youtube_url
          ].filter(Boolean)
        }
      ]
    };

    script.textContent = JSON.stringify(structuredData, null, 2);
  }
}
