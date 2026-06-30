/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `PageSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PageSection" DROP COLUMN "videoUrl",
ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
