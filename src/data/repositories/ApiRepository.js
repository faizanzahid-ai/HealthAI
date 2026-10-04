import { CONNECTION_STATUS, BLOOD_REQUEST_STATUS } from '../models';

export class ApiRepository {
  constructor({ client } = {}) {
    this.client = client;
  }

  _ensureClient() {
    if (!this.client) {
      throw new Error('API client is not configured.');
    }
  }

  async login({ email, password }) {
    this._ensureClient();
    return this.client.post('/auth/login', { email, password });
  }

  async logout() {
    this._ensureClient();
    return this.client.post('/auth/logout');
  }

  async getCurrentUser() {
    this._ensureClient();
    return this.client.get('/me');
  }

  async searchDoctors({ query, specialization, area, radiusKm, limit, offset }) {
    this._ensureClient();
    return this.client.get('/doctors', { params: { query, specialization, area, radiusKm, limit, offset } });
  }

  async getDoctorById(doctorId) {
    this._ensureClient();
    return this.client.get(`/doctors/${doctorId}`);
  }

  async getHospitals() {
    this._ensureClient();
    return this.client.get('/hospitals');
  }

  async getHospitalById(hospitalId) {
    this._ensureClient();
    return this.client.get(`/hospitals/${hospitalId}`);
  }

  async getHospitalFollowers(hospitalId) {
    this._ensureClient();
    return this.client.get(`/hospitals/${hospitalId}/followers`);
  }

  async followHospital({ hospitalId, userId }) {
    this._ensureClient();
    return this.client.post(`/hospitals/${hospitalId}/follow`, { userId });
  }

  async getFollowedHospitals(userId) {
    this._ensureClient();
    return this.client.get(`/users/${userId}/followed-hospitals`);
  }

  async getBloodRequests() {
    this._ensureClient();
    return this.client.get('/blood-requests');
  }

  async getBloodRequestById(bloodRequestId) {
    this._ensureClient();
    return this.client.get(`/blood-requests/${bloodRequestId}`);
  }

  async createBloodRequest(payload) {
    this._ensureClient();
    return this.client.post('/blood-requests', payload);
  }

  async fulfillBloodRequest(bloodRequestId) {
    this._ensureClient();
    return this.client.patch(`/blood-requests/${bloodRequestId}/status`, { status: BLOOD_REQUEST_STATUS.FULFILLED });
  }

  async closeBloodRequest(bloodRequestId) {
    this._ensureClient();
    return this.client.patch(`/blood-requests/${bloodRequestId}/status`, { status: BLOOD_REQUEST_STATUS.CLOSED });
  }

  async expireBloodRequest(bloodRequestId) {
    this._ensureClient();
    return this.client.patch(`/blood-requests/${bloodRequestId}/status`, { status: BLOOD_REQUEST_STATUS.EXPIRED });
  }

  async createBloodRequestResponse({ bloodRequestId, donorId, message }) {
    this._ensureClient();
    return this.client.post(`/blood-requests/${bloodRequestId}/responses`, { donorId, message });
  }

  async getBloodRequestResponses(bloodRequestId) {
    this._ensureClient();
    return this.client.get(`/blood-requests/${bloodRequestId}/responses`);
  }

  async sendConnectionRequest({ patientId, doctorId, notes }) {
    this._ensureClient();
    return this.client.post('/connections', { patientId, doctorId, notes });
  }

  async acceptConnection(connectionId) {
    this._ensureClient();
    return this.client.patch(`/connections/${connectionId}/accept`);
  }

  async rejectConnection(connectionId) {
    this._ensureClient();
    return this.client.patch(`/connections/${connectionId}/reject`);
  }

  async getConnectionStatus({ patientId, doctorId }) {
    this._ensureClient();
    const response = await this.client.get('/connections', { params: { patientId, doctorId } });
    return response.status || CONNECTION_STATUS.NOT_CONNECTED;
  }

  async canMessage({ patientId, doctorId }) {
    const status = await this.getConnectionStatus({ patientId, doctorId });
    return status === CONNECTION_STATUS.ACCEPTED;
  }

  async getPatientConnections({ patientId, status }) {
    this._ensureClient();
    return this.client.get('/connections', { params: { patientId, status } });
  }

  async getDoctorConnections({ doctorId, status }) {
    this._ensureClient();
    return this.client.get('/connections', { params: { doctorId, status } });
  }

  async getAppointmentsByUser({ userId, role }) {
    this._ensureClient();
    return this.client.get('/appointments', { params: { userId, role } });
  }

  async createAppointment({ doctorId, patientId, date, time }) {
    this._ensureClient();
    return this.client.post('/appointments', { doctorId, patientId, date, time });
  }

  async updateAppointmentStatus(appointmentId, status) {
    this._ensureClient();
    return this.client.patch(`/appointments/${appointmentId}/status`, { status });
  }

  async getDoctorAvailability(doctorId) {
    this._ensureClient();
    return this.client.get(`/doctors/${doctorId}/availability`);
  }

  async getConversationsForUser(userId) {
    this._ensureClient();
    return this.client.get('/conversations', { params: { userId } });
  }

  async getMessagesForConversation(conversationId) {
    this._ensureClient();
    return this.client.get(`/conversations/${conversationId}/messages`);
  }

  async sendMessage({ conversationId, senderId, receiverId, body, attachments }) {
    this._ensureClient();
    return this.client.post(`/conversations/${conversationId}/messages`, { senderId, receiverId, body, attachments });
  }

  async markMessagesRead({ conversationId, userId }) {
    this._ensureClient();
    return this.client.patch(`/conversations/${conversationId}/messages/read`, { userId });
  }

  async getReportsByUser(userId) {
    this._ensureClient();
    return this.client.get('/reports', { params: { userId } });
  }

  async processMedicalReport(report) {
    this._ensureClient();
    return this.client.post('/reports/process', { fileName: report.fileName, fileType: report.fileType });
  }

  async shareReportWithDoctor({ reportId, doctorId, patientId }) {
    this._ensureClient();
    return this.client.post(`/reports/${reportId}/share`, { doctorId, patientId });
  }

  async searchMedicines(query) {
    this._ensureClient();
    return this.client.get('/medicines', { params: { query } });
  }

  async matchMedicine(medicineName) {
    this._ensureClient();
    return this.client.get(`/medicines/${encodeURIComponent(medicineName)}`);
  }

  async getPrescription() {
    this._ensureClient();
    return this.client.get('/prescriptions/latest');
  }

  async createNotification(payload) {
    this._ensureClient();
    return this.client.post('/notifications', payload);
  }
}

export default ApiRepository;
