'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { exportService, ExportData, ExportFormat } from '@/services/exportService';
import styles from './ExportButton.module.scss';

interface ExportButtonProps {
  data: ExportData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  targetElementRef?: React.RefObject<HTMLElement>;
}

const formatIcons = {
  pdf: FileText,
  csv: FileSpreadsheet,
  xls: File
};

export default function ExportButton({ 
  data, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  showLabel = true,
  targetElementRef
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      switch (format) {
        case 'pdf':
          // Wait for dropdown to close and UI to stabilize
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Ensure the target element is available and stable
          if (!targetElementRef?.current) {
            throw new Error('Target element not found for PDF export');
          }
          
          await exportService.exportToPDF(data, targetElementRef.current);
          break;
        case 'csv':
          await exportService.exportToCSV(data);
          break;
        case 'xls':
          await exportService.exportToXLS(data);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = exportService.getExportOptions(data.metadata?.section || 'data');

  return (
    <div className={`${styles.exportContainer} ${className}`}>
      <button
        className={`${styles.exportButton} ${styles[variant]} ${styles[size]}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        <Download size={16} />
        {showLabel && (
          <span>
            {isExporting ? 'Exporting...' : 'Export'}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h4>Export Data</h4>
              <p>Choose your preferred format</p>
            </div>
            
            <div className={styles.exportOptions}>
              {exportOptions.map((option) => {
                const IconComponent = formatIcons[option.format];
                return (
                  <button
                    key={option.format}
                    className={styles.exportOption}
                    onClick={() => handleExport(option.format)}
                    disabled={isExporting}
                  >
                    <IconComponent size={18} />
                    <div className={styles.optionContent}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      <span className={styles.optionDescription}>
                        {option.format.toUpperCase()} format
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {data.metadata && (
              <div className={styles.exportInfo}>
                <p>Total Records: {data.metadata.totalRecords}</p>
                <p>Generated: {new Date(data.metadata.generatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
