import { PrescriptionMedicine, MedicinePrice } from '../data/models';

export class PrescriptionOCRService {
  async extract(payload) {
    throw new Error('PrescriptionOCRService.extract must be implemented by a concrete service.');
  }
}

const lowConfidenceDisclaimer =
  'Low confidence — please verify against the original prescription before taking any medicine.';

const demoMedicineCatalogue = [
  {
    medicineName: 'Metformin',
    strength: '500 mg',
    dose: '1 tablet',
    frequency: 'Twice daily',
    duration: '30 days',
    confidence: '92%',
  },
  {
    medicineName: 'Paracetamol',
    strength: '500 mg',
    dose: '1 tablet',
    frequency: 'Three times daily',
    duration: '5 days',
    confidence: '88%',
  },
  {
    medicineName: 'Amoxicillin',
    strength: '500 mg',
    dose: '1 capsule',
    frequency: 'Three times daily',
    duration: '7 days',
    confidence: '75%',
  },
  {
    medicineName: 'Atorvastatin',
    strength: '20 mg',
    dose: '1 tablet',
    frequency: 'Once daily',
    duration: '30 days',
    confidence: '90%',
  },
  {
    medicineName: 'Omeprazole',
    strength: '20 mg',
    dose: '1 capsule',
    frequency: 'Once daily',
    duration: '14 days',
    confidence: '85%',
  },
  {
    medicineName: 'Losartan',
    strength: '50 mg',
    dose: '1 tablet',
    frequency: 'Once daily',
    duration: '30 days',
    confidence: '87%',
  },
  {
    medicineName: 'Amlodipine',
    strength: '5 mg',
    dose: '1 tablet',
    frequency: 'Once daily',
    duration: '30 days',
    confidence: '91%',
  },
];

function getDemoMedicine(index) {
  return demoMedicineCatalogue[(index || 0) % demoMedicineCatalogue.length];
}

export class MockPrescriptionOCRService extends PrescriptionOCRService {
  constructor(medicineCatalogue = demoMedicineCatalogue) {
    super();
    this.medicineCatalogue = medicineCatalogue;
  }

  async extract(payload) {
    const demo = payload?.demoMedicine
      ? payload.demoMedicine
      : getDemoMedicine(0);

    const confidenceValue = parseInt(demo.confidence, 10) || 0;
    const verificationRequired = confidenceValue < 80;

    const medicine = new PrescriptionMedicine({
      id: `med-${Date.now()}`,
      medicineName: demo.medicineName,
      strength: demo.strength,
      dose: demo.dose,
      frequency: demo.frequency,
      duration: demo.duration,
      confidence: demo.confidence,
      source: 'Demo catalogue',
    });

    const price = new MedicinePrice({
      id: `price-${Date.now()}`,
      medicineName: demo.medicineName,
      price: this.getPriceForMedicine(demo.medicineName),
      currency: 'PKR',
      source: 'Demo Price',
    });

    return {
      id: `ocr-${Date.now()}`,
      medicines: [medicine],
      price,
      confidence: demo.confidence,
      verificationRequired,
      lowConfidenceDisclaimer: verificationRequired ? lowConfidenceDisclaimer : null,
      warning:
        confidenceValue < 90
          ? 'Handwritten prescriptions can be hard to read. Verify every medicine, strength and dose with your doctor or pharmacist.'
          : null,
      processedAt: new Date().toISOString(),
      disclaimer:
        'This is a demo OCR result. Always verify medicines and dosages against your original prescription.',
    };
  }

  getPriceForMedicine(medicineName) {
    const prices = {
      Metformin: 180,
      Paracetamol: 45,
      Amoxicillin: 250,
      Atorvastatin: 220,
      Omeprazole: 180,
      Losartan: 110,
      Amlodipine: 75,
    };
    return `${prices[medicineName] || 0}`;
  }
}

export class RealPrescriptionOCRService extends PrescriptionOCRService {
  async extract() {
    throw new Error(
      'RealPrescriptionOCRService is not implemented in the prototype. Use MockPrescriptionOCRService.',
    );
  }
}

export { lowConfidenceDisclaimer };

export default {
  PrescriptionOCRService,
  MockPrescriptionOCRService,
  RealPrescriptionOCRService,
};
