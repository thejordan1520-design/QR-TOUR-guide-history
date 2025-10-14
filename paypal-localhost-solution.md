-- SOLUCIÓN TEMPORAL PARA PAYPAL EN LOCALHOST
-- PayPal NO acepta localhost, pero podemos usar estas alternativas:

-- OPCIÓN 1: ngrok (RECOMENDADO PARA DESARROLLO)
-- 1. Instalar ngrok: https://ngrok.com/download
-- 2. Ejecutar: ngrok http 3005
-- 3. Copiar la URL pública (ej: https://abc123.ngrok.io)
-- 4. En PayPal usar: https://abc123.ngrok.io/payment-success
-- 5. Ventaja: Funciona inmediatamente, URL pública válida

-- OPCIÓN 2: Usar servicio temporal gratuito
-- 1. Ir a: https://webhook.site/
-- 2. Copiar la URL única generada
-- 3. En PayPal usar esa URL temporalmente
-- 4. Ventaja: No requiere instalación

-- OPCIÓN 3: Configurar dominio temporal
-- 1. Usar servicio como: https://localtunnel.github.io/www/
-- 2. Ejecutar: npx localtunnel --port 3005
-- 3. Usar la URL generada en PayPal

-- OPCIÓN 4: Deshabilitar PayPal temporalmente
-- 1. Usar solo el componente de prueba de pago
-- 2. Simular pagos sin PayPal
-- 3. Configurar PayPal cuando esté en producción

-- CONFIGURACIÓN RECOMENDADA PARA DESARROLLO:
-- 1. Usar ngrok para crear URL pública
-- 2. Configurar PayPal con URL de ngrok
-- 3. Probar flujo completo
-- 4. Cuando esté en producción, cambiar a dominio real

-- NOTA: El problema NO es el código, es que PayPal requiere URL pública válida
-- El componente de prueba permite verificar que todo funciona sin PayPal
