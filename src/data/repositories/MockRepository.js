import { seedData } from '../mock/seedData';
import {
  APPOINTMENT_STATUS,
  BLOOD_REQUEST_STATUS,
  CONNECTION_STATUS,
  NOTIFICATION_TYPE,
  RESPONSE_STATUS,
} from '../models';

export class MockRepository {
  constructor(initialState = seedData) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  login({ email, password }) {
    const user = this.state.users.find(
      (entry) => entry.email === email && entry.password === password,
    );

    if (!user) {
      throw new Error('Invalid demo credentials.');
    }

    return { ...user, password: undefined };
  }

  logout() {
    this.state._currentUserId = null;
    return { success: true };
  }

  getCurrentUser() {
    return this.state._currentUserId
      ? this.getUserById(this.state._currentUserId)
      : null;
  }

  setCurrentUser(userId) {
    this.state._currentUserId = userId;
    return this.getUserById(userId);
  }

  getUserById(userId) {
    return (
      this.state.users.find((user) => user.id === userId) ||
      this.state.donors.find((donor) => donor.id === userId) ||
      this.state.doctors.find((doctor) => doctor.id === userId) ||
      this.state.hospitals.find(
        (hospital) => hospital.userId === userId || hospital.id === userId,
      ) ||
      null
    );
  }

  getUsers() {
    return this.state.users.map((user) => ({ ...user, password: undefined }));
  }

  getDoctors() {
    return this.state.doctors;
  }

  getDoctorById(doctorId) {
    const doctor = this.state.doctors.find((d) => d.id === doctorId);
    if (!doctor) return null;
    return { ...doctor };
  }

  searchDoctors({ query = '', specialization, hospitalId, area, radiusKm, limit = 20, offset = 0 }) {
    const conditionToSpecialty = {
      cancer: 'oncolog',
      tumor: 'oncolog',
      oncology: 'oncolog',
      brain: 'neurolog',
      neurology: 'neurolog',
      neurologist: 'neurolog',
      heart: 'cardiolog',
      cardiac: 'cardiolog',
      cardiology: 'cardiolog',
      skin: 'dermatolog',
      dermatology: 'dermatolog',
      diabetes: 'endocrin',
      endocrine: 'endocrin',
      bone: 'orthoped',
      fracture: 'orthoped',
      orthopedics: 'orthoped',
      eye: 'ophthalm',
      vision: 'ophthalm',
      ophthalmology: 'ophthalm',
      stomach: 'gastroenter',
      digestion: 'gastroenter',
      gastroenterology: 'gastroenter',
      child: 'pediatric',
      children: 'pediatric',
      pediatric: 'pediatric',
      mental: 'psychiatr',
      psychiatrist: 'psychiatr',
    };

    let results = this.state.doctors;

    if (query.trim()) {
      const lower = query.toLowerCase();
      const words = lower.split(/\s+/);
      const mappedSpecialties = words
        .map((word) => conditionToSpecialty[word])
        .filter(Boolean);

      results = results.filter((d) => {
        const specLower = d.specialization.toLowerCase();
        const hospitalLower = (d.hospitalName || d.hospital || '').toLowerCase();
        const nameLower = d.name.toLowerCase();

        const directMatch =
          nameLower.includes(lower) ||
          specLower.includes(lower) ||
          hospitalLower.includes(lower) ||
          (d.conditions || []).some((c) => c.toLowerCase().includes(lower));

        const mappedMatch =
          mappedSpecialties.length > 0 &&
          mappedSpecialties.some((spec) => specLower.includes(spec));

        return directMatch || mappedMatch;
      });
    }

    if (specialization) {
      results = results.filter((d) =>
        d.specialization.toLowerCase().includes(specialization.toLowerCase()),
      );
    }

    if (hospitalId) {
      results = results.filter((d) => d.hospitalId === hospitalId);
    }

    if (area) {
      results = results.filter((d) => d.area.toLowerCase().includes(area.toLowerCase()));
    }

    if (typeof radiusKm === 'number') {
      results = results.filter(
        (d) => typeof d.distanceKm === 'number' && d.distanceKm <= radiusKm,
      );
    }

    return results.slice(offset, offset + limit);
  }

