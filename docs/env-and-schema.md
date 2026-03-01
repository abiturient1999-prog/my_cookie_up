# Based Cookie — переменные окружения и схема БД

Источник правды для настройки Vercel (один проект, разные env) и Neon Postgres. Используется на этапах 1–2.

---

## 1. Переменные окружения

### 1.1. Сеть (фронт и бекенд)

| Переменная | Где | Описание | Пример |
|------------|-----|----------|--------|
| `NEXT_PUBLIC_BASE_NETWORK` | Vercel (все env) | Сеть приложения: `sepolia` или `mainnet` | `sepolia` |
| `BASE_NETWORK` | Vercel (server) | То же для серверного кода; при отсутствии можно выводить из `NEXT_PUBLIC_BASE_NETWORK` | `sepolia` |

- **Preview / Development** на Vercel: ставим `sepolia`.
- **Production** на Vercel: ставим `mainnet` после тестов.

### 1.2. Контракт и эксплорер

| Переменная | Где | Описание | Пример (Sepolia) | Пример (Mainnet) |
|------------|-----|----------|-------------------|-------------------|
| `NEXT_PUBLIC_COOKIEJAR_ADDRESS` | Vercel | Адрес контракта; приоритет для одной сети (legacy). | `0xEdE3...` | — |
| `NEXT_PUBLIC_COOKIEJAR_ADDRESS_SEPOLIA` | Vercel | Адрес контракта на Base Sepolia | `0xEdE3bd8e85557DA8184cfF520d617489CC7e4093` | — |
| `NEXT_PUBLIC_COOKIEJAR_ADDRESS_MAINNET` | Vercel | Адрес контракта на Base mainnet | — | `0x...` |

Резолвинг в коде: если задан `NEXT_PUBLIC_BASE_NETWORK`, брать `_SEPOLIA` или `_MAINNET`; иначе fallback на `NEXT_PUBLIC_COOKIEJAR_ADDRESS`.

### 1.3. Paymaster (CDP)

| Переменная | Где | Описание | Пример |
|------------|-----|----------|--------|
| `CDP_PAYMASTER_URL` | Vercel (server) | Upstream Paymaster для **proxy** (`app/api/paymaster/route.ts`). Один URL на окружение. | `https://api.developer.coinbase.com/rpc/v1/base-sepolia/...` |
| `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL` | Vercel | Относительный или абсолютный URL proxy. Fallback, если не заданы сетевые URL. | `/api/paymaster` |
| `NEXT_PUBLIC_PAYMASTER_SEPOLIA_URL` | Vercel | URL proxy для Sepolia (клиент). | `/api/paymaster` |
| `NEXT_PUBLIC_PAYMASTER_MAINNET_URL` | Vercel | URL proxy для mainnet (клиент). | `/api/paymaster` |
| `PAYMASTER_PROXY_DEBUG` | Vercel (server) | `1` — включить debug-заголовки в ответе proxy | `1` |

На сервере `CDP_PAYMASTER_URL` должен соответствовать выбранной сети (в Production — mainnet URL, в Preview — Sepolia URL).

### 1.4. Neon Postgres

| Переменная | Где | Описание | Пример |
|------------|-----|----------|--------|
| `DATABASE_URL` | Vercel (server) | Connection string Neon. Для serverless **обязательно** использовать endpoint с **pooler** (в хосте `-pooler`). | `postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require` |

- **Preview**: своя ветка/проект Neon или тот же проект с отдельной БД — задаём `DATABASE_URL` для Preview в Vercel Environment Variables (Preview).
- **Production**: свой `DATABASE_URL` в Vercel (Production), чтобы данные прод и тест не смешивались.

Если `DATABASE_URL` не задан (локальная разработка без БД), этап 1 может работать с in-memory хранилищем; на Vercel для этапа 2 `DATABASE_URL` обязателен.

### 1.5. Остальное

