/**
 * @file Unit tests for MedicalReportService and ReportSummary generation.
 */

import {
  MedicalReportService,
  MockMedicalReportService,
  RealMedicalReportService,
} from '../../../src/services/MedicalReportService';
import { ReportSummary } from '../../../src/data/models';

describe('MedicalReportService', () => {
  describe('MockMedicalReportService.process', () => {
    const service = new MockMedicalReportService();

    test('throws from base class', async () => {
      const base = new MedicalReportService();
      await expect(base.process({})).rejects.toThrow();
    });

    test('processes a report and returns summary', async () => {
      const result = await service.process({
        id: 'report-1',
        fileName: 'blood-test.pdf',
      });

      expect(result.id).toBe('report-1');
      expect(result.fileName).toBe('blood-test.pdf');
      expect(result.aiSummaryUrdu).toContain('آپ');
      expect(result.importantFindings.length).toBeGreaterThan(0);
      expect(result.disclaimer).toContain('informational only');
    });

    test('uses fallback summary for unknown file name', async () => {
      const result = await service.process({ fileName: 'unknown.pdf' });
      expect(result.aiSummaryUrdu).toContain('آپ');
      expect(result.disclaimer).toBeTruthy();
    });
  });

  describe('MockMedicalReportService.generateSummary', () => {
    const service = new MockMedicalReportService();

    test('generates a ReportSummary object with Urdu content', async () => {
      const summary = await service.generateSummary({
        id: 'report-1',
        fileName: 'blood-test.pdf',
      });

      expect(summary).toBeInstanceOf(ReportSummary);
      expect(summary.summaryUrdu).toContain('آپ');
      expect(summary.importantFindings).toBeInstanceOf(Array);
      expect(summary.abnormalValues).toBeInstanceOf(Array);
      expect(summary.questions).toBeInstanceOf(Array);
      expect(summary.disclaimer).toContain('not a diagnosis');
    });

    test('includes questions to ask the doctor', async () => {
      const summary = await service.generateSummary({ fileName: 'thyroid-panel.pdf' });
      expect(summary.questions.length).toBeGreaterThan(0);
      expect(summary.questions[0]).toContain('?') || expect(summary.questions[0].length).toBeGreaterThan(0);
    });
  });

  describe('RealMedicalReportService', () => {
    test('throws "not implemented" error', async () => {
      const service = new RealMedicalReportService();
      await expect(service.process({})).rejects.toThrow('not implemented');
    });
  });
});




