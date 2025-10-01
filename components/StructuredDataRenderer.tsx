'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Code,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Hash,
  MessageSquare,
  Newspaper,
  Users,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import styles from './StructuredDataRenderer.module.scss';

interface StructuredData {
  type: 'chart' | 'code' | 'list' | 'metric' | 'timeline' | 'sentiment';
  title?: string;
  data: any;
  metadata?: any;
}

interface StructuredDataRendererProps {
  content: string;
}

export function StructuredDataRenderer({ content }: StructuredDataRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse structured data from AI response
  const parseStructuredData = (text: string): { text: string; structuredData: StructuredData[] } => {
    const structuredData: StructuredData[] = [];
    let processedText = text;

    // Parse code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      structuredData.push({
        type: 'code',
        data: { language, code },
        metadata: { originalMatch: match[0] }
      });
      
      processedText = processedText.replace(match[0], `[CODE_BLOCK_${structuredData.length - 1}]`);
    }

  // Let markdown renderer handle tables - remove table parsing

    // Parse metric cards
    const metricRegex = /📊\s*([^:]+):\s*([^\n]+)/g;
    while ((match = metricRegex.exec(text)) !== null) {
      const title = match[1].trim();
      const value = match[2].trim();

      structuredData.push({
        type: 'metric',
        data: { title, value },
        metadata: { originalMatch: match[0] }
      });

      processedText = processedText.replace(match[0], `[METRIC_${structuredData.length - 1}]`);
    }

    // Parse sentiment analysis
    const sentimentRegex = /🎯\s*Sentiment Analysis:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/g;
    while ((match = sentimentRegex.exec(text)) !== null) {
      const sentimentData = match[1].trim();
      
      structuredData.push({
        type: 'sentiment',
        data: { analysis: sentimentData },
        metadata: { originalMatch: match[0] }
      });

      processedText = processedText.replace(match[0], `[SENTIMENT_${structuredData.length - 1}]`);
    }

    // Parse lists
    const listRegex = /(?:^|\n)(?:\d+\.|\*|\-)\s+([^\n]+(?:\n(?!\d+\.|\*|\-)[^\n]+)*)/gm;
    const listItems: string[] = [];
    while ((match = listRegex.exec(text)) !== null) {
      listItems.push(match[1].trim());
    }

    if (listItems.length > 0) {
      structuredData.push({
        type: 'list',
        data: { items: listItems },
        metadata: { originalMatch: 'list' }
      });
    }

    return { text: processedText, structuredData };
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderCodeBlock = (data: any, index: number) => (
    <div key={index} className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <div className={styles.codeTitle}>
          <Code size={16} />
          <span>{data.language || 'text'}</span>
        </div>
        <button
          onClick={() => copyToClipboard(data.code, `code-${index}`)}
          className={styles.copyButton}
        >
          {copiedCode === `code-${index}` ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre className={styles.codeContent}>
        <code>{data.code}</code>
      </pre>
    </div>
  );

  // Tables are now handled by markdown renderer

  const renderMetric = (data: any, index: number) => (
    <div key={index} className={styles.metricCard}>
      <div className={styles.metricIcon}>
        <BarChart3 size={20} />
      </div>
      <div className={styles.metricContent}>
        <div className={styles.metricTitle}>{data.title}</div>
        <div className={styles.metricValue}>{data.value}</div>
      </div>
    </div>
  );

  const renderSentiment = (data: any, index: number) => (
    <div key={index} className={styles.sentimentCard}>
      <div className={styles.sentimentHeader}>
        <MessageSquare size={16} />
        <span>Sentiment Analysis</span>
      </div>
      <div className={styles.sentimentContent}>
        <pre className={styles.sentimentText}>{data.analysis}</pre>
      </div>
    </div>
  );

  const renderList = (data: any, index: number) => (
    <div key={index} className={styles.listContainer}>
      <div className={styles.listHeader}>
        <Hash size={16} />
        <span>Key Points</span>
      </div>
      <ul className={styles.list}>
        {data.items.map((item: string, i: number) => (
          <li key={i} className={styles.listItem}>{item}</li>
        ))}
      </ul>
    </div>
  );

  const renderStructuredData = (data: StructuredData, index: number) => {
    switch (data.type) {
      case 'code':
        return renderCodeBlock(data.data, index);
      case 'metric':
        return renderMetric(data.data, index);
      case 'sentiment':
        return renderSentiment(data.data, index);
      case 'list':
        return renderList(data.data, index);
      default:
        return null;
    }
  };

  const { text, structuredData } = parseStructuredData(content);

  return (
    <div className={styles.container}>
      {/* Render text content with placeholders replaced */}
      <div className={styles.textContent}>
        {text.split(/(\[(?:CODE_BLOCK|METRIC|SENTIMENT|LIST)_\d+\])/).map((part, index) => {
          const match = part.match(/\[(CODE_BLOCK|METRIC|SENTIMENT|LIST)_(\d+)\]/);
          if (match) {
            const type = match[1].toLowerCase();
            const dataIndex = parseInt(match[2]);
            const structuredItem = structuredData.find((_, i) => i === dataIndex);
            
            if (structuredItem) {
              return (
                <div key={index} className={styles.structuredWrapper}>
                  {renderStructuredData(structuredItem, dataIndex)}
                </div>
              );
            }
          }
          return part ? (
            <MarkdownRenderer key={index} content={part} />
          ) : null;
        })}
      </div>

      {/* Render any remaining structured data */}
      {structuredData.map((data, index) => (
        <div key={`remaining-${index}`} className={styles.structuredWrapper}>
          {renderStructuredData(data, index)}
        </div>
      ))}
    </div>
  );
}
