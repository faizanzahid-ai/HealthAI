export class DoctorRepository {
  async getDoctors() {
    throw new Error('DoctorRepository.getDoctors must be implemented by a concrete repository.');
  }

  async getDoctorById(doctorId) {
    throw new Error('DoctorRepository.getDoctorById must be implemented by a concrete repository.');
  }
}

export default DoctorRepository;
