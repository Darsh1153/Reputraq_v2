-- Migration: Add historical data collection tables
-- Created: 2025-01-30

-- Create data_collection_jobs table
CREATE TABLE IF NOT EXISTS "data_collection_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"keywords" jsonb NOT NULL,
	"total_keywords" integer NOT NULL,
	"processed_keywords" integer DEFAULT 0,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create historical_news_data table
CREATE TABLE IF NOT EXISTS "historical_news_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"collection_job_id" integer NOT NULL,
	"article_id" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"source_logo" text,
	"image" text,
	"sentiment_score" integer,
	"sentiment_label" varchar(50),
	"read_time" integer,
	"is_breaking" boolean DEFAULT false,
	"categories" jsonb,
	"topics" jsonb,
	"engagement" jsonb,
	"raw_data" jsonb,
	"collected_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create historical_social_data table
CREATE TABLE IF NOT EXISTS "historical_social_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"collection_job_id" integer NOT NULL,
	"post_id" varchar(255) NOT NULL,
	"title" text,
	"description" text,
	"url" text,
	"published_at" timestamp NOT NULL,
	"platform_name" varchar(255) NOT NULL,
	"platform_logo" text,
	"image" text,
	"sentiment_score" integer,
	"sentiment_label" varchar(50),
	"engagement" jsonb,
	"raw_data" jsonb,
	"collected_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create cron_job_settings table
CREATE TABLE IF NOT EXISTS "cron_job_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"interval_hours" integer DEFAULT 24,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"timezone" varchar(50) DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "data_collection_jobs" ADD CONSTRAINT "data_collection_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "historical_news_data" ADD CONSTRAINT "historical_news_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "historical_news_data" ADD CONSTRAINT "historical_news_data_collection_job_id_data_collection_jobs_id_fk" FOREIGN KEY ("collection_job_id") REFERENCES "data_collection_jobs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "historical_social_data" ADD CONSTRAINT "historical_social_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "historical_social_data" ADD CONSTRAINT "historical_social_data_collection_job_id_data_collection_jobs_id_fk" FOREIGN KEY ("collection_job_id") REFERENCES "data_collection_jobs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cron_job_settings" ADD CONSTRAINT "cron_job_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_data_collection_jobs_user_id" ON "data_collection_jobs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_data_collection_jobs_status" ON "data_collection_jobs" ("status");
CREATE INDEX IF NOT EXISTS "idx_data_collection_jobs_start_time" ON "data_collection_jobs" ("start_time");

CREATE INDEX IF NOT EXISTS "idx_historical_news_data_user_id" ON "historical_news_data" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_historical_news_data_keyword" ON "historical_news_data" ("keyword");
CREATE INDEX IF NOT EXISTS "idx_historical_news_data_collected_at" ON "historical_news_data" ("collected_at");
CREATE INDEX IF NOT EXISTS "idx_historical_news_data_published_at" ON "historical_news_data" ("published_at");

CREATE INDEX IF NOT EXISTS "idx_historical_social_data_user_id" ON "historical_social_data" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_historical_social_data_keyword" ON "historical_social_data" ("keyword");
CREATE INDEX IF NOT EXISTS "idx_historical_social_data_collected_at" ON "historical_social_data" ("collected_at");
CREATE INDEX IF NOT EXISTS "idx_historical_social_data_published_at" ON "historical_social_data" ("published_at");

CREATE INDEX IF NOT EXISTS "idx_cron_job_settings_user_id" ON "cron_job_settings" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_cron_job_settings_next_run_at" ON "cron_job_settings" ("next_run_at");
