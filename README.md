# Nexcure

Nexcure is a mobile-only Expo/React Native prototype for connected healthcare workflows in Pakistan. Flutter was not available in the target environment, so the implementation uses Expo while preserving repository/service boundaries for a future backend.

## Run

```powershell
npm install
npm start
```

Use Expo Go on Android/iOS, or run `npm run android` / `npm run ios` with a local simulator. The prototype runs in mock mode and does not require a backend.

## Demo accounts

- `patient@demo.com`
- `doctor@demo.com`
- `hospital@demo.com`
- `donor@demo.com`

Demo password: `nexcure-demo`

The login screen also provides one-tap role buttons. Switch roles from Profile to demonstrate each mode.

## Architecture overview

The project now includes the layered structure described in the prompt:

- `src/data/models`: domain models and role-based records
- `src/data/mock/seedData.js`: prototype data set for patients, doctors, hospitals, donors, reports, and blood requests
- `src/data/repositories`: repository contracts and mock/API implementations (`MockRepository`, `ApiRepository`, `repositoryFactory`)
- `src/services`: AI abstraction layer for reports, OCR, and medicine matching
- `src/storage/secureStorage.js`: token/session-safe storage placeholder for future secure persistence

This keeps the UI isolated from backend concerns while allowing a replacement from mock to API data without rewriting the screens.

## Mock mode instructions

Set `APP_MODE=mock` to run the local demo without backend connectivity.

## Prototype flows

- Patient: disease search, manual/current area selection, radius filters, doctor profile, appointment booking, messages, reports with Urdu summary, explicit report sharing, prescription OCR demo, and medicine price labeling.
- Doctor: dedicated dashboard, appointments, messages, and shared-report review.
- Hospital: publish updates, create a blood request, automatically notify every active follower, view donor responses, and fulfill the request.
- Donor/patient: follow hospitals, open blood requests, offer help, and see notification state update immediately.

## Testing

Use `npm test` once automated tests are added, and `npm run check` to validate the Expo app configuration.

This is a fictional demo. Medical summaries, medicine prices, identities, phone numbers, and CNIC values are not real. AI output is organizational only and never a diagnosis or prescription.
