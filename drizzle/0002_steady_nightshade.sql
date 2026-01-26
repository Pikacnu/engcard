CREATE TABLE "dictionary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marked_word" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"word" text NOT NULL,
	"deckId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_deck" (
	"userId" text NOT NULL,
	"deckId" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "saved_deck_userId_deckId_pk" PRIMARY KEY("userId","deckId")
);
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'word_cache'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "word_cache" DROP CONSTRAINT "word_cache_pkey";--> statement-breakpoint
ALTER TABLE "word_cache" ALTER COLUMN "targetLang" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "word_cache" ADD CONSTRAINT "word_cache_word_targetLang_pk" PRIMARY KEY("word","targetLang");--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "chatName" text;--> statement-breakpoint
ALTER TABLE "word_cache" ADD COLUMN "availableSearchTarget" text[];--> statement-breakpoint
ALTER TABLE "word_cache" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "marked_word" ADD CONSTRAINT "marked_word_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marked_word" ADD CONSTRAINT "marked_word_deckId_deck_id_fk" FOREIGN KEY ("deckId") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_deck" ADD CONSTRAINT "saved_deck_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_deck" ADD CONSTRAINT "saved_deck_deckId_deck_id_fk" FOREIGN KEY ("deckId") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dictionary_items_embedding_idx" ON "dictionary_items" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "dictionary_items_metadata_idx" ON "dictionary_items" USING gin ("metadata");--> statement-breakpoint
CREATE UNIQUE INDEX "user_word_deck_unique" ON "marked_word" USING btree ("userId","word","deckId");