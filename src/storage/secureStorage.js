import AsyncStorage from '@react-native-async-storage/async-storage';

export const secureStorage = {
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Unable to store secure value:', error?.message || 'storage-error');
    }
  },

  async getItem(key) {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Unable to read secure value:', error?.message || 'storage-error');
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Unable to clear secure value:', error?.message || 'storage-error');
    }
  },
};

export default secureStorage;
