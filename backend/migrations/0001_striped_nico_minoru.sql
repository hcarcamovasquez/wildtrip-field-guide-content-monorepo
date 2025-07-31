ALTER TABLE "base_content" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "base_content" CASCADE;--> statement-breakpoint
-- ALTER TABLE "news" DROP CONSTRAINT "news_base_content_id_base_content_id_fk";
--> statement-breakpoint
-- ALTER TABLE "species" DROP CONSTRAINT "species_base_content_id_base_content_id_fk";
--> statement-breakpoint
-- ALTER TABLE "protected_areas" DROP CONSTRAINT "protected_areas_base_content_id_base_content_id_fk";
--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "draft_data" json;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "has_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "draft_created_at" timestamp;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "locked_by" integer;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "lock_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "draft_data" json;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "has_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "draft_created_at" timestamp;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "locked_by" integer;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "lock_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "draft_data" json;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "has_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "draft_created_at" timestamp;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "locked_by" integer;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD COLUMN "lock_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD CONSTRAINT "protected_areas_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" DROP COLUMN "base_content_id";--> statement-breakpoint
ALTER TABLE "species" DROP COLUMN "base_content_id";--> statement-breakpoint
ALTER TABLE "protected_areas" DROP COLUMN "base_content_id";