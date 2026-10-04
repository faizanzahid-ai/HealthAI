export class BloodDonationRepository {
  async getBloodRequests() {
    throw new Error('BloodDonationRepository.getBloodRequests must be implemented by a concrete repository.');
  }

  async createBloodRequest(payload) {
    throw new Error('BloodDonationRepository.createBloodRequest must be implemented by a concrete repository.');
  }

  async offerToHelp({ bloodRequestId, donorId, message }) {
    throw new Error('BloodDonationRepository.offerToHelp must be implemented by a concrete repository.');
  }
}

export default BloodDonationRepository;
