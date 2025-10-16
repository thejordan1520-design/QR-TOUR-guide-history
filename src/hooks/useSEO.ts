import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: 'website' | 'article' | 'product';
  structuredData: any;
}

export const useSEO = (customData?: Partial<SEOData>) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const seoData = useMemo(() => {
    const baseUrl = 'https://puerto-plata-audio.com';
    const currentUrl = `${baseUrl}${location.pathname}`;
    const currentLocale = i18n.language;

    // Datos por defecto
    const defaultData: SEOData = {
      title: t('seo.default.title'),
      description: t('seo.default.description'),
      keywords: t('seo.default.keywords'),
      image: '/images/og-image.jpg',
      url: currentUrl,
      type: 'website',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Puerto Plata Audio Guide",
        "description": t('seo.default.description'),
        "url": baseUrl,
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Web Browser",
        "inLanguage": currentLocale,
        "availableLanguage": ["es", "en", "fr"]
      }
    };

    // Datos específicos por ruta
    const routeData: Record<string, Partial<SEOData>> = {
      '/': {
        title: t('seo.home.title'),
        description: t('seo.home.description'),
        keywords: t('seo.home.keywords'),
        structuredData: {
          "@type": "WebSite",
          "name": "Puerto Plata Audio Guide",
          "description": t('seo.home.description'),
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }
      },
      '/biblioteca-react': {
        title: t('seo.audioLibrary.title'),
        description: t('seo.audioLibrary.description'),
        keywords: t('seo.audioLibrary.keywords'),
        image: '/images/audio-library-og.jpg',
        structuredData: {
          "@type": "CollectionPage",
          "name": t('seo.audioLibrary.title'),
          "description": t('seo.audioLibrary.description'),
          "url": `${baseUrl}/biblioteca-react`,
          "mainEntity": {
            "@type": "ItemList",
            "name": "Audio Destinations",
            "description": "Collection of audio guides for Puerto Plata destinations"
          }
        }
      },
      '/subscribe': {
        title: t('seo.subscribe.title'),
        description: t('seo.subscribe.description'),
        keywords: t('seo.subscribe.keywords'),
        type: 'product',
        structuredData: {
          "@type": "Product",
          "name": "Puerto Plata Audio Guide Subscription",
          "description": t('seo.subscribe.description'),
          "url": `${baseUrl}/subscribe`,
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "5",
            "highPrice": "999",
            "offerCount": "4"
          }
        }
      }
    };

    // Datos para páginas de ubicación específicas
    if (location.pathname.startsWith('/location/')) {
      const locationId = location.pathname.split('/')[2];
      const locationName = t(`locations.${locationId}.name`);
      const locationDescription = t(`locations.${locationId}.description`);
      
      return {
        ...defaultData,
        title: `${locationName} | Puerto Plata Audio Guide`,
        description: locationDescription,
        keywords: `${locationName}, Puerto Plata, audio guide, turismo, ${t('seo.default.keywords')}`,
        image: `/places/${locationId}.jpg`,
        structuredData: {
          "@type": "TouristAttraction",
          "name": locationName,
          "description": locationDescription,
          "url": currentUrl,
          "image": `/places/${locationId}.jpg`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Puerto Plata",
            "addressRegion": "Puerto Plata",
            "addressCountry": "DO"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "19.7939",
            "longitude": "-70.6914"
          }
        }
      };
    }

    // Datos para páginas de audio específicas
    if (location.pathname.startsWith('/audio/')) {
      const audioId = location.pathname.split('/')[2];
      const audioName = t(`locations.${audioId}.name`);
      const audioDescription = t(`locations.${audioId}.description`);
      
      return {
        ...defaultData,
        title: `${audioName} - Audio Guide | Puerto Plata Audio Guide`,
        description: audioDescription,
        keywords: `${audioName}, audio guide, Puerto Plata, ${t('seo.default.keywords')}`,
        image: `/places/${audioId}.jpg`,
        type: 'article',
        structuredData: {
          "@type": "AudioObject",
          "name": `${audioName} - Audio Guide`,
          "description": audioDescription,
          "url": currentUrl,
          "image": `/places/${audioId}.jpg`,
          "contentUrl": `/audio/audios/${audioId}ING.mp3`,
          "encodingFormat": "audio/mpeg",
          "duration": "PT5M"
        }
      };
    }

    // Combinar datos de ruta con datos personalizados
    const routeSpecificData = routeData[location.pathname] || {};
    const finalData = { ...defaultData, ...routeSpecificData, ...customData };

    // Asegurar que la URL sea absoluta
    if (finalData.image && !finalData.image.startsWith('http')) {
      finalData.image = `${baseUrl}${finalData.image}`;
    }

    return finalData;
  }, [location.pathname, i18n.language, t, customData]);

  return seoData;
};

// Hook para generar breadcrumbs
export const useBreadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const breadcrumbs = useMemo(() => {
    const baseUrl = 'https://puerto-plata-audio.com';
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbList = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t('seo.breadcrumbs.home'),
        "item": baseUrl
      }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const position = index + 2;
      
      let name = segment;
      if (segment === 'biblioteca-react') {
        name = t('seo.breadcrumbs.audioLibrary');
      } else if (segment === 'subscribe') {
        name = t('seo.breadcrumbs.subscribe');
      } else if (segment === 'location') {
        name = t('seo.breadcrumbs.location');
      } else if (segment === 'audio') {
        name = t('seo.breadcrumbs.audio');
      } else if (pathSegments[index - 1] === 'location') {
        name = t(`locations.${segment}.name`);
      } else if (pathSegments[index - 1] === 'audio') {
        name = t(`locations.${segment}.name`);
      }

      breadcrumbList.push({
        "@type": "ListItem",
        "position": position,
        "name": name,
        "item": `${baseUrl}${currentPath}`
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    };
  }, [location.pathname, t]);

  return breadcrumbs;
};
