DELETE FROM "dictionary_items";--> statement-breakpoint
ALTER TABLE "dictionary_items" ALTER COLUMN "language_code" SET DATA TYPE text[] USING array[language_code];--> statement-breakpoint
ALTER TABLE "dictionary_items" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);--> statement-breakpoint
ALTER TABLE "word_cache" DROP COLUMN "availableSearchTarget";