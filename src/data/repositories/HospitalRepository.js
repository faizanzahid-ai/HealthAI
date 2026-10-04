export class HospitalRepository {
  async getHospitals() {
    throw new Error('HospitalRepository.getHospitals must be implemented by a concrete repository.');
  }

  async getHospitalById(hospitalId) {
    throw new Error('HospitalRepository.getHospitalById must be implemented by a concrete repository.');
  }

  async followHospital({ hospitalId, userId }) {
    throw new Error('HospitalRepository.followHospital must be implemented by a concrete repository.');
  }
}

export default HospitalRepository;
