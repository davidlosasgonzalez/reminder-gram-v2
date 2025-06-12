# 📅 ReminderGram

ReminderGram is a professional-grade Telegram bot that integrates with Google Calendar to help users **list and manage their events via natural language**. Built with a clean and modular architecture using **NestJS**, it leverages **OpenAI** for LLM-based intent parsing and includes a robust daily reminder system.

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **Natural Language Intent Detection**

    - Detects intent to list events using OpenAI Chat models.
    - Handles ambiguous user input via structured clarification prompts.

- **Clarification Context**

    - Stores pending clarifications per user in-memory.
    - Enforces one-step clarification before discarding context.

- **Multi-Account Google Calendar Integration**

    - Lists upcoming events across multiple linked calendars.
    - Filters events based on configurable titles.

- **Telegram Bot Interface**

    - Powered by [Telegraf](https://telegraf.js.org/).
    - Seamlessly integrates with the clarification and listing flows.

- **Daily Cron Notifications**
    - Sends scheduled summaries of today's events using `node-cron`.

## 🧱 Architecture

- **Framework**: [NestJS](https://nestjs.com/) with Clean Architecture principles.
- **Domains**:
    - **LLM**: Prompt-driven intent parsing (classify + clarify).
    - **Telegram**: Message routing, DTO validation, and per-user memory.
    - **Calendar**: Event listing via Google Calendar API + OAuth2.
    - **Scheduling**: Cron-based triggers via environment config.
- **Testing**:
    - Unit tests with mock dependencies.
    - Integration tests simulating real flows and Telegram messages.

## 🧪 Testing

Run unit and integration tests:

```bash
pnpm run test:unit
pnpm run test:integration
```

Test coverage reports and snapshot diffs are available for LLM and calendar responses.

## ⚙️ Environment Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# OpenAI Configuration
OPENAI_API_KEY=
LLM_MODEL=

# Google Calendar Integration
GOOGLE_OAUTH_USER_EMAIL=
GOOGLE_CALENDAR_ID=
CREDENTIALS_PATH=private/credentials.json

# App Settings
NODE_ENV=
CRON_TIME=08:00

# Event Filtering
IGNORED_EVENT_TITLES=festivo,holiday
```

## 📁 Project Structure (Partial)

```
apps/
  telegram-bot/            → Application entry point

libs/
  telegram/                → Message processing, DTOs, context handling
  llm/                     → Prompt logic, OpenAI provider
  calendar/                → Event queries and provider ports
  shared/                  → Logger, config, pipes

scripts/
  generate-token.ts        → CLI utility to bootstrap Google OAuth

test/
  unit/                    → Unit tests
  integration/             → Integration tests
```

## 🚀 Usage

```bash
pnpm install
pnpm run start:dev
```

Set your environment variables in `.env`. For production, use `pnpm run start:prod`.

## 🔐 License

This project is licensed under the MIT License – see [LICENSE.md](./LICENSE.md) for details.

## 🧠 Powered by

- [NestJS](https://nestjs.com/)
- [OpenAI](https://platform.openai.com/)
- [Telegraf](https://telegraf.js.org/)
- [Google Calendar API](https://developers.google.com/calendar)
- [TypeScript](https://www.typescriptlang.org/)
