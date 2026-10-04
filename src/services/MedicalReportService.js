import { ReportSummary } from '../data/models';

export class MedicalReportService {
  async process(payload) {
    throw new Error('MedicalReportService.process must be implemented by a concrete service.');
  }

  async generateSummary(payload) {
    throw new Error(
      'MedicalReportService.generateSummary must be implemented by a concrete service.',
    );
  }
}

const demoDisclaimer =
  'AI-generated information is provided for informational only and organizational purposes. It is not a diagnosis, prescription, or substitute for professional medical advice. Always consult a qualified healthcare professional for medical decisions.';

const demoSummaries = {
  'blood-test.pdf': {
    summaryUrdu: 'آپ کے خون کے ٹیسٹ میں انکوبسیلینٹ اور گلوکوز کی مقدار غیر معمولی ہے۔ براہ کرم اپنے ڈاکٹر سے مشاورت کریں۔',
    importantFindings: ['Hemoglobin is lower than expected.', 'Fasting glucose is elevated.'],
    abnormalValues: ['Hemoglobin: 11.8 g/dL (low)', 'Glucose: 134 mg/dL (high)'],
    plainLanguage: 'Some values in your blood test are outside the typical range. This needs review with your doctor.',
    questions: ['Should I adjust my diet?', 'Do I need medication?', 'When should I re-test?'],
  },
  'ct-scan-chest.png': {
    summaryUrdu: 'چیسٹ کے ایس ٹی ایس سکین میں ایک نیوکیمپلیکس لیسینٹ نوٹ ہوئی ہے۔ ڈاکٹر کی جانچ کی ضرورت ہے۔',
    importantFindings: ['Lesion noted in right upper lobe for follow-up.', 'No pleural effusion.'],
    abnormalValues: ['Lesion size: 2.3 cm'],
    plainLanguage: 'An area was seen in the upper part of your lung that needs follow-up with your doctor.',
    questions: ['Is this serious?', 'Do I need a biopsy?', 'How often should I scan?'],
  },
  'liver-function.jpg': {
    summaryUrdu: 'آئی ٹی ایلٹریشن اور ایس ٹی ایل کی مقدار میں اضافہ ہے۔ گردہ اور اینٹی بوڈی کی جانچ کی ضرورت ہے۔',
    importantFindings: ['ALT and AST are mildly elevated.', 'Bilirubin is within normal range.'],
    abnormalValues: ['ALT: 62 U/L (mildly high)', 'AST: 54 U/L (mildly high)'],
    plainLanguage: 'Your liver enzymes are slightly elevated. This can happen for many reasons and needs doctor review.',
    questions: ['Should I stop alcohol?', 'Do I need medication?', 'Are my medications safe for my liver?'],
  },
  'x-ray-chest.jpeg': {
    summaryUrdu: 'چیسٹ ایکس رے کے نتائج عام طور پر اچھے ہیں۔ کوئی ایمرجنسی نہیں۔',
    importantFindings: ['Chest X-ray reviewed. No acute findings.'],
    abnormalValues: [],
    plainLanguage: 'Your chest X-ray looks normal with no acute concerns.',
    questions: ['Any follow-up needed?'],
  },
  'mammogram-view.jpg': {
    summaryUrdu: 'میموگرام کا نتیجہ عام طور پر نیک ہے۔ مساوی گھنے پن کو مانیجمنٹ کے لئے دیکھیں۔',
    importantFindings: ['No acute findings in either breast.', 'Fibroglandular density noted.'],
    abnormalValues: ['Density: fibroglandular'],
    plainLanguage: 'No concerning masses seen, but breast density is noted which may need additional screening.',
    questions: ['Do I need additional imaging?', 'Should I do self-exams?'],
  },
  'thyroid-panel.pdf': {
    summaryUrdu: 'ٹی شی ہائی ہے جو امکانی ہائپوتھائروئڈ کی علامت ہے۔ ڈاکٹر سے مشاورت کریں۔',
    importantFindings: ['TSH is elevated, suggesting possible hypothyroidism.', 'Free T4 is on the low side.'],
    abnormalValues: ['TSH: 4.2 mIU/L (high)', 'Free T4: 0.9 ng/dL (low-normal)'],
    plainLanguage: 'Your thyroid hormone levels suggest your thyroid may not be working at full capacity.',
    questions: ['Do I need thyroid medication?', 'Should I re-test?', 'What are the symptoms to watch?'],
  },
  'kidney-function.csv': {
    summaryUrdu: 'کچر میں کام کے انڈکس معمولی ہیں۔ نیوزوری کی مانیٹرنگ جاری رکھیں۔',
    importantFindings: ['Kidney function markers are within normal limits.', 'Stay hydrated.'],
    abnormalValues: [],
    plainLanguage: 'Your kidney function looks normal. Keep monitoring with your doctor.',
    questions: ['How often should I re-check?', 'Any dietary restrictions?'],
  },
  'ecg-report.pdf': {
    summaryUrdu: 'ای سی جی کے نتائج عام طور پر درست ہیں۔ سینس ردھی میں ہے۔',
    importantFindings: ['Sinus rhythm maintained. No ST changes noted.'],
    abnormalValues: [],
    plainLanguage: 'Your heart rhythm is normal. No signs of strain or blockage seen.',
    questions: ['Any medication adjustments?', 'Follow-up ECG needed?'],
  },
  'lipid-profile.pdf': {
    summaryUrdu: 'لپڈ پروفائل میں LDL اور ٹرائی گلیرائڈز کم ہیں۔ غذائیتی ڈائی کی ضرورت ہے۔',
    importantFindings: ['LDL cholesterol is elevated.', 'HDL is low.', 'Triglycerides mildly elevated.'],
    abnormalValues: ['LDL: 142 mg/dL (high)', 'HDL: 42 mg/dL (low)', 'Triglycerides: 165 mg/dL (borderline)'],
    plainLanguage: 'Your cholesterol levels need attention. Diet and possibly medication may be recommended.',
    questions: ['Should I change my diet?', 'Do I need medication?', 'How long to see improvement?'],
  },
  'blood-pressure-log.pdf': {
    summaryUrdu: 'بلڈ پریشر کا لاگ تیار ہے۔ ڈاکٹر کی مشاورت کے ساتھ دیکھیں۔',
    importantFindings: ['Blood pressure log recorded. Review trends with provider.'],
    abnormalValues: [],
    plainLanguage: 'Your blood pressure readings have been logged for doctor review.',
    questions: ['Are my readings normal?', 'Any medication changes?'],
  },
};

