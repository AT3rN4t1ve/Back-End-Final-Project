/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Medicine_name_userId_key` ON `Medicine`(`name`, `userId`);
