'use client';

import React from 'react';
import { usePDFExport } from '@/lib/hooks/usePDFExport';
import PDFTemplate from './PDFTemplate';
import ExportButton from './ExportButton';
import { ExportData } from '@/services/exportService';
import styles from './PDFExportExample.module.scss';

interface PDFExportExampleProps {
  data: ExportData;
  title?: string;
  children?: React.ReactNode;
}

export default function PDFExportExample({ 
  data, 
  title = 'Social Listening Report',
  children 
}: PDFExportExampleProps) {
  const { targetRef, exportToPDF } = usePDFExport();

  const handlePDFExport = async () => {
    try {
      await exportToPDF(data, title);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <ExportButton 
          data={data} 
          targetElementRef={targetRef}
          variant="primary"
          showLabel={true}
        />
      </div>
      
      <div ref={targetRef} className={styles.pdfTarget}>
        <PDFTemplate data={data} title={title}>
          {children}
        </PDFTemplate>
      </div>
    </div>
  );
}
