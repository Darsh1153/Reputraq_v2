'use client';

import { StructuredDataRenderer } from './StructuredDataRenderer';

export function StructuredDataDemo() {
  const sampleResponse = `# 📊 **BMW PGA Championship** Analysis

Based on your data analysis, here's what I found:

## 🎯 **Performance Summary**

📊 **Total Articles**: 47 (+23% from last week)  
📊 **Average Sentiment**: 7.2/10 (+0.8 improvement)  
📊 **Top Source**: TechCrunch (12 articles)

---

## 📈 **Data Breakdown**

| Source | Articles | Avg Sentiment | Engagement |
|--------|----------|---------------|------------|
| TechCrunch | 12 | 8.1/10 | 1,234 |
| Wired | 8 | 7.5/10 | 987 |
| The Verge | 6 | 6.8/10 | 756 |

---

## 💻 **Code Example for Data Query**

\`\`\`sql
SELECT 
  source_name,
  COUNT(*) as article_count,
  AVG(sentiment_score) as avg_sentiment
FROM news_articles 
WHERE keyword = 'AI technology'
  AND published_at >= NOW() - INTERVAL '7 days'
GROUP BY source_name
ORDER BY article_count DESC;
\`\`\`

---

## 🔍 **Key Insights**

- **Brand mentions increased by 23%** this week
- **TechCrunch is your most positive source** with 8.1/10 sentiment
- **Engagement rates are highest** for AI-related content
- Consider focusing on *technical publications* for better reach

> **Pro Tip**: Your technical content resonates particularly well with TechCrunch's audience, suggesting a strong product-market fit in the AI space.

---

## 🎯 **Sentiment Analysis**

Your brand is performing **exceptionally well** in the AI technology space. The positive sentiment trend (+0.8) indicates growing public confidence in your products. TechCrunch's coverage shows particularly strong engagement, suggesting your technical content resonates well with their audience.

### **Next Steps:**
1. **Double down** on technical content
2. **Expand coverage** to similar tech publications
3. **Monitor sentiment** trends weekly
4. **Engage** with high-performing articles`;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Structured Data Demo</h2>
      <p>This shows how the AI chatbot will render structured data:</p>
      <StructuredDataRenderer content={sampleResponse} />
    </div>
  );
}
