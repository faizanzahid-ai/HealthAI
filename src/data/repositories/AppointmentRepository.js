export class AppointmentRepository {
  async getAppointmentsByUser(userId) {
    throw new Error('AppointmentRepository.getAppointmentsByUser must be implemented by a concrete repository.');
  }

  async createAppointment(payload) {
    throw new Error('AppointmentRepository.createAppointment must be implemented by a concrete repository.');
  }
}

export default AppointmentRepository;
