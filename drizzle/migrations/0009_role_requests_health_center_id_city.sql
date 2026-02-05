ALTER TABLE "role_requests" ADD COLUMN IF NOT EXISTS "health_center_id" uuid REFERENCES "health_centers"("id");
ALTER TABLE "role_requests" ADD COLUMN IF NOT EXISTS "health_center_city" text;
