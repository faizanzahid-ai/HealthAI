import ApiRepository from './ApiRepository';
import MockRepository from './MockRepository';

export const repositoryFactory = ({ mode = 'mock', client } = {}) => {
  if (mode === 'api') {
    return new ApiRepository({ client });
  }

  return new MockRepository();
};

export default repositoryFactory;
