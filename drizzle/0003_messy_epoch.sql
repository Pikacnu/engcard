CREATE TABLE "fsrs_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"card_id" text NOT NULL,
	"due" timestamp DEFAULT now() NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" integer NOT NULL,
	"scheduled_days" integer NOT NULL,
	"reps" integer NOT NULL,
	"lapses" integer NOT NULL,
	"state" integer NOT NULL,
	"learning_steps" integer NOT NULL,
	"last_review" timestamp
);
--> statement-breakpoint
CREATE TABLE "fsrs_review_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"fsrs_card_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"state" integer NOT NULL,
	"due" timestamp NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" integer NOT NULL,
	"last_elapsed_days" integer NOT NULL,
	"scheduled_days" integer NOT NULL,
	"review" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fsrs_card" ADD CONSTRAINT "fsrs_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fsrs_card" ADD CONSTRAINT "fsrs_card_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fsrs_review_log" ADD CONSTRAINT "fsrs_review_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fsrs_review_log" ADD CONSTRAINT "fsrs_review_log_fsrs_card_id_fsrs_card_id_fk" FOREIGN KEY ("fsrs_card_id") REFERENCES "public"."fsrs_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fsrs_card_user_id_idx" ON "fsrs_card" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fsrs_card_due_idx" ON "fsrs_card" USING btree ("due");--> statement-breakpoint
CREATE UNIQUE INDEX "fsrs_user_card_unique" ON "fsrs_card" USING btree ("user_id","card_id");