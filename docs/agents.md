# Agent Boundaries

- Product: maintain Pakistani healthcare context, fictional data and conservative medical language.
- Presentation: mobile-only layouts, accessible touch targets, loading/empty/error states.
- Domain: enforce follow, appointment, sharing and blood lifecycle rules.
- Data: use repository interfaces and mock/API substitutions.
- Safety: never diagnose, prescribe, expose CNIC or log medical content.
- QA: verify complete cross-role acceptance flows before marking tracker items done.

## Testing commands

- Run all tests: `npx jest --verbose`
- Run unit tests only: `npx jest test/unit/ --verbose`
- Run integration tests only: `npx jest test/integration/ --verbose`

The current prototype combines these responsibilities in one runnable file to keep the initial deliverable easy to demonstrate. The first production refactor is feature-based separation.
