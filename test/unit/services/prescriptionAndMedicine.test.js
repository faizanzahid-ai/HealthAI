/**
 * @file Unit tests for PrescriptionOCRService and MedicineMatchingService.
 */

import {
  PrescriptionOCRService,
  MockPrescriptionOCRService,
  RealPrescriptionOCRService,
  lowConfidenceDisclaimer,
} from '../../../src/services/PrescriptionOCRService';
import {
  MedicineMatchingService,
  MockMedicineMatchingService,
} from '../../../src/services/MedicineMatchingService';
import { PrescriptionMedicine, MedicinePrice } from '../../../src/data/models';

describe('PrescriptionOCRService', () => {
  describe('MockPrescriptionOCRService.extract', () => {
    const service = new MockPrescriptionOCRService();

    test('throws from base class', async () => {
      const base = new PrescriptionOCRService();
      await expect(base.extract({})).rejects.toThrow();
    });

    test('extracts medicine information with confidence', async () => {
      const result = await service.extract({});
      expect(result.medicines.length).toBeGreaterThan(0);
      expect(result.confidence).toBeTruthy();
      expect(result.disclaimer).toContain('verify');
    });

    test('sets verificationRequired flag when confidence is low', async () => {
      const result = await service.extract({
        demoMedicine: {
          medicineName: 'Amoxicillin',
          strength: '500 mg',
          dose: '1 capsule',
          frequency: 'Three times daily',
          duration: '7 days',
          confidence: '72%',
        },
      });
      expect(result.verificationRequired).toBe(true);
      expect(result.lowConfidenceDisclaimer).toBe(lowConfidenceDisclaimer);
    });

    test('does not set verificationRequired when confidence is high', async () => {
      const result = await service.extract({
        demoMedicine: {
          medicineName: 'Metformon',
          strength: '500 mg',
          dose: '1 tablet',
          frequency: 'Twice daily',
          duration: '30 days',
          confidence: '95%',
        },
      });
      expect(result.verificationRequired).toBe(false);
      expect(result.lowConfidenceDisclaimer).toBeNull();
    });

    test('includes medicine price information', async () => {
      const result = await service.extract({});
      expect(result.price).toBeInstanceOf(MedicinePrice);
      expect(result.price.source).toBe('Demo Price');
      expect(result.price.disclaimer || result.disclaimer).toBeTruthy();
    });

    test('returns a PrescriptionMedicine object', async () => {
      const result = await service.extract({});
      expect(result.medicines[0]).toBeInstanceOf(PrescriptionMedicine);
    });
  });

  describe('RealPrescriptionOCRService', () => {
    test('throws "not implemented" error', async () => {
      const service = new RealPrescriptionOCRService();
      await expect(service.extract({})).rejects.toThrow('not implemented');
    });
  });
});

describe('MedicineMatchingService', () => {
  describe('MockMedicineMatchingService.matchMedicine', () => {
    const service = new MockMedicineMatchingService();

    test('throws from base class', async () => {
      const base = new MedicineMatchingService();
      await expect(base.matchMedicine({ medicineName: 'Test' })).rejects.toThrow();
    });

    test('returns medicine price for known medicine', async () => {
      const result = await service.matchMedicine({ medicineName: 'Metformin' });
      expect(result).toBeInstanceOf(MedicinePrice);
      expect(result.medicineName).toBe('Metformin');
      expect(result.currency).toBe('PKR');
      expect(result.source).toBe('Demo Price');
      expect(result.price).toBe(180);
    });

    test('returns N/A for unknown medicine', async () => {
      const result = await service.matchMedicine({ medicineName: 'NonExistentMedicine' });
      expect(result.price).toBe('N/A');
      expect(result.disclaimer).toContain('Demo pricing');
    });
  });

  describe('MockMedicineMatchingService.searchMedicines', () => {
    const service = new MockMedicineMatchingService();

    test('returns matching medicines by partial name', async () => {
      const results = await service.searchMedicines('met');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((m) => m.medicineName === 'Metformin')).toBe(true);
    });

    test('returns empty for non-matching query', async () => {
      const results = await service.searchMedicines('zzz-nonexistent');
      expect(results.length).toBe(0);
    });

    test('returns MedicinePrice instances', async () => {
      const results = await service.searchMedicines('par');
      expect(results[0]).toBeInstanceOf(MedicinePrice);
    });
  });
});




