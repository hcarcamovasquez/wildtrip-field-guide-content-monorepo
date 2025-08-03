CREATE INDEX "idx_users_clerk_id" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_news_status" ON "news" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_news_slug" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_news_category" ON "news" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_news_published_at" ON "news" USING btree ("published_at") WHERE status = 'published';--> statement-breakpoint
CREATE INDEX "idx_species_status" ON "species" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_species_slug" ON "species" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_species_main_group" ON "species" USING btree ("main_group");--> statement-breakpoint
CREATE INDEX "idx_species_conservation_status" ON "species" USING btree ("conservation_status");--> statement-breakpoint
CREATE INDEX "idx_species_published_at" ON "species" USING btree ("published_at") WHERE status = 'published';--> statement-breakpoint
CREATE INDEX "idx_species_search" ON "species" USING gin (to_tsvector
          ('spanish', coalesce ("common_name", '') || ' ' || coalesce ("scientific_name", '')));--> statement-breakpoint
CREATE INDEX "idx_protected_areas_status" ON "protected_areas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_protected_areas_slug" ON "protected_areas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_protected_areas_type" ON "protected_areas" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_protected_areas_region" ON "protected_areas" USING btree ("region");