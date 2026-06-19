-- Add per-section background color, background image, and layout position
ALTER TABLE "PageSection" ADD COLUMN "bgColor" TEXT;
ALTER TABLE "PageSection" ADD COLUMN "bgImageUrl" TEXT;
ALTER TABLE "PageSection" ADD COLUMN "position" TEXT NOT NULL DEFAULT 'center';