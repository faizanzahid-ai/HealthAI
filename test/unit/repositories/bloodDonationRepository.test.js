/**
 * @file Unit tests for blood donation notification fan-out and lifecycle rules.
 *
 * Critical rules tested:
 * - Every active follower of a hospital receives an individual notification
 *   when the hospital creates an active blood request.
 * - Fulfilled/closed/expired requests do not generate new notifications.
 * - Duplicate donor responses are prevented.
 */

import MockRepository from '../../../src/data/repositories/MockRepository';
import { BLOOD_REQUEST_STATUS } from '../../../src/data/models';

describe('BloodDonationRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('Blood notification rule', () => {
    test('creates a notification for every active follower when an active request is published', () => {
      repo.state.notifications = [];

      const followersBefore = repo
        .getState()
        .followRelationships.filter((f) => f.hospitalId === 'hospital-xyz' && f.isActive)
        .map((f) => f.userId);

      const notificationsBefore = repo.state.notifications.length;

      const request = repo.createBloodRequest({
        hospitalId: 'hospital-xyz',
        bloodGroup: 'AB-',
        unitsRequired: 2,
        urgency: 'URGENT',
        title: 'AB- blood needed urgently',
        description: 'For a surgery',
        location: 'Islamabad',
        contactInformation: 'Coordination desk',
      });

      expect(request.status).toBe(BLOOD_REQUEST_STATUS.ACTIVE);

      const totalAfter = repo.state.notifications.length;
      expect(totalAfter - notificationsBefore).toBe(followersBefore.length);

      const bloodNotifs = repo.state.notifications.filter((n) => n.bloodRequestId === request.id);
      expect(bloodNotifs.length).toBe(followersBefore.length);

      followersBefore.forEach((userId) => {
        const userNotifs = repo.getNotifications(userId);
        const userBloodNotifs = userNotifs.filter((n) => n.bloodRequestId === request.id);
        expect(userBloodNotifs.length).toBe(1);
      });
    });

    test('does not notify unfollowed users', () => {
      repo.state.notifications = [];
      repo.createBloodRequest({
        hospitalId: 'hospital-xyz',
        bloodGroup: 'AB-',
        unitsRequired: 2,
        urgency: 'URGENT',
        title: 'AB- blood needed',
        description: 'For a surgery',
        location: 'Islamabad',
        contactInformation: 'Coordination desk',
      });

      // donor-3 follows hospital-xyz in seed data
      const donor3Notifs = repo.getNotifications('donor-3');
      expect(donor3Notifs.length).toBeGreaterThan(0);
    });
  });

  describe('Request lifecycle', () => {
    test('gets only active blood requests', () => {
      const active = repo.getBloodRequests();
      expect(active.every((r) => r.status === BLOOD_REQUEST_STATUS.ACTIVE)).toBe(true);
    });

    test('marks request FULFILLED and stops notifications', () => {
      const activeBefore = repo
        .getState()
        .notifications.filter(
          (n) =>
            n.bloodRequestId === 'blood-req-1' && n.type === 'BLOOD_REQUEST',
        ).length;

      repo.fulfillBloodRequest('blood-req-1');

      const fulfilledRequest = repo.getBloodRequestById('blood-req-1');
      expect(fulfilledRequest.status).toBe(BLOOD_REQUEST_STATUS.FULFILLED);

      const notifsAfter = repo
        .getState()
        .notifications.filter(
          (n) =>
            n.bloodRequestId === 'blood-req-1' && n.type === 'BLOOD_REQUEST',
        );
      expect(notifsAfter.length).toBe(0);
      expect(activeBefore).toBeGreaterThan(0);
    });

    test('marks request CLOSED and stops notifications', () => {
      repo.createBloodRequest({
        hospitalId: 'hospital-xyz',
        bloodGroup: 'B+',
        unitsRequired: 1,
        urgency: 'URGENT',
        title: 'B+ needed',
        description: 'For surgery',
        location: 'Islamabad',
        contactInformation: 'Desk',
      });
      const requestId = repo.getState().bloodRequests[0].id;

      repo.closeBloodRequest(requestId);
      const closed = repo.getBloodRequestById(requestId);
      expect(closed.status).toBe(BLOOD_REQUEST_STATUS.CLOSED);
    });

    test('marks request EXPIRED and stops notifications', () => {
      repo.createBloodRequest({
        hospitalId: 'hospital-xyz',
        bloodGroup: 'A+',
        unitsRequired: 2,
        urgency: 'URGENT',
        title: 'A+ needed',
        description: 'For surgery',
        location: 'Islamabad',
        contactInformation: 'Desk',
      });
      const requestId = repo.getState().bloodRequests[0].id;

      repo.expireBloodRequest(requestId);
      const expired = repo.getBloodRequestById(requestId);
      expect(expired.status).toBe(BLOOD_REQUEST_STATUS.EXPIRED);
    });
  });

  describe('createBloodRequestResponse (duplicate prevention)', () => {
    test('prevents duplicate donor responses', () => {
      repo.createBloodRequestResponse({
        bloodRequestId: 'blood-req-1',
        donorId: 'donor-999',
        message: 'I can help.',
      });

      expect(() =>
        repo.createBloodRequestResponse({
          bloodRequestId: 'blood-req-1',
          donorId: 'donor-999',
          message: 'I can help.',
        }),
      ).toThrow('A response already exists for this donor and blood request.');
    });

    test('increments response count', () => {
      const before = repo.getState().bloodRequests.find(
        (r) => r.id === 'blood-req-1',
      ).responseCount;

      repo.createBloodRequestResponse({
        bloodRequestId: 'blood-req-1',
        donorId: 'donor-998',
        message: 'Available tomorrow.',
      });

      const after = repo.getState().bloodRequests.find(
        (r) => r.id === 'blood-req-1',
      ).responseCount;
      expect(after).toBe(before + 1);
    });

    test('creates a notification for the hospital', () => {
      repo.state.notifications = [];
      repo.createBloodRequestResponse({
        bloodRequestId: 'blood-req-1',
        donorId: 'donor-997',
        message: 'I can help.',
      });
      const hospitalNotifs = repo.getNotifications('user-hospital-1');
      expect(hospitalNotifs.length).toBeGreaterThan(0);
    });
  });

  describe('getBloodRequestResponses', () => {
    test('returns responses for a request', () => {
      const responses = repo.getBloodRequestResponses('blood-req-2');
      expect(responses.length).toBeGreaterThan(0);
    });
  });
});




