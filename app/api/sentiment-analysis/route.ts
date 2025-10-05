import { NextRequest, NextResponse } from 'next/server';

const ENSEMBLE_BASE_URL = process.env.NEXT_PUBLIC_ENSEMBLE_BASE_URL;
const ENSEMBLE_TOKEN = process.env.ENSEMBLE_TOKEN;

// Enhanced sentiment analysis with comprehensive word dictionaries
class SentimentAnalyzer {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private intensifiers: Set<string>;
  private negators: Set<string>;

  constructor() {
    // Comprehensive positive words
    this.positiveWords = new Set([
      'amazing', 'awesome', 'great', 'excellent', 'fantastic', 'wonderful', 'love', 'best', 'perfect', 'incredible',
      'outstanding', 'brilliant', 'superb', 'marvelous', 'fabulous', 'terrific', 'spectacular', 'phenomenal',
      'impressive', 'stunning', 'beautiful', 'gorgeous', 'delicious', 'tasty', 'yummy', 'delightful', 'pleased',
      'happy', 'joyful', 'excited', 'thrilled', 'ecstatic', 'overjoyed', 'satisfied', 'content', 'pleased',
      'recommend', 'highly', 'top', 'quality', 'premium', 'superior', 'exceptional', 'remarkable', 'outstanding',
      'incredible', 'amazing', 'wow', 'wonderful', 'fantastic', 'brilliant', 'excellent', 'perfect', 'great',
      'good', 'nice', 'cool', 'awesome', 'sweet', 'lovely', 'beautiful', 'gorgeous', 'stunning', 'breathtaking',
      'magnificent', 'splendid', 'glorious', 'divine', 'heavenly', 'magical', 'enchanting', 'captivating',
      'mesmerizing', 'fascinating', 'intriguing', 'compelling', 'engaging', 'entertaining', 'fun', 'enjoyable',
      'pleasurable', 'satisfying', 'fulfilling', 'rewarding', 'gratifying', 'uplifting', 'inspiring', 'motivating',
      'encouraging', 'hopeful', 'optimistic', 'positive', 'cheerful', 'bright', 'sunny', 'radiant', 'vibrant',
      'energetic', 'dynamic', 'powerful', 'strong', 'robust', 'solid', 'reliable', 'trustworthy', 'dependable',
      'successful', 'victorious', 'triumphant', 'winning', 'champion', 'hero', 'legend', 'icon', 'star',
      'celebrity', 'famous', 'popular', 'trending', 'viral', 'hot', 'fire', 'lit', 'dope', 'sick', 'epic',
      'legendary', 'iconic', 'classic', 'timeless', 'eternal', 'immortal', 'unforgettable', 'memorable',
      'remarkable', 'extraordinary', 'unprecedented', 'revolutionary', 'groundbreaking', 'innovative', 'creative',
      'original', 'unique', 'special', 'rare', 'precious', 'valuable', 'treasured', 'cherished', 'beloved',
      'adored', 'worshiped', 'idolized', 'revered', 'respected', 'admired', 'appreciated', 'valued', 'esteemed',
      'honored', 'praised', 'acclaimed', 'celebrated', 'commended', 'lauded', 'applauded', 'cheered', 'supported',
      'endorsed', 'approved', 'validated', 'confirmed', 'verified', 'authenticated', 'genuine', 'real', 'true',
      'honest', 'sincere', 'authentic', 'legitimate', 'credible', 'believable', 'convincing', 'persuasive',
      'compelling', 'attractive', 'appealing', 'alluring', 'charming', 'enchanting', 'captivating', 'enticing',
      'tempting', 'irresistible', 'addictive', 'habit-forming', 'compulsive', 'obsessive', 'passionate', 'devoted',
      'dedicated', 'committed', 'loyal', 'faithful', 'true', 'steadfast', 'constant', 'consistent', 'reliable'
    ]);

    // Comprehensive negative words
    this.negativeWords = new Set([
      'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting', 'ugly', 'disappointing', 'frustrating',
      'annoying', 'irritating', 'boring', 'stupid', 'dumb', 'silly', 'ridiculous', 'pathetic', 'useless',
      'waste', 'garbage', 'trash', 'disgusting', 'revolting', 'nasty', 'gross', 'disappointed', 'frustrated',
      'angry', 'mad', 'upset', 'sad', 'depressed', 'miserable', 'unhappy', 'dissatisfied', 'displeased',
      'avoid', 'never', 'worst', 'poor', 'cheap', 'low', 'inferior', 'substandard', 'mediocre', 'terrible',
      'awful', 'horrible', 'disgusting', 'revolting', 'nasty', 'gross', 'vile', 'repulsive', 'offensive',
      'disturbing', 'upsetting', 'troubling', 'concerning', 'worrying', 'alarming', 'frightening', 'scary',
      'terrifying', 'horrifying', 'shocking', 'appalling', 'outrageous', 'unacceptable', 'intolerable',
      'unbearable', 'insufferable', 'unendurable', 'painful', 'hurtful', 'harmful', 'damaging', 'destructive',
      'devastating', 'catastrophic', 'disastrous', 'tragic', 'sad', 'depressing', 'melancholy', 'gloomy',
      'dreary', 'dismal', 'bleak', 'hopeless', 'desperate', 'helpless', 'powerless', 'weak', 'feeble',
      'frail', 'fragile', 'vulnerable', 'exposed', 'defenseless', 'unprotected', 'unsafe', 'dangerous',
      'risky', 'hazardous', 'perilous', 'threatening', 'menacing', 'intimidating', 'frightening', 'scary',
      'terrifying', 'horrifying', 'nightmarish', 'traumatic', 'devastating', 'crushing', 'overwhelming',
      'burdensome', 'oppressive', 'suffocating', 'stifling', 'restrictive', 'limiting', 'confining',
      'constraining', 'inhibiting', 'preventing', 'blocking', 'obstructing', 'hindering', 'impeding',
      'delaying', 'slowing', 'reducing', 'diminishing', 'decreasing', 'declining', 'deteriorating',
      'degenerating', 'worsening', 'failing', 'falling', 'collapsing', 'crumbling', 'breaking', 'shattering',
      'destroying', 'ruining', 'spoiling', 'corrupting', 'tainting', 'polluting', 'contaminating',
      'infecting', 'poisoning', 'killing', 'murdering', 'destroying', 'annihilating', 'eliminating',
      'eradicating', 'obliterating', 'wiping', 'clearing', 'removing', 'deleting', 'erasing', 'canceling',
      'voiding', 'nullifying', 'invalidating', 'disqualifying', 'rejecting', 'denying', 'refusing',
      'declining', 'dismissing', 'ignoring', 'neglecting', 'abandoning', 'deserting', 'betraying',
      'deceiving', 'lying', 'cheating', 'stealing', 'robbing', 'exploiting', 'abusing', 'mistreating',
      'hurting', 'harming', 'damaging', 'injuring', 'wounding', 'scarring', 'traumatizing', 'devastating'
    ]);

    // Intensifiers that amplify sentiment
    this.intensifiers = new Set([
      'very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'entirely', 'utterly',
      'perfectly', 'absolutely', 'definitely', 'certainly', 'surely', 'undoubtedly', 'unquestionably',
      'remarkably', 'exceptionally', 'extraordinarily', 'unusually', 'particularly', 'especially',
      'significantly', 'substantially', 'considerably', 'greatly', 'highly', 'intensely', 'deeply',
      'profoundly', 'thoroughly', 'completely', 'entirely', 'fully', 'wholly', 'totally', 'absolutely'
    ]);

    // Negators that reverse sentiment
    this.negators = new Set([
      'not', 'no', 'never', 'none', 'nothing', 'nobody', 'nowhere', 'neither', 'nor', 'hardly',
      'scarcely', 'barely', 'rarely', 'seldom', 'little', 'few', 'without', 'lacking', 'missing',
      'absent', 'devoid', 'free', 'clear', 'empty', 'void', 'blank', 'hollow', 'vacant'
    ]);
  }

