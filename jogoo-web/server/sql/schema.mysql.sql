-- JOGOO client accounts and journey tracking (MySQL 5.7+/MariaDB 10.3+).
--
-- Shaped like the future Supabase schema so moving is a straight copy:
--   users        ~ auth.users       (uuid id, email, bcrypt password hash)
--   profiles     ~ public.profiles  (1:1 with users, role client|admin)
--   journey_events ~ public.journey_events (append-only history; the latest
--                    event is the client's current stage)
-- See supabase/migrations/*_client_journey.sql for the Postgres version.

CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  email           VARCHAR(254) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sign_in_at DATETIME     NULL,
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(32)  NULL,
  location      VARCHAR(120) NULL,
  farm_size_ha  DECIMAL(8,2) NULL,
  role          ENUM('client','admin') NOT NULL DEFAULT 'client',
  lang          ENUM('en','fr') NOT NULL DEFAULT 'en',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  KEY profiles_role_idx (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stage codes, in order. Labels live in the app's translations.
CREATE TABLE IF NOT EXISTS journey_stages (
  code      VARCHAR(32) NOT NULL PRIMARY KEY,
  position  SMALLINT    NOT NULL,
  UNIQUE KEY journey_stages_position_key (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO journey_stages (code, position) VALUES
  ('signed_up', 1), ('contacted', 2), ('site_visit', 3), ('quote_sent', 4),
  ('payment_made', 5), ('installation_scheduled', 6), ('installed', 7);

CREATE TABLE IF NOT EXISTS journey_events (
  id          CHAR(36)    NOT NULL PRIMARY KEY,
  client_id   CHAR(36)    NOT NULL,
  stage       VARCHAR(32) NOT NULL,
  note        TEXT        NULL,
  created_by  CHAR(36)    NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT journey_events_client_fkey FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT journey_events_stage_fkey FOREIGN KEY (stage) REFERENCES journey_stages(code),
  CONSTRAINT journey_events_author_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL,
  KEY journey_events_client_idx (client_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sign-in sessions. Only a SHA-256 of the cookie token is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  CHAR(64)    NOT NULL PRIMARY KEY,
  user_id     CHAR(36)    NOT NULL,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME    NOT NULL,
  user_agent  VARCHAR(255) NULL,
  CONSTRAINT sessions_user_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY sessions_user_idx (user_id),
  KEY sessions_expiry_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate limiting for sign-in and sign-up.
CREATE TABLE IF NOT EXISTS auth_attempts (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kind       ENUM('login_fail','signup') NOT NULL,
  ip         VARCHAR(45)  NOT NULL,
  email      VARCHAR(254) NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY auth_attempts_ip_idx (kind, ip, created_at),
  KEY auth_attempts_email_idx (kind, email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
