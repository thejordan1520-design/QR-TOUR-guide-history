import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  alternateLocales?: { locale: string; url: string }[];
  structuredData?: any;
  noindex?: boolean;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Puerto Plata Audio Guide - Guía de Audio Interactiva',
  description = 'Descubre Puerto Plata con nuestra guía de audio interactiva. Contenido en español, inglés y francés. Fortaleza San Felipe, Teleférico, Calle de las Sombrillas y más.',
  keywords = 'Puerto Plata, guía de audio, turismo, República Dominicana, Fortaleza San Felipe, Teleférico, Calle de las Sombrillas, turismo interactivo',
  image = '/images/og-image.jpg',
  url = 'https://puerto-plata-audio.com',
  type = 'website',
  locale = 'es',
  alternateLocales = [
    { locale: 'en', url: 'https://puerto-plata-audio.com/en' },
    { locale: 'fr', url: 'https://puerto-plata-audio.com/fr' }
  ],
  structuredData,
  noindex = false,
  canonical
}) => {
  const fullTitle = title.includes('Puerto Plata Audio Guide') ? title : `${title} | Puerto Plata Audio Guide`;
  const fullUrl = canonical || url;
  const fullImage = image.startsWith('http') ? image : `${url}${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Puerto Plata Audio Guide",
    "description": description,
    "url": url,
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Puerto Plata Audio Guide",
      "url": url
    },
    "publisher": {
      "@type": "Organization",
      "name": "Puerto Plata Audio Guide",
      "url": url
    },
    "inLanguage": locale,
    "availableLanguage": ["es", "en", "fr"],
    "featureList": [
      "Audio guides in multiple languages",
      "Interactive maps",
      "QR code scanning",
      "Offline functionality",
      "Progressive Web App"
    ]
  };

  const mergedStructuredData = structuredData 
    ? { ...defaultStructuredData, ...structuredData }
    : defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Puerto Plata Audio Guide" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Puerto Plata Audio Guide" />
      <meta property="og:locale" content={locale} />
      
      {/* Alternate locales */}
      {alternateLocales.map((alt) => (
        <meta key={alt.locale} property="og:locale:alternate" content={alt.locale} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@PuertoPlataAudio" />
      <meta name="twitter:creator" content="@PuertoPlataAudio" />

      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PP Audio Guide" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://supabase.co" />
      <link rel="preconnect" href="https://maps.googleapis.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//supabase.co" />
      <link rel="dns-prefetch" href="//maps.googleapis.com" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(mergedStructuredData)}
      </script>

      {/* Additional Meta Tags for SEO */}
      <meta name="geo.region" content="DO-18" />
      <meta name="geo.placename" content="Puerto Plata" />
      <meta name="geo.position" content="19.7939;-70.6914" />
      <meta name="ICBM" content="19.7939, -70.6914" />

      {/* Language and Content */}
      <meta httpEquiv="content-language" content={locale} />
      <meta name="language" content={locale} />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />

      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preload critical resources */}
      <link rel="preload" href="/audio/audios/fortalezaING.mp3" as="audio" type="audio/mpeg" />
      <link rel="preload" href="/places/fortalezasanfelipe.jpg" as="image" type="image/jpeg" />
    </Helmet>
  );
};

export default SEO;
