/**
 * @file Unit tests for appointment booking, double-booking prevention,
 * and follow-up reminder creation.
 */

import MockRepository from '../../../src/data/repositories/MockRepository';
import { APPOINTMENT_STATUS } from '../../../src/data/models';

describe('AppointmentRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('getAppointmentsByUser', () => {
    test('returns appointments for a patient', () => {
      const appointments = repo.getAppointmentsByUser('user-patient-1');
      expect(appointments.length).toBeGreaterThan(0);
      expect(
        appointments.every(
          (a) => a.patientId === 'user-patient-1' || a.doctorId === 'user-patient-1',
        ),
      ).toBe(true);
    });

    test('returns appointments for a doctor', () => {
      const appointments = repo.getDoctorAppointments('doctor-1');
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments.every((a) => a.doctorId === 'doctor-1')).toBe(true);
    });
  });

  describe('createAppointment (double-booking prevention)', () => {
    test('creates an appointment with PENDING status', () => {
      const appointment = repo.createAppointment({
        patientId: 'user-patient-5',
        doctorId: 'doctor-1',
        hospitalId: 'hospital-xyz',
        date: '2026-10-20',
        time: '10:00 AM',
      });
      expect(appointment.status).toBe(APPOINTMENT_STATUS.PENDING);
      expect(appointment.id).toBeTruthy();
    });

    test('prevents double booking the same slot', () => {
      repo.createAppointment({
        patientId: 'user-patient-5',
        doctorId: 'doctor-2',
        hospitalId: 'hospital-shifa',
        date: '2026-10-20',
        time: '10:00 AM',
      });

      expect(() =>
        repo.createAppointment({
          patientId: 'user-patient-3',
          doctorId: 'doctor-2',
          hospitalId: 'hospital-shifa',
          date: '2026-10-20',
          time: '10:00 AM',
        }),
      ).toThrow('This appointment slot is no longer available.');
    });

    test('allows booking a different slot', () => {
      repo.createAppointment({
        patientId: 'user-patient-5',
        doctorId: 'doctor-2',
        hospitalId: 'hospital-shifa',
        date: '2026-10-20',
        time: '10:00 AM',
      });

      const second = repo.createAppointment({
        patientId: 'user-patient-3',
        doctorId: 'doctor-2',
        hospitalId: 'hospital-shifa',
        date: '2026-10-20',
        time: '10:30 AM',
      });
      expect(second.id).toBeTruthy();
    });

    test('creates a notification for the patient', () => {
      repo.state.notifications = [];
      repo.createAppointment({
        patientId: 'user-patient-5',
        doctorId: 'doctor-1',
        hospitalId: 'hospital-xyz',
        date: '2026-10-21',
        time: '10:00 AM',
      });
      const notifs = repo.getNotifications('user-patient-5');
      expect(notifs.some((n) => n.type === 'APPOINTMENT')).toBe(true);
    });
  });

  describe('updateAppointmentStatus', () => {
    test('supports cancellation', () => {
      const updated = repo.updateAppointmentStatus('appt-1', APPOINTMENT_STATUS.CANCELLED);
      expect(updated.status).toBe(APPOINTMENT_STATUS.CANCELLED);
    });

    test('supports confirmation', () => {
      const updated = repo.updateAppointmentStatus(
        'appt-1',
        APPOINTMENT_STATUS.CONFIRMED,
      );
      expect(updated.status).toBe(APPOINTMENT_STATUS.CONFIRMED);
    });

    test('creates follow-up notification on completion', () => {
      repo.state.notifications = [];
      repo.updateAppointmentStatus('appt-1', APPOINTMENT_STATUS.COMPLETED);
      const notifs = repo.getNotifications('user-patient-1');
      expect(notifs.some((n) => n.type === 'FOLLOW_UP')).toBe(true);
    });
  });

  describe('getDoctorAvailability', () => {
    test('returns availability for a doctor', () => {
      const avail = repo.getDoctorAvailability('doctor-1');
      expect(avail).toBeTruthy();
      expect(avail.date).toBe('2026-10-05');
      expect(avail.slots).toContain('10:00 AM');
    });
  });
});




