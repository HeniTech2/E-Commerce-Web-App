-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "image2Url" TEXT,
ADD COLUMN     "image3Url" TEXT,
ADD COLUMN     "image4Url" TEXT,
ADD COLUMN     "imagePosition" TEXT NOT NULL DEFAULT 'center';
