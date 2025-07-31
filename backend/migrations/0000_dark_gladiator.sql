CREATE TABLE "base_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_data" json,
	"has_draft" boolean DEFAULT false NOT NULL,
	"draft_created_at" timestamp,
	"locked_by" integer,
	"locked_at" timestamp,
	"lock_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"full_name" varchar(255),
	"avatar_url" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_content_id" integer NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft',
	"slug" text NOT NULL,
	"author" text,
	"category" text NOT NULL,
	"summary" text,
	"content" json NOT NULL,
	"main_image" json,
	"tags" json,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_content_id" integer NOT NULL,
	"status" text DEFAULT 'draft',
	"slug" text NOT NULL,
	"scientific_name" text DEFAULT '' NOT NULL,
	"common_name" text DEFAULT '' NOT NULL,
	"family" text,
	"order" text,
	"class" text,
	"phylum" text,
	"kingdom" text,
	"main_group" text,
	"specific_category" text,
	"description" text,
	"habitat" text,
	"distribution" json,
	"conservation_status" text,
	"images" json,
	"main_image" json,
	"gallery_images" json,
	"distinctive_features" text,
	"references" json,
	"rich_content" json,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "species_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "protected_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_content_id" integer NOT NULL,
	"status" text DEFAULT 'draft',
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"location" json,
	"area" integer,
	"creation_year" integer,
	"description" text,
	"ecosystems" json,
	"key_species" json,
	"visitor_information" json,
	"main_image" json,
	"gallery_images" json,
	"region" text,
	"rich_content" json,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "protected_areas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parent_id" integer,
	"path" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255),
	"created_by_name" varchar(255),
	"icon" varchar(50),
	"color" varchar(7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255),
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"media_type" text DEFAULT 'image' NOT NULL,
	"folder_id" integer,
	"folder_path" text,
	"width" integer,
	"height" integer,
	"title" varchar(255),
	"description" text,
	"alt_text" varchar(500),
	"tags" json DEFAULT '[]'::json,
	"uploaded_by" varchar(255),
	"uploaded_by_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "base_content" ADD CONSTRAINT "base_content_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_base_content_id_base_content_id_fk" FOREIGN KEY ("base_content_id") REFERENCES "public"."base_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_base_content_id_base_content_id_fk" FOREIGN KEY ("base_content_id") REFERENCES "public"."base_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_areas" ADD CONSTRAINT "protected_areas_base_content_id_base_content_id_fk" FOREIGN KEY ("base_content_id") REFERENCES "public"."base_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_gallery" ADD CONSTRAINT "media_gallery_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_folders_path_idx" ON "media_folders" USING btree ("path");--> statement-breakpoint
CREATE INDEX "media_folders_parent_id_idx" ON "media_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "media_folders_slug_idx" ON "media_folders" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_gallery_folder_id_idx" ON "media_gallery" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "media_gallery_folder_path_idx" ON "media_gallery" USING btree ("folder_path");--> statement-breakpoint
CREATE INDEX "media_gallery_uploaded_by_idx" ON "media_gallery" USING btree ("uploaded_by");