import { useRef, useCallback } from 'react';
import { exportService, ExportData } from '@/services/exportService';

export function usePDFExport() {
  const targetRef = useRef<HTMLDivElement>(null);

  const exportToPDF = useCallback(async (data: ExportData, customTitle?: string) => {
    try {
      await exportService.exportToPDF(data, targetRef.current || undefined);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }, []);

  const exportToPDFWithElement = useCallback(async (data: ExportData, element: HTMLElement) => {
    try {
      await exportService.exportToPDF(data, element);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }, []);

  return {
    targetRef,
    exportToPDF,
    exportToPDFWithElement
  };
}
