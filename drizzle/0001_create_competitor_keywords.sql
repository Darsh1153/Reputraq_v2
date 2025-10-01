CREATE TABLE "competitor_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
