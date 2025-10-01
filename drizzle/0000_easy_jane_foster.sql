CREATE TYPE "public"."plan" AS ENUM('normal', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"company_name" varchar(255),
	"password" varchar(255) NOT NULL,
	"plan" "plan" DEFAULT 'normal' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"monitoring_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
