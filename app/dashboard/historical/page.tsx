'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { Clock, BarChart3, Calendar, TrendingUp, Settings } from 'lucide-react';
import CronJobManager from '@/components/CronJobManager';
import HistoricalDataDisplay from '@/components/HistoricalDataDisplay';
import styles from './HistoricalDashboard.module.scss';

export default function HistoricalDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<'historical' | 'cron'>('historical');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Update Redux store with user data
      dispatch(setUser(parsedUser));
    }
    setPageLoading(false);
  }, [dispatch]);

  if (pageLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <span>Loading historical data...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>Please sign in to view historical data</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <BarChart3 className="w-8 h-8" />
          <div>
            <h1>Historical Data & Automation</h1>
            <p>View past data collections and manage automated data collection</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'historical' ? styles.active : ''}`}
          onClick={() => setActiveTab('historical')}
        >
          <Calendar className="w-5 h-5" />
          <span>Historical Data</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'cron' ? styles.active : ''}`}
          onClick={() => setActiveTab('cron')}
        >
          <Clock className="w-5 h-5" />
          <span>Automation Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'historical' && (
          <div className={styles.historicalTab}>
            <HistoricalDataDisplay
              userId={user.id}
              keywords={user.keywords || []}
            />
          </div>
        )}

        {activeTab === 'cron' && (
          <div className={styles.cronTab}>
            <CronJobManager userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
}