export class MockMedicalReportService extends MedicalReportService {
  async process(payload) {
    const fileName = payload?.fileName || 'demo-report.pdf';
    const demo = demoSummaries[fileName] || demoSummaries['blood-test.pdf'];

    return {
      id: payload?.id || `report-demo-${Date.now()}`,
      fileName,
      processedAt: new Date().toISOString(),
      extractedInformation: payload?.extractedInformation || {
        summary: 'Sample extraction result',
      },
      aiSummaryUrdu: demo.summaryUrdu,
      importantFindings: demo.importantFindings,
      abnormalValues: demo.abnormalValues,
      plainLanguage: demo.plainLanguage,
      questions: demo.questions,
      confidence: payload?.confidence || '85%',
      disclaimer: demoDisclaimer,
    };
  }

  async generateSummary(report) {
    const fileName = report?.fileName || 'demo-report.pdf';
    const demo = demoSummaries[fileName] || demoSummaries['blood-test.pdf'];

    return new ReportSummary({
      id: `summary-${report?.id || Date.now()}`,
      reportId: report?.id,
      summaryUrdu: demo.summaryUrdu,
      importantFindings: demo.importantFindings,
      abnormalValues: demo.abnormalValues,
      plainLanguage: demo.plainLanguage,
      questions: demo.questions,
      disclaimer: demoDisclaimer,
      confidence: report?.confidence || '85%',
      generatedAt: new Date().toISOString(),
    });
  }
}

export class RealMedicalReportService extends MedicalReportService {
  async process(payload) {
    throw new Error(
      'RealMedicalReportService is not implemented in the prototype. Use MockMedicalReportService.',
    );
  }
}

export default MedicalReportService;
