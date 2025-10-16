// authStatus.js
// --- Control centralizado de estado de usuario y acceso global ---

/**
 * Devuelve el estado actual del usuario desde localStorage
 * @returns {{isAuthenticated: boolean, isSubscribed: boolean, subscriptionEnds: string|null}}
 */
export function getUserStatus() {
  const user = JSON.parse(localStorage.getItem("userStatus"));
  return {
    isAuthenticated: user?.isAuthenticated || false,
    isSubscribed: user?.isSubscribed || false,
    subscriptionEnds: user?.subscriptionEnds || null
  };
}

/**
 * Devuelve los días restantes de suscripción
 * @returns {number|null}
 */
export function getRemainingDays() {
  const { subscriptionEnds } = getUserStatus();
  if (!subscriptionEnds) return null;
  const today = new Date();
  const endDate = new Date(subscriptionEnds);
  const diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
}

// --- Fin de authStatus.js --- 