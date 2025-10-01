// Mock API response for testing Historical Data page
// This simulates what the /api/historical-data endpoint returns

const mockHistoricalDataResponse = {
  data: {
    news: [
      {
        id: 1,
        userId: 9,
        keyword: "bmw",
        collectionJobId: 1,
        articleId: "bmw_001",
        title: "BMW Unveils Revolutionary Electric Vehicle Technology",
        description: "BMW has announced breakthrough battery technology that promises to revolutionize the electric vehicle market with 500-mile range capabilities.",
        url: "https://example.com/bmw-electric-breakthrough",
        publishedAt: "2025-09-28T10:00:00.000Z",
        sourceName: "Auto News Daily",
        sourceLogo: "https://via.placeholder.com/50x50/007bff/ffffff?text=AND",
        image: "https://via.placeholder.com/400x200/007bff/ffffff?text=BMW+Electric",
        sentimentScore: 25,
        sentimentLabel: "positive",
        readTime: 6,
        isBreaking: true,
        categories: ["Automotive", "Technology"],
        topics: ["Electric Vehicles", "Innovation"],
        engagement: { views: 1850, shares: 67, comments: 34 },
        rawData: {},
        collectedAt: "2025-09-30T15:30:00.000Z",
        createdAt: "2025-09-30T15:30:00.000Z"
      },
      {
        id: 2,
        userId: 9,
        keyword: "bmw",
        collectionJobId: 1,
        articleId: "bmw_002",
        title: "BMW Reports Record Sales in Q4 2024",
        description: "BMW has reported its highest quarterly sales figures in company history, driven by strong demand for luxury vehicles.",
        url: "https://example.com/bmw-record-sales",
        publishedAt: "2025-09-25T14:00:00.000Z",
        sourceName: "Business Automotive",
        sourceLogo: "https://via.placeholder.com/50x50/28a745/ffffff?text=BA",
        image: "https://via.placeholder.com/400x200/28a745/ffffff?text=BMW+Sales",
        sentimentScore: 18,
        sentimentLabel: "positive",
        readTime: 4,
        isBreaking: false,
        categories: ["Business", "Automotive"],
        topics: ["Sales", "Financial Results"],
        engagement: { views: 1200, shares: 45, comments: 23 },
        rawData: {},
        collectedAt: "2025-09-30T15:30:00.000Z",
        createdAt: "2025-09-30T15:30:00.000Z"
      },
      {
        id: 3,
        userId: 9,
        keyword: "bmw",
        collectionJobId: 1,
        articleId: "bmw_003",
        title: "BMW Recalls 50,000 Vehicles Over Safety Concerns",
        description: "BMW has issued a voluntary recall for approximately 50,000 vehicles due to potential brake system issues.",
        url: "https://example.com/bmw-recall-safety",
        publishedAt: "2025-09-23T09:00:00.000Z",
        sourceName: "Safety First News",
        sourceLogo: "https://via.placeholder.com/50x50/dc3545/ffffff?text=SFN",
        image: "https://via.placeholder.com/400x200/dc3545/ffffff?text=BMW+Recall",
        sentimentScore: -15,
        sentimentLabel: "negative",
        readTime: 5,
        isBreaking: true,
        categories: ["Safety", "Automotive"],
        topics: ["Recall", "Safety"],
        engagement: { views: 2100, shares: 89, comments: 156 },
        rawData: {},
        collectedAt: "2025-09-30T15:30:00.000Z",
        createdAt: "2025-09-30T15:30:00.000Z"
      }
    ],
    social: [
      {
        id: 1,
        userId: 9,
        keyword: "bmw",
        collectionJobId: 1,
        postId: "bmw_social_001",
        title: "BMW's new electric SUV is amazing!",
        description: "Just test drove the new BMW iX and it's incredible. The range and performance are outstanding.",
        url: "https://twitter.com/user/status/123456789",
        publishedAt: "2025-09-29T16:00:00.000Z",
        platformName: "Twitter",
        platformLogo: "https://via.placeholder.com/50x50/1da1f2/ffffff?text=T",
        image: "https://via.placeholder.com/400x200/1da1f2/ffffff?text=BMW+iX",
        sentimentScore: 22,
        sentimentLabel: "positive",
        engagement: { views: 850, shares: 23, comments: 12, likes: 45 },
        rawData: {},
        collectedAt: "2025-09-30T15:30:00.000Z",
        createdAt: "2025-09-30T15:30:00.000Z"
      },
      {
        id: 2,
        userId: 9,
        keyword: "artificial intelligence",
        collectionJobId: 1,
        postId: "ai_social_001",
        title: "The future of AI is here!",
        description: "Just attended an AI conference and the innovations are mind-blowing. The potential is limitless.",
        url: "https://linkedin.com/posts/user-123456789",
        publishedAt: "2025-09-26T11:00:00.000Z",
        platformName: "LinkedIn",
        platformLogo: "https://via.placeholder.com/50x50/0077b5/ffffff?text=L",
        image: "https://via.placeholder.com/400x200/0077b5/ffffff?text=AI+Conference",
        sentimentScore: 20,
        sentimentLabel: "positive",
        engagement: { views: 1200, shares: 45, comments: 23, likes: 78 },
        rawData: {},
        collectedAt: "2025-09-30T15:30:00.000Z",
        createdAt: "2025-09-30T15:30:00.000Z"
      }
    ],
    totalNews: 3,
    totalSocial: 2,
    dateRange: { startDate: "2025-08-01", endDate: "2025-09-30" },
    filters: { keyword: "", dataType: "all" }
  },
  message: "Historical data retrieved successfully"
};

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mockHistoricalDataResponse;
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
  window.mockHistoricalDataResponse = mockHistoricalDataResponse;
}

console.log('📊 Mock Historical Data Response loaded:', mockHistoricalDataResponse);
