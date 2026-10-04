# Architecture

## High-level structure

Nexcure is implemented as a mobile-first healthcare ecosystem prototype for the Pakistani market. The current app runs in Expo/React Native, but the architecture is intentionally split to preserve a clean, later-ready boundary between presentation and data access.

## Layered design

### Presentation
- The mobile UI shell handles screens, navigation, and role transitions.
- Widgets are not expected to hard-code provider logic or API calls.

### Application / state management
- App actions such as login, follow/unfollow, appointment booking, and blood-request publication are modeled as domain actions.
- These actions are conceptually backed by repository interfaces so the UI contract remains stable across mock and API implementations.

### Domain models
- Core healthcare entities are defined in `src/data/models/index.js` with TypeScript-style classes and constants.
- Constants: `ROLE`, `CONNECTION_STATUS`, `APPOINTMENT_STATUS`, `BLOOD_REQUEST_STATUS`, `RESPONSE_STATUS`, `NOTIFICATION_TYPE`, `HOSPITAL_FOLLOW_STATUS`
- Classes: `User`, `PatientProfile`, `DoctorProfile`, `HospitalProfile`, `DonorProfile`, `DoctorConnection`, `HospitalFollow`, `HospitalPost`, `BloodRequest`, `BloodRequestResponse`, `Appointment`, `DoctorAvailability`, `Message`, `Conversation`, `MedicalReport`, `ReportSummary`, `Prescription`, `PrescriptionMedicine`, `MedicinePrice`, `DoctorReview`, `Notification`
- `isMessagingAvailable(status)`: returns true only for `CONNECTION_STATUS.ACCEPTED`
- `createDemoDisclaimer()`: returns safety text for AI-generated content

### Data / repositories
- `src/data/repositories` contains the mock and API repository boundary.
- `MockRepository` (in `src/data/repositories/MockRepository.js`) provides the full working implementation with in-memory state and seed data.
  - Connection management: `sendConnectionRequest`, `acceptConnection`, `rejectConnection`, `getConnectionStatus`, `getPatientConnections`, `getDoctorConnections`, `canMessage`
  - Messaging: `getConversationsForUser`, `getMessagesForConversation`, `sendMessage`, `markMessagesRead`, `getUnreadMessageCount` (gated by `CONNECTION_STATUS.ACCEPTED`)
  - Hospital following: `followHospital`, `getFollowedHospitals`, `getHospitalFollowers`
  - Blood donation: `createBloodRequest` (fan-out notifications to all active followers), `fulfillBloodRequest`, `closeBloodRequest`, `expireBloodRequest`, `createBloodRequestResponse` (duplicate prevention)
  - Search: `searchDoctors` with disease-to-speciality mapping
  - Appointments: `createAppointment` (double-booking prevention), `updateAppointmentStatus`, `getDoctorAvailability`
  - Medical reports: `processMedicalReport`, `shareReportWithDoctor` (connection enforcement)
  - Prescriptions: `processPrescription`, `searchMedicines`
- `ConnectionRepository` defines the connection abstraction contract.
- `ApiRepository` is the future remote-data implementation.

### Services
- `src/services` provides the healthcare AI abstraction layer for:
  - medical report processing
  - prescription OCR extraction
  - medicine matching and price lookup

## Why this matters

The project is no longer only a single-screen mock. It now has a real architecture boundary that supports future backend replacement without changing the mobile screens.

## Business rule implementation

The core blood donation flow is preserved through repository logic:
- a hospital follower relation is checked before notification creation
- a blood request creates notifications for all active followers
- donor offers are recorded with a response object
- fulfilled requests stop future notification generation

## Security and safety boundaries

- Demo data never uses real CNIC values or patient identities.
- AI-generated summaries are clearly labeled as informational only and not a diagnosis.
- Sensitive data is separated from local app state and should remain masked in production.
