'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { getPlanLimits, getRemainingKeywords, getRemainingCompetitorKeywords, getPlanUpgradeMessage, getCompetitorKeywordUpgradeMessage } from '@/lib/constants/plans';
import { 
  Crown, 
  Star, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  Users,
  BarChart3,
  Shield
} from 'lucide-react';
import styles from './PlanIndicator.module.scss';

interface PlanIndicatorProps {
  currentKeywords?: number;
  maxKeywords?: number;
  showUpgrade?: boolean;
  keywordType?: 'regular' | 'competitor';
}

export function PlanIndicator({ 
  currentKeywords = 0, 
  maxKeywords, 
  showUpgrade = true, 
  keywordType = 'regular' 
}: PlanIndicatorProps) {
  const { user } = useAppSelector((state) => state.user);
  
  if (!user) return null;

  const plan = user.plan || 'free';
  const planLimits = getPlanLimits(plan);
  
  // Use provided maxKeywords or calculate based on keyword type
  const effectiveMaxKeywords = maxKeywords || (keywordType === 'competitor' ? planLimits.competitorKeywords : planLimits.keywords);
  const remainingKeywords = keywordType === 'competitor' 
    ? getRemainingCompetitorKeywords(currentKeywords, plan)
    : getRemainingKeywords(currentKeywords, plan);
  const upgradeMessage = keywordType === 'competitor' 
    ? getCompetitorKeywordUpgradeMessage(plan)
    : getPlanUpgradeMessage(plan);

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Star size={20} />;
      case 'pro':
        return <Crown size={20} />;
      case 'enterprise':
        return <Zap size={20} />;
      default:
        return <Star size={20} />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return '#6b7280';
      case 'pro':
        return '#3b82f6';
      case 'enterprise':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const isAtLimit = remainingKeywords === 0;
  const isNearLimit = remainingKeywords <= 1 && plan !== 'enterprise';

  return (
    <div className={styles.container}>
      {/* Plan Status Card */}
      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <div className={styles.planInfo}>
            <div 
              className={styles.planIcon}
              style={{ color: getPlanColor(plan) }}
            >
              {getPlanIcon(plan)}
            </div>
            <div className={styles.planDetails}>
              <h3 className={styles.planName}>{planLimits.name} Plan</h3>
              <p className={styles.planDescription}>{planLimits.description}</p>
            </div>
          </div>
          {showUpgrade && plan !== 'enterprise' && (
            <button className={styles.upgradeButton}>
              <ArrowUpRight size={16} />
              Upgrade
            </button>
          )}
        </div>

        {/* Keywords Usage */}
        <div className={styles.usageSection}>
          <div className={styles.usageHeader}>
            <h4 className={styles.usageTitle}>
              {keywordType === 'competitor' ? 'Competitor Keywords Usage' : 'Keywords Usage'}
            </h4>
            <div className={styles.usageStats}>
              <span className={styles.currentCount}>{currentKeywords}</span>
              <span className={styles.separator}>/</span>
              <span className={styles.maxCount}>{effectiveMaxKeywords}</span>
            </div>
          </div>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${(currentKeywords / effectiveMaxKeywords) * 100}%`,
                backgroundColor: getPlanColor(plan)
              }}
            ></div>
          </div>

          <div className={styles.usageMessage}>
            {isAtLimit ? (
              <div className={styles.limitReached}>
                <AlertCircle size={16} />
                <span>You've reached your keyword limit</span>
              </div>
            ) : isNearLimit ? (
              <div className={styles.nearLimit}>
                <AlertCircle size={16} />
                <span>Only {remainingKeywords} keyword{remainingKeywords !== 1 ? 's' : ''} remaining</span>
              </div>
            ) : (
              <div className={styles.withinLimit}>
                <CheckCircle size={16} />
                <span>{remainingKeywords} keyword{remainingKeywords !== 1 ? 's' : ''} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className={styles.featuresSection}>
          <h4 className={styles.featuresTitle}>Plan Features</h4>
          <div className={styles.featuresList}>
            {planLimits.features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <CheckCircle size={14} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Message */}
        {showUpgrade && plan !== 'enterprise' && (
          <div className={styles.upgradeSection}>
            <div className={styles.upgradeMessage}>
              <Crown size={16} />
              <span>{upgradeMessage}</span>
            </div>
            <div className={styles.upgradeActions}>
              <button className={styles.upgradeButtonPrimary}>
                <ArrowUpRight size={16} />
                Upgrade to {plan === 'free' ? 'Pro' : 'Enterprise'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      {showUpgrade && (
        <div className={styles.comparisonSection}>
          <h4 className={styles.comparisonTitle}>Plan Comparison</h4>
          <div className={styles.comparisonGrid}>
            {Object.entries(getPlanLimits('free')).map(([key, value]) => {
              if (key === 'features') return null;
              return (
                <div key={key} className={styles.comparisonItem}>
                  <div className={styles.comparisonLabel}>
                    {key === 'keywords' ? 'Keywords' : 
                     key === 'articles' ? 'Articles' : 
                     key === 'price' ? 'Price' : key}
                  </div>
                  <div className={styles.comparisonValues}>
                    <div className={styles.comparisonValue}>
                      <span className={styles.planLabel}>Free</span>
                      <span className={styles.planValue}>
                        {key === 'price' ? '$0' : 
                         key === 'keywords' ? '2' : 
                         key === 'articles' ? '100' : value}
                      </span>
                    </div>
                    <div className={styles.comparisonValue}>
                      <span className={styles.planLabel}>Pro</span>
                      <span className={styles.planValue}>
                        {key === 'price' ? '$29' : 
                         key === 'keywords' ? '3' : 
                         key === 'articles' ? '500' : value}
                      </span>
                    </div>
                    <div className={styles.comparisonValue}>
                      <span className={styles.planLabel}>Enterprise</span>
                      <span className={styles.planValue}>
                        {key === 'price' ? '$99' : 
                         key === 'keywords' ? '5' : 
                         key === 'articles' ? '2000' : value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
