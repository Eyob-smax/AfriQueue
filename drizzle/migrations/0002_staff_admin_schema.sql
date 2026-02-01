ALTER TABLE "health_centers" ALTER COLUMN "status" TYPE varchar(20);

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "description" text;

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "services" text;

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "specialties" varchar(100)[];

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "operating_status" varchar(20) DEFAULT 'OPEN';

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "queue_availability" boolean DEFAULT true;

--> statement-breakpoint
ALTER TABLE "health_centers" ADD COLUMN IF NOT EXISTS "is_blocked" boolean DEFAULT false;

--> statement-breakpoint
ALTER TABLE "queues" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'ACTIVE';

--> statement-breakpoint
ALTER TABLE "role_requests" ADD COLUMN IF NOT EXISTS "health_center_name" text;

--> statement-breakpoint
ALTER TABLE "role_requests" ADD COLUMN IF NOT EXISTS "health_center_description" text;

--> statement-breakpoint
ALTER TABLE "role_requests" ADD COLUMN IF NOT EXISTS "health_center_location" text;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL REFERENCES "users"("id"),
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
