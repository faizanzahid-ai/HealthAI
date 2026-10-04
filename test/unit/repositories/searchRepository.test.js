/**
 * @file Unit tests for doctor search with query matching and radius filtering.
 */

import MockRepository from '../../../src/data/repositories/MockRepository';

describe('DoctorRepository (MockRepository) - Search', () => {
  let repo;

  beforeEach(() => {
    repo = new MockRepository();
  });

  test('returns all doctors when no query', () => {
    const results = repo.searchDoctors({});
    expect(results.length).toBe(10);
  });

  test('finds doctors by name', () => {
    const results = repo.searchDoctors({ query: 'Sara' });
    expect(results.length).toBe(1);
    expect(results[0].name).toContain('Sara');
  });

  test('finds doctors by exact specialization', () => {
    const results = repo.searchDoctors({ query: 'Cardiologist' });
    expect(results.length).toBe(1);
    expect(results[0].specialization).toBe('Cardiologist');
  });

  test('maps Cancer to Oncologist', () => {
    const results = repo.searchDoctors({ query: 'cancer' });
    expect(results.length).toBe(1);
    expect(results[0].specialization).toContain('Oncolog');
  });

  test('maps Brain tumor to Neurologist and Oncologist', () => {
    const results = repo.searchDoctors({ query: 'brain tumor' });
    expect(results.length).toBe(2);
    const specialties = results.map((d) => d.specialization).join('');
    expect(specialties).toContain('Oncolog');
    expect(specialties).toContain('Neurolog');
  });

  test('maps heart/cardiac to Cardiologist', () => {
    const heart = repo.searchDoctors({ query: 'heart' });
    const cardiac = repo.searchDoctors({ query: 'cardiac' });
    expect(heart.length).toBe(1);
    expect(cardiac.length).toBe(1);
    expect(heart[0].specialization).toBe('Cardiologist');
  });

  test('maps orthopedics to Orthopedic Surgeon', () => {
    const results = repo.searchDoctors({ query: 'orthopedics' });
    expect(results.length).toBe(1);
    expect(results[0].specialization).toContain('Orthoped');
  });

  test('filters by specialization', () => {
    const results = repo.searchDoctors({ specialization: 'Oncologist' });
    expect(results.length).toBe(1);
  });

  test('filters by radius', () => {
    const results = repo.searchDoctors({ radiusKm: 10 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.distanceKm <= 10)).toBe(true);
  });

  test('filters by radius within 25km', () => {
    const results = repo.searchDoctors({ radiusKm: 25 });
    expect(results.every((d) => d.distanceKm <= 25)).toBe(true);
  });

  test('returns empty for unknown query', () => {
    const results = repo.searchDoctors({ query: 'xyznonexistentterm' });
    expect(results.length).toBe(0);
  });

  test('supports pagination offset', () => {
    const page1 = repo.searchDoctors({ limit: 5, offset: 0 });
    const page2 = repo.searchDoctors({ limit: 5, offset: 5 });
    expect(page1.length).toBe(5);
    expect(page2.length).toBe(5);
    expect(page1[0].id).not.toBe(page2[0].id);
  });
});