  getHospitals() {
    return this.state.hospitals;
  }

  getHospitalById(hospitalId) {
    return this.state.hospitals.find((hospital) => hospital.id === hospitalId) || null;
  }

  getHospitalFollowers(hospitalId) {
    return this.state.followRelationships
      .filter((relationship) => relationship.hospitalId === hospitalId && relationship.isActive)
      .map((relationship) => this.state.users.find((user) => user.id === relationship.userId))
      .filter(Boolean)
      .map((user) => ({ ...user, password: undefined }));
  }

  followHospital({ hospitalId, userId }) {
    const existing = this.state.followRelationships.find(
      (relationship) => relationship.hospitalId === hospitalId && relationship.userId === userId,
    );

    if (existing) {
      existing.isActive = !existing.isActive;
      existing.updatedAt = new Date().toISOString();
      return { ...existing };
    }

    const follow = {
      id: `follow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      hospitalId,
      userId,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    this.state.followRelationships.unshift(follow);
    return { ...follow };
  }

  getFollowedHospitals(userId) {
    return this.state.followRelationships
      .filter((relationship) => relationship.userId === userId && relationship.isActive)
      .map((relationship) => this.getHospitalById(relationship.hospitalId))
      .filter(Boolean);
  }

  getHospitalPosts(hospitalId) {
    return this.state.posts.filter((post) => post.hospitalId === hospitalId);
  }

  createHospitalPost({ hospitalId, postType, title, description, bloodGroup, unitsRequired, urgency, location }) {
    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      hospitalId,
      postType,
      title,
      description,
      bloodGroup: bloodGroup || null,
      unitsRequired: unitsRequired || 0,
      urgency: urgency || 'NORMAL',
      location: location || 'Islamabad',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      imageUrl: null,
    };

    this.state.posts.unshift(post);
    return post;
  }

  // ---------------------------------------------------------------------------
  // Connection management (DoctorConnection)
  // ---------------------------------------------------------------------------

  sendConnectionRequest({ patientId, doctorId, notes }) {
    const existing = this.state.connections.find(
      (connection) =>
        connection.patientId === patientId && connection.doctorId === doctorId,
    );

    if (existing) {
      if (existing.status === CONNECTION_STATUS.ACCEPTED) {
        return { ...existing, alreadyConnected: true };
      }
      if (existing.status === CONNECTION_STATUS.PENDING) {
        return { ...existing, alreadyPending: true };
      }
      if (existing.status === CONNECTION_STATUS.REJECTED) {
        existing.status = CONNECTION_STATUS.PENDING;
        existing.createdAt = new Date().toISOString();
        existing.rejectedAt = null;
        return { ...existing, resubmitted: true };
      }
    }

    const connection = {
      id: `conn-${Date.now()}`,
      patientId,
      doctorId,
      status: CONNECTION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      rejectedAt: null,
      notes: notes || '',
    };

    this.state.connections.push(connection);
    return { ...connection };
  }

  acceptConnection(connectionId) {
    const connection = this.state.connections.find((c) => c.id === connectionId);
    if (!connection) {
      throw new Error('Connection not found.');
    }

    connection.status = CONNECTION_STATUS.ACCEPTED;
    connection.acceptedAt = new Date().toISOString();
    connection.rejectedAt = null;

    const doctor = this.getDoctorById(connection.doctorId);
    const patient = this.getUserById(connection.patientId);

    if (patient) {
      this.state.notifications.unshift({
        id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: connection.patientId,
        type: NOTIFICATION_TYPE.MESSAGE,
        title: 'Connection accepted',
        body: `${doctor?.name || 'Doctor'} has accepted your connection request. You can now message directly.`,
        hospitalId: null,
        postId: null,
        bloodRequestId: null,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    return { ...connection };
  }

  rejectConnection(connectionId) {
    const connection = this.state.connections.find((c) => c.id === connectionId);
    if (!connection) {
      throw new Error('Connection not found.');
    }

    connection.status = CONNECTION_STATUS.REJECTED;
    connection.rejectedAt = new Date().toISOString();
    connection.acceptedAt = null;

    return { ...connection };
  }

  getConnectionStatus({ patientId, doctorId }) {
    const connection = this.state.connections.find(
      (c) => c.patientId === patientId && c.doctorId === doctorId,
    );
    return connection ? connection.status : CONNECTION_STATUS.NOT_CONNECTED;
  }

  getConnection(patientId, doctorId) {
    return this.state.connections.find(
      (c) => c.patientId === patientId && c.doctorId === doctorId,
    ) || null;
  }

  getPatientConnections({ patientId, status }) {
    let results = this.state.connections.filter((c) => c.patientId === patientId);
    if (status) {
      results = results.filter((c) => c.status === status);
    }
    return results;
  }

  getDoctorConnections({ doctorId, status }) {
    let results = this.state.connections.filter((c) => c.doctorId === doctorId);
    if (status) {
      results = results.filter((c) => c.status === status);
    }
    return results;
  }

  getConnections({ patientId, doctorId }) {
    if (patientId && doctorId) {
      return this.state.connections.find(
        (c) => c.patientId === patientId && c.doctorId === doctorId,
      ) || null;
    }
    if (patientId) {
      return this.getPatientConnections({ patientId });
    }
    if (doctorId) {
      return this.getDoctorConnections({ doctorId });
    }
    return [...this.state.connections];
  }

  canMessage({ patientId, doctorId }) {
    const status = this.getConnectionStatus({ patientId, doctorId });
    return status === CONNECTION_STATUS.ACCEPTED;
  }

  // ---------------------------------------------------------------------------
  // Appointments
  // ---------------------------------------------------------------------------

  getAppointmentsByUser(userId) {
    return this.state.appointments.filter(
      (appointment) => appointment.patientId === userId || appointment.doctorId === userId,
    );
  }

  getDoctorAppointments(doctorId, statusFilter) {
    let results = this.state.appointments.filter((a) => a.doctorId === doctorId);
    if (statusFilter) {
      results = results.filter((a) => a.status === statusFilter);
    }
    return results;
  }

  getDoctorAvailability(doctorId) {
    return this.state.doctorAvailability.find((a) => a.doctor === doctorId || a.doctorId === doctorId) || null;
  }

  updateAppointmentStatus(appointmentId, status) {
    const appointment = this.state.appointments.find((a) => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found.');
    }

    const previousStatus = appointment.status;
    appointment.status = status;

    if (status === APPOINTMENT_STATUS.COMPLETED) {
      const doctor = this.getDoctorById(appointment.doctorId);
      const patient = this.getUserById(appointment.patientId);

      const followUpDate = new Date(appointment.date);
      followUpDate.setDate(followUpDate.getDate() + 14);

      this.state.notifications.unshift({
        id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: appointment.patientId,
        type: NOTIFICATION_TYPE.FOLLOW_UP,
        title: 'Follow-up reminder',
        body: `It has been about two weeks since your appointment with ${doctor?.name || 'your doctor'}. Please schedule a follow-up if recommended.`,
        hospitalId: null,
        postId: null,
        bloodRequestId: null,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    if (status === APPOINTMENT_STATUS.CONFIRMED && previousStatus === APPOINTMENT_STATUS.PENDING) {
      this.state.notifications.unshift({
        id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: appointment.patientId,
        type: NOTIFICATION_TYPE.APPOINTMENT,
        title: 'Appointment confirmed',
        body: `Your appointment has been confirmed.`,
        hospitalId: null,
        postId: null,
        bloodRequestId: null,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    return { ...appointment };
  }

  createAppointment(payload) {
    const duplicate = this.state.appointments.some(
      (appointment) =>
        appointment.doctorId === payload.doctorId &&
        appointment.date === payload.date &&
        appointment.time === payload.time,
    );

    if (duplicate) {
      throw new Error('This appointment slot is no longer available.');
    }

    const appointment = {
      id: `appt-${Date.now()}`,
      ...payload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    this.state.appointments.unshift(appointment);

    this.state.notifications.unshift({
      id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: payload.patientId,
      type: NOTIFICATION_TYPE.APPOINTMENT,
      title: 'Appointment requested',
      body: `Your appointment request with ${payload.doctorName || 'the provider'} is pending confirmation.`,
      hospitalId: payload.hospitalId || null,
      postId: null,
      bloodRequestId: null,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    return appointment;
  }

  cancelAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.CANCELLED);
  }

  // ---------------------------------------------------------------------------
  // Messaging
  // ---------------------------------------------------------------------------

  getConversationsForUser(userId) {
    return this.state.conversations.filter((conv) =>
      conv.participantIds.includes(userId),
    );
  }

  getMessagesForConversation(conversationId) {
    return this.state.messages.filter((message) => message.conversationId === conversationId);
  }

  sendMessage({ conversationId, senderId, receiverId, body, attachment }) {
    const message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      receiverId,
      body,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    this.state.messages.unshift(message);

    const conversation = this.state.conversations.find((c) => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = body;
      conversation.lastMessageAt = message.createdAt;
      conversation.unreadCounts = conversation.unreadCounts || {};
      conversation.unreadCounts[receiverId] = (conversation.unreadCounts[receiverId] || 0) + 1;
    }

    this.state.notifications.unshift({
      id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: receiverId,
      type: NOTIFICATION_TYPE.MESSAGE,
      title: 'New message',
      body: body.length > 80 ? `${body.substring(0, 80)}...` : body,
      hospitalId: null,
      postId: null,
      bloodRequestId: null,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    return message;
  }

  getUnreadMessageCount(userId) {
    return this.state.messages.filter(
      (message) => !message.read && message.receiverId === userId,
    ).length;
  }

  markMessagesRead(conversationId, userId) {
    this.state.messages.forEach((message) => {
      if (message.conversationId === conversationId && message.receiverId === userId) {
        message.read = true;
      }
    });
    return this.getMessagesForConversation(conversationId);
  }

  // ---------------------------------------------------------------------------
  // Medical reports
  // ---------------------------------------------------------------------------

  getReportsByUser(userId) {
    return this.state.reports.filter((report) => report.userId === userId);
  }

  getReportById(reportId) {
    return this.state.reports.find((r) => r.id === reportId) || null;
  }

  processMedicalReport(report) {
    const processed = {
      ...report,
      isProcessed: true,
      extractedInformation: {
        ...report.extractedInformation,
        summary: 'Sample extraction result',
      },
      aiSummaryUrdu:
        'رپورٹ کا خلاصہ: آپ کے نتائج میں چند غیر معمولی چیزیں ہیں، جو ڈاکٹر کی تشخیص کے ذریعے واضح کی جا سکتی ہیں۔',
      importantFindings:
        report.importantFindings && report.importantFindings.length > 0
          ? report.importantFindings
          : ['Important findings are highlighted for clinician review.'],
    };

    this.state.reports.unshift(processed);
    return processed;
  }

  shareReportWithDoctor({ reportId, doctorId, patientId }) {
    const connectionStatus = this.getConnectionStatus({ patientId, doctorId });
    if (connectionStatus !== CONNECTION_STATUS.ACCEPTED) {
      throw new Error('Cannot share report: connection is not ACCEPTED.');
    }

    const report = this.state.reports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error('Report not found.');
    }

    report.sharedWithDoctorId = doctorId;
    report.sharedAt = new Date().toISOString();

    const doctor = this.getDoctorById(doctorId);
    const patient = this.getUserById(patientId);

    const conversation = this.state.conversations.find(
      (c) =>
        c.participantIds.includes(patientId) && c.participantIds.includes(doctorId),
    );

    if (conversation) {
      const structuredMessage = `Medical Report Shared

Patient: ${patient?.name || 'Unknown'}
Report: ${report.fileName}
AI Summary: ${report.aiSummaryUrdu}
Important Findings: ${(report.importantFindings || []).join(', ')}

Please review the original report before making clinical decisions.`;

      this.sendMessage({
        conversationId: conversation.id,
        senderId: patientId,
        receiverId: doctorId,
        body: structuredMessage,
        attachment: { reportId, fileName: report.fileName },
      });
    } else {
      this.state.notifications.unshift({
        id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: doctorId,
        type: NOTIFICATION_TYPE.MESSAGE,
        title: 'Report shared',
        body: `${patient?.name || 'A patient'} shared a medical report with you.`,
        hospitalId: null,
        postId: null,
        bloodRequestId: null,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    this.state.notifications.unshift({
      id: `notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: doctorId,
      type: NOTIFICATION_TYPE.REPORT,
      title: 'Medical report shared',
      body: `${patient?.name || 'A patient'} shared a report for your review.`,
      hospitalId: null,
      postId: null,
      bloodRequestId: null,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    return { ...report };
  }

  // ---------------------------------------------------------------------------
  // Prescriptions
  // ---------------------------------------------------------------------------

  getPrescriptionsForUser(userId) {
    return this.state.prescriptions.filter((prescription) => prescription.userId === userId);
  }

  scanPrescription(payload) {
    const prescription = {
      id: `prescription-${Date.now()}`,
      userId: payload.userId,
      scanDate: new Date().toISOString(),
      medicines: payload.medicines || [],
      notes: payload.notes || '',
    };

    this.state.prescriptions.unshift(prescription);
    return prescription;
  }

  getMedicinePrices(medicineName) {
    return this.state.medicinePrices.filter((price) =>
      price.medicineName.toLowerCase().includes(medicineName.toLowerCase()),
    );
  }

  // ---------------------------------------------------------------------------
  // Blood donation
  // ---------------------------------------------------------------------------

  getBloodRequests() {
    return this.state.bloodRequests.filter(
      (request) => request.status === BLOOD_REQUEST_STATUS.ACTIVE,
    );
  }

  getBloodRequestById(bloodRequestId) {
    return this.state.bloodRequests.find((r) => r.id === bloodRequestId) || null;
  }

  createBloodRequest(payload) {
    const request = {
      id: `blood-${Date.now()}`,
      ...payload,
      status: BLOOD_REQUEST_STATUS.ACTIVE,
      responseCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.bloodRequests.unshift(request);

    const followers = this.state.followRelationships.filter(
      (relationship) => relationship.hospitalId === payload.hospitalId && relationship.isActive,
    );

    const notifications = followers.map((relationship) => ({
      id: `notify-${Date.now()}-${relationship.userId}`,
      userId: relationship.userId,
      type: NOTIFICATION_TYPE.BLOOD_REQUEST,
      title: 'Blood Request',
      body: `${this.getHospitalById(payload.hospitalId)?.name || 'Hospital'} needs ${payload.bloodGroup} blood. ${payload.unitsRequired} units are required.`,
      hospitalId: payload.hospitalId,
      bloodRequestId: request.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    }));

    this.state.notifications.unshift(...notifications);
    return request;
  }

  createBloodRequestResponse({ bloodRequestId, donorId, message }) {
    const existing = this.state.bloodRequestResponses.find(
      (response) => response.bloodRequestId === bloodRequestId && response.donorId === donorId,
    );

    if (existing) {
      throw new Error('A response already exists for this donor and blood request.');
    }

    const request = this.state.bloodRequests.find((entry) => entry.id === bloodRequestId);

    const response = {
      id: `response-${Date.now()}`,
      bloodRequestId,
      donorId,
      createdAt: new Date().toISOString(),
      status: RESPONSE_STATUS.OFFERED,
      message: message || 'I can help.',
    };

    this.state.bloodRequestResponses.unshift(response);

    if (request) {
      request.responseCount = (request.responseCount || 0) + 1;
    }

    this.state.notifications.unshift({
      id: `notify-${Date.now()}-response`,
      userId: this.getHospitalById(request?.hospitalId)?.userId || 'user-hospital-1',
      type: NOTIFICATION_TYPE.BLOOD_REQUEST,
      title: 'Donor response received',
      body: 'A donor has offered to help with a blood request.',
      hospitalId: request?.hospitalId || null,
      bloodRequestId,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    return response;
  }

  getBloodRequestResponses(bloodRequestId) {
    return this.state.bloodRequestResponses.filter(
      (response) => response.bloodRequestId === bloodRequestId,
    );
  }

  fulfillBloodRequest(bloodRequestId) {
    const request = this.state.bloodRequests.find((entry) => entry.id === bloodRequestId);
    if (!request) {
      throw new Error('Blood request not found.');
    }

    request.status = BLOOD_REQUEST_STATUS.FULFILLED;

    this.state.notifications = this.state.notifications.filter(
      (notification) =>
        notification.bloodRequestId !== bloodRequestId ||
        notification.type !== NOTIFICATION_TYPE.BLOOD_REQUEST,
    );

    return request;
  }

  closeBloodRequest(bloodRequestId) {
    const request = this.state.bloodRequests.find((entry) => entry.id === bloodRequestId);
    if (!request) {
      throw new Error('Blood request not found.');
    }

    request.status = BLOOD_REQUEST_STATUS.CLOSED;

    this.state.notifications = this.state.notifications.filter(
      (notification) =>
        notification.bloodRequestId !== bloodRequestId ||
        notification.type !== NOTIFICATION_TYPE.BLOOD_REQUEST,
    );

    return request;
  }

  expireBloodRequest(bloodRequestId) {
    const request = this.state.bloodRequests.find((entry) => entry.id === bloodRequestId);
    if (!request) {
      throw new Error('Blood request not found.');
    }

    request.status = BLOOD_REQUEST_STATUS.EXPIRED;

    this.state.notifications = this.state.notifications.filter(
      (notification) =>
        notification.bloodRequestId !== bloodRequestId ||
        notification.type !== NOTIFICATION_TYPE.BLOOD_REQUEST,
    );

    return request;
  }

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  getNotifications(userId) {
    return this.state.notifications.filter((notification) => notification.userId === userId);
  }

  getNotificationsByUser(userId) {
    return this.getNotifications(userId);
  }

  markNotificationsRead(userId) {
    this.state.notifications.forEach((notification) => {
      if (notification.userId === userId) {
        notification.isRead = true;
      }
    });

    return this.getNotifications(userId);
  }

  markAllAsRead(userId) {
    return this.markNotificationsRead(userId);
  }

  markNotificationRead(notificationId) {
    const notification = this.state.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    return notification;
  }

  getUnreadNotificationCount(userId) {
    return this.state.notifications.filter(
      (notification) => notification.userId === userId && !notification.isRead,
    ).length;
  }

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------

  getReviewsForDoctor(doctorId) {
    return this.state.reviews.filter((review) => review.doctorId === doctorId);
  }

  addReview({ doctorId, patientId, rating, comment }) {
    const review = {
      id: `review-${Date.now()}`,
      doctorId,
      patientId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    this.state.reviews.unshift(review);

    const doctor = this.getDoctorById(doctorId);
    if (doctor) {
      const allReviews = this.getReviewsForDoctor(doctorId);
      doctor.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      doctor.reviewCount = allReviews.length;
    }

    return review;
  }
}

export default MockRepository;
