/**
 * @file Unit tests for HospitalRepository follow/unfollow logic and
 * NotificationRepository centralized notification state.
 */

import MockRepository from '../../../src/data/repositories/MockRepository';

describe('HospitalRepository (MockRepository) - Follow', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('followHospital', () => {
    test('creates an active follow relationship', () => {
      const follow = repo.followHospital({
        hospitalId: 'hospital-lahore',
        userId: 'user-patient-1',
      });
      expect(follow.isActive).toBe(true);
      expect(follow.hospitalId).toBe('hospital-lahore');
    });

    test('toggles to inactive when following again (unfollow)', () => {
      repo.followHospital({
        hospitalId: 'hospital-lahore',
        userId: 'user-patient-1',
      });

      const unfollow = repo.followHospital({
        hospitalId: 'hospital-lahore',
        userId: 'user-patient-1',
      });
      expect(unfollow.isActive).toBe(false);
    });

    test('prevents duplicate active follows', () => {
      repo.followHospital({
        hospitalId: 'hospital-lahore',
        userId: 'user-patient-2',
      });
      const second = repo.followHospital({
        hospitalId: 'hospital-lahore',
        userId: 'user-patient-2',
      });
      expect(second.isActive).toBe(false);
    });
  });

  describe('getFollowedHospitals', () => {
    test('returns only active followed hospitals for a user', () => {
      const followed = repo.getFollowedHospitals('donor-1');
      expect(followed.length).toBeGreaterThan(0);
    });
  });
});

describe('NotificationRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('getNotifications', () => {
    test('returns notifications for a specific user', () => {
      const notifs = repo.getNotifications('donor-1');
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs.every((n) => n.userId === 'donor-1')).toBe(true);
    });

    test('returns empty for user with no notifications', () => {
      const notifs = repo.getNotifications('nonexistent-user');
      expect(notifs.length).toBe(0);
    });
  });

  describe('markNotificationsRead / markAllAsRead', () => {
    test('marks all notifications as read for a user', () => {
      const before = repo.getNotifications('donor-1').filter((n) => !n.isRead);
      expect(before.length).toBeGreaterThan(0);

      repo.markAllAsRead('donor-1');
      const after = repo.getNotifications('donor-1').filter((n) => !n.isRead);
      expect(after.length).toBe(0);
    });

    test('does not mark other users notifications as read', () => {
      const otherBefore = repo.getNotifications('donor-2').filter((n) => !n.isRead);
      repo.markAllAsRead('donor-1');
      const otherAfter = repo.getNotifications('donor-2').filter((n) => !n.isRead);
      expect(otherAfter.length).toBe(otherBefore.length);
    });
  });

  describe('getUnreadNotificationCount', () => {
    test('counts only unread notifications for a user', () => {
      const unreadCount = repo.getUnreadNotificationCount('donor-1');
      const allNotifs = repo.getNotifications('donor-1');
      const unreadExpected = allNotifs.filter((n) => !n.isRead).length;
      expect(unreadCount).toBe(unreadExpected);
    });
  });

  describe('Notification navigation links', () => {
    test('notifications can link to blood requests', () => {
      const notifs = repo.getNotifications('donor-1');
      const bloodNotif = notifs.find((n) => n.type === 'BLOOD_REQUEST');
      expect(bloodNotif).toBeTruthy();
      expect(bloodNotif.bloodRequestId).toBeTruthy();
      expect(bloodNotif.hospitalId).toBeTruthy();
    });
  });
});




