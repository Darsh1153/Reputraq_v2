'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.scss';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface UserStatus {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/auth/status?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserStatus(data);
        } else {
          setError('Failed to fetch user status');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Poll for status updates every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const getStatusMessage = () => {
    if (!userStatus) return 'Loading...';
    
    switch (userStatus.status) {
      case 'pending':
        return 'Your account is pending approval from an administrator.';
      case 'approved':
        return 'Your account has been approved! You can now sign in.';
      case 'denied':
        return 'Your account request has been denied. Please contact support.';
      default:
        return 'Unknown status';
    }
  };

  const getStatusIcon = () => {
    if (!userStatus) return '⏳';
    
    switch (userStatus.status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'denied':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = () => {
    if (!userStatus) return '#718096';
    
    switch (userStatus.status) {
      case 'pending':
        return '#f6ad55';
      case 'approved':
        return '#68d391';
      case 'denied':
        return '#fc8181';
      default:
        return '#718096';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
            <a href="/signup" className={styles.button}>
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div 
            className={styles.statusIcon}
            style={{ color: getStatusColor() }}
          >
            {getStatusIcon()}
          </div>
          <h1 className={styles.title}>Account Status</h1>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{getStatusMessage()}</p>
          
          {userStatus && (
            <div className={styles.userInfo}>
              <h3>Account Details</h3>
              <div className={styles.details}>
                <div className={styles.detail}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{userStatus.name}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{userStatus.email}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Status:</span>
                  <span 
                    className={styles.value}
                    style={{ color: getStatusColor() }}
                  >
                    {userStatus.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {userStatus?.status === 'approved' ? (
              <a href="/signin" className={styles.button}>
                Sign In
              </a>
            ) : userStatus?.status === 'pending' ? (
              <button 
                onClick={() => window.location.reload()} 
                className={styles.buttonSecondary}
              >
                Refresh Status
              </button>
            ) : (
              <a href="/signup" className={styles.button}>
                Create New Account
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
