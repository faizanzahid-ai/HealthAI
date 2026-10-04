export class PrescriptionRepository {
  async getPrescriptionsForUser(userId) {
    throw new Error('PrescriptionRepository.getPrescriptionsForUser must be implemented by a concrete repository.');
  }

  async scanPrescription(payload) {
    throw new Error('PrescriptionRepository.scanPrescription must be implemented by a concrete repository.');
  }
}

export default PrescriptionRepository;