  analyzeSentiment(text: string): {
    score: number;
    category: 'positive' | 'negative' | 'neutral';
    confidence: number;
    words: { positive: string[]; negative: string[]; neutral: string[] };
  } {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        category: 'neutral',
        confidence: 0,
        words: { positive: [], negative: [], neutral: [] }
      };
    }

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;
    const foundWords = { positive: [] as string[], negative: [] as string[], neutral: [] as string[] };

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const nextWord = i < words.length - 1 ? words[i + 1] : '';

      let sentimentMultiplier = 1;
      let isNegated = false;

      // Check for negators
      if (this.negators.has(prevWord) || this.negators.has(word)) {
        sentimentMultiplier = -1;
        isNegated = true;
      }

      // Check for intensifiers
      if (this.intensifiers.has(prevWord)) {
        sentimentMultiplier *= 2;
      }

      // Analyze word sentiment
      if (this.positiveWords.has(word)) {
        const adjustedCount = sentimentMultiplier > 0 ? 1 : -1;
        if (adjustedCount > 0) {
          positiveCount += adjustedCount;
          foundWords.positive.push(word);
        } else {
          negativeCount += Math.abs(adjustedCount);
          foundWords.negative.push(word);
        }
      } else if (this.negativeWords.has(word)) {
        const adjustedCount = sentimentMultiplier > 0 ? 1 : -1;
        if (adjustedCount > 0) {
          negativeCount += adjustedCount;
          foundWords.negative.push(word);
        } else {
          positiveCount += Math.abs(adjustedCount);
          foundWords.positive.push(word);
        }
      } else {
        foundWords.neutral.push(word);
      }
    }

    const sentimentScore = totalWords > 0 ? (positiveCount - negativeCount) / totalWords : 0;
    const confidence = Math.abs(sentimentScore);
    
    let category: 'positive' | 'negative' | 'neutral';
    if (sentimentScore > 0.1) {
      category = 'positive';
    } else if (sentimentScore < -0.1) {
      category = 'negative';
    } else {
      category = 'neutral';
    }

    return {
      score: sentimentScore,
      category,
      confidence,
      words: foundWords
    };
  }
}

