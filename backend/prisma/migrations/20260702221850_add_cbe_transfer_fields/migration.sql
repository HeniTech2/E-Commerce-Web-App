/*
  Warnings:

  - You are about to drop the column `videoUrls` on the `PageSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "txId" TEXT,
ADD COLUMN     "txProof" TEXT;

-- AlterTable
ALTER TABLE "PageSection" DROP COLUMN "videoUrls";
