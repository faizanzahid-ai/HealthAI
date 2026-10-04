import { CONNECTION_STATUS } from '../models';

export class ConnectionRepository {
  async sendConnectionRequest({ patientId, doctorId, notes }) {
    throw new Error(
      'ConnectionRepository.sendConnectionRequest must be implemented by a concrete repository.',
    );
  }

  async acceptConnection(connectionId) {
    throw new Error(
      'ConnectionRepository.acceptConnection must be implemented by a concrete repository.',
    );
  }

  async rejectConnection(connectionId) {
    throw new Error(
      'ConnectionRepository.rejectConnection must be implemented by a concrete repository.',
    );
  }

  async getConnectionStatus({ patientId, doctorId }) {
    throw new Error(
      'ConnectionRepository.getConnectionStatus must be implemented by a concrete repository.',
    );
  }

  async getPatientConnections({ patientId, status }) {
    throw new Error(
      'ConnectionRepository.getPatientConnections must be implemented by a concrete repository.',
    );
  }

  async getDoctorConnections({ doctorId, status }) {
    throw new Error(
      'ConnectionRepository.getDoctorConnections must be implemented by a concrete repository.',
    );
  }

  async getConnections({ patientId, doctorId }) {
    throw new Error(
      'ConnectionRepository.getConnections must be implemented by a concrete repository.',
    );
  }

  async canMessage({ patientId, doctorId }) {
    const status = await this.getConnectionStatus({ patientId, doctorId });
    return status === CONNECTION_STATUS.ACCEPTED;
  }
}

export const MessagingUnavailable = new Error(
  'Messaging is only available after a connection is ACCEPTED.',
);

export default ConnectionRepository;
