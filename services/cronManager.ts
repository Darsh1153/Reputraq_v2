import cron from 'node-cron';
import { getDatabase } from '@/lib/db/connection';
import { 
  dataCollectionJobs, 
  cronJobSettings, 
  historicalNewsData, 
  historicalSocialData,
  keywords,
  users
} from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { collectAllData } from '@/services/dataPipeline';

interface CronJobManager {
  start(): void;
  stop(): void;
  scheduleJobForUser(userId: number): void;
  cancelJobForUser(userId: number): void;
  runDataCollection(userId: number): Promise<void>;
}

class DataCollectionCronManager implements CronJobManager {
  private jobs: Map<number, cron.ScheduledTask> = new Map();
  private isRunning = false;

  constructor() {
    console.log('🕐 Data Collection Cron Manager initialized');
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Cron manager is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Data Collection Cron Manager...');

    try {
      const db = await getDatabase();
      
      // Get all users with enabled cron jobs
      const enabledJobs = await db
        .select()
        .from(cronJobSettings)
        .where(eq(cronJobSettings.isEnabled, true));

      console.log(`📋 Found ${enabledJobs.length} enabled cron jobs`);

      // Schedule jobs for each user
      for (const job of enabledJobs) {
        await this.scheduleJobForUser(job.userId);
      }

      // Schedule cleanup job to run every hour
      cron.schedule('0 * * * *', async () => {
        await this.cleanupOldData();
      });

      console.log('✅ Data Collection Cron Manager started successfully');
    } catch (error) {
      console.error('❌ Failed to start cron manager:', error);
      this.isRunning = false;
    }
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Cron manager is not running');
      return;
    }

    console.log('🛑 Stopping Data Collection Cron Manager...');
    
