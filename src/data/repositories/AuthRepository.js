export class AuthRepository {
  async login({ email, password }) {
    throw new Error('AuthRepository.login must be implemented by a concrete repository.');
  }

  async logout() {
    throw new Error('AuthRepository.logout must be implemented by a concrete repository.');
  }
}

export default AuthRepository;
