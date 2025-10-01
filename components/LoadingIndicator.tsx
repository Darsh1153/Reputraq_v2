'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import styles from './LoadingIndicator.module.scss';

export function LoadingIndicator() {
  const { loading, loadingMessage } = useAppSelector((state) => state.news);

  console.log('LoadingIndicator - loading:', loading, 'message:', loadingMessage);

  if (!loading) return null;

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner}></div>
        <div className={styles.text}>
          <div className={styles.title}>Collecting Data</div>
          <div className={styles.subtitle}>
            {loadingMessage || 'Fetching latest news and social media posts...'}
          </div>
        </div>
      </div>
    </div>
  );
}
