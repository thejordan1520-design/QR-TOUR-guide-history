// Servicio de traducción automática
interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage: string;
}

interface TranslationService {
  translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult>;
  translatePlace(place: { name: string; description: string; title?: string }, sourceLanguage?: string): Promise<{
    name: { es: string; en: string; fr: string };
    description: { es: string; en: string; fr: string };
    title?: { es: string; en: string; fr: string };
  }>;
}

class GoogleTranslateService implements TranslationService {
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage = 'auto'): Promise<TranslationResult> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.data.translations[0];

      return {
        translatedText: translation.translatedText,
        detectedSourceLanguage: translation.detectedSourceLanguage || sourceLanguage
      };
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: return original text
      return {
        translatedText: text,
        detectedSourceLanguage: sourceLanguage
      };
    }
  }

  async translatePlace(place: { name: string; description: string; title?: string }, sourceLanguage = 'es'): Promise<{
    name: { es: string; en: string; fr: string };
    description: { es: string; en: string; fr: string };
    title?: { es: string; en: string; fr: string };
  }> {
    const languages = ['es', 'en', 'fr'];
    const result: any = {
      name: {},
      description: {}
    };

    if (place.title) {
      result.title = {};
    }

    // Traducir en paralelo para mejor rendimiento
    const translationPromises: Promise<any>[] = [];

    for (const lang of languages) {
      // Traducir nombre
      translationPromises.push(
        this.translateText(place.name, lang, sourceLanguage)
          .then(translation => ({ field: 'name', lang, text: translation.translatedText }))
      );

      // Traducir descripción
      translationPromises.push(
        this.translateText(place.description, lang, sourceLanguage)
          .then(translation => ({ field: 'description', lang, text: translation.translatedText }))
      );

      // Traducir título si existe
      if (place.title) {
        translationPromises.push(
          this.translateText(place.title, lang, sourceLanguage)
            .then(translation => ({ field: 'title', lang, text: translation.translatedText }))
        );
      }
    }

    const translations = await Promise.all(translationPromises);

    // Organizar las traducciones
    translations.forEach(({ field, lang, text }) => {
      result[field][lang] = text;
    });

    return result;
  }
}

// Servicio de traducción simulada (para desarrollo sin API key)
class MockTranslationService implements TranslationService {
  async translateText(text: string, targetLanguage: string): Promise<TranslationResult> {
    // Simular traducción básica
    const translations: Record<string, Record<string, string>> = {
      'es': {
        'en': this.spanishToEnglish(text),
        'fr': this.spanishToFrench(text)
      },
      'en': {
        'es': this.englishToSpanish(text),
        'fr': this.englishToFrench(text)
      },
      'fr': {
        'es': this.frenchToSpanish(text),
        'en': this.frenchToEnglish(text)
      }
    };

    const translatedText = translations[targetLanguage]?.[targetLanguage] || text;
    
    return {
      translatedText,
      detectedSourceLanguage: 'auto'
    };
  }

  async translatePlace(place: { name: string; description: string; title?: string }): Promise<{
    name: { es: string; en: string; fr: string };
    description: { es: string; en: string; fr: string };
    title?: { es: string; en: string; fr: string };
  }> {
    return {
      name: {
        es: place.name,
        en: this.spanishToEnglish(place.name),
        fr: this.spanishToFrench(place.name)
      },
      description: {
        es: place.description,
        en: this.spanishToEnglish(place.description),
        fr: this.spanishToFrench(place.description)
      },
      title: place.title ? {
        es: place.title,
        en: this.spanishToEnglish(place.title),
        fr: this.spanishToFrench(place.title)
      } : undefined
    };
  }

