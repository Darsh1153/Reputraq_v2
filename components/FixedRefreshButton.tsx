'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import styles from './FixedRefreshButton.module.scss';

export default function FixedRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dataManager.refreshAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      className={styles.fixedRefreshButton}
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh all data"
    >
      <RefreshCw className={`${styles.icon} ${isRefreshing ? styles.spinning : ''}`} />
    </button>
  );
}
