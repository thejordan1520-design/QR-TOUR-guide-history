-- CONFIGURACIÓN PAYPAL TEMPORAL PARA DESARROLLO
-- Usar esta URL temporal hasta tener dominio de producción

-- OPCIÓN 1: Usar ngrok para crear URL pública temporal
-- 1. Instalar ngrok: https://ngrok.com/download
-- 2. Ejecutar: ngrok http 3005
-- 3. Copiar la URL pública (ej: https://abc123.ngrok.io)
-- 4. Usar esa URL en PayPal: https://abc123.ngrok.io/payment-success

-- OPCIÓN 2: Usar servicio temporal gratuito
-- 1. Usar: https://webhook.site/
-- 2. Copiar la URL única generada
-- 3. Usar esa URL en PayPal temporalmente

-- OPCIÓN 3: Configurar dominio de producción
-- 1. Comprar dominio (ej: qrtourguidehistory.com)
-- 2. Configurar DNS apuntando a Vercel/Netlify
-- 3. Usar: https://qrtourguidehistory.com/payment-success

-- CONFIGURACIÓN RECOMENDADA PARA PAYPAL:
-- Auto-return URL: https://qrtourguidehistory.com/payment-success
-- Cancel URL: https://qrtourguidehistory.com/biblioteca-react
-- Notify URL: https://qrtourguidehistory.com/api/paypal/webhook

-- NOTA: PayPal NO acepta localhost en producción
-- Para desarrollo, usar ngrok o servicio temporal
