# Implementation Plan

## Prototype completion

- [x] Expo mobile shell and role login
- [x] Role-specific home and bottom navigation
- [x] Search, radius chips, doctor cards and profile
- [x] Appointment request state and notification
- [x] Messages list and explicit sharing language
- [x] Report processing demo and Urdu summary
- [x] Hospital profile, posts and follow state
- [x] Blood request publication and follower notifications
- [x] Donor offer response and hospital fulfillment action
- [x] Notification center, profile switching, and safety copy
- [x] Repository, model, and service layer scaffolding for future backends
- [x] Mock-to-API transition boundary via `repositoryFactory`

## Production next steps

1. Move the current UI actions to dedicated feature state managers with repository injection.
2. Replace ad hoc mock state with secure storage + local cache behavior for session values.
3. Add API client adapters for auth, reports, messages, blood requests, and notifications.
4. Expand test coverage for repository logic, validation, and donor notification workflows.
5. Add production-grade medical safety review, audit logging, and permission handling before releasing beyond prototype mode.
