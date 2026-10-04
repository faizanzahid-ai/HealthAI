export class MessageRepository {
  async getConversationsForUser(userId) {
    throw new Error('MessageRepository.getConversationsForUser must be implemented by a concrete repository.');
  }

  async sendMessage(payload) {
    throw new Error('MessageRepository.sendMessage must be implemented by a concrete repository.');
  }
}

export default MessageRepository;
