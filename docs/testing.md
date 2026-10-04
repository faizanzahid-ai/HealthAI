# Testing Strategy

## Manual acceptance flows

1. Choose Donor, open Hospitals, open XYZ Hospital, follow it, switch to Hospital mode, create a B+ request, switch back to Donor, open Alerts, open the request and tap I can help. Switch to Hospital and confirm the response count, then mark the request fulfilled.
2. Choose Patient, search Brain tumor, adjust the radius, open a doctor, request an appointment, open Reports, upload the demo report and review the Urdu summary.
3. Switch among all four roles and verify that each bottom navigation set remains usable.
4. Confirm that the mock repository and API repository boundary stay equivalent for the same state transitions.

## Automated coverage

- Repository state transitions for follow/unfollow and duplicate response prevention.
- Notification fan-out for multiple followers and no fan-out after fulfillment.
- Appointment creation and unavailable-slot handling.
- Report safety copy and explicit sharing.
- Component tests for login, search, hospital page, blood request, and notification center.
- Service-level tests for medical report processing, OCR extraction, and medicine matching response formatting.

### Test suites (all passing)

**Unit tests** (`test/unit/`):

| Suite | Focus | Tests |
| --- | --- | --- |
| `connectionRepository.test.js` | Connection states (NOT_CONNECTED/PENDING/ACCEPTED/REJECTED), `canMessage` gating, send/accept/reject flow, notifications | 13 |
| `bloodDonationRepository.test.js` | Notification fan-out to all active followers, lifecycle (FULFILLED/CLOSED/EXPIRED), duplicate response prevention | 9 |
| `searchRepository.test.js` | Disease-to-speciality mapping (Cancer→Oncologist, Brain tumor→Neurologist+Oncologist, Heart→Cardiologist, Orthopedics→Orthopedic Surgeon), radius filtering, pagination | 11 |
| `appointmentRepository.test.js` | Appointment creation, double-booking prevention, status updates, follow-up notifications, availability | 8 |
| `messagingAndReports.test.js` | Conversation retrieval, messaging, read marks, report processing, share with doctor connection enforcement | 9 |
| `hospitalFollowRepository.test.js` | Follow/unfollow toggle, duplicate prevention, followed hospitals, notification read state, navigation links | 10 |
| `medicalReportService.test.js` | Report processing, Urdu summary generation, questions, real service stub | 5 |
| `prescriptionAndMedicine.test.js` | OCR extraction, confidence thresholds, medicine matching, search | 9 |
| `models.test.js` | Model classes, constants, `isMessagingAvailable` helper | 22 |

**Integration tests** (`test/integration/`):

| Suite | Focus | Tests |
| --- | --- | --- |
| `connectionModel.test.js` | UI enforcement of connection states, messaging gating, blood request notifications, disease-to-speciality search mapping | 7 |

## Validation status

All 127 automated tests pass across 11 test suites. Run with `npx jest --verbose`.