// Extract text content from different platform data structures
function extractTextContent(platform: string, data: any): string[] {
  const content: string[] = [];

  try {
    if (platform === 'youtube' && data?.data?.posts) {
      data.data.posts.forEach((item: any) => {
        if (item.videoRenderer) {
          const title = item.videoRenderer.title?.runs?.[0]?.text || '';
          const description = item.videoRenderer.descriptionSnippet?.runs?.[0]?.text || '';
          const channelName = item.videoRenderer.ownerText?.runs?.[0]?.text || '';
          if (title) content.push(title);
          if (description) content.push(description);
          if (channelName) content.push(channelName);
        }
      });
    } else if (platform === 'instagram' && data?.data) {
      // Handle Instagram users
      if (data.data.users && Array.isArray(data.data.users)) {
        data.data.users.forEach((item: any) => {
          if (item.user) {
            const username = item.user.username || '';
            const fullName = item.user.full_name || '';
            if (username) content.push(username);
            if (fullName) content.push(fullName);
          }
        });
      }
      // Handle Instagram hashtags
      if (data.data.hashtags && Array.isArray(data.data.hashtags)) {
        data.data.hashtags.forEach((item: any) => {
          if (item.hashtag) {
            const hashtagName = item.hashtag.name || '';
            if (hashtagName) content.push(hashtagName);
          }
        });
      }
    } else if (platform === 'tiktok' && data?.data?.data) {
      data.data.data.forEach((item: any) => {
        if (item.aweme_info) {
          const desc = item.aweme_info.desc || '';
          const authorName = item.aweme_info.author?.nickname || '';
          if (desc) content.push(desc);
          if (authorName) content.push(authorName);
        }
      });
    }
  } catch (error) {
    console.error('Error extracting text content:', error);
  }

  return content.filter(text => text && text.trim().length > 0);
}

