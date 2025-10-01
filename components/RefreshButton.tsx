'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import styles from './RefreshButton.module.scss';

interface RefreshButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function RefreshButton({ 
  className = '', 
  size = 'md', 
  variant = 'primary' 
}: RefreshButtonProps) {
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

  const buttonClass = `${styles.refreshButton} ${styles[size]} ${styles[variant]} ${className}`;

  return (
    <button
      className={buttonClass}
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh all data"
    >
      <RefreshCw className={`${styles.icon} ${isRefreshing ? styles.spinning : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
    </button>
  );
}