    // Stop all scheduled jobs
    for (const [userId, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ Stopped cron job for user ${userId}`);
    }
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Data Collection Cron Manager stopped');
  }

  async scheduleJobForUser(userId: number) {
    try {
      const db = await getDatabase();
      
      // Get user's cron settings
      const settings = await db
        .select()
        .from(cronJobSettings)
        .where(eq(cronJobSettings.userId, userId))
        .limit(1);

      if (settings.length === 0) {
        console.log(`⚠️ No cron settings found for user ${userId}`);
        return;
      }

      const userSettings = settings[0];
      
      if (!userSettings.isEnabled) {
        console.log(`⚠️ Cron job disabled for user ${userId}`);
        return;
      }

      // Cancel existing job if any
      this.cancelJobForUser(userId);

      // Create cron expression (every N hours)
      const cronExpression = `0 */${userSettings.intervalHours} * * *`;
      
      console.log(`📅 Scheduling cron job for user ${userId}: ${cronExpression}`);

      // Schedule the job
      const job = cron.schedule(cronExpression, async () => {
        console.log(`🔄 Running scheduled data collection for user ${userId}`);
        await this.runDataCollection(userId);
      }, {
        scheduled: true,
        timezone: userSettings.timezone || 'UTC'
      });

      this.jobs.set(userId, job);
      
      // Update next run time
      const nextRun = new Date();
      nextRun.setHours(nextRun.getHours() + userSettings.intervalHours);
      
      await db
        .update(cronJobSettings)
        .set({ 
          nextRunAt: nextRun,
          updatedAt: new Date()
        })
        .where(eq(cronJobSettings.userId, userId));

      console.log(`✅ Cron job scheduled for user ${userId}, next run: ${nextRun.toISOString()}`);
    } catch (error) {
      console.error(`❌ Failed to schedule job for user ${userId}:`, error);
    }
  }

  cancelJobForUser(userId: number) {
    const job = this.jobs.get(userId);
    if (job) {
      job.stop();
      this.jobs.delete(userId);
      console.log(`⏹️ Cancelled cron job for user ${userId}`);
    }
  }

  async runDataCollection(userId: number) {
    const startTime = new Date();
    let jobId: number | null = null;

    try {
      const db = await getDatabase();
      
      // Get user's keywords
      const userKeywords = await db
        .select()
        .from(keywords)
        .where(eq(keywords.userId, userId));

      if (userKeywords.length === 0) {
        console.log(`⚠️ No keywords found for user ${userId}`);
        return;
      }

      const keywordStrings = userKeywords.map(k => k.keyword);
      
      // Create job record
      const [newJob] = await db
        .insert(dataCollectionJobs)
        .values({
          userId,
          status: 'running',
          keywords: keywordStrings,
          totalKeywords: keywordStrings.length,
          processedKeywords: 0,
          startTime,
          metadata: {
            trigger: 'cron',
            intervalHours: await this.getUserIntervalHours(userId)
          }
        })
        .returning();

      jobId = newJob.id;
      console.log(`📊 Started data collection job ${jobId} for user ${userId}`);

      // Collect data for all keywords
      const collectedData = await collectAllData(keywordStrings);
      
      // Store historical data AND update user's monitoring data
      let processedKeywords = 0;
      for (const data of collectedData) {
        try {
          // Store news data
          if (data.newsData?.results) {
            for (const article of data.newsData.results) {
              await db.insert(historicalNewsData).values({
                userId,
                keyword: data.keyword,
                collectionJobId: jobId,
                articleId: article.id || article.url,
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: new Date(article.publishedAt),
                sourceName: article.source?.name || 'Unknown',
                sourceLogo: article.source?.logo,
                image: article.image,
                sentimentScore: article.sentiment?.score,
                sentimentLabel: article.sentiment?.label,
                readTime: article.readTime,
                isBreaking: article.isBreaking || false,
                categories: article.categories,
                topics: article.topics,
                engagement: article.engagement,
                rawData: article,
                collectedAt: new Date()
              });
            }
          }

          // Store social data
          if (data.socialData?.data) {
            for (const post of data.socialData.data) {
              await db.insert(historicalSocialData).values({
                userId,
                keyword: data.keyword,
                collectionJobId: jobId,
                postId: post.id || post.url,
                title: post.title,
                description: post.description,
                url: post.url,
                publishedAt: new Date(post.publishedAt),
                platformName: post.platform || 'Unknown',
                platformLogo: post.platformLogo,
                image: post.image,
                sentimentScore: post.sentiment?.score,
                sentimentLabel: post.sentiment?.label,
                engagement: post.engagement,
                rawData: post,
                collectedAt: new Date()
              });
            }
          }

          processedKeywords++;
          
          // Update job progress
          await db
            .update(dataCollectionJobs)
            .set({ processedKeywords })
            .where(eq(dataCollectionJobs.id, jobId));

        } catch (error) {
          console.error(`❌ Error storing data for keyword ${data.keyword}:`, error);
        }
      }

      // IMPORTANT: Update user's monitoring data for dashboard display
      await db
        .update(users)
        .set({
          monitoringData: collectedData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      console.log(`✅ Updated user's monitoring data for dashboard display`);

      // Mark job as completed
      await db
        .update(dataCollectionJobs)
        .set({
          status: 'completed',
          endTime: new Date(),
          processedKeywords
        })
        .where(eq(dataCollectionJobs.id, jobId));

      // Update last run time
      await db
        .update(cronJobSettings)
        .set({ 
          lastRunAt: startTime,
          updatedAt: new Date()
        })
        .where(eq(cronJobSettings.userId, userId));

      console.log(`✅ Data collection completed for user ${userId}, job ${jobId}`);
      
    } catch (error) {
      console.error(`❌ Data collection failed for user ${userId}:`, error);
      
      if (jobId) {
        try {
          const db = await getDatabase();
          await db
            .update(dataCollectionJobs)
            .set({
              status: 'failed',
              endTime: new Date(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            })
            .where(eq(dataCollectionJobs.id, jobId));
        } catch (updateError) {
          console.error('❌ Failed to update job status:', updateError);
        }
      }
    }
  }

  private async getUserIntervalHours(userId: number): Promise<number> {
    try {
      const db = await getDatabase();
      const settings = await db
        .select()
        .from(cronJobSettings)
        .where(eq(cronJobSettings.userId, userId))
        .limit(1);
      
      return settings[0]?.intervalHours || 24;
    } catch (error) {
      console.error('❌ Failed to get user interval hours:', error);
      return 24;
    }
  }

  private async cleanupOldData() {
    try {
      const db = await getDatabase();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old historical data (keep only last 30 days)
      const deletedNews = await db
        .delete(historicalNewsData)
        .where(lte(historicalNewsData.collectedAt, thirtyDaysAgo));

      const deletedSocial = await db
        .delete(historicalSocialData)
        .where(lte(historicalSocialData.collectedAt, thirtyDaysAgo));

      console.log(`🧹 Cleaned up old data: ${deletedNews.rowCount} news records, ${deletedSocial.rowCount} social records`);
    } catch (error) {
      console.error('❌ Failed to cleanup old data:', error);
    }
  }

  // Get job status for a user
  async getJobStatus(userId: number) {
    try {
      const db = await getDatabase();
      const jobs = await db
        .select()
        .from(dataCollectionJobs)
        .where(eq(dataCollectionJobs.userId, userId))
        .orderBy(dataCollectionJobs.startTime)
        .limit(10);

      return jobs;
    } catch (error) {
      console.error('❌ Failed to get job status:', error);
      return [];
    }
  }
}

// Create singleton instance
export const cronManager = new DataCollectionCronManager();

// Auto-start in both production and development
cronManager.start();
