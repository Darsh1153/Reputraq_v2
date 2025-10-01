export interface PlanLimits {
  keywords: number;
  competitorKeywords: number;
  articles: number;
  features: string[];
  price: number;
  name: string;
  description: string;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    keywords: 2,
    competitorKeywords: 1,
    articles: 100,
    features: [
      'Basic keyword monitoring',
      'Basic competitor analysis',
      'Email notifications',
      'Basic analytics'
    ],
    price: 0,
    name: 'Free',
    description: 'Perfect for getting started'
  },
  pro: {
    keywords: 3,
    competitorKeywords: 2,
    articles: 500,
    features: [
      'Advanced keyword monitoring',
      'Advanced competitor analysis',
      'Real-time notifications',
      'Advanced analytics',
      'Priority support'
    ],
    price: 29,
    name: 'Pro',
    description: 'For growing businesses'
  },
  enterprise: {
    keywords: 5,
    competitorKeywords: 3,
    articles: 2000,
    features: [
      'Unlimited keyword monitoring',
      'Unlimited competitor analysis',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Dedicated support',
      'Custom dashboards'
    ],
    price: 99,
    name: 'Enterprise',
    description: 'For large organizations'
  }
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canAddKeyword(currentKeywords: number, plan: string): boolean {
  const limits = getPlanLimits(plan);
  return currentKeywords < limits.keywords;
}

export function getRemainingKeywords(currentKeywords: number, plan: string): number {
  const limits = getPlanLimits(plan);
  return Math.max(0, limits.keywords - currentKeywords);
}

export function canAddCompetitorKeyword(currentKeywords: number, plan: string): boolean {
  const limits = getPlanLimits(plan);
  return currentKeywords < limits.competitorKeywords;
}

export function getRemainingCompetitorKeywords(currentKeywords: number, plan: string): number {
  const limits = getPlanLimits(plan);
  return Math.max(0, limits.competitorKeywords - currentKeywords);
}

export function getPlanUpgradeMessage(plan: string): string {
  switch (plan) {
    case 'free':
      return 'Upgrade to Pro to monitor up to 3 keywords and 2 competitor keywords';
    case 'pro':
      return 'Upgrade to Enterprise to monitor up to 5 keywords and 3 competitor keywords';
    case 'enterprise':
      return 'You have the maximum plan with 5 keywords and 3 competitor keywords';
    default:
      return 'Upgrade your plan to monitor more keywords';
  }
}

export function getCompetitorKeywordUpgradeMessage(plan: string): string {
  switch (plan) {
    case 'free':
      return 'Upgrade to Pro to monitor up to 2 competitor keywords';
    case 'pro':
      return 'Upgrade to Enterprise to monitor up to 3 competitor keywords';
    case 'enterprise':
      return 'You have the maximum plan with 3 competitor keywords';
    default:
      return 'Upgrade your plan to monitor more competitor keywords';
  }
}
