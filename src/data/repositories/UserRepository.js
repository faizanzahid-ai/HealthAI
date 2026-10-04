export class UserRepository {
  async getUserById(userId) {
    throw new Error('UserRepository.getUserById must be implemented by a concrete repository.');
  }

  async getUsers() {
    throw new Error('UserRepository.getUsers must be implemented by a concrete repository.');
  }
}

export default UserRepository;
