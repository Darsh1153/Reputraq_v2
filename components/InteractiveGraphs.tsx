'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target,
  Calendar,
  Zap,
  Eye,
  Share2,
  MessageSquare
} from 'lucide-react';
import styles from './InteractiveGraphs.module.scss';

interface GraphData {
  articles: any[];
  keywords: string[];
}

export function InteractiveGraphs({ articles, keywords }: GraphData) {
  // Calculate comprehensive metrics
  const totalArticles = articles.length;
  const breakingNews = articles.filter(article => article.isBreaking).length;
  
  // Sentiment analysis
  const sentimentData = {
    positive: articles.filter(article => (article.sentimentScore || 0) > 10).length,
    negative: articles.filter(article => (article.sentimentScore || 0) < -10).length,
    neutral: articles.filter(article => 
      (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
    ).length
  };

  // Source distribution
  const sourceCounts = articles.reduce((acc, article) => {
    const source = article.sourceName || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(sourceCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  // Engagement metrics
  const totalEngagement = articles.reduce((sum, article) => {
    const engagement = article.engagement || {};
    return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0);
  }, 0);

  const avgEngagement = totalEngagement / totalArticles || 0;

  // Time-based data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyArticles = last7Days.map(date => {
    return articles.filter(article => 
      new Date(article.publishedAt).toISOString().split('T')[0] === date
    ).length;
  });

  // Keyword performance
  const keywordPerformance = keywords.map(keyword => {
    const keywordArticles = articles.filter(article => 
      article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      article.description?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const totalEngagement = keywordArticles.reduce((sum, article) => {
      const engagement = article.engagement || {};
      return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0);
    }, 0);

    return {
      keyword,
      articles: keywordArticles.length,
      engagement: totalEngagement,
      avgSentiment: keywordArticles.length > 0 
        ? keywordArticles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / keywordArticles.length
        : 0
    };
  });

  // Category distribution
  const categoryCounts = articles.reduce((acc, article) => {
    if (article.categories && Array.isArray(article.categories)) {
      article.categories.forEach(category => {
        const categoryName = typeof category === 'string' ? category : category.name || 'Unknown';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  return (
    <div className={styles.graphsContainer}>
      {/* Sentiment Analysis Pie Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Sentiment Analysis</h3>
          <PieChart size={20} />
        </div>
        <div className={styles.pieChart}>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChartSvg}>
              <svg viewBox="0 0 200 200" className={styles.pieSvg}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.positive / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.negative / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset={`-${(sentimentData.positive / totalArticles) * 502.4}`}
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.neutral / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset={`-${((sentimentData.positive + sentimentData.negative) / totalArticles) * 502.4}`}
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
              </svg>
            </div>
            <div className={styles.pieCenter}>
              <div className={styles.pieCenterNumber}>{totalArticles}</div>
              <div className={styles.pieCenterLabel}>Total Articles</div>
            </div>
          </div>
          <div className={styles.pieLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <span>Positive ({sentimentData.positive})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
              <span>Negative ({sentimentData.negative})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
              <span>Neutral ({sentimentData.neutral})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trends Line Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Daily Article Trends</h3>
          <TrendingUp size={20} />
        </div>
        <div className={styles.lineChart}>
          <div className={styles.lineChartContainer}>
            <svg viewBox="0 0 400 200" className={styles.lineSvg}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              <polyline
                points={dailyArticles.map((count, index) => 
                  `${(index * 400) / 6},${200 - (count * 200) / Math.max(...dailyArticles, 1)}`
                ).join(' ')}
                fill="none"
                stroke="#667eea"
                strokeWidth="3"
                className={styles.linePath}
              />
              <polygon
                points={`0,200 ${dailyArticles.map((count, index) => 
                  `${(index * 400) / 6},${200 - (count * 200) / Math.max(...dailyArticles, 1)}`
                ).join(' ')} 400,200`}
                fill="url(#lineGradient)"
                className={styles.lineArea}
              />
              {dailyArticles.map((count, index) => (
                <circle
                  key={index}
                  cx={(index * 400) / 6}
                  cy={200 - (count * 200) / Math.max(...dailyArticles, 1)}
                  r="4"
                  fill="#667eea"
                  className={styles.dataPoint}
                />
              ))}
            </svg>
          </div>
          <div className={styles.lineChartLabels}>
            {last7Days.map((date, index) => (
              <div key={date} className={styles.lineLabel}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Distribution Bar Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Top News Sources</h3>
          <BarChart3 size={20} />
        </div>
        <div className={styles.barChart}>
          <div className={styles.barChartContainer}>
            {topSources.map(([source, count], index) => {
              const maxCount = Math.max(...topSources.map(([,c]) => c));
              const height = (count / maxCount) * 100;
              return (
                <div key={source} className={styles.barGroup}>
                  <div className={styles.barValue}>{count}</div>
                  <div 
                    className={styles.bar}
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                    }}
                  ></div>
                  <div className={styles.barLabel}>{source}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyword Performance Radar Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Keyword Performance</h3>
          <Target size={20} />
        </div>
        <div className={styles.radarChart}>
          <div className={styles.radarChartContainer}>
            <svg viewBox="0 0 300 300" className={styles.radarSvg}>
              {/* Radar grid */}
              <circle cx="150" cy="150" r="120" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              <circle cx="150" cy="150" r="90" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              <circle cx="150" cy="150" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              <circle cx="150" cy="150" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              
              {/* Radar lines */}
              {keywordPerformance.map((_, index) => {
                const angle = (index * 360) / keywordPerformance.length;
                const x = 150 + 120 * Math.cos((angle - 90) * Math.PI / 180);
                const y = 150 + 120 * Math.sin((angle - 90) * Math.PI / 180);
                return (
                  <line
                    key={index}
                    x1="150"
                    y1="150"
                    x2={x}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data points and area */}
              {keywordPerformance.length > 0 && (
                <>
                  <polygon
                    points={keywordPerformance.map((keyword, index) => {
                      const angle = (index * 360) / keywordPerformance.length;
                      const normalizedArticles = Math.min(keyword.articles / 10, 1);
                      const x = 150 + 120 * normalizedArticles * Math.cos((angle - 90) * Math.PI / 180);
                      const y = 150 + 120 * normalizedArticles * Math.sin((angle - 90) * Math.PI / 180);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="rgba(102, 126, 234, 0.2)"
                    stroke="#667eea"
                    strokeWidth="2"
                    className={styles.radarArea}
                  />
                  {keywordPerformance.map((keyword, index) => {
                    const angle = (index * 360) / keywordPerformance.length;
                    const normalizedArticles = Math.min(keyword.articles / 10, 1);
                    const x = 150 + 120 * normalizedArticles * Math.cos((angle - 90) * Math.PI / 180);
                    const y = 150 + 120 * normalizedArticles * Math.sin((angle - 90) * Math.PI / 180);
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#667eea"
                        className={styles.radarPoint}
                      />
                    );
                  })}
                </>
              )}
            </svg>
          </div>
          <div className={styles.radarLabels}>
            {keywordPerformance.map((keyword, index) => (
              <div key={keyword.keyword} className={styles.radarLabel}>
                {keyword.keyword} ({keyword.articles})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Metrics Donut Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Engagement Breakdown</h3>
          <Activity size={20} />
        </div>
        <div className={styles.donutChart}>
          <div className={styles.donutChartContainer}>
            <svg viewBox="0 0 200 200" className={styles.donutSvg}>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${(articles.reduce((sum, article) => sum + (article.engagement?.views || 0), 0) / totalEngagement) * 502.4} 502.4`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${(articles.reduce((sum, article) => sum + (article.engagement?.shares || 0), 0) / totalEngagement) * 502.4} 502.4`}
                strokeDashoffset={`-${(articles.reduce((sum, article) => sum + (article.engagement?.views || 0), 0) / totalEngagement) * 502.4}`}
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${(articles.reduce((sum, article) => sum + (article.engagement?.comments || 0), 0) / totalEngagement) * 502.4} 502.4`}
                strokeDashoffset={`-${((articles.reduce((sum, article) => sum + (article.engagement?.views || 0), 0) + articles.reduce((sum, article) => sum + (article.engagement?.shares || 0), 0)) / totalEngagement) * 502.4}`}
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
            </svg>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterNumber}>{formatNumber(totalEngagement)}</div>
              <div className={styles.donutCenterLabel}>Total Engagement</div>
            </div>
          </div>
          <div className={styles.donutLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <Eye size={14} />
              <span>Views ({formatNumber(articles.reduce((sum, article) => sum + (article.engagement?.views || 0), 0))})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></div>
              <Share2 size={14} />
              <span>Shares ({formatNumber(articles.reduce((sum, article) => sum + (article.engagement?.shares || 0), 0))})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
              <MessageSquare size={14} />
              <span>Comments ({formatNumber(articles.reduce((sum, article) => sum + (article.engagement?.comments || 0), 0))})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution Horizontal Bar Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Content Categories</h3>
          <Calendar size={20} />
        </div>
        <div className={styles.horizontalBarChart}>
          {topCategories.map(([category, count], index) => {
            const maxCount = Math.max(...topCategories.map(([,c]) => c));
            const width = (count / maxCount) * 100;
            return (
              <div key={category} className={styles.horizontalBarGroup}>
                <div className={styles.horizontalBarLabel}>{category}</div>
                <div className={styles.horizontalBarContainer}>
                  <div 
                    className={styles.horizontalBar}
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  ></div>
                  <div className={styles.horizontalBarValue}>{count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
