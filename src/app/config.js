export const APP_MODE = process.env.APP_MODE || 'mock';

export const appConfig = {
  mode: APP_MODE,
  demoPassword: 'nexcure-demo',
  maxSearchRadiusKm: 25,
  allowedRoles: ['PATIENT', 'DOCTOR', 'HOSPITAL', 'DONOR'],
};

export default appConfig;
