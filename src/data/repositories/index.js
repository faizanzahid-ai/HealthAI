export { default as MockRepository } from './MockRepository';
export { default as ApiRepository } from './ApiRepository';
export { default as repositoryFactory } from './repositoryFactory';
export { default as AuthRepository } from './AuthRepository';
export { default as UserRepository } from './UserRepository';
export { default as DoctorRepository } from './DoctorRepository';
export { default as HospitalRepository } from './HospitalRepository';
export { default as ConnectionRepository, MessagingUnavailable } from './ConnectionRepository';
export { default as AppointmentRepository } from './AppointmentRepository';
export { default as MessageRepository } from './MessageRepository';
export { default as MedicalReportRepository } from './MedicalReportRepository';
export { default as PrescriptionRepository } from './PrescriptionRepository';
export { default as BloodDonationRepository } from './BloodDonationRepository';
export { default as NotificationRepository } from './NotificationRepository';

export const repositoryContracts = {
  auth: 'AuthRepository',
  user: 'UserRepository',
  doctor: 'DoctorRepository',
  hospital: 'HospitalRepository',
  connection: 'ConnectionRepository',
  appointment: 'AppointmentRepository',
  message: 'MessageRepository',
  medicalReport: 'MedicalReportRepository',
  prescription: 'PrescriptionRepository',
  bloodDonation: 'BloodDonationRepository',
  notification: 'NotificationRepository',
};
