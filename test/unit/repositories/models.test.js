/**
 * @file Unit tests for domain models, constants, and the isMessagingAvailable helper.
 */

import {
  ROLE,
  APPOINTMENT_STATUS,
  BLOOD_REQUEST_STATUS,
  RESPONSE_STATUS,
  NOTIFICATION_TYPE,
  CONNECTION_STATUS,
  HOSPITAL_FOLLOW_STATUS,
  User,
  PatientProfile,
  DoctorProfile,
  HospitalProfile,
  DonorProfile,
  DoctorConnection,
  HospitalFollow,
  HospitalPost,
  BloodRequest,
  BloodRequestResponse,
  Appointment,
  DoctorAvailability,
  Message,
  Conversation,
  MedicalReport,
  ReportSummary,
  Prescription,
  PrescriptionMedicine,
  MedicinePrice,
  DoctorReview,
  Notification,
  isMessagingAvailable,
  createDemoDisclaimer,
} from '../../../src/data/models';

describe('Constants', () => {
  test('ROLE has all four required roles', () => {
    expect(ROLE.PATIENT).toBe('PATIENT');
    expect(ROLE.DOCTOR).toBe('DOCTOR');
    expect(ROLE.HOSPITAL).toBe('HOSPITAL');
    expect(ROLE.DONOR).toBe('DONOR');
  });

  test('APPOINTMENT_STATUS has all required statuses', () => {
    expect(APPOINTMENT_STATUS.PENDING).toBe('Pending');
    expect(APPOINTMENT_STATUS.CONFIRMED).toBe('Confirmed');
    expect(APPOINTMENT_STATUS.CANCELLED).toBe('Cancelled');
    expect(APPOINTMENT_STATUS.COMPLETED).toBe('Completed');
  });

  test('BLOOD_REQUEST_STATUS includes EXPIRED', () => {
    expect(BLOOD_REQUEST_STATUS.ACTIVE).toBe('ACTIVE');
    expect(BLOOD_REQUEST_STATUS.CLOSED).toBe('CLOSED');
    expect(BLOOD_REQUEST_STATUS.FULFILLED).toBe('FULFILLED');
    expect(BLOOD_REQUEST_STATUS.EXPIRED).toBe('EXPIRED');
  });

  test('CONNECTION_STATUS has all required states', () => {
    expect(CONNECTION_STATUS.NOT_CONNECTED).toBe('NOT_CONNECTED');
    expect(CONNECTION_STATUS.PENDING).toBe('PENDING');
    expect(CONNECTION_STATUS.ACCEPTED).toBe('ACCEPTED');
    expect(CONNECTION_STATUS.REJECTED).toBe('REJECTED');
  });

  test('NOTIFICATION_TYPE has all required types', () => {
    expect(NOTIFICATION_TYPE.BLOOD_REQUEST).toBe('BLOOD_REQUEST');
    expect(NOTIFICATION_TYPE.HOSPITAL_POST).toBe('HOSPITAL_POST');
    expect(NOTIFICATION_TYPE.APPOINTMENT).toBe('APPOINTMENT');
    expect(NOTIFICATION_TYPE.MESSAGE).toBe('MESSAGE');
    expect(NOTIFICATION_TYPE.REPORT).toBe('REPORT');
    expect(NOTIFICATION_TYPE.FOLLOW_UP).toBe('FOLLOW_UP');
    expect(NOTIFICATION_TYPE.SYSTEM).toBe('SYSTEM');
  });

  test('RESPONSE_STATUS has all statuses', () => {
    expect(RESPONSE_STATUS.OFFERED).toBe('OFFERED');
    expect(RESPONSE_STATUS.CONTACTED).toBe('CONTACTED');
    expect(RESPONSE_STATUS.ACCEPTED).toBe('ACCEPTED');
    expect(RESPONSE_STATUS.COMPLETED).toBe('COMPLETED');
    expect(RESPONSE_STATUS.CANCELLED).toBe('CANCELLED');
  });
});

describe('isMessagingAvailable', () => {
  test('returns true for ACCEPTED', () => {
    expect(isMessagingAvailable(CONNECTION_STATUS.ACCEPTED)).toBe(true);
  });

  test('returns false for PENDING', () => {
    expect(isMessagingAvailable(CONNECTION_STATUS.PENDING)).toBe(false);
  });

  test('returns false for REJECTED', () => {
    expect(isMessagingAvailable(CONNECTION_STATUS.REJECTED)).toBe(false);
  });

  test('returns false for NOT_CONNECTED', () => {
    expect(isMessagingAvailable(CONNECTION_STATUS.NOT_CONNECTED)).toBe(false);
  });
});

