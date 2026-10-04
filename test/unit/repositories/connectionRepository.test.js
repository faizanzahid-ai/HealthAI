/**
 * @file Unit tests for the ConnectionRepository and connection state enforcement.
 *
 * These tests verify the critical LinkedIn-style professional connection model:
 * - Patient sends connection request → PENDING
 * - Doctor accepts → ACCEPTED → messaging unlocked
 * - Doctor rejects → REJECTED → messaging locked
 */

import MockRepository from '../../../src/data/repositories/MockRepository';
import { CONNECTION_STATUS } from '../../../src/data/models';

describe('ConnectionRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('getConnectionStatus', () => {
    test('returns NOT_CONNECTED when no connection exists', () => {
      const status = repo.getConnectionStatus({
        patientId: 'user-patient-1',
        doctorId: 'doctor-2',
      });
      expect(status).toBe(CONNECTION_STATUS.NOT_CONNECTED);
    });

    test('returns ACCEPTED for seeded accepted connection', () => {
      const status = repo.getConnectionStatus({
        patientId: 'user-patient-1',
        doctorId: 'doctor-1',
      });
      expect(status).toBe(CONNECTION_STATUS.ACCEPTED);
    });

    test('returns PENDING for seeded pending connection', () => {
      const status = repo.getConnectionStatus({
        patientId: 'user-patient-2',
        doctorId: 'doctor-2',
      });
      expect(status).toBe(CONNECTION_STATUS.PENDING);
    });

    test('returns REJECTED for seeded rejected connection', () => {
      const status = repo.getConnectionStatus({
        patientId: 'user-patient-3',
        doctorId: 'doctor-4',
      });
      expect(status).toBe(CONNECTION_STATUS.REJECTED);
    });
  });

  describe('canMessage (messaging permission enforcement)', () => {
    test('returns true ONLY when status is ACCEPTED', () => {
      expect(
        repo.canMessage({ patientId: 'user-patient-1', doctorId: 'doctor-1' }),
      ).toBe(true);
    });

    test('returns false when status is PENDING', () => {
      expect(
        repo.canMessage({ patientId: 'user-patient-2', doctorId: 'doctor-2' }),
      ).toBe(false);
    });

    test('returns false when status is REJECTED', () => {
      expect(
        repo.canMessage({ patientId: 'user-patient-3', doctorId: 'doctor-4' }),
      ).toBe(false);
    });

    test('returns false when status is NOT_CONNECTED', () => {
      expect(
        repo.canMessage({ patientId: 'user-patient-5', doctorId: 'doctor-2' }),
      ).toBe(false);
    });
  });

  describe('sendConnectionRequest', () => {
    test('creates a PENDING connection', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-1',
        doctorId: 'doctor-5',
      });
      expect(connection.status).toBe(CONNECTION_STATUS.PENDING);
      expect(connection.patientId).toBe('user-patient-1');
      expect(connection.doctorId).toBe('doctor-5');
      expect(connection.acceptedAt).toBeNull();
    });

    test('prevents duplicate PENDING request and returns alreadyPending', () => {
      repo.sendConnectionRequest({
        patientId: 'test-patient',
        doctorId: 'test-doctor',
      });
      const secondAttempt = repo.sendConnectionRequest({
        patientId: 'test-patient',
        doctorId: 'test-doctor',
      });
      expect(secondAttempt.alreadyPending).toBe(true);
      expect(secondAttempt.status).toBe(CONNECTION_STATUS.PENDING);
    });

    test('allows re-request after REJECTED', () => {
      const rejected = repo.sendConnectionRequest({
        patientId: 'user-patient-4',
        doctorId: 'doctor-3',
      });
      repo.rejectConnection(rejected.id);
      const retry = repo.sendConnectionRequest({
        patientId: 'user-patient-4',
        doctorId: 'doctor-3',
      });
      expect(retry.status).toBe(CONNECTION_STATUS.PENDING);
      expect(retry.resubmitted).toBe(true);
    });

    test('returns alreadyConnected when connection is ACCEPTED', () => {
      const result = repo.sendConnectionRequest({
        patientId: 'user-patient-1',
        doctorId: 'doctor-1',
      });
      expect(result.alreadyConnected).toBe(true);
    });
  });

  describe('acceptConnection', () => {
    test('transitions connection from PENDING to ACCEPTED', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-1',
        doctorId: 'doctor-8',
      });
      const accepted = repo.acceptConnection(connection.id);
      expect(accepted.status).toBe(CONNECTION_STATUS.ACCEPTED);
      expect(accepted.acceptedAt).toBeTruthy();
    });

    test('unlocks messaging after acceptance', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-2',
        doctorId: 'doctor-3',
      });
      repo.acceptConnection(connection.id);
      expect(
        repo.canMessage({ patientId: 'user-patient-2', doctorId: 'doctor-3' }),
      ).toBe(true);
    });

    test('creates a notification for the patient', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-2',
        doctorId: 'doctor-2',
      });
      // Clear existing notifications to isolate
      repo.state.notifications = [];
      repo.acceptConnection(connection.id);
      const notifs = repo.getNotifications('user-patient-2');
      expect(notifs.some((n) => n.type === 'MESSAGE')).toBe(true);
    });

    test('throws for non-existent connection', () => {
      expect(() => repo.acceptConnection('nonexistent')).toThrow(
        'Connection not found.',
      );
    });
  });

  describe('rejectConnection', () => {
    test('transitions connection from PENDING to REJECTED', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-3',
        doctorId: 'doctor-8',
      });
      const rejected = repo.rejectConnection(connection.id);
      expect(rejected.status).toBe(CONNECTION_STATUS.REJECTED);
      expect(rejected.rejectedAt).toBeTruthy();
    });

    test('keeps messaging locked after rejection', () => {
      const connection = repo.sendConnectionRequest({
        patientId: 'user-patient-4',
        doctorId: 'doctor-8',
      });
      repo.rejectConnection(connection.id);
      expect(
        repo.canMessage({ patientId: 'user-patient-4', doctorId: 'doctor-8' }),
      ).toBe(false);
    });
  });

  describe('getPatientConnections and getDoctorConnections', () => {
    test('returns all connections for a patient', () => {
      const connections = repo.getPatientConnections({
        patientId: 'user-patient-1',
      });
      expect(connections.length).toBeGreaterThan(0);
    });

    test('returns filtered connections by status', () => {
      const pending = repo.getPatientConnections({
        patientId: 'user-patient-2',
        status: CONNECTION_STATUS.PENDING,
      });
      expect(pending.length).toBe(1);
    });

    test('returns all connections for a doctor', () => {
      const connections = repo.getDoctorConnections({
        doctorId: 'doctor-1',
      });
      expect(connections.length).toBeGreaterThan(0);
    });
  });
});




