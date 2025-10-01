'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Settings, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import styles from './CronJobManager.module.scss';

interface CronJobSettings {
  id: number;
  userId: number;
  isEnabled: boolean;
  intervalHours: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface CronJobManagerProps {
  userId: number;
  className?: string;
}

export function CronJobManager({ userId, className = '' }: CronJobManagerProps) {
  const [settings, setSettings] = useState<CronJobSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [jobHistory, setJobHistory] = useState<any[]>([]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = btoa(JSON.stringify({ userId }));
      const response = await fetch('/api/cron', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cron settings');
      }

      const result = await response.json();
      setSettings(result.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobHistory = async () => {
    try {
      const token = btoa(JSON.stringify({ userId }));
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'getJobHistory' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job history');
      }

      const result = await response.json();
      setJobHistory(result.jobs || []);
    } catch (err) {
      console.error('Failed to fetch job history:', err);
    }
  };

  const updateSettings = async (updates: Partial<CronJobSettings>) => {
    setSaving(true);
    setError(null);

    try {
      const token = btoa(JSON.stringify({ userId }));
      const response = await fetch('/api/cron', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update cron settings');
      }

      const result = await response.json();
      setSettings(result.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const runDataCollectionNow = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = btoa(JSON.stringify({ userId }));
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'runNow' })
      });

      if (!response.ok) {
        throw new Error('Failed to start data collection');
      }

      // Refresh job history after running
      await fetchJobHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchJobHistory();
  }, [userId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'running': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className={`${styles.cronJobManager} ${className}`}>
        <div className={styles.loading}>
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading cron job settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`${styles.cronJobManager} ${className}`}>
        <div className={styles.error}>
          <AlertCircle className="w-6 h-6" />
          <span>Failed to load cron job settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.cronJobManager} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <Clock className="w-6 h-6" />
          <span>Automated Data Collection</span>
        </div>
        <div className={styles.status}>
          <div className={`${styles.statusIndicator} ${settings.isEnabled ? styles.enabled : styles.disabled}`}>
            {settings.isEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className={styles.settings}>
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <Settings className="w-4 h-4" />
            Collection Interval
          </label>
          <div className={styles.intervalOptions}>
            {[6, 12, 24, 48].map(hours => (
              <button
                key={hours}
                className={`${styles.intervalButton} ${
                  settings.intervalHours === hours ? styles.active : ''
                }`}
                onClick={() => updateSettings({ intervalHours: hours })}
                disabled={saving}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <Calendar className="w-4 h-4" />
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => updateSettings({ timezone: e.target.value })}
            className={styles.timezoneSelect}
            disabled={saving}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Shanghai">Shanghai</option>
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.toggleButton} ${settings.isEnabled ? styles.disable : styles.enable}`}
          onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
          disabled={saving}
        >
          {settings.isEnabled ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Disable Auto Collection</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Enable Auto Collection</span>
            </>
          )}
        </button>

        <button
          className={styles.runNowButton}
          onClick={runDataCollectionNow}
          disabled={saving}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Run Now</span>
        </button>
      </div>

      {/* Status Info */}
      <div className={styles.statusInfo}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Last Run:</span>
          <span className={styles.statusValue}>
            {formatDate(settings.lastRunAt)}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Next Run:</span>
          <span className={styles.statusValue}>
            {settings.isEnabled ? formatDate(settings.nextRunAt) : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Job History */}
      {jobHistory.length > 0 && (
        <div className={styles.jobHistory}>
          <div className={styles.historyHeader}>
            <span>Recent Jobs</span>
            <button
              className={styles.refreshButton}
              onClick={fetchJobHistory}
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className={styles.historyList}>
            {jobHistory.slice(0, 5).map((job) => (
              <div key={job.id} className={styles.historyItem}>
                <div className={styles.jobStatus}>
                  <span className={styles.jobIcon}>
                    {getStatusIcon(job.status)}
                  </span>
                  <span 
                    className={styles.jobStatusText}
                    style={{ color: getStatusColor(job.status) }}
                  >
                    {job.status}
                  </span>
                </div>
                <div className={styles.jobDetails}>
                  <div className={styles.jobKeywords}>
                    {job.keywords?.length} keywords
                  </div>
                  <div className={styles.jobTime}>
                    {formatDate(job.startTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default CronJobManager;