// Generate insights and metrics
function generateInsights(sentimentResults: any[], keyword: string) {
  const totalContent = sentimentResults.length;
  const positiveCount = sentimentResults.filter(r => r.category === 'positive').length;
  const negativeCount = sentimentResults.filter(r => r.category === 'negative').length;
  const neutralCount = sentimentResults.filter(r => r.category === 'neutral').length;

  const overallSentiment = totalContent > 0 ? (positiveCount - negativeCount) / totalContent : 0;
  const positivePercentage = totalContent > 0 ? (positiveCount / totalContent) * 100 : 0;
  const negativePercentage = totalContent > 0 ? (negativeCount / totalContent) * 100 : 0;
  const neutralPercentage = totalContent > 0 ? (neutralCount / totalContent) * 100 : 0;

  // Extract all words for word cloud
  const allWords: { [key: string]: number } = {};
  sentimentResults.forEach(result => {
    [...result.words.positive, ...result.words.negative, ...result.words.neutral].forEach(word => {
      if (word.length > 2) { // Filter out short words
        allWords[word] = (allWords[word] || 0) + 1;
      }
    });
  });

  // Get top words for word cloud
  const topWords = Object.entries(allWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));

  // Calculate confidence score
  const avgConfidence = sentimentResults.length > 0 
    ? sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / sentimentResults.length 
    : 0;

  return {
    keyword,
    totalContent,
    overallSentiment,
    sentimentDistribution: {
      positive: { count: positiveCount, percentage: positivePercentage },
      negative: { count: negativeCount, percentage: negativePercentage },
      neutral: { count: neutralCount, percentage: neutralPercentage }
    },
    confidence: avgConfidence,
    topWords,
    insights: {
      sentimentTrend: overallSentiment > 0.1 ? 'positive' : overallSentiment < -0.1 ? 'negative' : 'neutral',
      confidenceLevel: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.4 ? 'medium' : 'low',
      dominantSentiment: positiveCount > negativeCount && positiveCount > neutralCount ? 'positive' :
                        negativeCount > positiveCount && negativeCount > neutralCount ? 'negative' : 'neutral'
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, platforms = ['youtube', 'instagram', 'tiktok'] } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    if (!ENSEMBLE_BASE_URL || !ENSEMBLE_TOKEN) {
      return NextResponse.json({ error: 'API configuration missing' }, { status: 500 });
    }

    const analyzer = new SentimentAnalyzer();
    const allSentimentResults: any[] = [];
    const platformResults: { [key: string]: any } = {};

    // Fetch data from each platform
    for (const platform of platforms) {
      try {
        let apiUrl: string;
        if (platform === 'instagram') {
          apiUrl = `${ENSEMBLE_BASE_URL}/instagram/search?text=${encodeURIComponent(keyword)}&token=${ENSEMBLE_TOKEN}`;
        } else if (platform === 'tiktok') {
          apiUrl = `${ENSEMBLE_BASE_URL}/tt/keyword/search?name=${encodeURIComponent(keyword)}&cursor=0&period=7d&sorting=popular&country=US&match_exactly=false&get_author_stats=true&token=${ENSEMBLE_TOKEN}`;
        } else {
          apiUrl = `${ENSEMBLE_BASE_URL}/youtube/search?keyword=${encodeURIComponent(keyword)}&depth=1&start_cursor=&period=overall&sorting=relevance&get_additional_info=false&token=${ENSEMBLE_TOKEN}`;
        }

        console.log(`Fetching ${platform} data for sentiment analysis:`, apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const textContent = extractTextContent(platform, data);
          
          const platformSentimentResults = textContent.map(text => ({
            ...analyzer.analyzeSentiment(text),
            platform,
            originalText: text
          }));

          platformResults[platform] = {
            data,
            sentimentResults: platformSentimentResults,
            contentCount: textContent.length
          };

          allSentimentResults.push(...platformSentimentResults);
        } else {
          console.error(`${platform} API Error:`, response.status);
          platformResults[platform] = {
            error: `Failed to fetch ${platform} data`,
            sentimentResults: [],
            contentCount: 0
          };
        }
      } catch (error) {
        console.error(`Error fetching ${platform} data:`, error);
        platformResults[platform] = {
          error: `Error fetching ${platform} data`,
          sentimentResults: [],
          contentCount: 0
        };
      }
    }

    // Generate comprehensive insights
    const insights = generateInsights(allSentimentResults, keyword);

    return NextResponse.json({
      success: true,
      keyword,
      platforms,
      insights,
      platformResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sentiment Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sentiment Analysis API',
    description: 'Analyze sentiment of social media content using Ensemble Data APIs',
    endpoints: {
      POST: '/api/sentiment-analysis - Analyze sentiment for a keyword across platforms'
    },
    supportedPlatforms: ['YouTube', 'Instagram', 'TikTok'],
    usage: {
      method: 'POST',
      body: {
        keyword: 'string (required) - The search term to analyze',
        platforms: 'array (optional) - Platforms to analyze, default: ["youtube", "instagram", "tiktok"]'
      }
    },
    features: [
      'Comprehensive sentiment analysis',
      'Multi-platform data aggregation',
      'Word cloud generation',
      'Confidence scoring',
      'Sentiment distribution analysis',
      'Trending keywords extraction'
    ]
  });
}
