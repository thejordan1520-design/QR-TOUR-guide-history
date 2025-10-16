-- Crear tabla subscription_plans si no existe
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    duration_days INTEGER NOT NULL DEFAULT 1,
    duration_hours INTEGER NOT NULL DEFAULT 24,
    features JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    color TEXT DEFAULT 'blue',
    paypal_link TEXT,
    plan_key TEXT,
    price_usd DECIMAL(10,2) DEFAULT 0,
    discount_percentage TEXT DEFAULT '0',
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_created_at ON subscription_plans(created_at);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes por defecto si no existen
INSERT INTO subscription_plans (name, description, price, currency, duration_days, duration_hours, features, benefits, is_active, is_popular, color, plan_key)
VALUES 
    (
        'Acceso Básico',
        'Acceso completo por 24 horas a todos los tours de audio',
        5,
        'USD',
        1,
        24,
        '["Acceso a todos los tours", "Audio de alta calidad", "Mapas interactivos", "Soporte 24/7"]'::jsonb,
        '["Tours ilimitados", "Sin anuncios", "Contenido premium"]'::jsonb,
        true,
        false,
        'blue',
        'basic-24h'
    ),
    (
        'Acceso Premium',
        'Acceso completo por 7 días con funciones avanzadas',
        15,
        'USD',
        7,
        168,
        '["Acceso a todos los tours", "Audio de alta calidad", "Mapas interactivos", "Soporte 24/7", "Contenido exclusivo", "Descargas offline"]'::jsonb,
        '["Tours ilimitados", "Sin anuncios", "Contenido premium", "Funciones avanzadas"]'::jsonb,
        true,
        true,
        'purple',
        'premium-7d'
    )
ON CONFLICT (plan_key) DO NOTHING;

