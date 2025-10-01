'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import styles from './DateRangeSlider.module.scss';

interface DateRangeSliderProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onKeywordChange?: (keyword: string) => void;
  keywords?: string[];
  className?: string;
}

interface DatePreset {
  label: string;
  days: number;
  icon: React.ReactNode;
}

const datePresets: DatePreset[] = [
  { label: 'Last 7 days', days: 7, icon: <Calendar className="w-4 h-4" /> },
  { label: 'Last 14 days', days: 14, icon: <Clock className="w-4 h-4" /> },
  { label: 'Last 30 days', days: 30, icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Last 90 days', days: 90, icon: <BarChart3 className="w-4 h-4" /> },
];

export function DateRangeSlider({ 
  onDateRangeChange, 
  onKeywordChange, 
  keywords = [],
  className = '' 
}: DateRangeSliderProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Initialize with last 30 days
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    
    // Trigger initial callback only once
    onDateRangeChange(
      thirtyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }, []); // Empty dependency array to run only once

  const handlePresetClick = (days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setIsCustomRange(false);
    
    onDateRangeChange(
      startDate.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      setIsCustomRange(true);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleKeywordChange = (keyword: string) => {
    setSelectedKeyword(keyword);
    if (onKeywordChange) {
      onKeywordChange(keyword === 'all' ? '' : keyword);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateRangeLabel = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return 'Select date range';
  };

  return (
    <div className={`${styles.dateRangeSlider} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <Filter className="w-5 h-5" />
          <span>Data Filter</span>
        </div>
        <div className={styles.dateRangeLabel}>
          {getDateRangeLabel()}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className={styles.presets}>
        <div className={styles.presetLabel}>Quick Filters:</div>
        <div className={styles.presetButtons}>
          {datePresets.map((preset) => (
            <button
              key={preset.days}
              className={`${styles.presetButton} ${
                !isCustomRange && 
                startDate && 
                endDate && 
                Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) === preset.days
                  ? styles.active 
                  : ''
              }`}
              onClick={() => handlePresetClick(preset.days)}
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className={styles.customRange}>
        <div className={styles.customRangeLabel}>Custom Range:</div>
        <div className={styles.dateInputs}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="startDate">From:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleCustomDateChange}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="endDate">To:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleCustomDateChange}
              className={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {/* Keyword Filter */}
      {keywords.length > 0 && (
        <div className={styles.keywordFilter}>
          <div className={styles.keywordLabel}>Keyword:</div>
          <select
            value={selectedKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className={styles.keywordSelect}
          >
            <option value="all">All Keywords</option>
            {keywords.map((keyword) => (
              <option key={keyword} value={keyword}>
                {keyword}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Apply Button */}
      <div className={styles.actions}>
        <button
          className={styles.applyButton}
          onClick={handleCustomDateChange}
          disabled={!startDate || !endDate}
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}

export default DateRangeSlider;
