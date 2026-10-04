export class MedicalReportRepository {
  async getReportsForUser(userId) {
    throw new Error('MedicalReportRepository.getReportsForUser must be implemented by a concrete repository.');
  }

  async processReport(payload) {
    throw new Error('MedicalReportRepository.processReport must be implemented by a concrete repository.');
  }
}

export default MedicalReportRepository;
