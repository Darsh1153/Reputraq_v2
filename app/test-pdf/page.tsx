'use client';

import React from 'react';
import PDFExportExample from '@/components/PDFExportExample';
import { ExportData } from '@/services/exportService';

// Sample data for testing
const sampleData: ExportData = {
  content: [
    {
      id: '1',
      platform: 'Twitter',
      content: 'Just launched our new product! Excited to see the response from our community.',
      author: {
        name: 'John Doe',
        username: '@johndoe',
        followers: 15000,
        verified: true
      },
      engagement: {
        likes: 245,
        shares: 89,
        comments: 34,
        views: 12000,
        total: 368
      },
      hashtags: ['#productlaunch', '#innovation'],
      mentions: ['@company'],
      publishedAt: '2024-01-15T10:30:00Z',
      url: 'https://twitter.com/johndoe/status/123456789',
      media: {
        type: 'image',
        url: 'https://example.com/image.jpg'
      },
      sentiment: {
        score: 0.8,
        label: 'positive'
      },
      reach: {
        estimated: 25000,
        viral: false
      },
      language: 'en',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      platform: 'Instagram',
      content: 'Behind the scenes of our latest campaign 📸',
      author: {
        name: 'Jane Smith',
        username: '@janesmith',
        followers: 8500,
        verified: false
      },
      engagement: {
        likes: 156,
        shares: 23,
        comments: 12,
        views: 8500,
        total: 191
      },
      hashtags: ['#behindthescenes', '#campaign'],
      mentions: [],
      publishedAt: '2024-01-15T14:20:00Z',
      url: 'https://instagram.com/p/abc123',
      media: {
        type: 'image',
        url: 'https://example.com/image2.jpg'
      },
      sentiment: {
        score: 0.6,
        label: 'positive'
      },
      reach: {
        estimated: 12000,
        viral: false
      },
      language: 'en',
      location: 'New York, NY'
    }
  ],
  hashtags: [
    {
      hashtag: '#productlaunch',
      count: 45,
      platforms: ['Twitter', 'Instagram'],
      engagement: {
        likes: 1200,
        shares: 300,
        comments: 150,
        views: 50000,
        total: 1650
      },
      sentiment: {
        positive: 75,
        negative: 5,
        neutral: 20
      },
      trend: {
        direction: 'up',
        change: 15.5
      },
      reach: {
        estimated: 75000,
        viral: true
      },
      lastSeen: '2024-01-15T16:45:00Z'
    }
  ],
  platforms: [
    {
      platform: 'Twitter',
      totalContent: 150,
      totalEngagement: 25000,
      avgEngagement: 166.67,
      engagementRate: 8.5,
      reach: 100000,
      sentiment: {
        positive: 65,
        negative: 15,
        neutral: 20
      }
    },
    {
      platform: 'Instagram',
      totalContent: 89,
      totalEngagement: 18000,
      avgEngagement: 202.25,
      engagementRate: 12.3,
      reach: 85000,
      sentiment: {
        positive: 70,
        negative: 10,
        neutral: 20
      }
    }
  ],
  metadata: {
    exportDate: new Date().toISOString(),
    totalRecords: 241,
    filters: {
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-15'
      },
      platforms: ['Twitter', 'Instagram']
    },
    generatedBy: 'Reputraq System',
    generatedAt: new Date().toISOString()
  }
};

export default function TestPDFPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>PDF Export Test Page</h1>
      <p>This page demonstrates the PDF export functionality. Click the export button to generate a PDF that captures the exact appearance of the content below.</p>
      
      <PDFExportExample 
        data={sampleData} 
        title="Social Listening Analytics Report"
      >
        <div style={{ marginTop: '20px' }}>
          <h3>Detailed Analytics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <h4>Top Performing Content</h4>
              <p>Content with highest engagement rates</p>
              <ul>
                <li>Product launch announcement: 368 engagements</li>
                <li>Behind the scenes post: 191 engagements</li>
              </ul>
            </div>
            <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <h4>Sentiment Analysis</h4>
              <p>Overall sentiment breakdown</p>
              <ul>
                <li>Positive: 67.5%</li>
                <li>Neutral: 20%</li>
                <li>Negative: 12.5%</li>
              </ul>
            </div>
            <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <h4>Platform Performance</h4>
              <p>Engagement by platform</p>
              <ul>
                <li>Instagram: 12.3% engagement rate</li>
                <li>Twitter: 8.5% engagement rate</li>
              </ul>
            </div>
          </div>
        </div>
      </PDFExportExample>
    </div>
  );
}
