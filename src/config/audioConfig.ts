// Configuración de audios multilingües para cada ubicación
export interface AudioConfig {
  id: string;
  name: string;
  audios: {
    spanish: string;
    english: string;
    french: string;
  };
}

export const audioConfigs: AudioConfig[] = [
  {
    id: 'fortaleza-san-felipe',
    name: 'Fortaleza San Felipe',
    audios: {
      spanish: '/audios/fortalezasanfelipe.mp3',
      english: '/audios/fortalezaING.mp3',
      french: '/audios/fortalezaFRC.mp3'
    }
  },
  {
    id: 'calle-sombrillas',
    name: 'Calle de las Sombrillas',
    audios: {
      spanish: '/audios/callesombrillas.mp3',
      english: '/audios/callesombrillaING.mp3',
      french: '/audios/callesombrillaFRC.mp3'
    }
  },
  {
    id: 'calle-rosada',
    name: 'Calle Rosada (Patio Doña Blanca)',
    audios: {
      spanish: '/audios/callerosada.mp3',
      english: '/audios/callerosadaING.mp3',
      french: '/audios/callerosadaFRC.mp3'
    }
  },
  {
    id: 'letrero-puerto-plata',
    name: 'Letrero Puerto Plata',
    audios: {
      spanish: '/audios/letreropuertoplata.mp3',
      english: '/audios/letreroING.mp3',
      french: '/audios/letreroFRC.mp3'
    }
  },
  {
    id: 'museo-ambar',
    name: 'Museo del Ámbar',
    audios: {
      spanish: '/audios/museodelambar.mp3',
      english: '/audios/museoambarING.mp3',
      french: '/audios/museoambarFRC.mp3'
    }
  },
  {
    id: 'ronfactory',
    name: 'Fábrica de Ron',
    audios: {
      spanish: '/audio/audios/ronfactory.mp3',
      english: '/audio/audios/ronfactoryING.mp3',
      french: '/audio/audios/ronfactoryFRC.mp3'
    }
  },
  {
    id: 'larimarr',
    name: 'Museo del Larimar',
    audios: {
      spanish: '/audios/larimarr.mp3',
      english: '/audios/larimarING.mp3',
      french: ''
    }
  },
  {
    id: 'hermanasmirabal',
    name: 'Monumento Hermanas Mirabal',
    audios: {
      spanish: '/audios/hermanasmirabal.mp3',
      english: '/audios/hermanasmirabalING.mp3',
      french: ''
    }
  },
  {
    id: 'neptuno',
    name: 'Estatua Neptuno en el Malecón',
    audios: {
      spanish: '/audios/neptuno.mp3',
      english: '/audios/neptuneiING.mp3',
      french: ''
    }
  },
  {
    id: 'catedralsanfelipe',
    name: 'Catedral San Felipe',
    audios: {
      spanish: '/audios/catedralsanfelipe.mp3',
      english: '/audios/catedralING.mp3',
      french: ''
    }
  },
  {
    id: 'cristoredentor',
    name: 'Cristo Redentor',
    audios: {
      spanish: '/audios/cristoredentor.mp3',
      english: '/audios/cristoredentorING.mp3',
      french: ''
    }
  },
  {
    id: 'calledelacometas',
    name: 'Calle de las Cometas Voladoras',
    audios: {
      spanish: '/audios/calledelacometas.mp3',
      english: '/audios/cometasING.mp3',
      french: ''
    }
  },
  {
    id: 'teleferico-puerto-plata',
    name: 'Teleférico de Puerto Plata',
    audios: {
      spanish: '/audios/telefericoESP.mp3',
      english: '/audios/telefericoING.mp3',
      french: '/audios/telefericoFRC.mp3'
    }
  },
  {
    id: 'ocean-world',
    name: 'Ocean World Water Park',
    audios: {
      spanish: '/audios/oceanworldESP.mp3',
      english: '/audios/oceanworldING.mp3',
      french: '/audios/oceanworldFRC.mp3'
    }
  },
  {
    id: 'museo-gregorio-luperon',
    name: 'Museo Gregorio Luperón',
    audios: {
      spanish: '/audios/museogregorioluperonESP.mp3',
      english: '/audios/museogregorioluperonING.mp3',
      french: '/audios/museogregorioluperonFRC.mp3'
    }
  },
  {
    id: 'parque-central',
    name: 'Parque Central de Puerto Plata',
    audios: {
      spanish: '/audios/parquecentralESP.mp3',
      english: '/audios/parquecentralING.mp3',
      french: '/audios/parquecentralFRC.mp3'
    }
  }
];

// Función helper para obtener la configuración de audio por ID
export const getAudioConfig = (id: string): AudioConfig | undefined => {
  return audioConfigs.find(config => config.id === id);
};

// Función helper para obtener todos los audios disponibles para una ubicación
export const getAvailableAudios = (id: string) => {
  const config = getAudioConfig(id);
  if (!config) return [];
  
  return Object.entries(config.audios)
    .filter(([_, src]) => src !== '')
    .map(([language, src]) => ({ language, src }));
}; 