| Переменная | Где | Описание |
|------------|-----|----------|
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | Vercel | Ключ OnchainKit (уже есть). |
| `NEXT_PUBLIC_URL` | Vercel | Базовый URL приложения (metadata, paymaster fallback). |

---

## 2. Группы env в Vercel (один проект)

- **Production**:  
  `NEXT_PUBLIC_BASE_NETWORK=mainnet`, `BASE_NETWORK=mainnet`, `CDP_PAYMASTER_URL=<mainnet>`, `DATABASE_URL=<prod Neon>`, адреса контракта mainnet, `NEXT_PUBLIC_PAYMASTER_MAINNET_URL=/api/paymaster`.

- **Preview** (и при необходимости **Development**):  
  `NEXT_PUBLIC_BASE_NETWORK=sepolia`, `BASE_NETWORK=sepolia`, `CDP_PAYMASTER_URL=<base-sepolia>`, `DATABASE_URL=<preview Neon или тот же с другой веткой>`, адреса контракта Sepolia, `NEXT_PUBLIC_PAYMASTER_SEPOLIA_URL=/api/paymaster`.

В Vercel: Project → Settings → Environment Variables — для каждой переменной указать, к каким окружениям она применяется (Production / Preview / Development).

---

## 3. Схема Postgres (Neon) под эндпоинты

Ниже схема, совместимая с `docs/miniapp-endpoints.md`. На этапе 1 бекенд может работать без БД (in-memory); на этапе 2 — переключение на Neon по `DATABASE_URL`.

### 3.1. Таблица `fortune_definitions`

Справочник фортуны (можно заполнять миграцией/сидом из кода).

```sql
CREATE TABLE fortune_definitions (
  id          TEXT PRIMARY KEY,
  text        TEXT NOT NULL,
  rarity      TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'legendary')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2. Таблица `fortune_claims`

Записи о клеймах. Уникальность по `(user_fid, user_address, claimed_at)` или по `tx_hash` (если один tx = один клейм) — на выбор; для идемпотентности полезен уникальный индекс по `tx_hash` (WHERE tx_hash IS NOT NULL).

```sql
CREATE TABLE fortune_claims (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid     BIGINT NOT NULL,
  user_address TEXT NOT NULL,
  fortune_id   TEXT NOT NULL REFERENCES fortune_definitions(id),
  claimed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash      TEXT,
  network      TEXT NOT NULL DEFAULT 'sepolia' CHECK (network IN ('sepolia', 'mainnet'))
);

CREATE INDEX idx_fortune_claims_user ON fortune_claims (user_fid, user_address, claimed_at DESC);
CREATE UNIQUE INDEX idx_fortune_claims_tx ON fortune_claims (tx_hash) WHERE tx_hash IS NOT NULL;
```

### 3.3. Агрегаты / представление для статуса и лидерборда

- **Статус пользователя** (для `GET /api/fortune/status`): последний клейм по `(user_fid, user_address)`, расчёт `next_claim_available_at` (last_claimed_at + 24h), `remaining_cooldown_ms`, флаг `is_cooldown_active`. Ежедневная фортуна считается по `(fid, date)` в коде (хэш → `fortune_definitions.id`).
- **Лидерборд** (этап 2): представление или материализованная таблица по `user_fid`, `user_address` с агрегатами `total_claims`, `rare_claims`, `legendary_claims`, `best_streak_days` и т.д.

Для этапа 1 достаточно таблиц `fortune_definitions` и `fortune_claims`; при переходе на Neon в этапе 2 — создаём эти таблицы (миграция) и подключаем `DATABASE_URL` с pooler.

---

## 4. Связь с этапами

- **Этап 1**: env для сети и Paymaster используются; БД опциональна (in-memory store). Схема и этот документ — ориентир для этапа 2.
- **Этап 2**: в Vercel задаётся `DATABASE_URL` (Neon, pooler), разворачивается миграция с таблицами выше, все чтения/записи переходят на Postgres.
