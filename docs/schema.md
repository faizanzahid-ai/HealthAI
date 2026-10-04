# Schema

Core entities are represented by plain objects in the current mock store, with TypeScript-style model classes in `src/data/models/index.js` for the mock repository implementation.

## Entities

### User / Profile variants
- `User`: id, name, role, area, bloodGroup, isActive, profileImage
- `PatientProfile` (extends User): adds diseaseDetails, age
- `DoctorProfile` (extends User): specialization, rating, isVerified, hospital, distance
- `HospitalProfile` (extends User): services, doctors[], followers count, userId
- `DonorProfile` (extends User): cnicMasked (masked), bloodGroup

### Connection model (LinkedIn-style)
- `DoctorConnection`: id, patientId, doctorId, status, createdAt, acceptedAt, rejectedAt
  - `CONNECTION_STATUS`: `NOT_CONNECTED`, `PENDING`, `ACCEPTED`, `REJECTED`
  - Messaging is only available when status is `ACCEPTED` (enforced by `isMessagingAvailable()`)

### Hospital relationship model
- `HospitalFollow`: id, hospitalId, userId, isActive, createdAt, updatedAt
- `HOSPITAL_FOLLOW_STATUS`: `ACTIVE`, `INACTIVE`

### Content
- `HospitalPost`: id, hospitalId, postType, title, body, time
- `BloodRequest` (extends HospitalPost): bloodGroup, unitsRequired, urgency, status, location, responseCount
  - `BLOOD_REQUEST_STATUS`: `ACTIVE`, `CLOSED`, `FULFILLED`, `EXPIRED`
  - Active followers receive individual notifications on `ACTIVE` request creation
- `BloodRequestResponse`: id, bloodRequestId, donorId, message, status, createdAt
  - `RESPONSE_STATUS`: `OFFERED`, `CONTACTED`, `ACCEPTED`, `COMPLETED`, `CANCELLED`

### Communication
- `Message`: id, senderId, receiverId, conversationId, body, read, time, attachments
- `Conversation`: id, participantIds, unreadCounts
- `Notification`: id, userId, type, title, body, isRead, createdAt, links (bloodRequestId, appointmentId, etc.)
  - `NOTIFICATION_TYPE`: `BLOOD_REQUEST`, `HOSPITAL_POST`, `APPOINTMENT`, `MESSAGE`, `REPORT`, `FOLLOW_UP`, `SYSTEM`

### Medical records
- `Appointment`: id, patientId, doctorId, date, time, status, notes
  - `APPOINTMENT_STATUS`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
- `MedicalReport`: id, userId, fileName, fileType, isProcessed, aiSummaryUrdu, importantFindings, sharedWithDoctorId
- `ReportSummary`: reportId, summaryUrdu, importantFindings[], abnormalValues[], plainLanguage, questions[]
- `Prescription`: id, userId, medicines[], extractedAt
- `PrescriptionMedicine`: medicineName, strength, dose, frequency, duration, confidence, source, price
- `MedicinePrice`: name, price, unit, source, confidence

### Reviews
- `DoctorReview`: id, doctorId, patientId, rating, text, date

## Disease-to-speciality mapping (search)
- Cancer → Oncologist
- Brain tumor → Neurologist + Oncologist
- Heart / Cardiac → Cardiologist
- Orthopedics → Orthopedic Surgeon
- Diabetes → Endocrinologist
- Skin rash / Eczema / Psoriasis → Dermatologist
- Eye / Vision → Ophthalmologist
- Kidney → Nephrologist
- Liver / Stomach / Digestive → Gastroenterologist
- Child / Children → Pediatrician
- Mental / Depression / Anxiety → Psychiatrist

## Production notes
- Add timestamps, ownership identifiers and server-generated IDs
- Keep sensitive medical files outside unsecured cache
- CNIC values must always be masked (`cnicMasked`)
- Medical AI summaries must include safety disclaimers (not a diagnosis)
