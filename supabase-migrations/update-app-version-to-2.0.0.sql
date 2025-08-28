-- Migration: Update app version to 2.0.0 in config_app table
-- This migration updates the app version displayed in the profile screen

-- Ensure config_app table exists (create if not exists)
CREATE TABLE IF NOT EXISTS config_app (
    id SERIAL PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update the version record
INSERT INTO config_app (chave, valor)
VALUES ('versao', '2.0.0')
ON CONFLICT (chave)
DO UPDATE SET
    valor = EXCLUDED.valor,
    atualizado_em = NOW();

-- Add comment for documentation
COMMENT ON TABLE config_app IS 'Application configuration table for storing app-wide settings';
COMMENT ON COLUMN config_app.chave IS 'Configuration key (e.g., versao, maintenance_mode)';
COMMENT ON COLUMN config_app.valor IS 'Configuration value as text';
