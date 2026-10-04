import { MedicinePrice } from '../data/models';

export class MedicineMatchingService {
  async matchMedicine({ medicineName }) {
    throw new Error('MedicineMatchingService.matchMedicine must be implemented by a concrete service.');
  }

  async searchMedicines(query) {
    throw new Error('MedicineMatchingService.searchMedicines must be implemented by a concrete service.');
  }
}

const demoPrices = [
  { medicineName: 'Metformin', price: 180, currency: 'PKR' },
  { medicineName: 'Paracetamol', price: 45, currency: 'PKR' },
  { medicineName: 'Amoxicillin', price: 250, currency: 'PKR' },
  { medicineName: 'Atorvastatin', price: 220, currency: 'PKR' },
  { medicineName: 'Omeprazole', price: 180, currency: 'PKR' },
  { medicineName: 'Losartan', price: 110, currency: 'PKR' },
  { medicineName: 'Amlodipine', price: 75, currency: 'PKR' },
  { medicineName: 'Glucophage XR', price: 480, currency: 'PKR' },
  { medicineName: 'Albuterol', price: 320, currency: 'PKR' },
  { medicineName: 'Levothyroxine', price: 95, currency: 'PKR' },
  { medicineName: 'Aspirin', price: 60, currency: 'PKR' },
];

export class MockMedicineMatchingService extends MedicineMatchingService {
  async matchMedicine({ medicineName }) {
    const match = demoPrices.find(
      (entry) => entry.medicineName.toLowerCase() === (medicineName || '').toLowerCase(),
    );

    if (!match) {
      return {
        medicineName: medicineName || 'Unknown',
        price: 'N/A',
        currency: 'PKR',
        source: 'Demo Price',
        lastUpdated: new Date().toISOString(),
        disclaimer: 'Demo pricing only. This is not a current real-world market quote.',
      };
    }

    return new MedicinePrice({
      id: `price-${Date.now()}`,
      medicineName: match.medicineName,
      price: match.price,
      currency: match.currency,
      source: 'Demo Price',
      lastUpdated: new Date().toISOString(),
    });
  }

  async searchMedicines(query) {
    const lower = (query || '').toLowerCase();
    const results = demoPrices.filter((entry) =>
      entry.medicineName.toLowerCase().includes(lower),
    );

    return results.map(
      (entry) =>
        new MedicinePrice({
          id: `price-${entry.medicineName}`,
          medicineName: entry.medicineName,
          price: entry.price,
          currency: entry.currency,
          source: 'Demo Price',
          lastUpdated: new Date().toISOString(),
        }),
    );
  }
}

export class RealMedicineMatchingService extends MedicineMatchingService {
  async matchMedicine() {
    throw new Error(
      'RealMedicineMatchingService is not implemented in the prototype. Use MockMedicineMatchingService.',
    );
  }
}

export default MedicineMatchingService;