  // Traducciones básicas simuladas
  private spanishToEnglish(text: string): string {
    const translations: Record<string, string> = {
      // Lugares específicos
      'casa de jordan': "Jordan's House",
      'una prueba de integracion de lugar para el proyecto': "an integration test of a place for the project",
      // Traducciones generales
      'Monumento': 'Monument',
      'Histórico': 'Historic',
      'Cultural': 'Cultural',
      'Religioso': 'Religious',
      'Museo': 'Museum',
      'Plaza': 'Square',
      'Iglesia': 'Church',
      'Fortaleza': 'Fortress',
      'Catedral': 'Cathedral',
      'Parque': 'Park',
      'Calle': 'Street',
      'Avenida': 'Avenue',
      'Puerto': 'Port',
      'Plata': 'Silver',
      'Cristo': 'Christ',
      'Redentor': 'Redeemer',
      'San': 'Saint',
      'Felipe': 'Philip',
      'Hermanas': 'Sisters',
      'Mirabal': 'Mirabal',
      'Ámbar': 'Amber',
      'Larimar': 'Larimar',
      'General': 'General',
      'Gregorio': 'Gregory',
      'Luperón': 'Luperon',
      'Central': 'Central',
      'Neptuno': 'Neptune',
      'Malecón': 'Boardwalk',
      'Factory': 'Factory',
      'Ron': 'Rum',
      'Ocean': 'Ocean',
      'World': 'World',
      'Teleférico': 'Cable Car',
      'Sombrillas': 'Umbrellas',
      'Chichiguas': 'Kites',
      'Cometas': 'Kites',
      'Rosada': 'Pink',
      'Puerto Plata': 'Silver Port',
      'República Dominicana': 'Dominican Republic',
      
      // Traducciones específicas para descripciones largas de excursiones
      'Vuela sobre la selva en una emocionante aventura de Zipline. Deslazate por cables a traves del dosel de los arboles, con vistas espectaculares del paisaje rural de Puerto Plata': 'Fly over the jungle in an exciting Zipline adventure. Glide through cables through the canopy of the trees, with spectacular views of the rural landscape of Puerto Plata',
      'La excursion a los 27 Charcos de Damajagua te invita a una aventura en el corazonn de la naturaleza de Puerto Plata. Preparate para saltar, deslizarte y nadar a traves de una serie de 27 cascadas y pozas de agua cristalina, talladas por la naturaleza.': 'The excursion to the 27 Charcos of Damajagua invites you to an adventure in the heart of nature in Puerto Plata. Get ready to jump, slide and swim through a series of 27 waterfalls and crystal clear pools, carved by nature.',
      'Explora la Cueva del Teleferico, una joya natural escondida en la base de la montaña Isabel de Torres': 'Explore the Cable Car Cave, a hidden natural gem at the base of Isabel de Torres mountain',
      'En esta excursionn a El Gallo Eco Lodge, te adentraras en el campo dominicano para disfrutar de rios, cascadas y pozas de agua natural. Es la escapada perfecta para los amantes de la naturaleza y la aventura.': 'In this excursion to El Gallo Eco Lodge, you will immerse yourself in the Dominican countryside to enjoy rivers, waterfalls and natural water pools. It is the perfect escape for nature and adventure lovers.'
    };

    let translated = text;
    Object.entries(translations).forEach(([spanish, english]) => {
      translated = translated.replace(new RegExp(spanish, 'gi'), english);
    });
    return translated;
  }

