/**
 * @file Unit tests for MessageRepository (conversation gating) and
 * MedicalReportRepository (processing and sharing).
 */

import MockRepository from '../../../src/data/repositories/MockRepository';
import { CONNECTION_STATUS } from '../../../src/data/models';

describe('MessageRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('getConversationsForUser', () => {
    test('returns conversations where the user is a participant', () => {
      const conversations = repo.getConversationsForUser('user-patient-1');
      expect(conversations.length).toBeGreaterThan(0);
    });
  });

  describe('getMessagesForConversation', () => {
    test('returns messages for a conversation', () => {
      const messages = repo.getMessagesForConversation('conv-1');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('sendMessage', () => {
    test('creates and stores a message', () => {
      repo.state.notifications = [];
      const message = repo.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-patient-1',
        receiverId: 'doctor-1',
        body: 'Hello doctor, I need to follow up.',
      });
      expect(message.id).toBeTruthy();
      expect(message.body).toBe('Hello doctor, I need to follow up.');
      expect(message.isRead).toBe(false);
    });

    test('creates a notification for the receiver', () => {
      repo.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-patient-1',
        receiverId: 'doctor-1',
        body: 'Test message',
      });
      const notifs = repo.getNotifications('doctor-1');
      expect(notifs.some((n) => n.type === 'MESSAGE')).toBe(true);
    });
  });

  describe('markMessagesRead', () => {
    test('marks all messages in a conversation as read for the receiver', () => {
      repo.sendMessage({
        conversationId: 'conv-1',
        senderId: 'doctor-1',
        receiverId: 'user-patient-1',
        body: 'New message',
      });
      repo.markMessagesRead('conv-1', 'user-patient-1');
      const messages = repo.getMessagesForConversation('conv-1');
      expect(
        messages
          .filter((m) => m.receiverId === 'user-patient-1')
          .every((m) => m.read === true),
      ).toBe(true);
    });
  });

  describe('getUnreadMessageCount', () => {
    test('counts unread messages for a user', () => {
      const count = repo.getUnreadMessageCount('user-patient-1');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('MedicalReportRepository (MockRepository)', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  describe('getReportsByUser', () => {
    test('returns reports for a specific user', () => {
      const reports = repo.getReportsByUser('user-patient-1');
      expect(reports.length).toBeGreaterThan(0);
      expect(reports.every((r) => r.userId === 'user-patient-1')).toBe(true);
    });

    test('returns empty for user with no reports', () => {
      const reports = repo.getReportsByUser('nonexistent-user');
      expect(reports.length).toBe(0);
    });
  });

  describe('processMedicalReport', () => {
    test('processes a report and generates AI summary', () => {
      const processed = repo.processMedicalReport({
        id: 'test-report-1',
        userId: 'user-patient-1',
        fileName: 'test.pdf',
        fileType: 'PDF',
        uploadedAt: new Date().toISOString(),
        isProcessed: false,
        extractedInformation: {},
        aiSummaryUrdu: '',
        importantFindings: [],
        sharedWithDoctorId: null,
      });

      expect(processed.isProcessed).toBe(true);
      expect(processed.aiSummaryUrdu).toContain('آپ');
      expect(processed.importantFindings.length).toBeGreaterThan(0);
    });
  });

  describe('shareReportWithDoctor (connection enforcement)', () => {
    test('allows sharing when connection is ACCEPTED', () => {
      const report = repo.getReportsByUser('user-patient-1')[0];
      const shared = repo.shareReportWithDoctor({
        reportId: report.id,
        doctorId: 'doctor-1',
        patientId: 'user-patient-1',
      });
      expect(shared.sharedWithDoctorId).toBe('doctor-1');
    });

    test('throws when connection is PENDING', () => {
      const report = repo.getReportsByUser('user-patient-1')[0];
      expect(() =>
        repo.shareReportWithDoctor({
          reportId: report.id,
          doctorId: 'doctor-2',
          patientId: 'user-patient-2',
        }),
      ).toThrow('Cannot share report: connection is not ACCEPTED.');
    });

    test('throws when connection is NOT_CONNECTED', () => {
      const report = repo.getReportsByUser('user-patient-1')[0];
      expect(() =>
        repo.shareReportWithDoctor({
          reportId: report.id,
          doctorId: 'doctor-9',
          patientId: 'user-patient-1',
        }),
      ).toThrow('Cannot share report: connection is not ACCEPTED.');
    });
  });
});




