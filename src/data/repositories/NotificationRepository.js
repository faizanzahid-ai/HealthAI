export class NotificationRepository {
  async getNotificationsForUser(userId) {
    throw new Error('NotificationRepository.getNotificationsForUser must be implemented by a concrete repository.');
  }

  async markAllAsRead(userId) {
    throw new Error('NotificationRepository.markAllAsRead must be implemented by a concrete repository.');
  }
}

export default NotificationRepository;
