# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-12

### Added

- Implemented LLM-based clarification flow to resolve ambiguous calendar-related user messages.
- Introduced `ClarificationContextService` to manage per-user clarification state in memory.
- Created `EVALUATE_CLARIFICATION_PROMPT` to evaluate follow-up clarifications after vague requests.
- Separated message evaluation logic into `classify()` and `clarify()` methods in `EvaluateMessageIntentService`.
- Added automated daily cron job infrastructure to summarize upcoming events.
- Added test coverage:
    - Integration tests for classification and clarification.
    - Unit tests for listing events and error scenarios.
- Configured CI workflow with lint, test, and build stages.
- Created `.github/workflows/ci.yml` and CodeQL analysis workflow.
- Added `LICENSE.md`, `README.md`, and documentation setup.

### Changed

- `MessageProcessorService` refactored to conditionally classify or clarify messages based on context.
- Logger output standardized across all modules, distinguishing development and production environments.
- Removed `clarificationCount` and `clarified` flags to enforce a stateless clarification design.
- `TelegramMessageDto` simplified to retain only required fields (`text`, `message_id`, `from.id`).
- Logging in `GoogleCalendarProvider` was updated to avoid redundant entries and aggregate event counts.

### Removed

- Legacy validation logic tied to unused clarification fields.
- Redundant logs in event retrieval flow.