describe('Model classes', () => {
  test('User sets defaults', () => {
    const user = new User({ id: 'test', name: 'Test User' });
    expect(user.id).toBe('test');
    expect(user.name).toBe('Test User');
    expect(user.isActive).toBe(true);
    expect(user.profileImage).toBeNull();
  });

  test('PatientProfile extends User with bloodGroup and age', () => {
    const patient = new PatientProfile({
      id: 'p1',
      name: 'Patient One',
      role: ROLE.PATIENT,
      bloodGroup: 'A+',
      age: 30,
    });
    expect(patient.bloodGroup).toBe('A+');
    expect(patient.age).toBe(30);
    expect(patient.role).toBe(ROLE.PATIENT);
  });

  test('DoctorProfile has specialization and rating', () => {
    const doctor = new DoctorProfile({
      id: 'd1',
      name: 'Dr. Test',
      role: ROLE.DOCTOR,
      specialization: 'Oncologist',
      rating: 4.9,
    });
    expect(doctor.specialization).toBe('Oncologist');
    expect(doctor.rating).toBe(4.9);
    expect(doctor.isVerified).toBe(true);
  });

  test('DoctorConnection defaults to PENDING status', () => {
    const conn = new DoctorConnection({
      id: 'conn-1',
      patientId: 'p1',
      doctorId: 'd1',
    });
    expect(conn.status).toBe(CONNECTION_STATUS.PENDING);
    expect(conn.acceptedAt).toBeNull();
    expect(conn.rejectedAt).toBeNull();
  });

  test('DoctorConnection can be ACCEPTED', () => {
    const conn = new DoctorConnection({
      id: 'conn-1',
      patientId: 'p1',
      doctorId: 'd1',
      status: CONNECTION_STATUS.ACCEPTED,
      acceptedAt: new Date().toISOString(),
    });
    expect(conn.status).toBe(CONNECTION_STATUS.ACCEPTED);
    expect(conn.acceptedAt).toBeTruthy();
  });

  test('HospitalProfile has services and doctor list', () => {
    const hospital = new HospitalProfile({
      id: 'h1',
      name: 'Test Hospital',
      services: ['Oncology', 'Emergency'],
      doctors: ['d1', 'd2'],
    });
    expect(hospital.services).toContain('Oncology');
    expect(hospital.doctors).toContain('d1');
  });

  test('DonorProfile masks CNIC', () => {
    const donor = new DonorProfile({
      id: 'donor-1',
      name: 'Donor One',
      role: ROLE.DONOR,
      bloodGroup: 'B+',
      cnicMasked: '****-*******-XXXXX',
    });
    expect(donor.bloodGroup).toBe('B+');
    expect(donor.cnicMasked).toMatch(/\*+/);
  });

  test('BloodRequest extends HospitalPost', () => {
    const request = new BloodRequest({
      id: 'br-1',
      hospitalId: 'h1',
      bloodGroup: 'O+',
      unitsRequired: 2,
      urgency: 'URGENT',
    });
    expect(request.postType).toBe('BLOOD_NEEDED');
    expect(request.status).toBe(BLOOD_REQUEST_STATUS.ACTIVE);
    expect(request.responseCount).toBe(0);
  });

  test('BloodRequestResponse defaults to OFFERED', () => {
    const response = new BloodRequestResponse({
      id: 'resp-1',
      bloodRequestId: 'br-1',
      donorId: 'donor-1',
    });
    expect(response.status).toBe(RESPONSE_STATUS.OFFERED);
  });

  test('Appointment defaults to Pending', () => {
    const appt = new Appointment({
      id: 'appt-1',
      patientId: 'p1',
      doctorId: 'd1',
      date: '2026-10-01',
      time: '10:00 AM',
    });
    expect(appt.status).toBe(APPOINTMENT_STATUS.PENDING);
  });

  test('Message defaults to unread', () => {
    const msg = new Message({
      id: 'msg-1',
      senderId: 'p1',
      receiverId: 'd1',
      conversationId: 'conv-1',
      body: 'Hello',
    });
    expect(msg.read).toBe(false);
    expect(msg.attachments).toEqual([]);
  });

  test('MedicalReport tracks sharing status', () => {
    const report = new MedicalReport({
      id: 'r1',
      userId: 'p1',
      fileName: 'test.pdf',
      fileType: 'PDF',
    });
    expect(report.isProcessed).toBe(false);
    expect(report.sharedWithDoctorId).toBeNull();
  });

  test('ReportSummary has Urdu fields', () => {
    const summary = new ReportSummary({
      reportId: 'r1',
      summaryUrdu: 'خلاصہ',
      importantFindings: [],
      abnormalValues: [],
      plainLanguage: 'Summary',
      questions: [],
    });
    expect(summary.summaryUrdu).toBe('خلاصہ');
    expect(summary.disclaimer).toContain('not a diagnosis');
  });

  test('PrescriptionMedicine has confidence', () => {
    const med = new PrescriptionMedicine({
      id: 'med-1',
      medicineName: 'TestMed',
      strength: '100 mg',
      dose: '1 tablet',
      frequency: 'Daily',
      duration: '7 days',
      confidence: '85%',
    });
    expect(med.confidence).toBe('85%');
    expect(med.source).toBe('Demo catalogue');
  });

  test('createDemoDisclaimer returns safety text', () => {
    const disclaimer = createDemoDisclaimer();
    expect(disclaimer).toContain('informational');
    expect(disclaimer).toContain('not a diagnosis');
  });
});




