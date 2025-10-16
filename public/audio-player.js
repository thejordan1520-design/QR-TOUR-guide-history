// audio-player.js
// --- Estado global de usuario y funciones reutilizables ---

// Simulación inicial de usuario (puedes reemplazar por integración real)
const defaultUser = {
  isAuthenticated: false,
  isSubscribed: false,
  subscriptionEnds: null // 'YYYY-MM-DD' o null
};

// Inicializa el usuario desde localStorage o usa el valor por defecto
function getUser() {
  const stored = localStorage.getItem('userStatus');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...defaultUser };
    }
  }
  return { ...defaultUser };
}

// Guarda el usuario en localStorage y dispara evento global
function setUser(user) {
  localStorage.setItem('userStatus', JSON.stringify(user));
  window.dispatchEvent(new Event('userStatusChanged'));
}

// Función de acceso global: true si autenticado y suscrito
function hasAccess() {
  const user = getUser();
  return !!(user && user.isAuthenticated && user.isSubscribed);
}

// Devuelve la fecha de expiración de la suscripción (string o null)
function getSubscriptionEndDate() {
  const user = getUser();
  return user && user.subscriptionEnds ? user.subscriptionEnds : null;
}

// Simula login o suscripción
function simulateSubscribe(days = 30) {
  const user = getUser();
  user.isAuthenticated = true;
  user.isSubscribed = true;
  // Fecha de expiración simulada
  const now = new Date();
  now.setDate(now.getDate() + days);
  user.subscriptionEnds = now.toISOString().slice(0, 10);
  setUser(user);
}

// Simula logout o cancelación
function simulateLogout() {
  setUser({ ...defaultUser });
}

// Exportar funciones globalmente
window.getUser = getUser;
window.setUser = setUser;
window.hasAccess = hasAccess;
window.getSubscriptionEndDate = getSubscriptionEndDate;
window.simulateSubscribe = simulateSubscribe;
window.simulateLogout = simulateLogout;

// --- Fin de audio-player.js ---

// Lista de lugares (nombre base, nombre visible)
const lugares = [
  { base: 'cristoredentor', nombre: 'Cristo Redentor' },
  { base: 'callerosada', nombre: 'Calle Rosada' },
  { base: 'calledelasombrillas', nombre: 'Calle de la Sombrilla' },
  { base: 'catedralsanfelipe', nombre: 'Catedral San Felipe' },
  { base: 'calledelacometas', nombre: 'Calle de las Cometas' },
  { base: 'fortalezasanfelipe', nombre: 'Fortaleza San Felipe' },
  { base: 'ronfactory', nombre: 'Ron Factory' },
  { base: 'hermanasmirabal', nombre: 'Hermanas Mirabal' },
  { base: 'larimarr', nombre: 'Larimar' },
  { base: 'letreropuertoplata', nombre: 'Letrero Puerto Plata' },
  { base: 'museodelambar', nombre: 'Museo del Ámbar' },
  { base: 'neptuno', nombre: 'Neptuno' },
];


const reproductor = document.getElementById('reproductor');

// Reproducir audio por nombre base y pausar otros audios
function reproducirAudio(nombreBase, contenedor) {
  // Si el usuario tiene acceso, reproduce normalmente
  if (hasAccess()) {
    reproducirAudioCompleto(nombreBase, contenedor);
    return;
  }

  // Control de demo único por usuario y lugar
  const demoKey = `demoPlayed_${nombreBase}`;
  if (localStorage.getItem(demoKey)) {
    alert("Ya has escuchado el demo de este lugar. Suscríbete para escuchar el audio completo.");
    return;
  }

  // Marca como escuchado
  localStorage.setItem(demoKey, "true");

  // Pausar todos los audios en la página antes de reproducir el nuevo
  document.querySelectorAll('audio').forEach(aud => {
    if (!aud.paused) aud.pause();
  });
  reproductor.src = `/audios/${nombreBase}.mp3`;
  reproductor.style.display = 'block';
  reproductor.currentTime = 0;
  // Establecer volumen al máximo (100%)
  reproductor.volume = 1.0;
  // Mover el reproductor debajo del contenedor seleccionado
  if (contenedor) {
    contenedor.appendChild(reproductor);
    if (volverBtn && volverBtn.parentNode) volverBtn.parentNode.removeChild(volverBtn);
    reproductor.parentNode.insertBefore(volverBtn, reproductor.nextSibling);
  }
  reproductor.play();

  // Detener el audio después de 10 segundos
  setTimeout(() => {
    reproductor.pause();
    reproductor.currentTime = 0;
    alert("Fin del demo. Suscríbete para escuchar el audio completo.");
  }, 10000);
}

// Nueva función para reproducción completa (solo suscriptores)
function reproducirAudioCompleto(nombreBase, contenedor) {
  document.querySelectorAll('audio').forEach(aud => {
    if (!aud.paused) aud.pause();
  });
  reproductor.src = `/audios/${nombreBase}.mp3`;
  reproductor.style.display = 'block';
  reproductor.currentTime = 0;
  // Establecer volumen al máximo (100%)
  reproductor.volume = 1.0;
  if (contenedor) {
    contenedor.appendChild(reproductor);
    if (volverBtn && volverBtn.parentNode) volverBtn.parentNode.removeChild(volverBtn);
    reproductor.parentNode.insertBefore(volverBtn, reproductor.nextSibling);
  }
  reproductor.play();
}

// Botones de lugares populares
const lugaresDivs = document.querySelectorAll('#lugares-populares .lugar');
lugaresDivs.forEach(lugar => {
  const btn = lugar.querySelector('.btn-audio');
  const audio = lugar.getAttribute('data-audio');
  btn.addEventListener('click', () => {
    reproducirAudio(audio, lugar);
  });
});

// Biblioteca de audios
const btnBiblioteca = document.getElementById('ver-biblioteca');
const biblioteca = document.getElementById('biblioteca-audio');

btnBiblioteca.addEventListener('click', () => {
  biblioteca.style.display = biblioteca.style.display === 'none' ? 'block' : 'none';
  if (biblioteca.innerHTML.trim() === '') {
    lugares.forEach(lugar => {
      const div = document.createElement('div');
      div.className = 'audio-item';
      div.innerHTML = `
        <img src="/places/${lugar.base}.jpg" alt="${lugar.nombre}" style="width:60px;height:60px;object-fit:cover;margin-right:10px;vertical-align:middle;" />
        <span>${lugar.nombre}</span>
        <button class="btn-audio">🔊</button>
      `;
      div.querySelector('.btn-audio').addEventListener('click', () => {
        reproducirAudio(lugar.base, div);
      });
      biblioteca.appendChild(div);
    });
  }
});

// Controles extra: volver al inicio
const volverBtn = document.createElement('button');
volverBtn.textContent = '⏮ Volver al inicio';
volverBtn.style.marginLeft = '10px';
volverBtn.onclick = () => {
  reproductor.currentTime = 0;
};
reproductor.parentNode.insertBefore(volverBtn, reproductor.nextSibling);

// Mostrar controles solo si hay audio cargado
reproductor.addEventListener('play', () => {
  reproductor.style.display = 'block';
  volverBtn.style.display = 'inline-block';
});
reproductor.addEventListener('pause', () => {
  // reproductor.style.display = 'block';
});
reproductor.addEventListener('ended', () => {
  // reproductor.style.display = 'none';
});
