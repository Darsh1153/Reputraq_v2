'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { getPlanLimits, canAddKeyword, getRemainingKeywords } from '@/lib/constants/plans';
import { PlanIndicator } from '@/components/PlanIndicator';
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Crown,
  Star,
  Zap,
  Hash,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';
import ExportButton from '@/components/ExportButton';
import { createKeywordsExportData } from '@/utils/exportUtils';
import styles from './page.module.scss';

interface Keyword {
  id: number;
  keyword: string;
  createdAt: string;
}

export default function KeywordsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to view keywords');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(user);
      
      // Update Redux store with user data
      dispatch(setUser(userData));
      
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/keywords', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setKeywords(data);
      } else {
        setError('Failed to fetch keywords');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyword.trim()) {
      return;
    }

    // Check plan limits before submitting
    const userPlan = user?.plan || 'free';
    if (!canAddKeyword(keywords.length, userPlan)) {
      const planLimits = getPlanLimits(userPlan);
      setPlanError(`You have reached the maximum number of keywords for your ${planLimits.name} plan (${planLimits.keywords} keywords). Please upgrade your plan to add more keywords.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setPlanError(null);

    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to add keywords');
        setSubmitting(false);
        return;
      }

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });

      if (response.ok) {
        const newKeywordData = await response.json();
        setKeywords(prev => [...prev, newKeywordData]);
        setNewKeyword('');
        setPlanError(null);
        
        // Update user data in localStorage with new keywords
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          const updatedUser = {
            ...userData,
            keywords: [...(userData.keywords || []), newKeywordData.keyword]
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Also update Redux store
          dispatch(setUser(updatedUser));
        }
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setPlanError(errorData.message);
        } else {
          setError(errorData.message || 'Failed to add keyword');
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const removeKeyword = async (keywordId: number) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to remove keywords');
        return;
      }

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch(`/api/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const removedKeyword = keywords.find(k => k.id === keywordId);
        setKeywords(prev => prev.filter(k => k.id !== keywordId));
        
        // Update user data in localStorage by removing the keyword
        if (removedKeyword) {
          const user = localStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            const updatedUser = {
              ...userData,
              keywords: (userData.keywords || []).filter((k: string) => k !== removedKeyword.keyword)
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Also update Redux store
            dispatch(setUser(updatedUser));
          }
        }
      } else {
        setError('Failed to remove keyword');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleContinue = () => {
    if (keywords.length === 0) {
      setError('Please add at least one keyword before continuing');
      return;
    }
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your keywords...</p>
        </div>
      </div>
    );
  }

  const userPlan = user?.plan || 'free';
  const planLimits = getPlanLimits(userPlan);
  const remainingKeywords = getRemainingKeywords(keywords.length, userPlan);
  const canAddMore = canAddKeyword(keywords.length, userPlan);

  return (
    <div className={styles.container}>
      {/* Plan Indicator */}
      <PlanIndicator currentKeywords={keywords.length} showUpgrade={true} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.titleIconWrapper}>
              <Hash size={28} className={styles.titleIcon} />
              <Sparkles size={16} className={styles.sparkleIcon} />
            </div>
            <div className={styles.titleContent}>
              <h1 className={styles.title}>Keywords Management</h1>
              <p className={styles.subtitle}>
                Add and manage your keywords for social media monitoring
              </p>
            </div>
          </div>
          {keywords.length > 0 && (
            <div className={styles.exportSection}>
              <ExportButton
                data={createKeywordsExportData(keywords)}
                variant="primary"
                size="medium"
                showLabel={true}
              />
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {planError && (
          <div className={styles.planErrorAlert}>
            <AlertCircle size={16} />
            {planError}
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.addForm}>
            <div className={styles.formHeader}>
              <div className={styles.formTitle}>
                <Target size={20} className={styles.formIcon} />
                <h3>Add New Keyword</h3>
              </div>
              <p className={styles.formDescription}>
                Enter keywords, hashtags, or phrases you want to track
              </p>
            </div>
            
            <form onSubmit={addKeyword} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Search size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder={canAddMore ? "e.g., #AI, artificial intelligence, machine learning" : "Upgrade your plan to add more keywords"}
                    className={`${styles.keywordInput} ${!canAddMore ? styles.disabled : ''}`}
                    disabled={submitting || !canAddMore}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !newKeyword.trim() || !canAddMore}
                  className={`${styles.addButton} ${!canAddMore ? styles.disabled : ''}`}
                >
                  <Plus size={18} className={styles.buttonIcon} />
                  {submitting ? 'Adding...' : canAddMore ? 'Add Keyword' : 'Upgrade Required'}
                </button>
              </div>
              {!canAddMore && (
                <div className={styles.limitMessage}>
                  <AlertCircle size={16} />
                  <span>You've reached your keyword limit ({planLimits.keywords} keywords) for the {planLimits.name} plan</span>
                </div>
              )}
            </form>
          </div>

          <div className={styles.keywordsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <TrendingUp size={20} className={styles.sectionIcon} />
                <h3>Your Keywords ({keywords.length})</h3>
              </div>
              <div className={styles.keywordStats}>
                <span className={styles.statItem}>
                  <CheckCircle size={16} />
                  {keywords.length} Active
                </span>
                <span className={styles.statItem}>
                  <Target size={16} />
                  {remainingKeywords} Remaining
                </span>
              </div>
            </div>
            
            {keywords.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Hash size={48} />
                </div>
                <h4>No keywords added yet</h4>
                <p>Add your first keyword above to start monitoring!</p>
              </div>
            ) : (
              <div className={styles.keywordsList}>
                {keywords.map((keyword) => (
                  <div key={keyword.id} className={styles.keywordItem}>
                    <div className={styles.keywordContent}>
                      <div className={styles.keywordIcon}>
                        {keyword.keyword.startsWith('#') ? <Hash size={16} /> : <Target size={16} />}
                      </div>
                      <span className={styles.keywordText}>{keyword.keyword}</span>
                    </div>
                    <button
                      onClick={() => removeKeyword(keyword.id)}
                      className={styles.removeButton}
                      title="Remove keyword"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleContinue}
              disabled={keywords.length === 0}
              className={styles.continueButton}
            >
              <TrendingUp size={18} className={styles.buttonIcon} />
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
