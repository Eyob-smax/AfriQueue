ALTER TABLE "users" ALTER COLUMN "status" TYPE varchar(20);
ALTER TABLE "users" ALTER COLUMN "country" TYPE varchar(100);
ALTER TABLE "users" ALTER COLUMN "city" TYPE varchar(100);

--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "blood_type" TYPE varchar(5);

--> statement-breakpoint
ALTER TABLE "staff_profiles" ALTER COLUMN "role_in_center" TYPE varchar(50);
ALTER TABLE "staff_profiles" ALTER COLUMN "department" TYPE varchar(50);

--> statement-breakpoint
ALTER TABLE "health_centers" ALTER COLUMN "status" TYPE varchar(10);

--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE varchar(50);
