# 🛠️ Guía Paso a Paso (con `pnpm`) – Proyecto ReminderGram

> ⚙️ Basado en Clean Architecture + DDD + CQRS + Scheduler + Telegram + OpenAI + Google Calendar

## 1️⃣ Inicializa el proyecto NestJS con `pnpm`

```bash
pnpm create nest-app reminder-gram
cd reminder-gram
```

Selecciona **TypeScript** y luego:

```bash
pnpm install
```

## 2️⃣ Instala dependencias base del proyecto

```bash
pnpm add @nestjs/common@^11.0.1 @nestjs/core@^11.0.1 @nestjs/platform-express@^11.0.1
pnpm add @nestjs/config@^4.0.2
pnpm add @nestjs/cqrs@^11.0.3
pnpm add class-transformer@^0.5.1 class-validator@^0.14.2
pnpm add reflect-metadata@^0.2.2 rxjs@^7.8.1
pnpm add openai@^4.100.0 googleapis@^148.0.0 google-auth-library@^9.15.1
pnpm add telegraf@^4.16.3 @telegraf/session@^2.0.0-beta.7
pnpm add node-cron@^4.0.6 zod@^3.24.4
```

## 3️⃣ Configura entorno y validación

```bash
mkdir -p src/config/env
touch .env .env.example
```

**Archivos:**

-   `src/config/env/env.config.ts` → lectura `.env`
-   `src/config/env/env.validation.ts` → validación con `zod` (o Joi si prefieres)

Ejemplo `.env.example`:

```env
TELEGRAM_BOT_TOKEN=
GOOGLE_OAUTH_USER_EMAIL=
GOOGLE_CALENDAR_ID=primary
CRON_TIME=08:00
OPENAI_API_KEY=
```

## 4️⃣ Estructura de carpetas recomendada

```bash
mkdir -p \
  src/{calendar,telegram,scheduler,shared,config,domain,infrastructure,application,presentation} \
  src/calendar/{domain,application,infrastructure} \
  src/telegram/{domain,application,infrastructure,presentation} \
  src/scheduler/{application,infrastructure} \
  src/shared/{application,domain,infrastructure,presentation} \
  private/tokens \
  scripts \
  test
```

## 5️⃣ Google Calendar OAuth Setup

```bash
pnpm add googleapis google-auth-library
```

Crea:

-   `src/calendar/infrastructure/google-calendar.config.ts`
-   `scripts/generate-token.ts`
-   `private/credentials.json` → ⚠️ **Ignóralo en Git**

## 6️⃣ Calendario – Capa de Dominio

Ubicación: `src/calendar/domain/`

Archivos:

-   `event.entity.ts`
-   `event.repository.interface.ts`
-   `calendar.service.interface.ts`
-   `date.vo.ts`
-   Excepciones:

    -   `event-not-found.exception.ts`
    -   `invalid-calendar.exception.ts`
    -   `unauthorized-calendar-access.exception.ts`, etc.

## 7️⃣ Calendario – Aplicación

Ubicación: `src/calendar/application/`

Archivos:

-   `create-event.use-case.ts`
-   `find-event.use-case.ts`
-   `create-event.dto.ts`
-   `event-response.dto.ts`
-   `event.adapter.ts`
-   `event.port.ts`

## 8️⃣ Calendario – Infraestructura

Ubicación: `src/calendar/infrastructure/`

Archivos:

-   `calendar.module.ts`
-   `google-calendar.service.ts`
-   `event.repository.ts`

Subcarpetas:

-   `adapters/` → `calendar.adapter.ts`, `google-auth.helper.ts`
-   `mappers/` → `google-calendar.mapper.ts`
-   `services/` → `event-creator.service.ts`, `event-query.service.ts`, etc.

## 9️⃣ Telegram – Dominio

Ubicación: `src/telegram/domain/`

Archivos:

-   `session.entity.ts`
-   `telegram.service.interface.ts`

## 🔟 Telegram – CQRS y Aplicación

Ubicación: `src/telegram/application/`

Archivos base:

-   `telegram-intent.router.ts`
-   `telegram-replies.utils.ts`
-   `telegram-session.utils.ts`

**Commands:**

```bash
src/telegram/application/commands/
├── create-event/
│   ├── create-event.command.ts
│   ├── create-event.handler.ts
└── delete-event/
    ├── delete-event.command.ts
    ├── delete-event.handler.ts
```

**Queries:**

```bash
src/telegram/application/queries/list-events/
├── list-events.query.ts
└── list-events.handler.ts
```

## 1️⃣1️⃣ Telegram – Infraestructura y Presentación

Infraestructura:

-   `src/telegram/infrastructure/telegram/telegram.adapter.ts`
-   `telegram-message.mapper.ts`
-   `base-telegram.service.ts`

Presentación:

-   `src/telegram/presentation/telegram.module.ts`
-   `message-processor.service.ts`

## 1️⃣2️⃣ Integración LLM – OpenAI

```bash
pnpm add openai
```

Ubicación: `src/shared/infrastructure/llm/`

-   `llm.module.ts`
-   `prompts/*.prompt.ts`
-   `services/*.service.ts`
-   `utils/*.util.ts`

Define interfaces en `telegram/application/llm/`:

-   `clarify-any.port.ts`
-   `evaluate-message.port.ts`
-   `resolve-intent.port.ts`

## 1️⃣3️⃣ Scheduler con `node-cron`

```bash
pnpm add node-cron
```

Ubicación: `src/scheduler/infrastructure/`

-   `scheduler.module.ts`
-   `scheduler.service.ts`

Implementa `@Cron(CRON_TIME)` y llama al flujo de eventos de Telegram.

## 1️⃣4️⃣ Testing con Jest

```bash
pnpm add -D jest @types/jest ts-jest
```

Archivos y estructura:

-   `test/*.spec.ts` (unitarios)
-   `test/e2e/*.e2e-spec.ts` (si aplica)

Utiliza mocks o `Test.createTestingModule()`.

## 1️⃣5️⃣ ESLint + Prettier + Hooks

```bash
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier
pnpm add -D husky lint-staged commitlint
```

Inicia Husky:

```bash
pnpm dlx husky-init && pnpm install
pnpm husky add .husky/pre-commit "pnpm lint && pnpm test"
```

Configura `.eslintrc`, `.prettierrc`, `commitlint.config.js`.

## 1️⃣6️⃣ CI/CD con GitHub Actions

Ruta: `.github/workflows/ci.yml`

```yaml
name: CI

on: [push, pull_request]

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - run: pnpm install
            - run: pnpm lint
            - run: pnpm test
```

## 🧾 Estructura Final Esperada

```
src/
├── calendar/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
├── telegram/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── scheduler/
├── shared/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   └── presentation/
├── config/
├── main.ts
├── app.module.ts
```

```
/private/           ← credenciales y tokens
/scripts/           ← generación de tokens OAuth
/test/              ← unitarios y E2E
/docs/              ← (si defines Notion o draw.io exportado)
/.github/           ← Workflows CI
```
