-- =============================================
-- Script de inicialización de base de datos
-- TechHelpDesk - Sistema de Soporte Técnico
-- =============================================

-- =============================================
-- Tabla: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Tabla: clients
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Tabla: technicians
-- =============================================
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Tabla: categories
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Tabla: tickets
-- =============================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Índices y constraints adicionales
-- =============================================
-- email único en usuarios
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- email único en technicians
CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_email ON technicians(email);

-- user_id único en clients
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- user_id único en technicians
CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_user_id ON technicians(user_id);

-- =============================================
-- Datos iniciales (Seeders)
-- =============================================

-- Usuarios
INSERT INTO users (id, name, email, password, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@example.com', '$2b$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'John Client', 'john.client@example.com', '$2b$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'client'),
  ('33333333-3333-3333-3333-333333333333', 'Jane Technician', 'jane.tech@example.com', '$2b$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'technician')
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO clients (id, name, company, contact_email, user_id)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'John Client', 'Acme Corp', 'contact@acme.com', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Técnicos
INSERT INTO technicians (id, name, email, user_id)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'Jane Technician', 'jane.tech@example.com', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Categorías
INSERT INTO categories (id, name, description)
VALUES
  ('66666666-6666-6666-6666-666666666666', 'Hardware', 'Issues related to physical devices'),
  ('77777777-7777-7777-7777-777777777777', 'Software', 'Issues related to applications or software'),
  ('88888888-8888-8888-8888-888888888888', 'Network', 'Network and connectivity issues')
ON CONFLICT (id) DO NOTHING;

-- Tickets
INSERT INTO tickets (id, title, description, status, priority, client_id, technician_id, category_id)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'Computer won''t start', 'My desktop does not power on.', 'OPEN', 'HIGH', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Software installation issue', 'Cannot install the new software update.', 'IN_PROGRESS', 'MEDIUM', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777')
ON CONFLICT (id) DO NOTHING;