  private spanishToFrench(text: string): string {
    const translations: Record<string, string> = {
      // Lugares específicos
      'casa de jordan': "Maison de Jordan",
      'una prueba de integracion de lugar para el proyecto': "un test d'intégration d'un lieu pour le projet",
      // Traducciones generales
      'Monumento': 'Monument',
      'Histórico': 'Historique',
      'Cultural': 'Culturel',
      'Religioso': 'Religieux',
      'Museo': 'Musée',
      'Plaza': 'Place',
      'Iglesia': 'Église',
      'Fortaleza': 'Forteresse',
      'Catedral': 'Cathédrale',
      'Parque': 'Parc',
      'Calle': 'Rue',
      'Avenida': 'Avenue',
      'Puerto': 'Port',
      'Plata': 'Argent',
      'Cristo': 'Christ',
      'Redentor': 'Rédempteur',
      'San': 'Saint',
      'Felipe': 'Philippe',
      'Hermanas': 'Sœurs',
      'Mirabal': 'Mirabal',
      'Ámbar': 'Ambre',
      'Larimar': 'Larimar',
      'General': 'Général',
      'Gregorio': 'Grégoire',
      'Luperón': 'Luperon',
      'Central': 'Central',
      'Neptuno': 'Neptune',
      'Malecón': 'Promenade',
      'Factory': 'Usine',
      'Ron': 'Rhum',
      'Ocean': 'Océan',
      'World': 'Monde',
      'Teleférico': 'Téléphérique',
      'Sombrillas': 'Parapluies',
      'Chichiguas': 'Cerfs-volants',
      'Cometas': 'Cerfs-volants',
      'Rosada': 'Rose',
      'Puerto Plata': 'Port d\'Argent',
      'República Dominicana': 'République Dominicaine',
      
      // Traducciones específicas para descripciones largas de excursiones
      'Vuela sobre la selva en una emocionante aventura de Zipline. Deslazate por cables a traves del dosel de los arboles, con vistas espectaculares del paisaje rural de Puerto Plata': 'Volez au-dessus de la jungle dans une aventure passionnante de Tyrolienne. Glissez sur des câbles à travers la canopée des arbres, avec des vues spectaculaires du paysage rural de Puerto Plata',
      'La excursion a los 27 Charcos de Damajagua te invita a una aventura en el corazonn de la naturaleza de Puerto Plata. Preparate para saltar, deslizarte y nadar a traves de una serie de 27 cascadas y pozas de agua cristalina, talladas por la naturaleza.': 'L\'excursion aux 27 Charcos de Damajagua vous invite à une aventure au cœur de la nature de Puerto Plata. Préparez-vous à sauter, glisser et nager à travers une série de 27 cascades et piscines d\'eau cristalline, sculptées par la nature.',
      'Explora la Cueva del Teleferico, una joya natural escondida en la base de la montaña Isabel de Torres': 'Explorez la Grotte du Téléphérique, un joyau naturel caché au pied de la montagne Isabel de Torres',
      'En esta excursionn a El Gallo Eco Lodge, te adentraras en el campo dominicano para disfrutar de rios, cascadas y pozas de agua natural. Es la escapada perfecta para los amantes de la naturaleza y la aventura.': 'Dans cette excursion à El Gallo Eco Lodge, vous vous plongerez dans la campagne dominicaine pour profiter des rivières, cascades et piscines d\'eau naturelle. C\'est l\'évasion parfaite pour les amateurs de nature et d\'aventure.'
    };

    let translated = text;
    Object.entries(translations).forEach(([spanish, french]) => {
      translated = translated.replace(new RegExp(spanish, 'gi'), french);
    });
    return translated;
  }

  private englishToSpanish(text: string): string {
    // Implementar traducciones básicas de inglés a español
    return text; // Por simplicidad, retornar el texto original
  }

  private englishToFrench(text: string): string {
    // Implementar traducciones básicas de inglés a francés
    return text; // Por simplicidad, retornar el texto original
  }

  private frenchToSpanish(text: string): string {
    // Implementar traducciones básicas de francés a español
    return text; // Por simplicidad, retornar el texto original
  }

  private frenchToEnglish(text: string): string {
    // Implementar traducciones básicas de francés a inglés
    return text; // Por simplicidad, retornar el texto original
  }
}

// Factory para crear el servicio de traducción apropiado
export function createTranslationService(): TranslationService {
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  
  if (apiKey) {
    console.log('🌐 Usando Google Translate API');
    return new GoogleTranslateService(apiKey);
  } else {
    console.log('🌐 Usando servicio de traducción simulado');
    return new MockTranslationService();
  }
}

export { TranslationService, TranslationResult };
